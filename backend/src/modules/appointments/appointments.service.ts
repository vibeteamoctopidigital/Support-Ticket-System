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

export const appointmentsService = {
  /** Everything received via the GHL webhook for this agency, newest first. */
  async listBookedAppointments(agencyId: string): Promise<BookedAppointment[]> {
    const rows = await prisma.bookedAppointment.findMany({
      where: { agencyId },
      orderBy: { startTime: "desc" },
    });

    return rows.map((r) => ({
      id: r.id,
      contactName: r.contactName,
      contactEmail: r.contactEmail,
      contactPhone: r.contactPhone,
      title: r.title,
      startTime: r.startTime.toISOString(),
      endTime: r.endTime.toISOString(),
      status: r.status as BookedAppointment["status"],
      notes: r.notes,
    }));
  },
};
