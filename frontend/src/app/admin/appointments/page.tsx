"use client"

import { useQuery } from "@tanstack/react-query"
import { CalendarClock, Check, Copy } from "lucide-react"
import { useState } from "react"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { AppShell } from "@/components/layouts/AppShell"
import { AppointmentCard } from "@/components/appointments/AppointmentCard"
import { AppointmentDetailModal } from "@/components/appointments/AppointmentDetailModal"
import { QUERY_KEYS } from "@/constants"
import { useAuth } from "@/hooks/auth/useAuth"
import { AppointmentService } from "@/services/appointment.service"

/** Backend base URL without the trailing /api — the webhook route lives under /api/webhooks. */
function apiOrigin(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ""
  return apiUrl.replace(/\/api\/?$/, "")
}

function WebhookSetupNotice({ agencyId }: { agencyId: string }) {
  const [copied, setCopied] = useState(false)
  const webhookUrl = `${apiOrigin()}/api/webhooks/ghl/appointments/${agencyId}`

  const copy = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 py-24 px-6 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <CalendarClock className="w-7 h-7 text-blue-500" />
      </div>
      <h3 className="text-[15px] font-bold text-gray-900">No bookings yet</h3>
      <p className="text-[13px] text-gray-500 mt-1.5 max-w-md leading-relaxed">
        Every appointment booked on any of your GoHighLevel calendars shows up here automatically — no calendar ID or
        API key needed. In GoHighLevel, add a Workflow with an <strong>Appointment Booked</strong> trigger and a{" "}
        <strong>Webhook</strong> action pointed at this URL:
      </p>
      <div className="mt-4 w-full max-w-md flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
        <code className="flex-1 text-[12px] text-gray-700 text-left break-all">{webhookUrl}</code>
        <button
          type="button"
          onClick={copy}
          className="flex-shrink-0 inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[12px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
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
        <WebhookSetupNotice agencyId={user!.agencyId} />
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
