"use client"

import { Loader2, XCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useRef, useState } from "react"
import { ROUTES } from "@/constants"
import { PortalService } from "@/services/portal.service"

/**
 * Single Custom Menu Link entry point, installed at BOTH the agency level
 * and inside each sub-account.
 *
 * Recommended GHL URL (documented substitution form, works everywhere):
 *   /entry?location_id={{location.id}}
 *
 * Also tolerated for backward compatibility — GHL substituting it as a bare,
 * keyless query string:
 *   /entry?{{location.id}}
 *
 * Either way, at the agency level GHL does not substitute the variable (it
 * only resolves on the Location sidebar), so the literal placeholder — or an
 * empty query — is treated as the agency view and the owner lands on the
 * admin dashboard.
 */

function extractLocationId(searchParams: URLSearchParams): string | null {
  const raw = searchParams.toString()
  if (!raw) return null
  const value = (
    searchParams.get("location_id") ?? searchParams.get("locationId") ?? Array.from(searchParams.keys())[0] ?? ""
  ).trim()
  // GHL leaves the literal placeholder text in place when a template
  // variable isn't supported in a given context — never treat that as a
  // real ID.
  if (!value || /^\{\{.*\}\}$/.test(value) || value === "undefined" || value === "null") return null
  return value
}

type ScreenState = "resolving" | "error"

function EntryScreen() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [state, setState] = useState<ScreenState>("resolving")
  const resolved = useRef(false)

  useEffect(() => {
    if (resolved.current) return
    resolved.current = true

    const locationId = extractLocationId(searchParams)

    PortalService.resolveEntry(locationId)
      .then(({ view }) => {
        if (view === "agency" || !locationId) {
          router.replace(ROUTES.ADMIN_DASHBOARD)
        } else {
          router.replace(`/portal?location_id=${encodeURIComponent(locationId)}`)
        }
      })
      .catch(() => setState("error"))
  }, [searchParams, router])

  if (state === "error") {
    return (
      <>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-red-50 mb-4">
          <XCircle className="w-7 h-7 text-red-500" />
        </div>
        <h1 className="text-lg font-semibold text-gray-900">Something went wrong</h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Couldn&apos;t figure out where to send you. Please try again shortly.
        </p>
      </>
    )
  }

  return (
    <>
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
      <h1 className="text-lg font-semibold text-gray-900">Loading...</h1>
    </>
  )
}

export default function EntryPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <Suspense fallback={<Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />}>
          <EntryScreen />
        </Suspense>
      </div>
    </div>
  )
}
