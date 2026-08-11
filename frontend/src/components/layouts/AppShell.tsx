"use client"

import { useQuery } from "@tanstack/react-query"
import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { QUERY_KEYS } from "@/constants"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/auth/useAuth"
import { cn } from "@/lib/utils"
import { SubAccountsService } from "@/services/subaccounts.service"
import { TicketService } from "@/services/ticket.service"

/**
 * GHL-native top-tab shell. This app is embedded inside GoHighLevel through a
 * Custom Menu Link, and the client must never feel they left GHL — so no
 * custom sidebar, no product branding: a white top tab bar, GHL's light gray
 * canvas, and white bordered cards, exactly like GHL's own Payments pages.
 */

interface NavItem {
  href: string
  label: string
  /** Key into the live counts — renders an attention badge when > 0. */
  countKey?: "review" | "unassigned" | "requests" | "myActive"
}

const OWNER_NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/board", label: "Support board" },
  { href: "/admin/review", label: "Review queue", countKey: "review" },
  { href: "/admin/unassigned", label: "Unassigned", countKey: "unassigned" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/sub-accounts", label: "Sub-accounts" },
  { href: "/admin/requests", label: "Access requests", countKey: "requests" },
]

// Everything except Dashboard itself — these fill the "Dashboard" dropdown's menu.
const OWNER_MENU_ITEMS = OWNER_NAV.filter((item) => item.href !== "/admin/dashboard")

const TEAM_NAV: NavItem[] = [
  { href: "/team/dashboard", label: "Dashboard" },
  { href: "/team/board", label: "My tickets", countKey: "myActive" },
]

const CLIENT_NAV: NavItem[] = [{ href: "/client/dashboard", label: "My tickets" }]

/**
 * Live attention counts for the nav badges. Uses the SAME query keys as the
 * pages themselves so the cache is shared — the Review queue page and its
 * badge always agree. Polls gently so counts stay fresh while embedded.
 */
function useNavCounts(role: { isOwner: boolean; isTeamMember: boolean }) {
  const shared = { staleTime: 30_000, refetchInterval: 60_000 } as const

  const review = useQuery({
    queryKey: QUERY_KEYS.REVIEW,
    queryFn: () => TicketService.getReview(),
    enabled: role.isOwner,
    ...shared,
  })
  const unassigned = useQuery({
    queryKey: QUERY_KEYS.UNASSIGNED,
    queryFn: () => TicketService.getUnassigned(),
    enabled: role.isOwner,
    ...shared,
  })
  const requests = useQuery({
    queryKey: QUERY_KEYS.SUB_ACCOUNT_REQUESTS,
    queryFn: () => SubAccountsService.listRequests(),
    enabled: role.isOwner,
    ...shared,
  })
  const mine = useQuery({
    queryKey: QUERY_KEYS.MY_TICKETS,
    queryFn: () => TicketService.getMine(),
    enabled: role.isTeamMember,
    ...shared,
  })

  return {
    review: review.data?.length ?? 0,
    unassigned: unassigned.data?.length ?? 0,
    requests: requests.data?.length ?? 0,
    myActive: mine.data?.filter((t: { stage: string }) => t.stage !== "RESOLVED").length ?? 0,
  }
}

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
      {count > 99 ? "99+" : count}
    </span>
  )
}

export function AppShell({
  children,
  title,
  subtitle,
  actions,
  fullWidth = false,
}: {
  children: React.ReactNode
  title: string
  subtitle?: string
  actions?: React.ReactNode
  /** Board views need the whole viewport — skips the GHL content max-width. */
  fullWidth?: boolean
}) {
  const pathname = usePathname()
  const { isOwner, isTeamMember, isSubAccount } = useAuth()
  const counts = useNavCounts({ isOwner, isTeamMember })

  const nav = isSubAccount ? CLIENT_NAV : isOwner ? OWNER_NAV : TEAM_NAV

  return (
    <div className="min-h-screen bg-[#F0F4F8] mt-5">
      {/* GHL-style top tab bar — transparent over the canvas, bordered tabs */}
      <header className="bg-transparent border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 sm:px-6 h-[54px] flex items-center justify-between gap-3">
          {isOwner ? (
            <>
              {/* Owner nav collapses into one pill — the "Dashboard" label
                  navigates directly, the chevron opens the rest of the sections. */}
              <div className="inline-flex h-11 flex-shrink-0 items-center overflow-hidden rounded-lg border border-gray-900 bg-gray-900 text-white">
                <Link
                  href="/admin/dashboard"
                  className="flex h-full items-center px-5 text-[15px] font-semibold transition-colors hover:bg-gray-800"
                >
                  Dashboard
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label="More sections"
                    className="flex h-full items-center border-l border-gray-700 px-3 transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400/40"
                  >
                    <ChevronDown className="h-5 w-5 text-gray-300" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="z-[110] w-56 rounded-xl border border-gray-200 bg-white p-1 text-gray-900 shadow-lg"
                  >
                    {OWNER_MENU_ITEMS.map((item) => {
                      const active = pathname.startsWith(item.href)
                      const count = item.countKey ? counts[item.countKey] : 0
                      return (
                        <DropdownMenuItem
                          key={item.href}
                          asChild
                          className={cn(
                            "cursor-pointer rounded-lg px-3 py-2 text-[13px] focus:bg-blue-50 focus:text-blue-700",
                            active ? "text-blue-600 font-medium bg-blue-50/50" : "text-gray-700",
                          )}
                        >
                          <Link href={item.href} className="flex w-full items-center justify-between">
                            {item.label}
                            <CountBadge count={count} />
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Opposite corner from the dropdown — jumps straight to the
                  ticket pipeline, the app's main working view. */}
              <Link
                href="/admin/board"
                className={cn(
                  "inline-flex h-11 flex-shrink-0 items-center rounded-lg border px-5 text-[15px] font-semibold transition-colors",
                  pathname.startsWith("/admin/board")
                    ? "text-blue-600 bg-blue-50/50 border-blue-200"
                    : "text-gray-600 bg-white border-gray-200 hover:text-gray-900 hover:bg-gray-50",
                )}
              >
                Support Ticket
              </Link>
            </>
          ) : (
            <nav className="flex items-center overflow-x-auto py-2 flex-1" aria-label="Main">
              {nav.map((item, i) => {
                const active = pathname.startsWith(item.href)
                const count = item.countKey ? counts[item.countKey] : 0
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center whitespace-nowrap h-9 px-3.5 text-[13px] font-medium border transition-colors -ml-px",
                      i === 0 && "ml-0 rounded-l-lg",
                      i === nav.length - 1 && "rounded-r-lg",
                      active
                        ? "text-blue-600 bg-blue-50/50 border-blue-200 relative z-10"
                        : "text-gray-600 bg-gray-50  border-gray-200 hover:text-gray-900 hover:bg-gray-100",
                    )}
                  >
                    {item.label}
                    <CountBadge count={count} />
                  </Link>
                )
              })}
            </nav>
          )}
        </div>
      </header>

      {/* Page canvas — GHL gray with constrained content width */}
      <div className={cn("px-4 sm:px-6 py-6", !fullWidth && "w-full mx-auto")}>
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-[24px] font-bold text-gray-900 truncate">{title}</h1>
            {subtitle && <p className="text-[13px] text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </div>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}
