import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Loader2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DEFAULT_CHIPS = [
  "Skilled Nursing",
  "Physical Therapy",
  "Occupational Therapy",
  "Speech Therapy",
  "Home Health Aide",
  "Medical Social Work",
  "About Us",
  "Careers",
  "Book Appointment",
  "Contact",
];

const ChatPanel = forwardRef(function ChatPanel({ onIntent }, ref) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState(DEFAULT_CHIPS.slice(0, 4));
  const sessionRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!sessionRef.current) {
      const existing = localStorage.getItem("careplus-session");
      sessionRef.current = existing || crypto.randomUUID();
      localStorage.setItem("careplus-session", sessionRef.current);
    }
    // Rehydrate conversation from backend
    (async () => {
      try {
        const { data } = await axios.get(`${API}/assistant/history/${sessionRef.current}`);
        const restored = (data?.messages || []).map((m) => ({
          role: m.role,
          content: m.content,
          intent: m.intent,
        }));
        if (restored.length) {
          setMessages(restored);
          const lastIntent = [...restored].reverse().find((m) => m.role === "assistant" && m.intent)?.intent;
          if (lastIntent) onIntent?.(lastIntent);
        }
      } catch {
        /* ignore */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, busy]);

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || busy) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content }]);
    setBusy(true);
    try {
      const { data } = await axios.post(`${API}/assistant/chat`, {
        session_id: sessionRef.current,
        message: content,
      });
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, intent: data.intent }]);
      if (data.intent) onIntent?.(data.intent);
      const next = (data.suggestions && data.suggestions.length ? data.suggestions : DEFAULT_CHIPS).slice(0, 4);
      setSuggestions(next);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry — I had trouble reaching the assistant. Please try again or call 214-234-1612." }]);
    } finally {
      setBusy(false);
    }
  };

  useImperativeHandle(ref, () => ({ send }));

  return (
    <div
      className="h-full w-full flex flex-col"
      style={{ background: "linear-gradient(180deg, rgba(10,14,30,0.96) 0%, rgba(8,12,26,0.98) 100%)" }}
      data-testid="chat-panel"
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #E07A5F, #C17767)" }}>
            <Sparkles className="h-4 w-4 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <div className="font-display text-lg text-[#F3EFE6] leading-none">CarePlus AI</div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-[#B7B3AA] mt-1">always on · claude sonnet 4.5</div>
          </div>
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-4" data-testid="chat-messages">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="font-display text-2xl text-[#F3EFE6]">How can I help?</div>
            <p className="text-sm text-[#B7B3AA] mt-2">Ask about services, book an appointment, or submit a referral.</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              data-testid={`msg-${m.role}-${i}`}
            >
              <div
                className={`rounded-2xl px-4 py-3 max-w-[88%] text-[15px] leading-relaxed ${
                  m.role === "user"
                    ? "text-white"
                    : "text-[#F3EFE6] border border-white/10"
                }`}
                style={
                  m.role === "user"
                    ? { background: "linear-gradient(135deg, #C17767, #A35F52)" }
                    : { background: "rgba(255,255,255,0.04)" }
                }
              >
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {busy && (
          <div className="flex justify-start" data-testid="chat-loader">
            <div className="rounded-2xl px-4 py-3 border border-white/10 bg-white/[0.04] text-[#B7B3AA] flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-3 flex flex-wrap gap-2" data-testid="chat-chips">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            disabled={busy}
            className="text-xs rounded-full border border-white/10 px-3 py-1.5 text-[#D6D2C9] hover:border-white/30 hover:bg-white/[0.05] transition-all disabled:opacity-40"
            data-testid={`chip-${s.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="p-4 pr-28 md:pr-32 border-t border-white/10 flex items-center gap-2"
        data-testid="chat-form"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about care services..."
          className="flex-1 bg-white/[0.04] border border-white/10 rounded-full px-5 py-3 text-[#F3EFE6] placeholder:text-white/30 outline-none focus:border-[#E07A5F]"
          data-testid="chat-input"
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="h-11 w-11 rounded-full flex items-center justify-center text-white disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #E07A5F, #C17767)" }}
          data-testid="chat-send-btn"
          aria-label="Send"
        >
          <Send className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </form>
    </div>
  );
});

export default ChatPanel;
