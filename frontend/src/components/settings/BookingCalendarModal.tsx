"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarClock, Building2, KeyRound, Loader2, X } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { type BookingCalendarFormData, bookingCalendarSchema } from "@/schemas/auth.schema"
import { AuthService } from "@/services/auth.service"

/**
 * Owner connects the booking calendar whose appointments show on the admin
 * dashboard. The calendar lives in ONE sub-account — often a different one
 * from the media-storage sub-account — so it needs its own location-level PIT
 * (scopes: calendars.readonly, contacts.readonly). The backend validates the
 * key live against GHL before saving; bad keys fail here with GHL's reason.
 */
export function BookingCalendarModal({ onClose, onConnected }: { onClose: () => void; onConnected?: () => void }) {
  const [saving, setSaving] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingCalendarFormData>({ resolver: zodResolver(bookingCalendarSchema) })

  const inputClass =
    "w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"

  const onSubmit = async (data: BookingCalendarFormData) => {
    setSaving(true)
    try {
      await AuthService.updateBookingCalendar(data)
      toast.success("Booking calendar connected — appointments will show here")
      onConnected?.()
      onClose()
    } catch (e: any) {
      toast.error(e?.response?.data?.error?.message || "Could not connect the booking calendar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Connect booking calendar</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <p className="text-[12.5px] text-gray-500 leading-relaxed">
            Every appointment booked on this calendar will show on the admin dashboard. Create a Private
            Integration <strong>inside the sub-account that owns the calendar</strong> with the{" "}
            <strong>calendars.readonly</strong> and <strong>contacts.readonly</strong> scopes, then paste the
            Calendar ID, that sub-account&apos;s Location ID, and its token below. The key is validated with GHL
            before saving and stored encrypted.
          </p>

          <div>
            <label htmlFor="bc-calendar" className="block text-sm font-medium text-gray-700 mb-1.5">
              Calendar ID
            </label>
            <div className="relative">
              <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="bc-calendar"
                type="text"
                placeholder="The calendar whose bookings you want to show"
                className={inputClass}
                {...register("ghlBookingCalendarId")}
              />
            </div>
            {errors.ghlBookingCalendarId && (
              <p className="text-red-500 text-xs mt-1">{errors.ghlBookingCalendarId.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="bc-location" className="block text-sm font-medium text-gray-700 mb-1.5">
              Sub-account Location ID
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="bc-location"
                type="text"
                placeholder="The sub-account this calendar lives in"
                className={inputClass}
                {...register("ghlBookingCalendarLocationId")}
              />
            </div>
            {errors.ghlBookingCalendarLocationId && (
              <p className="text-red-500 text-xs mt-1">{errors.ghlBookingCalendarLocationId.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="bc-key" className="block text-sm font-medium text-gray-700 mb-1.5">
              Sub-account PIT token (calendar scopes)
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="bc-key"
                type="password"
                autoComplete="off"
                placeholder="pit-..."
                className={inputClass}
                {...register("ghlBookingCalendarApiKey")}
              />
            </div>
            {errors.ghlBookingCalendarApiKey && (
              <p className="text-red-500 text-xs mt-1">{errors.ghlBookingCalendarApiKey.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Validating with GoHighLevel...
              </>
            ) : (
              "Connect booking calendar"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
