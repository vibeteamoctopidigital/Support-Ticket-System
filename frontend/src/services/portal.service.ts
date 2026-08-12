import { API_ENDPOINTS } from "@/constants"
import axiosInstance from "@/lib/axios"
import type { User } from "@/types"

export type PortalEnterResult =
  | { status: "ACTIVE"; user: User; accessToken: string; refreshToken: string }
  | { status: "PENDING"; requestedAt: string; created: boolean }
  | { status: "REJECTED" }
  | { status: "BLOCKED" }
  | { status: "UNKNOWN_LOCATION" }

export const PortalService = {
  async enter(locationId: string): Promise<PortalEnterResult> {
    const response = await axiosInstance.post<{ success: boolean; data: PortalEnterResult }>(
      API_ENDPOINTS.PORTAL.ENTER,
      { locationId },
    )
    return response.data.data
  },

  async resolveEntry(locationId: string | null): Promise<{ view: "agency" | "sub_account" }> {
    const response = await axiosInstance.get<{ success: boolean; data: { view: "agency" | "sub_account" } }>(
      API_ENDPOINTS.PORTAL.RESOLVE_ENTRY,
      { params: locationId ? { locationId } : undefined },
    )
    return response.data.data
  },
}
