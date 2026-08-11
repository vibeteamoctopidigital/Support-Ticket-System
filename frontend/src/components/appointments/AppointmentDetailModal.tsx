"use client"

import { format } from "date-fns"
import { CalendarDays, Clock, Mail, Phone, X } from "lucide-react"
import { type Appointment, AppointmentStatusBadge } from "./appointment-bits"
import { Avatar } from "@/components/tickets/ticket-bits"

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-gray-400">{label}</p>
        <p className="text-[13.5px] text-gray-900 font-medium break-words">{value}</p>
      </div>
    </div>
  )
}

export function AppointmentDetailModal({
  appointment,
  onClose,
}: {
  appointment: Appointment
  onClose: () => void
}) {
  const start = new Date(appointment.startTime)
  const end = new Date(appointment.endTime)

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={appointment.contactName} initials={initialsOf(appointment.contactName)} />
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">{appointment.title}</h2>
              <p className="text-[12px] text-gray-400">{appointment.contactName}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <AppointmentStatusBadge status={appointment.status} />

          <Row icon={<CalendarDays className="w-4 h-4" />} label="Date" value={format(start, "EEEE, MMMM d, yyyy")} />
          <Row
            icon={<Clock className="w-4 h-4" />}
            label="Time"
            value={`${format(start, "h:mm a")} – ${format(end, "h:mm a")}`}
          />
          <Row icon={<Mail className="w-4 h-4" />} label="Email" value={appointment.contactEmail} />
          <Row icon={<Phone className="w-4 h-4" />} label="Phone" value={appointment.contactPhone} />

          {appointment.notes && (
            <div className="pt-2 border-t border-gray-50">
              <p className="text-[11px] text-gray-400 mb-1.5">Notes</p>
              <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">{appointment.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?"
}
