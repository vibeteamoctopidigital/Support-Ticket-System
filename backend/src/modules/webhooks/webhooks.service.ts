import crypto from "node:crypto";
import { notFound } from "../../utils/appError";
import { prisma } from "../../utils/prisma";

/**
 * Receives appointment bookings pushed FROM a GHL Workflow's Webhook action —
 * no polling, no per-calendar Private Integration Token. The agency points
 * one Workflow (trigger: "Appointment Booked"/"Appointment Status") at
 *   POST /api/webhooks/ghl/appointments/{agencyId}
 * with a JSON body. Body shape is a GHL Workflow author's choice (custom
 * merge-field JSON, or GHL's own default Appointment payload), so every
 * field below is read defensively from several common shapes — ASSUMED,
 * pending a real payload to confirm against.
 */

function pick(body: Record<string, any>, paths: string[]): any {
  for (const path of paths) {
    const value = path.split(".").reduce<any>((obj, key) => (obj == null ? undefined : obj[key]), body);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function toIsoOrNull(value: unknown): string | null {
  if (!value) return null;
  const d = new Date(typeof value === "number" ? value : String(value));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const STATUS_ALIASES: Record<string, string> = {
  new: "confirmed",
  confirmed: "confirmed",
  booked: "confirmed",
  cancelled: "cancelled",
  canceled: "cancelled",
  showed: "showed",
  noshow: "noshow",
  "no-show": "noshow",
  invalid: "cancelled",
};

export const webhooksService = {
  async receiveAppointment(agencyId: string, body: Record<string, any>) {
    const agency = await prisma.agency.findUnique({ where: { id: agencyId }, select: { id: true } });
    if (!agency) throw notFound("Unknown agency in webhook URL.", "AGENCY_NOT_FOUND");

    // GHL's default Appointment webhook nests the event under `appointment`;
    // a custom Workflow body is usually flat — support both.
    const appt = (body.appointment && typeof body.appointment === "object" ? body.appointment : body) as Record<
      string,
      any
    >;
    const contact = (body.contact && typeof body.contact === "object" ? body.contact : body) as Record<string, any>;

    const ghlEventId =
      pick(appt, ["id", "appointmentId", "eventId", "_id"]) ?? crypto.randomUUID();

    const startTime = toIsoOrNull(pick(appt, ["startTime", "start_time", "startAt", "start"]));
    const endTime =
      toIsoOrNull(pick(appt, ["endTime", "end_time", "endAt", "end"])) ??
      (startTime ? new Date(new Date(startTime).getTime() + 30 * 60 * 1000).toISOString() : null);

    if (!startTime || !endTime) {
      // Nothing usable to show — accept the request (so GHL doesn't retry
      // forever) but don't create a broken row.
      return { stored: false, reason: "missing start/end time" };
    }

    const rawStatus = String(pick(appt, ["appointmentStatus", "status"]) ?? "confirmed").toLowerCase();
    const contactFirst = pick(contact, ["firstName", "first_name"]);
    const contactLast = pick(contact, ["lastName", "last_name"]);
    const contactName =
      pick(contact, ["name", "contactName", "full_name"]) ??
      [contactFirst, contactLast].filter(Boolean).join(" ") ??
      "Unknown contact";

    await prisma.bookedAppointment.upsert({
      where: { agencyId_ghlEventId: { agencyId, ghlEventId: String(ghlEventId) } },
      create: {
        agencyId,
        ghlEventId: String(ghlEventId),
        ghlCalendarId: pick(appt, ["calendarId", "calendar_id", "calendar.id"]) ?? null,
        contactName: String(contactName || "Unknown contact"),
        contactEmail: pick(contact, ["email"]) ?? null,
        contactPhone: pick(contact, ["phone"]) ?? null,
        title: String(pick(appt, ["title", "appointmentTitle"]) ?? "Appointment"),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: STATUS_ALIASES[rawStatus] ?? "confirmed",
        notes: pick(appt, ["notes", "note"]) ?? null,
      },
      update: {
        ghlCalendarId: pick(appt, ["calendarId", "calendar_id", "calendar.id"]) ?? undefined,
        contactName: String(contactName || "Unknown contact"),
        contactEmail: pick(contact, ["email"]) ?? undefined,
        contactPhone: pick(contact, ["phone"]) ?? undefined,
        title: String(pick(appt, ["title", "appointmentTitle"]) ?? "Appointment"),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: STATUS_ALIASES[rawStatus] ?? "confirmed",
        notes: pick(appt, ["notes", "note"]) ?? undefined,
      },
    });

    return { stored: true };
  },
};
