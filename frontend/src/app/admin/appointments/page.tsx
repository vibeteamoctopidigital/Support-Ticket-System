"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, CalendarClock, Plus } from "lucide-react"
import { useState } from "react"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { AppShell } from "@/components/layouts/AppShell"
import { AppointmentCard } from "@/components/appointments/AppointmentCard"
import { AppointmentDetailModal } from "@/components/appointments/AppointmentDetailModal"
import { BookingWidgetModal } from "@/components/appointments/BookingWidgetModal"
import { BookingCalendarModal } from "@/components/settings/BookingCalendarModal"
import { GhlConnectionModal } from "@/components/settings/GhlConnectionModal"
import { Button } from "@/components/ui/button"
import { QUERY_KEYS } from "@/constants"
import { AppointmentService } from "@/services/appointment.service"
import { AuthService } from "@/services/auth.service"

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
  const [openId, setOpenId] = useState<string | null>(null)
  const [connectOpen, setConnectOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)

  // The agency's connected booking calendar (from the backend, so it survives
  // deployments and can differ from any hard-coded calendar in frontend config).
  const { data: bookingCalendar, isLoading: bcLoading } = useQuery({
    queryKey: QUERY_KEYS.BOOKING_CALENDAR,
    queryFn: () => AuthService.getBookingCalendar(),
    retry: false,
  })
  const calendarId = bookingCalendar?.configured ? (bookingCalendar.calendarId ?? null) : null

  const { data: appointments, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.APPOINTMENTS(calendarId ?? ""),
    queryFn: () => AppointmentService.list(calendarId ?? ""),
    enabled: !!calendarId,
    retry: false,
  })
  const openAppointment = appointments?.find((a) => a.id === openId) ?? null

  const errorCode = (error as any)?.response?.data?.error?.code as string | undefined
  const errorMessage = (error as any)?.response?.data?.error?.message as string | undefined
  const notConnected = errorCode === "GHL_NOT_CONNECTED" || errorCode === "GHL_KEY_INVALID"
  const calendarNotSet = !bookingCalendar?.configured || errorCode === "GHL_CALENDAR_NOT_SET"

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKING_CALENDAR })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS(calendarId ?? "") })
  }

  return (
    <AppShell
      title="Booked Appointments"
      subtitle="Live bookings from your GoHighLevel calendar."
      actions={
        calendarId && !notConnected && !calendarNotSet ? (
          <Button onClick={() => setBookingOpen(true)} className="rounded-xl bg-black hover:bg-gray-800 text-white h-10">
            <Plus className="w-4 h-4 mr-1.5" /> New booking
          </Button>
        ) : undefined
      }
    >
      {bcLoading ? (
        <div className="flex justify-center py-24">
          <div className="w-7 h-7 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : calendarNotSet ? (
        <EmptyState
          title="Booking calendar not connected"
          subtitle="Connect the GoHighLevel calendar that receives your bookings — every appointment booked on it will then show up below as a card."
          action={
            <Button onClick={() => setCalendarOpen(true)} className="rounded-xl bg-black hover:bg-gray-800 text-white h-10">
              Connect booking calendar
            </Button>
          }
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
      {calendarOpen && <BookingCalendarModal onClose={() => setCalendarOpen(false)} onConnected={refetch} />}
      {connectOpen && <GhlConnectionModal onClose={() => setConnectOpen(false)} onConnected={refetch} />}
      {bookingOpen && (
        <BookingWidgetModal
          calendarId={calendarId ?? ""}
          onClose={() => {
            setBookingOpen(false)
            // The new booking (if any) needs a moment to land in GHL before it'd show up here anyway.
            refetch()
          }}
        />
      )}
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
