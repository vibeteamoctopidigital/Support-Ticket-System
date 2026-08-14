import { API_ENDPOINTS } from "@/constants"
import axiosInstance from "@/lib/axios"
import type { Appointment } from "@/components/appointments/appointment-bits"

export const AppointmentService = {
  async list(calendarId: string): Promise<Appointment[]> {
    const response = await axiosInstance.get<{ success: boolean; data: Appointment[] }>(
      API_ENDPOINTS.APPOINTMENTS.LIST,
      { params: { calendarId } },
    )
    return response.data.data
  },
}
