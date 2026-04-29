import React from "react";
import { MessageCircle } from "lucide-react";
import { waLink } from "../lib/api";

export default function WhatsappFab({ phone }) {
  return (
    <a
      data-testid="whatsapp-fab"
      href={waLink(phone)}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-50 bg-[#2B3A2F] hover:bg-[#1F2A22] text-[#F4F1EB] rounded-full shadow-lg p-4 flex items-center gap-2 transition-transform hover:-translate-y-0.5"
    >
      <MessageCircle className="w-5 h-5" strokeWidth={1.6} />
      <span className="hidden sm:inline text-sm tracking-wide pr-1">WhatsApp</span>
    </a>
  );
}
