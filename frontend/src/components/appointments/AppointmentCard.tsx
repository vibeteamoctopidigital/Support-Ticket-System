"use client"

import { format } from "date-fns"
import { Clock, Mail } from "lucide-react"
import { type Appointment, AppointmentStatusBadge } from "./appointment-bits"
import { Avatar } from "@/components/tickets/ticket-bits"

export function AppointmentCard({ appointment, onDetails }: { appointment: Appointment; onDetails: () => void }) {
  const start = new Date(appointment.startTime)
  const end = new Date(appointment.endTime)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 hover:border-gray-200 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col items-center justify-center flex-shrink-0 w-14 h-14 rounded-xl bg-gray-50 border border-gray-100">
          <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{format(start, "MMM")}</span>
          <span className="text-[18px] font-bold text-gray-900 leading-none mt-0.5">{format(start, "d")}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-bold text-gray-900 truncate">{appointment.title}</p>
          <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mt-1">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            {format(start, "h:mm a")} – {format(end, "h:mm a")}
          </div>
        </div>
        <AppointmentStatusBadge status={appointment.status} />
      </div>

      <div className="flex items-center gap-2.5 pt-3 border-t border-gray-50">
        <Avatar name={appointment.contactName} initials={initialsOf(appointment.contactName)} />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-gray-900 truncate">{appointment.contactName}</p>
          {appointment.contactEmail && (
            <p className="flex items-center gap-1 text-[11px] text-gray-400 truncate">
              <Mail className="w-3 h-3 flex-shrink-0" /> {appointment.contactEmail}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onDetails}
        className="w-full h-9 rounded-xl border border-gray-200 text-[12.5px] font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
      >
        Details
      </button>
    </div>
  )
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?"
}
