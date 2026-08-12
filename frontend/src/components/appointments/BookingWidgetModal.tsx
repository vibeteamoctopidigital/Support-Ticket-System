"use client"

import Script from "next/script"
import { X } from "lucide-react"

export function BookingWidgetModal({ calendarId, onClose }: { calendarId: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">New booking</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <iframe
            src={`https://api.leadconnectorhq.com/widget/booking/${calendarId}`}
            title="Book an appointment"
            allow="payment"
            scrolling="no"
            style={{ width: "100%", height: 720, border: "none", overflow: "hidden" }}
          />
        </div>
      </div>
      <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="afterInteractive" />
    </div>
  )
}
