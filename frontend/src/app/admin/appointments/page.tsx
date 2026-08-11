"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, CalendarClock } from "lucide-react"
import { useState } from "react"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { AppShell } from "@/components/layouts/AppShell"
import { AppointmentCard } from "@/components/appointments/AppointmentCard"
import { AppointmentDetailModal } from "@/components/appointments/AppointmentDetailModal"
import { GhlConnectionModal } from "@/components/settings/GhlConnectionModal"
import { Button } from "@/components/ui/button"
import { config } from "@/config"
import { QUERY_KEYS } from "@/constants"
import { AppointmentService } from "@/services/appointment.service"

const CALENDAR_ID = config.ghl.calendarId

function EmptyState({
  icon: Icon = CalendarClock,
  title,
  subtitle,
  action,
}: {
  icon?: typeof CalendarClock
  title: string
  subtitle: string
  action?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 py-24 px-6 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-blue-500" />
      </div>
      <h3 className="text-[15px] font-bold text-gray-900">{title}</h3>
      <p className="text-[13px] text-gray-500 mt-1.5 max-w-sm leading-relaxed">{subtitle}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

function AppointmentsPage() {
  const queryClient = useQueryClient()
  const { data: appointments, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.APPOINTMENTS(CALENDAR_ID),
    queryFn: () => AppointmentService.list(CALENDAR_ID),
    enabled: !!CALENDAR_ID,
    retry: false,
  })
  const [openId, setOpenId] = useState<string | null>(null)
  const [connectOpen, setConnectOpen] = useState(false)
  const openAppointment = appointments?.find((a) => a.id === openId) ?? null

  const errorCode = (error as any)?.response?.data?.error?.code as string | undefined
  const errorMessage = (error as any)?.response?.data?.error?.message as string | undefined
  const notConnected = errorCode === "GHL_NOT_CONNECTED" || errorCode === "GHL_KEY_INVALID"

  const refetch = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS(CALENDAR_ID) })

  return (
    <AppShell title="Booked Appointments" subtitle="Live bookings from your GoHighLevel calendar.">
      {!CALENDAR_ID ? (
        <EmptyState
          title="Calendar not connected yet"
          subtitle="Once a GoHighLevel booking calendar is connected here, every appointment booked through it will show up below as a card."
        />
      ) : isLoading ? (
        <div className="flex justify-center py-24">
          <div className="w-7 h-7 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <EmptyState
          icon={notConnected ? CalendarClock : AlertTriangle}
          title={notConnected ? "GoHighLevel account not connected" : "Couldn't load appointments"}
          subtitle={errorMessage ?? "Something went wrong talking to GoHighLevel — try again shortly."}
          action={
            notConnected ? (
              <Button onClick={() => setConnectOpen(true)} className="rounded-xl bg-black hover:bg-gray-800 text-white h-10">
                Connect GoHighLevel
              </Button>
            ) : undefined
          }
        />
      ) : !appointments || appointments.length === 0 ? (
        <EmptyState title="No appointments yet" subtitle="Bookings made through your calendar will appear here." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {appointments.map((a) => (
            <AppointmentCard key={a.id} appointment={a} onDetails={() => setOpenId(a.id)} />
          ))}
        </div>
      )}

      {openAppointment && <AppointmentDetailModal appointment={openAppointment} onClose={() => setOpenId(null)} />}
      {connectOpen && <GhlConnectionModal onClose={() => setConnectOpen(false)} onConnected={refetch} />}
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
