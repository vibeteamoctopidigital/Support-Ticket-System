"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Building2, KeyRound, Loader2, X } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { type GhlConnectionFormData, ghlConnectionSchema } from "@/schemas/auth.schema"
import { AuthService } from "@/services/auth.service"

/**
 * Connects (or reconnects) this agency's agency-level GHL account after
 * signup — needed for agencies that started with no GHL credentials at all
 * (e.g. seeded ones). The backend validates the key live against GHL before
 * saving; bad keys fail here with GHL's exact reason.
 */
export function GhlConnectionModal({ onClose, onConnected }: { onClose: () => void; onConnected?: () => void }) {
  const [saving, setSaving] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GhlConnectionFormData>({ resolver: zodResolver(ghlConnectionSchema) })

  const inputClass =
    "w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"

  const onSubmit = async (data: GhlConnectionFormData) => {
    setSaving(true)
    try {
      await AuthService.updateGhlConnection(data)
      toast.success("GoHighLevel connected")
      onConnected?.()
      onClose()
    } catch (e: any) {
      toast.error(e?.response?.data?.error?.message || "Could not connect this GHL account")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Connect GoHighLevel</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <p className="text-[12.5px] text-gray-500 leading-relaxed">
            Create an agency-level Private Integration in GoHighLevel and paste its Company ID and token below. The
            key is validated with GHL before saving and stored encrypted.
          </p>

          <div>
            <label htmlFor="ghl-company" className="block text-sm font-medium text-gray-700 mb-1.5">
              Agency Company ID
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="ghl-company" type="text" placeholder="Your agency-level GHL ID" className={inputClass} {...register("ghlCompanyId")} />
            </div>
            {errors.ghlCompanyId && <p className="text-red-500 text-xs mt-1">{errors.ghlCompanyId.message}</p>}
          </div>

          <div>
            <label htmlFor="ghl-key" className="block text-sm font-medium text-gray-700 mb-1.5">
              Agency PIT token
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="ghl-key" type="password" autoComplete="off" placeholder="pit-..." className={inputClass} {...register("ghlApiKey")} />
            </div>
            {errors.ghlApiKey && <p className="text-red-500 text-xs mt-1">{errors.ghlApiKey.message}</p>}
          </div>

          <div>
            <label htmlFor="ghl-location" className="block text-sm font-medium text-gray-700 mb-1.5">
              Primary Location ID
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="ghl-location"
                type="text"
                placeholder="The sub-account this agency operates through"
                className={inputClass}
                {...register("ghlLocationId")}
              />
            </div>
            {errors.ghlLocationId && <p className="text-red-500 text-xs mt-1">{errors.ghlLocationId.message}</p>}
            <p className="text-[11px] text-gray-400 mt-1.5">Used to look up calendar bookings for this agency.</p>
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
              "Connect"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
