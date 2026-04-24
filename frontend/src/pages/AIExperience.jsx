import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import ChatPanel from "@/components/ChatPanel";
import DynamicView from "@/components/DynamicView";
import AuthButton from "@/components/AuthButton";
import { BRAND } from "@/lib/brand";
import { AiThemeProvider, useAiTheme } from "@/lib/AiThemeContext";

export default function AIExperience() {
  return (
    <AiThemeProvider>
      <AIExperienceInner />
    </AiThemeProvider>
  );
}

function AIExperienceInner() {
  const { theme, setTheme } = useAiTheme();
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

  // Keep the user on the intake/booking screen while they're filling it in.
  // Only allow the AI to switch away on EXPLICIT user intents (welcome/referral/feedback/logout).
  const handleAiIntent = (nextIntent) => {
    const EXPLICIT_SWITCH = new Set([
      "welcome",
      "action:submit_referral",
      "action:share_feedback",
      "page:contact",
      "page:careers",
    ]);
    setIntent((current) => {
      const stickyViews = ["action:start_intake", "action:book_appointment"];
      if (stickyViews.includes(current) && !EXPLICIT_SWITCH.has(nextIntent)) {
        return current; // stay on intake
      }
      return nextIntent;
    });
  };

  const handleAction = (a) => {
    if (a?.type === "prompt" && chatRef.current) chatRef.current.send(a.value);
    if (a?.type === "set_intent" && a.intent) setIntent(a.intent); // user-initiated → always allow
    if (a?.type === "intake_submitted") setIntent("welcome");
  };

  const handleExtract = () => setExtractTick((t) => t + 1);
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <div
      className="ai-root fixed inset-0 flex flex-col"
      data-ai-theme={theme}
      style={{ background: "var(--ai-bg)", color: "var(--ai-fg)" }}
      data-testid="ai-experience"
    >
      <div
        className="relative flex items-center justify-between px-6 lg:px-10 h-20"
        style={{
          background: "var(--ai-bg-top)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: "1px solid var(--ai-border)",
        }}
      >
        <Link to="/" className="flex items-center gap-3" data-testid="ai-logo-link">
          <span
            className="h-10 w-10 rounded-full flex items-center justify-center text-white font-display text-xl"
            style={{ background: "linear-gradient(135deg, var(--ai-accent), var(--ai-deep))" }}
          >
            c+
          </span>
          <span className="font-display text-xl" style={{ color: "var(--ai-fg)" }}>
            Careplus Health Services
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            data-testid="theme-toggle-btn"
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium border transition-all"
            style={{ borderColor: "var(--ai-border)", color: "var(--ai-fg-2)" }}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <Moon className="h-4 w-4" strokeWidth={1.6} /> : <Sun className="h-4 w-4" strokeWidth={1.6} />}
            {theme === "light" ? "Dark mode" : "Light mode"}
          </button>
          <AuthButton variant={theme === "dark" ? "dark" : "light"} />
          <a
            href={BRAND.phoneHref}
            className="hidden md:inline-flex text-sm transition-colors"
            style={{ color: "var(--ai-fg-2)" }}
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
        <aside
          className="hidden md:flex w-[420px] xl:w-[460px]"
          style={{ borderLeft: "1px solid var(--ai-border)" }}
          data-testid="chat-right-panel"
        >
          <ChatPanel ref={chatRef} onIntent={handleAiIntent} onExtract={handleExtract} />
        </aside>
      </div>

      <div
        className="md:hidden h-[55vh]"
        style={{ borderTop: "1px solid var(--ai-border)" }}
      >
        <ChatPanel ref={chatRef} onIntent={handleAiIntent} onExtract={handleExtract} />
      </div>
    </div>
  );
}
