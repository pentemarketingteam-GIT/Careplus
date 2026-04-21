import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Loader2, Mic, MicOff, Volume2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DEFAULT_CHIPS = ["Skilled Nursing", "Book Appointment", "Meet the team", "I have knee pain"];

const ChatPanel = forwardRef(function ChatPanel({ onIntent }, ref) {
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
      const next = (data.suggestions && data.suggestions.length ? data.suggestions : DEFAULT_CHIPS).slice(0, 4);
      setSuggestions(next);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry — I had trouble reaching the assistant. Please try again or call 214-234-1612." },
      ]);
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
      style={{ background: "linear-gradient(180deg, rgba(10,20,16,0.96) 0%, rgba(8,16,12,0.98) 100%)" }}
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

      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 relative">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #D4A537, #C9A227)" }}>
            <Sparkles className="h-4 w-4 text-[#1A1F1B]" strokeWidth={1.8} />
          </div>
          <div>
            <div className="font-display text-lg text-[#F0EADB] leading-none">CarePlus AI</div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-[#B5AD99] mt-1">always on · claude sonnet 4.5</div>
          </div>
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-4 relative" data-testid="chat-messages">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="font-display text-2xl text-[#F0EADB]">How can I help?</div>
            <p className="text-sm text-[#B5AD99] mt-2">Ask about services, book an appointment, or submit a referral.</p>
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
                    m.role === "user" ? "text-[#1A1F1B]" : "text-[#F0EADB] border border-white/10"
                  }`}
                  style={
                    m.role === "user"
                      ? { background: "linear-gradient(135deg, #D4A537, #C9A227)" }
                      : { background: "rgba(255,255,255,0.04)" }
                  }
                >
                  {m.content}
                </div>
                {m.role === "assistant" && (
                  <button
                    onClick={() => playTTS(i, m.content)}
                    className={`text-[10px] inline-flex items-center gap-1 px-2 py-1 rounded-full border border-white/10 text-[#B5AD99] hover:text-[#D4A537] hover:border-[#D4A537]/60 transition-all ${
                      speakingIdx === i ? "text-[#D4A537] border-[#D4A537]/60" : ""
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
            <div className="rounded-2xl px-4 py-3 border border-white/10 bg-white/[0.04] text-[#B5AD99] flex items-center gap-2">
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
            className="text-xs rounded-full border border-white/10 px-3 py-1.5 text-[#D4CDB6] hover:border-[#D4A537]/60 hover:bg-white/[0.05] transition-all disabled:opacity-40"
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
        className={`p-4 pr-4 pb-16 md:pb-16 md:pr-56 border-t border-white/10 flex items-center gap-2 transition-all duration-300 ${
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
              ? "border-[#D4A537] bg-[#D4A537]/20 text-[#D4A537] animate-pulse"
              : "border-white/10 text-[#B5AD99] hover:border-[#D4A537]/60 hover:text-[#D4A537]"
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
          className="flex-1 min-w-0 bg-white/[0.04] border border-white/10 rounded-full px-5 py-3 text-[#F0EADB] placeholder:text-white/30 outline-none focus:border-[#D4A537]"
          data-testid="chat-input"
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="shrink-0 h-11 w-11 rounded-full flex items-center justify-center text-[#1A1F1B] disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #D4A537, #C9A227)" }}
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
