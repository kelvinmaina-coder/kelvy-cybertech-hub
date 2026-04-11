import { MessageSquare } from "lucide-react";

const WA_URL = "https://wa.me/254787730624?text=Hello%2C%20I%20need%20help%20with%20Kelvy%20CyberTech%20Hub";

export default function WhatsAppButton() {
  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Kelvy CyberTech support on WhatsApp"
      className="fixed z-50 right-4 bottom-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-medium text-white shadow-xl shadow-slate-900/20 transition hover:bg-[#1ebe57]"
    >
      <MessageSquare className="w-5 h-5" />
      WhatsApp
    </a>
  );
}
