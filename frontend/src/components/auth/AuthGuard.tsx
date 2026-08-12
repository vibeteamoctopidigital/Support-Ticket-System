"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ROUTES } from "@/constants"
import { homeRouteFor, useAuth } from "@/hooks/auth/useAuth"
import type { UserRole } from "@/types"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  /** Where to send unauthenticated visitors (sub-account pages use /portal). */
  redirectTo?: string
}

export function AuthGuard({ children, allowedRoles, redirectTo = ROUTES.LOGIN }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user, autoLogin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // No-login mode: an unauthenticated visitor is signed in as the default
  // owner automatically instead of being sent to /login. This must NOT apply
  // to areas with a custom redirectTo (e.g. /client's SUB_ACCOUNT pages send
  // to /portal to re-verify access) — auto-logging those in as the owner
  // would silently swap a client's session for the agency owner's and dump
  // them on the admin dashboard, breaking the portal flow entirely.
  const autoLoginEligible = redirectTo === ROUTES.LOGIN
  const [autoLoginState, setAutoLoginState] = useState<"idle" | "pending" | "failed">("idle")

  // A team member still on a temporary password is forced through onboarding
  // (set a real password) before any other authenticated page will render.
  const mustOnboard =
    isAuthenticated &&
    user?.role === "TEAM_MEMBER" &&
    user?.tempPassword === true &&
    pathname !== ROUTES.ONBOARDING

  useEffect(() => {
    if (!isLoading && !isAuthenticated && autoLoginEligible && autoLoginState === "idle") {
      setAutoLoginState("pending")
      autoLogin()
        .then(() => setAutoLoginState("idle"))
        .catch(() => setAutoLoginState("failed"))
    }
  }, [isLoading, isAuthenticated, autoLoginEligible, autoLoginState, autoLogin])

  useEffect(() => {
    if (!isLoading && !isAuthenticated && (!autoLoginEligible || autoLoginState === "failed")) {
      router.push(redirectTo)
    }
  }, [isLoading, isAuthenticated, autoLoginEligible, autoLoginState, router, redirectTo])

  useEffect(() => {
    if (!isLoading && mustOnboard) {
      router.push(ROUTES.ONBOARDING)
    }
  }, [isLoading, mustOnboard, router])

  useEffect(() => {
    // Authenticated but wrong role for this area — send them to their own home.
    if (
      !isLoading &&
      isAuthenticated &&
      allowedRoles &&
      user &&
      !allowedRoles.includes(user.role)
    ) {
      router.push(homeRouteFor(user.role))
    }
  }, [isLoading, isAuthenticated, allowedRoles, user, router])

  if (isLoading || autoLoginState === "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null
  }

  // Block content while we bounce them to onboarding.
  if (mustOnboard) {
    return null
  }

  return <>{children}</>
}
