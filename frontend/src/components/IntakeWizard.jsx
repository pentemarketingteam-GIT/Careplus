import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Send, Lock } from "lucide-react";
import { toast } from "sonner";
import { celebrate } from "@/lib/confetti";
import { useAuth } from "@/lib/AuthContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FIELDS = [
  { key: "name", label: "Full name", required: true, type: "text" },
  { key: "phone", label: "Phone", required: true, type: "tel" },
  { key: "email", label: "Email", required: false, type: "email" },
  { key: "caregiver_relationship", label: "Caregiver relationship", required: false, type: "select", options: ["self", "spouse", "child", "parent", "sibling", "other"] },
  { key: "condition", label: "Condition / reason for care", required: true, type: "text" },
  { key: "service", label: "Service needed", required: true, type: "select", options: ["skilled-nursing", "physical-therapy", "occupational-therapy", "speech-therapy", "home-health-aide", "medical-social-work"] },
  { key: "urgency", label: "Urgency", required: false, type: "select", options: ["routine", "soon", "urgent"] },
  { key: "preferred_contact_time", label: "Preferred contact time", required: false, type: "time" },
  { key: "insurance_provider", label: "Insurance provider", required: false, type: "text" },
  { key: "insurance_id", label: "Insurance member ID", required: false, type: "text" },
];

/**
 * IntakeWizard — live-updating form that mirrors AI-extracted fields and lets user edit.
 * Auto-fetches existing intake on mount and when `refreshTick` changes.
 */
export default function IntakeWizard({ sessionId, refreshTick, onAction }) {
  const { user, login } = useAuth();
  const [fields, setFields] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      try {
        const { data } = await axios.get(`${API}/intake/${sessionId}`);
        setFields((prev) => ({ ...(data?.fields || {}), ...prev }));
      } catch {
        /* ignore */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, refreshTick]);

  const update = async (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    try {
      await axios.patch(`${API}/intake/${sessionId}`, { fields: { [key]: value } });
    } catch {
      /* ignore */
    }
  };

  const completeness = () => {
    const done = FIELDS.filter((f) => (fields?.[f.key] || "").toString().trim().length > 0).length;
    return Math.round((done / FIELDS.length) * 100);
  };

  const canSubmit = fields?.name && fields?.phone && fields?.condition && fields?.service;

  const submit = async () => {
    if (!canSubmit) return toast.error("Please fill name, phone, condition, and service.");
    setBusy(true);
    try {
      const { data } = await axios.post(`${API}/intake/${sessionId}/submit`, {}, { withCredentials: true });
      celebrate();
      const hi = fields.name ? `, ${fields.name.split(" ")[0]}` : "";
      toast.success(`Thank you${hi}! Appointment request sent. We'll reach out within one business day.`);
      if (data?.logged_in) toast.success("Saved to your profile.");
      onAction?.({ type: "intake_submitted" });
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const pct = completeness();

  return (
    <div className="mt-8" data-testid="intake-wizard">
      {/* Progress */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs tracking-[0.22em] uppercase font-semibold text-[#D4A537]">Your intake</div>
        <div className="text-xs text-[#B5AD99]">{pct}% complete</div>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #D4A537, #C9A227)" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Save to profile banner */}
      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3">
        <Lock className="h-4 w-4 text-[#D4A537] shrink-0" strokeWidth={1.6} />
        {user ? (
          <div className="text-sm text-[#D4CDB6]">
            Signed in as <span className="font-semibold text-[#F0EADB]">{user.name}</span> — your intake will be saved to your profile.
          </div>
        ) : (
          <div className="text-sm text-[#D4CDB6] flex items-center justify-between gap-3 flex-1">
            <span>Continue as guest, or sign in to save this intake for later.</span>
            <button
              onClick={login}
              data-testid="intake-signin-btn"
              className="text-xs rounded-full border border-[#D4A537]/60 text-[#D4A537] hover:bg-[#D4A537]/10 px-3 py-1.5 shrink-0"
            >
              Sign in
            </button>
          </div>
        )}
      </div>

      {/* Fields grid */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {FIELDS.map((f) => {
          const val = fields[f.key] || "";
          const filled = val.toString().trim().length > 0;
          return (
            <motion.div
              key={f.key}
              initial={false}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
              data-testid={`intake-field-${f.key}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {filled ? (
                  <CheckCircle2 className="h-4 w-4 text-[#D4A537]" strokeWidth={1.8} />
                ) : (
                  <Circle className="h-4 w-4 text-white/30" strokeWidth={1.5} />
                )}
                <div className="text-xs tracking-wide text-[#B5AD99]">
                  {f.label}
                  {f.required && <span className="text-[#D4A537]"> *</span>}
                </div>
              </div>
              {f.type === "select" ? (
                <select
                  value={val}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="w-full rounded-lg px-3 py-2 bg-white/[0.04] border border-white/10 text-[#F0EADB] outline-none focus:border-[#D4A537]"
                  data-testid={`intake-select-${f.key}`}
                >
                  <option value="" style={{ background: "#0A1410" }}>—</option>
                  {f.options.map((o) => (
                    <option key={o} value={o} style={{ background: "#0A1410" }}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type}
                  value={val}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="w-full rounded-lg px-3 py-2 bg-white/[0.04] border border-white/10 text-[#F0EADB] outline-none focus:border-[#D4A537]"
                  data-testid={`intake-input-${f.key}`}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {canSubmit && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={submit}
            disabled={busy}
            className="btn-accent mt-8 w-full md:w-auto"
            data-testid="intake-submit-btn"
          >
            <Send className="h-4 w-4" strokeWidth={1.6} />
            {busy ? "Submitting..." : "Submit & request appointment"}
          </motion.button>
        )}
      </AnimatePresence>
      <p className="mt-4 text-xs text-[#B5AD99]">
        Keep chatting with the AI — answers you give will auto-fill this form.
      </p>
    </div>
  );
}
