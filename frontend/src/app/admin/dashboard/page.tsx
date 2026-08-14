"use client"

import { CalendarClock } from "lucide-react"
import { useState } from "react"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { AppShell } from "@/components/layouts/AppShell"
import { OwnerDashboardContent, TeamDashboardContent } from "@/components/dashboard/DashboardContent"
import { MediaStorageModal } from "@/components/settings/MediaStorageModal"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/auth/useAuth"
import { ROUTES } from "@/constants"

function AdminDashboard() {
  const { user, isOwner } = useAuth()
  const [mediaOpen, setMediaOpen] = useState(false)
  // Highlight the button until media storage is configured — uploads need it.
  const mediaConfigured = user?.mediaStorageConfigured !== false
  const bookingCalendarConfigured = user?.bookingCalendarConfigured === true

  return (
    <AppShell
      title={`Hello, ${user?.name?.split(" ")[0] ?? ""}!`}
      subtitle={isOwner ? "Here's where your support desk stands." : "Your workload at a glance."}
    >
      {!bookingCalendarConfigured && (
        <a
          href={ROUTES.ADMIN_APPOINTMENTS}
          className="block mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between gap-4 hover:border-amber-300 transition-colors"
        >
          <span className="flex items-center gap-3">
            <CalendarClock className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="text-[13px] text-amber-800">
              Bookings aren&apos;t showing yet — connect your GoHighLevel booking calendar to see appointments here.
            </span>
          </span>
          <span className="text-[13px] font-semibold text-amber-700 whitespace-nowrap">Connect →</span>
        </a>
      )}
      {isOwner ? <OwnerDashboardContent /> : <TeamDashboardContent />}
      {mediaOpen && <MediaStorageModal onClose={() => setMediaOpen(false)} />}
    </AppShell>
  )
}

export default function AdminDashboardPage() {
  // Strictly owner-only: a team member landing here is bounced to /team/dashboard.
  return (
    <AuthGuard allowedRoles={["AGENCY_OWNER"]}>
      <AdminDashboard />
    </AuthGuard>
  )
}
