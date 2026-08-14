"use client"

import { useQuery } from "@tanstack/react-query"
import { CalendarClock } from "lucide-react"
import { useState } from "react"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { AppShell } from "@/components/layouts/AppShell"
import { AppointmentCard } from "@/components/appointments/AppointmentCard"
import { AppointmentDetailModal } from "@/components/appointments/AppointmentDetailModal"
import { QUERY_KEYS } from "@/constants"
import { useAuth } from "@/hooks/auth/useAuth"
import { AppointmentService } from "@/services/appointment.service"

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 py-24 px-6 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <CalendarClock className="w-7 h-7 text-blue-500" />
      </div>
      <h3 className="text-[15px] font-bold text-gray-900">No bookings yet</h3>
      <p className="text-[13px] text-gray-500 mt-1.5 max-w-sm leading-relaxed">
        Bookings made through your GoHighLevel calendars will appear here.
      </p>
    </div>
  )
}

function AppointmentsPage() {
  const { user } = useAuth()
  const { data: appointments, isLoading } = useQuery({
    queryKey: QUERY_KEYS.APPOINTMENTS,
    queryFn: () => AppointmentService.list(),
    enabled: !!user,
  })
  const [openId, setOpenId] = useState<string | null>(null)
  const openAppointment = appointments?.find((a) => a.id === openId) ?? null

  return (
    <AppShell title="Booked Appointments" subtitle="Live bookings from your GoHighLevel calendars.">
      {isLoading ? (
        <div className="flex justify-center py-24">
          <div className="w-7 h-7 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : !appointments || appointments.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {appointments.map((a) => (
            <AppointmentCard key={a.id} appointment={a} onDetails={() => setOpenId(a.id)} />
          ))}
        </div>
      )}

      {openAppointment && <AppointmentDetailModal appointment={openAppointment} onClose={() => setOpenId(null)} />}
    </AppShell>
  )
}

export default function Page() {
  return (
    <AuthGuard allowedRoles={["AGENCY_OWNER"]}>
      <AppointmentsPage />
    </AuthGuard>
  )
}
