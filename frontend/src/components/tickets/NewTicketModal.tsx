"use client"

import { X } from "lucide-react"
import { useAuth } from "@/hooks/auth/useAuth"
import { TicketForm } from "./TicketForm"

export function NewTicketModal({ onClose }: { onClose: () => void }) {
  const { isSubAccount } = useAuth()

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{isSubAccount ? "Submit a ticket" : "New ticket"}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <TicketForm onClose={onClose} />
      </div>
    </div>
  )
}
