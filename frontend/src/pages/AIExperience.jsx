import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import ChatPanel from "@/components/ChatPanel";
import DynamicView from "@/components/DynamicView";
import { BRAND } from "@/lib/brand";

export default function AIExperience() {
  const [intent, setIntent] = useState("welcome");
  const chatRef = useRef(null);

  const handleAction = (a) => {
    if (a?.type === "prompt" && chatRef.current) chatRef.current.send(a.value);
  };

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: "#070B1F", color: "#F3EFE6" }}
      data-testid="ai-experience"
    >
      {/* Top bar */}
      <div className="relative flex items-center justify-between px-6 lg:px-10 h-20 border-b border-white/5"
        style={{ background: "rgba(7,11,31,0.85)", backdropFilter: "blur(18px)" }}>
        <Link to="/" className="flex items-center gap-3" data-testid="ai-logo-link">
          <span className="h-10 w-10 rounded-full flex items-center justify-center text-white font-display text-xl"
            style={{ background: "linear-gradient(135deg, #E07A5F, #4A6741)" }}>
            c+
          </span>
          <span className="font-display text-xl text-[#F3EFE6]">Careplus Health Services</span>
        </Link>
        <a href={BRAND.phoneHref} className="hidden md:inline-flex text-sm text-[#C8C4BB] hover:text-white transition-colors" data-testid="ai-phone-link">
          {BRAND.phone}
        </a>
      </div>

      {/* Main split layout */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 min-w-0 relative" data-testid="dynamic-left-panel">
          <DynamicView intent={intent} onAction={handleAction} />
        </div>
        <aside className="hidden md:flex w-[420px] xl:w-[460px] border-l border-white/5" data-testid="chat-right-panel">
          <ChatPanel ref={chatRef} onIntent={setIntent} />
        </aside>
      </div>

      {/* Mobile: stacked chat below */}
      <div className="md:hidden border-t border-white/5 h-[55vh]">
        <ChatPanel ref={chatRef} onIntent={setIntent} />
      </div>
    </div>
  );
}
