"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { ROUTES } from "@/constants"
import { useAuth } from "@/hooks/auth/useAuth"

// No-login mode: visiting /login directly signs you in as the default owner
// and sends you straight to the admin dashboard — no form is ever shown.
export default function LoginPage() {
  const { autoLogin } = useAuth()
  const router = useRouter()
  const tried = useRef(false)

  useEffect(() => {
    if (tried.current) return
    tried.current = true
    autoLogin()
      .then(() => router.replace(ROUTES.ADMIN_DASHBOARD))
      .catch(() => {
        /* No owner account exists yet — nothing to fall back to. */
      })
  }, [autoLogin, router])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">Signing you in...</p>
    </div>
  )
}
