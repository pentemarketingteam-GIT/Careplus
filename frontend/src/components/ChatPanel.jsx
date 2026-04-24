import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Loader2, Mic, MicOff, Volume2, Home, RotateCcw } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DEFAULT_CHIPS = ["Start my intake", "Skilled Nursing", "Book Appointment", "Meet the team"];

const ChatPanel = forwardRef(function ChatPanel({ onIntent, onExtract }, ref) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [suggestions, setSuggestions] = useState(DEFAULT_CHIPS);
  const sessionRef = useRef(null);
  const listRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  const goHome = () => {
    onIntent?.("welcome");
  };

  const resetConversation = async () => {
    if (!window.confirm("Start a new conversation? This will clear your chat history.")) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setSpeakingIdx(null);
    }
    // New session id → fresh chat + intake draft
    const newId = crypto.randomUUID();
    sessionRef.current = newId;
    localStorage.setItem("careplus-session", newId);
    setMessages([]);
    setInput("");
    setSuggestions(DEFAULT_CHIPS);
    onIntent?.("welcome");
    onExtract?.();
  };

  useEffect(() => {
    if (!sessionRef.current) {
      const existing = localStorage.getItem("careplus-session");
      sessionRef.current = existing || crypto.randomUUID();
      localStorage.setItem("careplus-session", sessionRef.current);
    }
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
      if (data.extracted && Object.keys(data.extracted).length > 0) onExtract?.(data.extracted);
      const next = (data.suggestions && data.suggestions.length ? data.suggestions : DEFAULT_CHIPS).slice(0, 4);
      setSuggestions(next);
    } catch (e) {
      const detail = e?.response?.data?.detail || "";
      const isBudget = /budget/i.test(detail);
      const msg = isBudget
        ? "The AI assistant is temporarily unavailable (usage limit reached). You can still call us at 214-234-1612 or fill the intake form on the left manually."
        : "Sorry — I had trouble reaching the assistant. Please try again or call 214-234-1612.";
      setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
    } finally {
      setBusy(false);
    }
  };

  useImperativeHandle(ref, () => ({ send }));

  // Voice input via Web Speech API
  const toggleMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice input not supported in this browser. Try Chrome.");
      return;
    }
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e) => {
      let finalText = "";
      for (let i = 0; i < e.results.length; i++) {
        finalText += e.results[i][0].transcript;
      }
      setInput(finalText);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  // TTS playback
  const playTTS = async (idx, text) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (speakingIdx === idx) {
        setSpeakingIdx(null);
        return;
      }
      setSpeakingIdx(idx);
      const { data } = await axios.post(`${API}/assistant/tts`, { text });
      const audio = new Audio(`data:${data.mime};base64,${data.audio_base64}`);
      audioRef.current = audio;
      audio.onended = () => setSpeakingIdx(null);
      audio.onerror = () => setSpeakingIdx(null);
      audio.play();
    } catch {
      setSpeakingIdx(null);
    }
  };

  return (
    <div
      className="h-full w-full flex flex-col relative"
      style={{ background: "var(--ai-chat-bg)" }}
      data-testid="chat-panel"
    >
      {/* Thinking aura */}
      <AnimatePresence>
        {busy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(212,165,55,0.08) 0%, transparent 70%)",
            }}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between px-6 py-5 border-b ai-border relative">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--ai-accent), var(--ai-accent-2))" }}>
            <Sparkles className="h-4 w-4 text-[var(--ai-ink)]" strokeWidth={1.8} />
          </div>
          <div>
            <div className="font-display text-lg text-[var(--ai-fg)] leading-none">CarePlus AI</div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--ai-fg-3)] mt-1">always on · claude sonnet 4.5</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={goHome}
            data-testid="chat-home-btn"
            aria-label="Back to welcome"
            title="Back to welcome"
            className="h-9 w-9 rounded-full flex items-center justify-center border ai-border transition-all text-[var(--ai-fg-3)] hover:text-[var(--ai-accent)]"
          >
            <Home className="h-4 w-4" strokeWidth={1.6} />
          </button>
          <button
            onClick={resetConversation}
            data-testid="chat-reset-btn"
            aria-label="Start new conversation"
            title="Start new conversation (clears chat)"
            className="h-9 w-9 rounded-full flex items-center justify-center border ai-border transition-all text-[var(--ai-fg-3)] hover:text-[var(--ai-accent)]"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.6} />
          </button>
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-4 relative" data-testid="chat-messages">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="font-display text-2xl text-[var(--ai-fg)]">How can I help?</div>
            <p className="text-sm text-[var(--ai-fg-3)] mt-2">Ask about services, book an appointment, or submit a referral.</p>
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
              <div className={`flex flex-col gap-1 max-w-[88%] ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                    m.role === "user" ? "text-[var(--ai-ink)]" : "text-[var(--ai-fg)] border ai-border"
                  }`}
                  style={
                    m.role === "user"
                      ? { background: "linear-gradient(135deg, var(--ai-accent), var(--ai-accent-2))" }
                      : { background: "var(--ai-surface)" }
                  }
                >
                  {m.content}
                </div>
                {m.role === "assistant" && (
                  <button
                    onClick={() => playTTS(i, m.content)}
                    className={`text-[10px] inline-flex items-center gap-1 px-2 py-1 rounded-full border ai-border text-[var(--ai-fg-3)] hover:text-[var(--ai-accent)] hover:border-[var(--ai-accent)]/60 transition-all ${
                      speakingIdx === i ? "text-[var(--ai-accent)] border-[var(--ai-accent)]/60" : ""
                    }`}
                    data-testid={`msg-tts-${i}`}
                  >
                    <Volume2 className="h-3 w-3" strokeWidth={1.6} />
                    {speakingIdx === i ? "Playing..." : "Listen"}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {busy && (
          <div className="flex justify-start" data-testid="chat-loader">
            <div className="rounded-2xl px-4 py-3 border ai-border ai-surface text-[var(--ai-fg-3)] flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-3 flex flex-wrap gap-2 relative" data-testid="chat-chips">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            disabled={busy}
            className="text-xs rounded-full border ai-border px-3 py-1.5 text-[var(--ai-fg-2)] hover:border-[var(--ai-accent)]/60 hover:ai-surface-hover transition-all disabled:opacity-40"
            data-testid={`chip-${s.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className={`p-4 pr-4 pb-16 md:pb-16 md:pr-56 border-t ai-border flex items-center gap-2 transition-all duration-300 ${
          input ? "bg-white/[0.02]" : ""
        }`}
        style={
          input
            ? { boxShadow: "inset 0 0 0 1px rgba(212,165,55,0.15)" }
            : undefined
        }
        data-testid="chat-form"
      >
        <button
          type="button"
          onClick={toggleMic}
          disabled={busy}
          className={`shrink-0 h-11 w-11 rounded-full flex items-center justify-center border transition-all ${
            listening
              ? "border-[var(--ai-accent)] bg-[var(--ai-accent)]/20 text-[var(--ai-accent)] animate-pulse"
              : "ai-border text-[var(--ai-fg-3)] hover:border-[var(--ai-accent)]/60 hover:text-[var(--ai-accent)]"
          }`}
          data-testid="chat-mic-btn"
          aria-label={listening ? "Stop listening" : "Start voice input"}
        >
          {listening ? <MicOff className="h-4 w-4" strokeWidth={1.8} /> : <Mic className="h-4 w-4" strokeWidth={1.8} />}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={listening ? "Listening..." : "Ask about care services..."}
          className="flex-1 min-w-0 ai-surface border ai-border rounded-full px-5 py-3 text-[var(--ai-fg)] placeholder: outline-none focus:border-[var(--ai-accent)]"
          data-testid="chat-input"
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="shrink-0 h-11 w-11 rounded-full flex items-center justify-center text-[var(--ai-ink)] disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, var(--ai-accent), var(--ai-accent-2))" }}
          data-testid="chat-send-btn"
          aria-label="Send"
        >
          <Send className="h-4 w-4" strokeWidth={2} />
        </button>
      </form>
    </div>
  );
});

export default ChatPanel;
