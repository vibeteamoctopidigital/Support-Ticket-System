import { GhlApiError, ghlClient } from "../../lib/ghl/ghl.client";
import { badGateway, conflict } from "../../utils/appError";
import { decryptSecret } from "../../utils/crypto";
import { prisma } from "../../utils/prisma";

export interface BookedAppointment {
  id: string;
  contactName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  title: string;
  startTime: string;
  endTime: string;
  status: "confirmed" | "cancelled" | "showed" | "noshow";
  notes: string | null;
}

const STATUS_MAP: Record<string, BookedAppointment["status"]> = {
  new: "confirmed",
  confirmed: "confirmed",
  cancelled: "cancelled",
  showed: "showed",
  noshow: "noshow",
  invalid: "cancelled",
};

/**
 * The credential used for calendar lookups. The dedicated booking-calendar
 * setting is preferred when present (it's the calendar's own sub-account PIT,
 * which can actually read its events). Falls back to the agency key + media
 * location so pre-existing setups keep working until a calendar is connected.
 */
async function ghlCredentials(agencyId: string) {
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    select: {
      ghlApiKeyEncrypted: true,
      ghlMediaLocationId: true,
      ghlBookingCalendarId: true,
      ghlBookingCalendarLocationId: true,
      ghlBookingCalendarApiKeyEncrypted: true,
    },
  });

  if (agency?.ghlBookingCalendarId && agency?.ghlBookingCalendarLocationId && agency?.ghlBookingCalendarApiKeyEncrypted) {
    try {
      return {
        apiKey: decryptSecret(agency.ghlBookingCalendarApiKeyEncrypted),
        locationId: agency.ghlBookingCalendarLocationId,
        calendarId: agency.ghlBookingCalendarId,
      };
    } catch {
      throw badGateway(
        "The stored booking-calendar key can't be read (encryption key changed?) — reconnect the booking calendar.",
        "GHL_KEY_UNREADABLE",
      );
    }
  }

  // No dedicated calendar setting — fall back to the legacy path (agency key
  // + media-storage location + the calendarId the caller passed from config).
  if (!agency?.ghlApiKeyEncrypted || !agency.ghlMediaLocationId) return null;
  try {
    return { apiKey: decryptSecret(agency.ghlApiKeyEncrypted), locationId: agency.ghlMediaLocationId, calendarId: null };
  } catch {
    throw badGateway(
      "The stored GHL API key can't be read (encryption key changed?) — reconnect the agency's GHL account.",
      "GHL_KEY_UNREADABLE",
    );
  }
}

export const appointmentsService = {
  /** Booked events for the agency's booking calendar, defaulting to a 90-day window centered on now. */
  async listBookedAppointments(agencyId: string, requestedCalendarId: string): Promise<BookedAppointment[]> {
    const credentials = await ghlCredentials(agencyId);
    if (!credentials) {
      throw conflict(
        "This agency hasn't connected a GoHighLevel account yet — connect it to see live bookings here.",
        "GHL_NOT_CONNECTED",
      );
    }

    const calendarId = credentials.calendarId || requestedCalendarId;
    if (!calendarId) {
      throw conflict(
        "No booking calendar is connected yet — connect one on the Booked Appointments page to see live bookings.",
        "GHL_CALENDAR_NOT_SET",
      );
    }

    const now = Date.now();
    const startTimeMs = now - 30 * 24 * 60 * 60 * 1000;
    const endTimeMs = now + 60 * 24 * 60 * 60 * 1000;

    let events: Awaited<ReturnType<typeof ghlClient.listCalendarEvents>>;
    try {
      events = await ghlClient.listCalendarEvents(credentials.apiKey, credentials.locationId, calendarId, startTimeMs, endTimeMs);
    } catch (err) {
      if (err instanceof GhlApiError) {
        if (err.httpStatus === 401 || err.httpStatus === 403) {
          throw conflict(
            "GHL rejected the calendar request — the stored API key may be missing the calendars.events.readonly scope, or may have been revoked.",
            "GHL_KEY_INVALID",
          );
        }
        if (err.httpStatus === 0) throw badGateway("Could not reach GoHighLevel to load appointments. Please try again.");
      }
      throw err;
    }

    // Enrich each event with the booker's contact details. Sequential + best-effort:
    // a failed contact lookup shouldn't hide the whole appointment.
    const results: BookedAppointment[] = [];
    for (const e of events) {
      let contact: Awaited<ReturnType<typeof ghlClient.getContact>> = null;
      if (e.contactId) {
        try {
          contact = await ghlClient.getContact(credentials.apiKey, e.contactId);
        } catch {
          contact = null;
        }
      }
      const contactName =
        contact?.name || [contact?.firstName, contact?.lastName].filter(Boolean).join(" ") || "Unknown contact";

      results.push({
        id: e.id,
        contactName,
        contactEmail: contact?.email ?? null,
        contactPhone: contact?.phone ?? null,
        title: e.title || "Appointment",
        startTime: e.startTime,
        endTime: e.endTime,
        status: STATUS_MAP[e.appointmentStatus ?? "confirmed"] ?? "confirmed",
        notes: e.notes ?? null,
      });
    }

    return results.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  },
};
