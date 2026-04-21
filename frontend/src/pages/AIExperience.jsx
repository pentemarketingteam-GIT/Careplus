import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ChatPanel from "@/components/ChatPanel";
import DynamicView from "@/components/DynamicView";
import AuthButton from "@/components/AuthButton";
import { BRAND } from "@/lib/brand";

export default function AIExperience() {
  const [intent, setIntent] = useState("welcome");
  const [sessionId, setSessionId] = useState(null);
  const [extractTick, setExtractTick] = useState(0);
  const chatRef = useRef(null);

  useEffect(() => {
    const existing = localStorage.getItem("careplus-session");
    const id = existing || crypto.randomUUID();
    if (!existing) localStorage.setItem("careplus-session", id);
    setSessionId(id);
  }, []);

  const handleAction = (a) => {
    if (a?.type === "prompt" && chatRef.current) chatRef.current.send(a.value);
    if (a?.type === "intake_submitted") setIntent("welcome");
  };

  const handleExtract = () => setExtractTick((t) => t + 1);

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: "#0A1410", color: "#F0EADB" }}
      data-testid="ai-experience"
    >
      <div
        className="relative flex items-center justify-between px-6 lg:px-10 h-20 border-b border-white/5"
        style={{ background: "rgba(10,20,16,0.85)", backdropFilter: "blur(18px)" }}
      >
        <Link to="/" className="flex items-center gap-3" data-testid="ai-logo-link">
          <span
            className="h-10 w-10 rounded-full flex items-center justify-center text-white font-display text-xl"
            style={{ background: "linear-gradient(135deg, #D4A537, #2D4A2B)" }}
          >
            c+
          </span>
          <span className="font-display text-xl text-[#F0EADB]">Careplus Health Services</span>
        </Link>
        <div className="flex items-center gap-4">
          <AuthButton variant="dark" />
          <a
            href={BRAND.phoneHref}
            className="hidden md:inline-flex text-sm text-[#C5BFA8] hover:text-white transition-colors"
            data-testid="ai-phone-link"
          >
            {BRAND.phone}
          </a>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 min-w-0 relative" data-testid="dynamic-left-panel">
          <DynamicView intent={intent} onAction={handleAction} sessionId={sessionId} extractTick={extractTick} />
        </div>
        <aside className="hidden md:flex w-[420px] xl:w-[460px] border-l border-white/5" data-testid="chat-right-panel">
          <ChatPanel ref={chatRef} onIntent={setIntent} onExtract={handleExtract} />
        </aside>
      </div>

      <div className="md:hidden border-t border-white/5 h-[55vh]">
        <ChatPanel ref={chatRef} onIntent={setIntent} onExtract={handleExtract} />
      </div>
    </div>
  );
}
