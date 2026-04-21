import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Phone, MapPin, Stethoscope, Heart, Activity, MessageCircle, Briefcase, Calendar, Users, Sparkles, ShieldCheck, Clock, ArrowRight, Star } from "lucide-react";
import { BRAND, SERVICES, ABOUT_POINTS } from "@/lib/brand";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ICONS = {
  "skilled-nursing": Stethoscope,
  "physical-therapy": Activity,
  "occupational-therapy": Heart,
  "speech-therapy": MessageCircle,
  "home-health-aide": Users,
  "medical-social-work": Briefcase,
};

export default function DynamicView({ intent, onAction }) {
  const view = resolveView(intent);
  return (
    <div className="relative w-full h-full overflow-hidden" data-testid="dynamic-view">
      <AmbientBg />
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 h-full w-full overflow-y-auto"
          data-testid={`view-${view}`}
        >
          {view === "welcome" && <WelcomeView onAction={onAction} />}
          {view === "about" && <AboutView onAction={onAction} />}
          {view === "contact" && <ContactView />}
          {view === "careers" && <CareersView onAction={onAction} />}
          {view === "services" && <ServicesGridView onAction={onAction} />}
          {view === "book" && <BookView />}
          {view === "referral" && <ReferralView />}
          {view === "feedback" && <FeedbackView />}
          {view.startsWith("service:") && <ServiceDetailView slug={view.slice(8)} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function resolveView(intent) {
  if (!intent) return "welcome";
  if (intent === "welcome") return "welcome";
  if (intent === "page:about") return "about";
  if (intent === "page:contact") return "contact";
  if (intent === "page:careers") return "careers";
  if (intent === "page:services") return "services";
  if (intent === "action:book_appointment") return "book";
  if (intent === "action:submit_referral") return "referral";
  if (intent === "action:share_feedback") return "feedback";
  if (intent.startsWith("service:")) return `service:${intent.slice(8)}`;
  return "welcome";
}

function AmbientBg() {
  return (
    <>
      <div
        className="absolute -top-40 -left-40 w-[720px] h-[720px] rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{ background: "radial-gradient(circle, #C9A22744 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-40 right-0 w-[620px] h-[620px] rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: "radial-gradient(circle, #2D4A2Baa 0%, transparent 70%)" }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </>
  );
}

function Frame({ children }) {
  return (
    <div className="min-h-full w-full flex flex-col items-center justify-center px-8 md:px-16 py-20 text-[#EAE5D9]">
      <div className="max-w-4xl w-full">{children}</div>
    </div>
  );
}

function WelcomeView({ onAction }) {
  return (
    <Frame>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
        <div className="h-20 w-20 mx-auto rounded-2xl border border-white/15 flex items-center justify-center mb-10"
          style={{ background: "linear-gradient(135deg, rgba(212,165,55,0.25), rgba(74,103,65,0.15))" }}>
          <span className="font-display text-3xl text-[#EAE5D9]">c+</span>
        </div>
      </motion.div>
      <h1 className="font-display text-6xl md:text-7xl leading-[1.02] text-center">
        Welcome to <span className="text-[#D4A537] serif-italic">CarePlus</span>
      </h1>
      <p className="mt-8 text-center text-xl text-[#B5AD99]">
        Your personalized healthcare experience.
      </p>
      <p className="mt-2 text-center text-xl text-[#B5AD99]">
        Ask our AI assistant anything to get started.
      </p>

      <div className="mt-16 flex flex-wrap justify-center gap-3 text-sm text-[#B5AD99]">
        {[
          "Tell me about skilled nursing",
          "Book an appointment",
          "What areas do you serve?",
          "I want to refer a patient",
        ].map((s) => (
          <button
            key={s}
            onClick={() => onAction?.({ type: "prompt", value: s })}
            className="rounded-full px-4 py-2 border border-white/10 hover:border-white/30 hover:text-white transition-all"
            data-testid={`welcome-suggestion-${s.slice(0,8)}`}
          >
            Try asking: {s}
          </button>
        ))}
      </div>
    </Frame>
  );
}

function SectionLabel({ children }) {
  return <div className="text-[11px] tracking-[0.28em] uppercase font-semibold text-[#D4A537]">{children}</div>;
}

function ServiceDetailView({ slug }) {
  const s = SERVICES.find((x) => x.slug === slug) || SERVICES[0];
  const Icon = ICONS[s.slug] || Stethoscope;
  return (
    <Frame>
      <SectionLabel>Our Care</SectionLabel>
      <div className="flex items-center gap-5 mt-4">
        <div className="h-14 w-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(212,165,55,0.2)", border: "1px solid rgba(212,165,55,0.4)" }}>
          <Icon className="h-7 w-7 text-[#D4A537]" strokeWidth={1.4} />
        </div>
        <h2 className="font-display text-5xl md:text-6xl leading-tight">{s.name}</h2>
      </div>
      <p className="mt-8 text-xl leading-relaxed text-[#C5BFA8] max-w-3xl">{s.desc}</p>

      <div className="mt-12 rounded-3xl overflow-hidden border border-white/10">
        <img src={s.image} alt={s.name} className="w-full h-[360px] object-cover" />
      </div>

      <div className="mt-10 grid sm:grid-cols-3 gap-4 text-sm">
        {[
          { icon: <ShieldCheck className="h-4 w-4" />, label: "Licensed & insured" },
          { icon: <Heart className="h-4 w-4" />, label: "Physician-directed" },
          { icon: <Clock className="h-4 w-4" />, label: "Flexible scheduling" },
        ].map((b) => (
          <div key={b.label} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-[#D4CDB6]">
            <span className="text-[#D4A537]">{b.icon}</span> {b.label}
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <a href={BRAND.phoneHref} className="btn-accent" data-testid={`dyn-call-${s.slug}`}>
          <Phone className="h-4 w-4" strokeWidth={1.5} /> Call {BRAND.phone}
        </a>
      </div>
    </Frame>
  );
}

function ServicesGridView() {
  return (
    <Frame>
      <SectionLabel>All Services</SectionLabel>
      <h2 className="font-display text-5xl md:text-6xl mt-4">A full range of care.</h2>
      <div className="mt-10 grid md:grid-cols-2 gap-5">
        {SERVICES.map((s) => {
          const Icon = ICONS[s.slug] || Stethoscope;
          return (
            <div key={s.slug} className="rounded-2xl p-6 border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(212,165,55,0.2)" }}>
                <Icon className="h-5 w-5 text-[#D4A537]" strokeWidth={1.4} />
              </div>
              <div className="font-display text-2xl">{s.name}</div>
              <p className="text-sm text-[#B5AD99] mt-2 leading-relaxed">{s.desc}</p>
            </div>
          );
        })}
      </div>
    </Frame>
  );
}

function AboutView() {
  return (
    <Frame>
      <SectionLabel>About Us</SectionLabel>
      <h2 className="font-display text-5xl md:text-6xl mt-4 leading-tight">
        <span className="text-[#D4A537] serif-italic">Compassion</span> in every action.
      </h2>
      <p className="mt-6 text-lg text-[#C5BFA8] max-w-3xl leading-relaxed">
        {BRAND.name} is a dedicated home health care provider serving Dallas and surrounding counties. We work closely with patients, families, and physicians to deliver care that's thoughtful, dignified, and deeply personal.
      </p>

      <div className="mt-10 grid md:grid-cols-2 gap-4">
        {ABOUT_POINTS.map((p) => (
          <div key={p} className="flex items-start gap-3 rounded-xl border border-white/10 p-4 bg-white/[0.03]">
            <span className="mt-1.5 h-1.5 w-5 rounded-full bg-[#D4A537]" />
            <span className="text-[#D4CDB6]">{p}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Heart, t: "Compassion" },
          { icon: ShieldCheck, t: "Safety" },
          { icon: Users, t: "Partnership" },
          { icon: Sparkles, t: "Quality" },
        ].map(({ icon: I, t }) => (
          <div key={t} className="rounded-2xl border border-white/10 p-5 bg-white/[0.03]">
            <I className="h-5 w-5 text-[#D4A537]" strokeWidth={1.4} />
            <div className="font-display text-xl mt-3">{t}</div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

function ContactView() {
  return (
    <Frame>
      <SectionLabel>Contact</SectionLabel>
      <h2 className="font-display text-5xl md:text-6xl mt-4">Let's talk.</h2>
      <p className="mt-5 text-lg text-[#C5BFA8] max-w-2xl">
        Reach us directly — we usually respond within one business day. Your conversation with the AI assistant can also be turned into an appointment request.
      </p>

      <div className="mt-10 grid sm:grid-cols-2 gap-4">
        <InfoCard icon={<Phone className="h-5 w-5" />} label="Phone" value={BRAND.phone} href={BRAND.phoneHref} />
        <InfoCard icon={<MapPin className="h-5 w-5" />} label="Service Area" value={BRAND.address} />
        <InfoCard icon={<Clock className="h-5 w-5" />} label="Hours" value={BRAND.hours} />
        <InfoCard icon={<Sparkles className="h-5 w-5" />} label="Email" value={BRAND.email} href={`mailto:${BRAND.email}`} />
      </div>

      <a href={BRAND.phoneHref} className="btn-accent mt-10 inline-flex" data-testid="dyn-contact-call">
        <Phone className="h-4 w-4" strokeWidth={1.5} /> Call {BRAND.phone}
      </a>
    </Frame>
  );
}

function CareersView() {
  const OPENINGS = [
    "Registered Nurse (RN)",
    "Physical Therapist",
    "Occupational Therapist",
    "Home Health Aide (HHA)",
    "Speech-Language Pathologist",
    "Medical Social Worker",
  ];
  return (
    <Frame>
      <SectionLabel>Careers</SectionLabel>
      <h2 className="font-display text-5xl md:text-6xl mt-4">Do the work that <span className="serif-italic text-[#D4A537]">matters</span>.</h2>
      <p className="mt-5 text-lg text-[#C5BFA8] max-w-2xl">
        Join clinicians and caregivers who believe great care is personal. Hiring across North Texas.
      </p>
      <div className="mt-10 divide-y divide-white/10 border border-white/10 rounded-2xl bg-white/[0.03]">
        {OPENINGS.map((o) => (
          <div key={o} className="p-5 flex items-center justify-between">
            <div className="font-display text-xl">{o}</div>
            <a href={BRAND.phoneHref} className="text-[#D4A537] text-sm inline-flex items-center gap-2 hover:text-[#EAE5D9]">
              Apply <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </a>
          </div>
        ))}
      </div>
    </Frame>
  );
}

function BookView() {
  return (
    <Frame>
      <SectionLabel>Book Appointment</SectionLabel>
      <h2 className="font-display text-5xl md:text-6xl mt-4">Schedule your visit.</h2>
      <p className="mt-5 text-lg text-[#C5BFA8] max-w-2xl">
        Tell the assistant your preferred date and service — or use the form below. We'll reach out within one business day.
      </p>

      <AppointmentForm />
    </Frame>
  );
}

function ReferralView() {
  return (
    <Frame>
      <SectionLabel>Submit Referral</SectionLabel>
      <h2 className="font-display text-5xl md:text-6xl mt-4">Refer a patient.</h2>
      <p className="mt-5 text-lg text-[#C5BFA8] max-w-2xl">
        Share a recommendation — our intake team will follow up discreetly.
      </p>
      <ReferralForm />
    </Frame>
  );
}

function FeedbackView() {
  return (
    <Frame>
      <SectionLabel>Your Feedback</SectionLabel>
      <h2 className="font-display text-5xl md:text-6xl mt-4">Share your experience.</h2>
      <p className="mt-5 text-lg text-[#C5BFA8] max-w-2xl">
        Your voice helps us deliver better care. Rate your experience and tell us what we can improve.
      </p>
      <FeedbackForm />
    </Frame>
  );
}

function InfoCard({ icon, label, value, href }) {
  const inner = (
    <>
      <div className="flex items-center gap-2 text-[#D4A537]">{icon}<span className="text-[11px] tracking-[0.22em] uppercase font-semibold">{label}</span></div>
      <div className="mt-2 text-xl font-display text-[#EAE5D9]">{value}</div>
    </>
  );
  const cls = "rounded-2xl border border-white/10 p-5 bg-white/[0.03] hover:bg-white/[0.06] transition-colors block";
  return href ? <a href={href} className={cls}>{inner}</a> : <div className={cls}>{inner}</div>;
}

// ---------- forms (dark) ----------

function DarkField({ label, testid, ...props }) {
  return (
    <div>
      <div className="text-xs text-[#B5AD99] mb-1.5 tracking-wide">{label}</div>
      <input
        {...props}
        data-testid={testid}
        className="w-full rounded-xl px-4 py-3 bg-white/[0.04] border border-white/10 text-[#EAE5D9] placeholder:text-white/30 outline-none focus:border-[#D4A537] focus:bg-white/[0.08] transition-all"
      />
    </div>
  );
}

function AppointmentForm() {
  const [f, setF] = useState({ name: "", phone: "", email: "", preferred_date: "", service: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!f.name || !f.phone) return toast.error("Name and phone are required.");
    setBusy(true);
    try {
      const payload = { ...f };
      if (!payload.email) delete payload.email;
      await axios.post(`${API}/appointments`, payload);
      toast.success("Appointment request received. We'll be in touch.");
      setF({ name: "", phone: "", email: "", preferred_date: "", service: "", notes: "" });
    } catch { toast.error("Something went wrong. Please try again."); }
    finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="mt-8 grid md:grid-cols-2 gap-4" data-testid="dyn-appointment-form">
      <DarkField label="Full name *" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} testid="appt-name" required />
      <DarkField label="Phone *" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} testid="appt-phone" required />
      <DarkField label="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} testid="appt-email" />
      <DarkField label="Preferred date" type="date" value={f.preferred_date} onChange={(e) => setF({ ...f, preferred_date: e.target.value })} testid="appt-date" />
      <DarkField label="Service" placeholder="e.g. Skilled Nursing" value={f.service} onChange={(e) => setF({ ...f, service: e.target.value })} testid="appt-service" />
      <div className="md:col-span-2">
        <div className="text-xs text-[#B5AD99] mb-1.5 tracking-wide">Notes</div>
        <textarea
          rows={4}
          value={f.notes}
          onChange={(e) => setF({ ...f, notes: e.target.value })}
          data-testid="appt-notes"
          className="w-full rounded-xl px-4 py-3 bg-white/[0.04] border border-white/10 text-[#EAE5D9] outline-none focus:border-[#D4A537]"
        />
      </div>
      <button disabled={busy} className="btn-accent md:col-span-2" data-testid="appt-submit-btn">
        <Calendar className="h-4 w-4" strokeWidth={1.5} />{busy ? "Sending..." : "Request appointment"}
      </button>
    </form>
  );
}

function ReferralForm() {
  const [f, setF] = useState({ referrer_name: "", referrer_phone: "", patient_name: "", patient_condition: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!f.referrer_name || !f.referrer_phone || !f.patient_name) return toast.error("Fill required fields.");
    setBusy(true);
    try {
      await axios.post(`${API}/referrals`, f);
      toast.success("Referral received. Thank you!");
      setF({ referrer_name: "", referrer_phone: "", patient_name: "", patient_condition: "", notes: "" });
    } catch { toast.error("Something went wrong."); }
    finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="mt-8 grid md:grid-cols-2 gap-4" data-testid="dyn-referral-form">
      <DarkField label="Your name *" value={f.referrer_name} onChange={(e) => setF({ ...f, referrer_name: e.target.value })} testid="dref-name" required />
      <DarkField label="Your phone *" value={f.referrer_phone} onChange={(e) => setF({ ...f, referrer_phone: e.target.value })} testid="dref-phone" required />
      <DarkField label="Patient name *" value={f.patient_name} onChange={(e) => setF({ ...f, patient_name: e.target.value })} testid="dref-patient" required />
      <DarkField label="Condition" value={f.patient_condition} onChange={(e) => setF({ ...f, patient_condition: e.target.value })} testid="dref-condition" />
      <div className="md:col-span-2">
        <div className="text-xs text-[#B5AD99] mb-1.5 tracking-wide">Notes</div>
        <textarea rows={4} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} data-testid="dref-notes"
          className="w-full rounded-xl px-4 py-3 bg-white/[0.04] border border-white/10 text-[#EAE5D9] outline-none focus:border-[#D4A537]" />
      </div>
      <button disabled={busy} className="btn-accent md:col-span-2" data-testid="dref-submit-btn">
        {busy ? "Submitting..." : "Submit referral"}
      </button>
    </form>
  );
}

function FeedbackForm() {
  const [f, setF] = useState({ name: "", email: "", rating: 5, feedback: "" });
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!f.feedback.trim()) return toast.error("Please share your feedback.");
    setBusy(true);
    try {
      const payload = { ...f, rating: Number(f.rating) };
      if (!payload.name) delete payload.name;
      if (!payload.email) delete payload.email;
      await axios.post(`${API}/survey`, payload);
      toast.success("Thank you!");
      setF({ name: "", email: "", rating: 5, feedback: "" });
    } catch { toast.error("Something went wrong."); }
    finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="mt-8 space-y-4" data-testid="dyn-feedback-form">
      <div className="grid md:grid-cols-2 gap-4">
        <DarkField label="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} testid="dfb-name" />
        <DarkField label="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} testid="dfb-email" />
      </div>
      <div>
        <div className="text-xs text-[#B5AD99] mb-2 tracking-wide">Rating</div>
        <div className="flex gap-2">
          {[1,2,3,4,5].map((n) => (
            <button key={n} type="button" onClick={() => setF({ ...f, rating: n })} data-testid={`dfb-star-${n}`}>
              <Star className={`h-6 w-6 ${n <= f.rating ? "fill-[#D4A537] text-[#D4A537]" : "text-white/25"}`} strokeWidth={1.3} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs text-[#B5AD99] mb-1.5 tracking-wide">Your feedback</div>
        <textarea rows={5} value={f.feedback} onChange={(e) => setF({ ...f, feedback: e.target.value })} data-testid="dfb-feedback"
          className="w-full rounded-xl px-4 py-3 bg-white/[0.04] border border-white/10 text-[#EAE5D9] outline-none focus:border-[#D4A537]" required />
      </div>
      <button disabled={busy} className="btn-accent" data-testid="dfb-submit-btn">{busy ? "Sending..." : "Submit feedback"}</button>
    </form>
  );
}
