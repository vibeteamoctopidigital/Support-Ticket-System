export interface Appointment {
  id: string
  contactName: string
  contactEmail?: string | null
  contactPhone?: string | null
  title: string
  startTime: string
  endTime: string
  status: "confirmed" | "cancelled" | "showed" | "noshow"
  notes?: string | null
}

const STATUS_META: Record<Appointment["status"], { label: string; className: string; dot: string }> = {
  confirmed: { label: "Confirmed", className: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  showed: { label: "Showed", className: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  noshow: { label: "No-show", className: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-500 border-gray-200", dot: "bg-gray-400" },
}

export function AppointmentStatusBadge({ status }: { status: Appointment["status"] }) {
  const s = STATUS_META[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${s.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}
