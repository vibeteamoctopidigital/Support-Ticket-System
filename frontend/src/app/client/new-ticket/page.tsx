"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { AppShell } from "@/components/layouts/AppShell"
import { TicketForm } from "@/components/tickets/TicketForm"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants"

function NewTicketPage() {
  const router = useRouter()
  const goBack = () => router.push(ROUTES.CLIENT_DASHBOARD)

  return (
    <AppShell
      title="Submit a ticket"
      subtitle="Tell us what's going on and we'll route it to the right person."
      actions={
        <Button variant="outline" onClick={goBack} className="rounded-xl text-gray-600 h-10">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to my tickets
        </Button>
      }
    >
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden max-w-2xl">
        <TicketForm onClose={goBack} />
      </div>
    </AppShell>
  )
}

export default function ClientNewTicketPage() {
  return (
    <AuthGuard allowedRoles={["SUB_ACCOUNT"]} redirectTo={ROUTES.PORTAL}>
      <NewTicketPage />
    </AuthGuard>
  )
}
