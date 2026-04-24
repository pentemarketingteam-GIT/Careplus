import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Phone, MapPin, Stethoscope, Heart, Activity, MessageCircle, Briefcase,
  Calendar, Users, Sparkles, ShieldCheck, Clock, ArrowRight, Star, Map as MapIcon,
} from "lucide-react";
import { BRAND, SERVICES, ABOUT_POINTS } from "@/lib/brand";
import { SERVICE_ILLUSTRATIONS } from "@/components/Illustrations";
import { TESTIMONIALS } from "@/lib/content";
import AmbientParticles from "@/components/AmbientParticles";
import TeamCards from "@/components/TeamCards";
import TourCards from "@/components/TourCards";
import Testimonials from "@/components/Testimonials";
import BodyDiagram from "@/components/BodyDiagram";
import IntakeWizard from "@/components/IntakeWizard";
import { celebrate } from "@/lib/confetti";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ICONS = {
  "skilled-nursing": Stethoscope,
  "physical-therapy": Activity,
  "occupational-therapy": Heart,
  "speech-therapy": MessageCircle,
  "home-health-aide": Users,
  "medical-social-work": Briefcase,
};

// Intent → ambient tint + backdrop
const INTENT_AMBIENT = {
  welcome: "mustard",
  "page:about": "warm",
  "page:contact": "forest",
  "page:careers": "moss",
  "page:services": "mustard",
  "action:book_appointment": "moss",
  "action:submit_referral": "mustard",
  "action:share_feedback": "warm",
  "action:find_care": "mustard",
  "action:meet_team": "moss",
  "action:tour_visit": "warm",
  "action:symptom_check": "mustard",
  "action:start_intake": "moss",
};

export default function DynamicView({ intent, onAction, sessionId, extractTick }) {
  const view = resolveView(intent);
  const hue = INTENT_AMBIENT[intent] || "forest";
  return (
    <div className="relative w-full h-full overflow-hidden" data-testid="dynamic-view">
      <AmbientParticles hue={hue} />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
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
          {view === "about" && <AboutView />}
          {view === "contact" && <ContactView />}
          {view === "careers" && <CareersView />}
          {view === "services" && <ServicesGridView />}
          {view === "book" && <BookView />}
          {view === "referral" && <ReferralView />}
          {view === "feedback" && <FeedbackView />}
          {view === "find-care" && <FindCareView onAction={onAction} />}
          {view === "meet-team" && <MeetTeamView />}
          {view === "tour-visit" && <TourVisitView />}
          {view === "symptom-check" && <SymptomCheckView onAction={onAction} />}
          {view === "intake" && <IntakeView sessionId={sessionId} refreshTick={extractTick} onAction={onAction} />}
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
  if (intent === "action:find_care") return "find-care";
  if (intent === "action:meet_team") return "meet-team";
  if (intent === "action:tour_visit") return "tour-visit";
  if (intent === "action:symptom_check") return "symptom-check";
  if (intent === "action:start_intake") return "intake";
  if (intent.startsWith("service:")) return `service:${intent.slice(8)}`;
  return "welcome";
}

function Frame({ children }) {
  return (
    <div className="min-h-full w-full flex flex-col items-center justify-start px-8 md:px-16 py-20 text-[var(--ai-fg)]">
      <div className="max-w-4xl w-full">{children}</div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="text-[11px] tracking-[0.28em] uppercase font-semibold text-[var(--ai-accent)]">
      {children}
    </div>
  );
}

/* ------------------------- VIEWS ------------------------- */

function WelcomeView({ onAction }) {
  const chips = [
    { label: "Start my intake", prompt: "Start my intake", intent: "action:start_intake" },
    { label: "Tell me about skilled nursing", prompt: "Tell me about skilled nursing", intent: "service:skilled-nursing" },
    { label: "Book an appointment", prompt: "Book an appointment", intent: "action:book_appointment" },
    { label: "Meet the team", prompt: "Meet the team", intent: "action:meet_team" },
    { label: "I have knee pain", prompt: "I have knee pain — what service should I consider?", intent: "action:symptom_check" },
    { label: "What does a home visit look like?", prompt: "What does a home visit look like?", intent: "action:tour_visit" },
  ];
  return (
    <Frame>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div
          className="h-20 w-20 mx-auto rounded-2xl border ai-border flex items-center justify-center mb-10"
          style={{ background: "linear-gradient(135deg, rgba(212,165,55,0.25), rgba(107,142,78,0.15))" }}
        >
          <span className="font-display text-3xl text-[var(--ai-fg)]">c+</span>
        </div>
      </motion.div>
      <h1 className="font-display text-6xl md:text-7xl leading-[1.02] text-center">
        Welcome to <span className="text-[var(--ai-accent)] serif-italic">CarePlus</span>
      </h1>
      <p className="mt-8 text-center text-xl text-[var(--ai-fg-3)]">Your personalized healthcare experience.</p>
      <p className="mt-2 text-center text-xl text-[var(--ai-fg-3)]">Ask our AI assistant anything to get started.</p>

      <div className="mt-16 flex flex-wrap justify-center gap-3 text-sm text-[var(--ai-fg-3)]">
        {chips.map((c) => (
          <button
            key={c.label}
            onClick={() => {
              onAction?.({ type: "set_intent", intent: c.intent });
              onAction?.({ type: "prompt", value: c.prompt });
            }}
            className="rounded-full px-4 py-2 border ai-border hover:border-[var(--ai-accent)]/60 hover:text-[var(--ai-fg)] hover:ai-surface transition-all"
            data-testid={`welcome-suggestion-${c.label.slice(0, 10).replace(/\s+/g, "-")}`}
          >
            Try asking: {c.label}
          </button>
        ))}
      </div>
    </Frame>
  );
}

function ServiceDetailView({ slug }) {
  const s = SERVICES.find((x) => x.slug === slug) || SERVICES[0];
  const Icon = ICONS[s.slug] || Stethoscope;
  const Illustration = SERVICE_ILLUSTRATIONS[s.slug];
  // Pick a testimonial relevant-ish to the service
  const testimonialIdx = ["skilled-nursing", "physical-therapy", "home-health-aide"].includes(s.slug) ? (s.slug === "physical-therapy" ? 1 : s.slug === "skilled-nursing" ? 0 : 2) : s.slug.charCodeAt(0) % 3;
  const t = TESTIMONIALS[testimonialIdx];
  return (
    <Frame>
      <SectionLabel>Our Care</SectionLabel>
      <div className="flex items-center gap-5 mt-4">
        <div
          className="h-14 w-14 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(212,165,55,0.2)", border: "1px solid rgba(212,165,55,0.4)" }}
        >
          <Icon className="h-7 w-7 text-[var(--ai-accent)]" strokeWidth={1.4} />
        </div>
        <h2 className="font-display text-5xl md:text-6xl leading-tight">{s.name}</h2>
      </div>

      <div className="grid md:grid-cols-5 gap-8 mt-10 items-center">
        <div className="md:col-span-3">
          <p className="text-xl leading-relaxed text-[var(--ai-fg-2)]">{s.desc}</p>
          <div className="mt-8 grid sm:grid-cols-3 gap-3 text-sm">
            {[
              { icon: <ShieldCheck className="h-4 w-4" />, label: "Licensed & insured" },
              { icon: <Heart className="h-4 w-4" />, label: "Physician-directed" },
              { icon: <Clock className="h-4 w-4" />, label: "Flexible scheduling" },
            ].map((b) => (
              <div
                key={b.label}
                className="flex items-center gap-2 rounded-xl border ai-border px-4 py-3 text-[var(--ai-fg-2)]"
              >
                <span className="text-[var(--ai-accent)]">{b.icon}</span> {b.label}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <a href={BRAND.phoneHref} className="btn-accent" data-testid={`dyn-call-${s.slug}`}>
              <Phone className="h-4 w-4" strokeWidth={1.5} /> Call {BRAND.phone}
            </a>
          </div>
        </div>
        <div className="md:col-span-2 flex justify-center">
          {Illustration ? <Illustration size={260} /> : null}
        </div>
      </div>

      {/* Testimonial callout */}
      <motion.figure
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-12 rounded-3xl border ai-border p-8 relative ai-surface-2"
      >
        <div
          className="absolute -top-5 left-8 h-10 w-10 rounded-full flex items-center justify-center font-display"
          style={{ background: "rgba(212,165,55,0.2)", color: "var(--ai-accent)", border: "1px solid rgba(212,165,55,0.4)" }}
        >
          {t.initial}
        </div>
        <blockquote className="serif-italic text-lg text-[var(--ai-quote)] leading-relaxed">"{t.quote}"</blockquote>
        <figcaption className="mt-4 flex items-center justify-between">
          <div>
            <div className="font-semibold text-[var(--ai-fg)]">{t.name}</div>
            <div className="text-sm text-[var(--ai-fg-3)]">{t.role}</div>
          </div>
          <div className="flex">
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-[var(--ai-accent)] text-[var(--ai-accent)]" strokeWidth={1.2} />
            ))}
          </div>
        </figcaption>
      </motion.figure>
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
            <div
              key={s.slug}
              className="rounded-2xl p-6 border ai-border ai-surface-2 hover:ai-surface-hover transition-colors"
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(212,165,55,0.2)" }}
              >
                <Icon className="h-5 w-5 text-[var(--ai-accent)]" strokeWidth={1.4} />
              </div>
              <div className="font-display text-2xl">{s.name}</div>
              <p className="text-sm text-[var(--ai-fg-3)] mt-2 leading-relaxed">{s.desc}</p>
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
        <span className="text-[var(--ai-accent)] serif-italic">Compassion</span> in every action.
      </h2>
      <p className="mt-6 text-lg text-[var(--ai-fg-2)] max-w-3xl leading-relaxed">
        {BRAND.name} is a dedicated home health care provider serving Dallas and surrounding counties. We work closely with patients, families, and physicians to deliver care that's thoughtful, dignified, and deeply personal.
      </p>

      <div className="mt-10 grid md:grid-cols-2 gap-4">
        {ABOUT_POINTS.map((p) => (
          <div key={p} className="flex items-start gap-3 rounded-xl border ai-border p-4 ai-surface-2">
            <span className="mt-1.5 h-1.5 w-5 rounded-full bg-[var(--ai-accent)]" />
            <span className="text-[var(--ai-fg-2)]">{p}</span>
          </div>
        ))}
      </div>

      <div className="mt-14">
        <SectionLabel>Voices of Care</SectionLabel>
        <h3 className="font-display text-3xl md:text-4xl mt-3 mb-2">What families say</h3>
      </div>
      <Testimonials variant="dark" />
    </Frame>
  );
}

function ContactView() {
  return (
    <Frame>
      <SectionLabel>Contact</SectionLabel>
      <h2 className="font-display text-5xl md:text-6xl mt-4">Let's talk.</h2>
      <p className="mt-5 text-lg text-[var(--ai-fg-2)] max-w-2xl">
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
      <h2 className="font-display text-5xl md:text-6xl mt-4">
        Do the work that <span className="serif-italic text-[var(--ai-accent)]">matters</span>.
      </h2>
      <p className="mt-5 text-lg text-[var(--ai-fg-2)] max-w-2xl">
        Join clinicians and caregivers who believe great care is personal. Hiring across North Texas.
      </p>
      <div className="mt-10 divide-y  border ai-border rounded-2xl ai-surface-2">
        {OPENINGS.map((o) => (
          <div key={o} className="p-5 flex items-center justify-between">
            <div className="font-display text-xl">{o}</div>
            <a href={BRAND.phoneHref} className="text-[var(--ai-accent)] text-sm inline-flex items-center gap-2 hover:text-[var(--ai-fg)]">
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
      <p className="mt-5 text-lg text-[var(--ai-fg-2)] max-w-2xl">
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
      <p className="mt-5 text-lg text-[var(--ai-fg-2)] max-w-2xl">
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
      <p className="mt-5 text-lg text-[var(--ai-fg-2)] max-w-2xl">
        Your voice helps us deliver better care. Rate your experience and tell us what we can improve.
      </p>
      <FeedbackForm />
    </Frame>
  );
}

function MeetTeamView() {
  return (
    <Frame>
      <SectionLabel>Meet the Team</SectionLabel>
      <h2 className="font-display text-5xl md:text-6xl mt-4">
        The people behind your <span className="serif-italic text-[var(--ai-accent)]">care plan</span>.
      </h2>
      <p className="mt-5 text-lg text-[var(--ai-fg-2)] max-w-2xl">
        Tap a card to read each clinician's story.
      </p>
      <TeamCards />
    </Frame>
  );
}

function TourVisitView() {
  return (
    <Frame>
      <SectionLabel>A Typical Home Visit</SectionLabel>
      <h2 className="font-display text-5xl md:text-6xl mt-4">
        What to <span className="serif-italic text-[var(--ai-accent)]">expect</span>.
      </h2>
      <p className="mt-5 text-lg text-[var(--ai-fg-2)] max-w-2xl">
        Every visit follows a calm, consistent rhythm — here's how it unfolds.
      </p>
      <TourCards />
    </Frame>
  );
}

function SymptomCheckView({ onAction }) {
  return (
    <Frame>
      <SectionLabel>Where does it hurt?</SectionLabel>
      <h2 className="font-display text-5xl md:text-6xl mt-4">
        Tap a region for a <span className="serif-italic text-[var(--ai-accent)]">care suggestion</span>.
      </h2>
      <p className="mt-5 text-lg text-[var(--ai-fg-2)] max-w-2xl">
        A quick way to see which service might help — not a diagnosis.
      </p>
      <div className="mt-10 flex justify-center">
        <BodyDiagram
          onPick={(region) => {
            // Immediately show the care suggestion (works even if AI is unavailable)
            if (region.suggest) onAction?.({ type: "set_intent", intent: `service:${region.suggest}` });
            // Also send to chat for conversational context / AI follow-up
            onAction?.({
              type: "prompt",
              value: `I'm experiencing discomfort in my ${region.label.toLowerCase()}. Which service would help?`,
            });
          }}
        />
      </div>
    </Frame>
  );
}

function FindCareView({ onAction }) {
  const steps = [
    { q: "Post-surgery recovery", v: "I need post-surgery recovery care at home" },
    { q: "Chronic condition management", v: "I need help managing a chronic condition" },
    { q: "Daily living support", v: "I need help with daily living activities" },
    { q: "Rehabilitation & therapy", v: "I need rehabilitation therapy" },
    { q: "Cognitive / speech support", v: "I need speech or cognitive support" },
    { q: "Family caregiver guidance", v: "I'm a family caregiver looking for guidance" },
  ];
  return (
    <Frame>
      <SectionLabel>Find the Right Care</SectionLabel>
      <h2 className="font-display text-5xl md:text-6xl mt-4">
        What brings you <span className="serif-italic text-[var(--ai-accent)]">here today</span>?
      </h2>
      <p className="mt-5 text-lg text-[var(--ai-fg-2)] max-w-2xl">Pick what resonates most — the AI will guide you from there.</p>
      <div className="mt-10 grid sm:grid-cols-2 gap-4">
        {steps.map((s, i) => (
          <motion.button
            key={s.q}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            onClick={() => onAction?.({ type: "prompt", value: s.v })}
            className="text-left rounded-2xl p-6 border ai-border ai-surface-2 hover:border-[var(--ai-accent)]/60 hover:ai-track transition-all"
            data-testid={`find-care-${i}`}
          >
            <div className="font-display text-2xl text-[var(--ai-fg)]">{s.q}</div>
            <div className="text-sm text-[var(--ai-fg-3)] mt-2 flex items-center gap-2">
              Explore <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </div>
          </motion.button>
        ))}
      </div>
    </Frame>
  );
}

function InfoCard({ icon, label, value, href }) {
  const inner = (
    <>
      <div className="flex items-center gap-2 text-[var(--ai-accent)]">
        {icon}
        <span className="text-[11px] tracking-[0.22em] uppercase font-semibold">{label}</span>
      </div>
      <div className="mt-2 text-xl font-display text-[var(--ai-fg)]">{value}</div>
    </>
  );
  const cls = "rounded-2xl border ai-border p-5 ai-surface-2 hover:ai-surface-hover transition-colors block";
  return href ? (
    <a href={href} className={cls}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

/* ------------------------- FORMS ------------------------- */

function DarkField({ label, testid, ...props }) {
  return (
    <div>
      <div className="text-xs text-[var(--ai-fg-3)] mb-1.5 tracking-wide">{label}</div>
      <input
        {...props}
        data-testid={testid}
        className="w-full rounded-xl px-4 py-3 ai-surface border ai-border text-[var(--ai-fg)] placeholder: outline-none focus:border-[var(--ai-accent)] focus:ai-track transition-all"
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
      celebrate();
      toast.success(`Thank you, ${f.name.split(" ")[0]}! We'll reach out within one business day.`);
      setF({ name: "", phone: "", email: "", preferred_date: "", service: "", notes: "" });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="mt-8 grid md:grid-cols-2 gap-4" data-testid="dyn-appointment-form">
      <DarkField label="Full name *" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} testid="appt-name" required />
      <DarkField label="Phone *" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} testid="appt-phone" required />
      <DarkField label="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} testid="appt-email" />
      <DarkField label="Preferred date" type="date" value={f.preferred_date} onChange={(e) => setF({ ...f, preferred_date: e.target.value })} testid="appt-date" />
      <DarkField label="Service" placeholder="e.g. Skilled Nursing" value={f.service} onChange={(e) => setF({ ...f, service: e.target.value })} testid="appt-service" />
      <div className="md:col-span-2">
        <div className="text-xs text-[var(--ai-fg-3)] mb-1.5 tracking-wide">Notes</div>
        <textarea
          rows={4}
          value={f.notes}
          onChange={(e) => setF({ ...f, notes: e.target.value })}
          data-testid="appt-notes"
          className="w-full rounded-xl px-4 py-3 ai-surface border ai-border text-[var(--ai-fg)] outline-none focus:border-[var(--ai-accent)]"
        />
      </div>
      <button disabled={busy} className="btn-accent md:col-span-2" data-testid="appt-submit-btn">
        <Calendar className="h-4 w-4" strokeWidth={1.5} />
        {busy ? "Sending..." : "Request appointment"}
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
      celebrate();
      toast.success(`Thank you, ${f.referrer_name.split(" ")[0]}! Your referral has been received.`);
      setF({ referrer_name: "", referrer_phone: "", patient_name: "", patient_condition: "", notes: "" });
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="mt-8 grid md:grid-cols-2 gap-4" data-testid="dyn-referral-form">
      <DarkField label="Your name *" value={f.referrer_name} onChange={(e) => setF({ ...f, referrer_name: e.target.value })} testid="dref-name" required />
      <DarkField label="Your phone *" value={f.referrer_phone} onChange={(e) => setF({ ...f, referrer_phone: e.target.value })} testid="dref-phone" required />
      <DarkField label="Patient name *" value={f.patient_name} onChange={(e) => setF({ ...f, patient_name: e.target.value })} testid="dref-patient" required />
      <DarkField label="Condition" value={f.patient_condition} onChange={(e) => setF({ ...f, patient_condition: e.target.value })} testid="dref-condition" />
      <div className="md:col-span-2">
        <div className="text-xs text-[var(--ai-fg-3)] mb-1.5 tracking-wide">Notes</div>
        <textarea
          rows={4}
          value={f.notes}
          onChange={(e) => setF({ ...f, notes: e.target.value })}
          data-testid="dref-notes"
          className="w-full rounded-xl px-4 py-3 ai-surface border ai-border text-[var(--ai-fg)] outline-none focus:border-[var(--ai-accent)]"
        />
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
      celebrate();
      const hi = f.name ? `, ${f.name.split(" ")[0]}` : "";
      toast.success(`Thank you${hi}! Your feedback helps us grow.`);
      setF({ name: "", email: "", rating: 5, feedback: "" });
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="mt-8 space-y-4" data-testid="dyn-feedback-form">
      <div className="grid md:grid-cols-2 gap-4">
        <DarkField label="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} testid="dfb-name" />
        <DarkField label="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} testid="dfb-email" />
      </div>
      <div>
        <div className="text-xs text-[var(--ai-fg-3)] mb-2 tracking-wide">Rating</div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setF({ ...f, rating: n })} data-testid={`dfb-star-${n}`}>
              <Star
                className={`h-6 w-6 ${n <= f.rating ? "fill-[var(--ai-accent)] text-[var(--ai-accent)]" : ""}`}
                strokeWidth={1.3}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs text-[var(--ai-fg-3)] mb-1.5 tracking-wide">Your feedback</div>
        <textarea
          rows={5}
          value={f.feedback}
          onChange={(e) => setF({ ...f, feedback: e.target.value })}
          data-testid="dfb-feedback"
          className="w-full rounded-xl px-4 py-3 ai-surface border ai-border text-[var(--ai-fg)] outline-none focus:border-[var(--ai-accent)]"
          required
        />
      </div>
      <button disabled={busy} className="btn-accent" data-testid="dfb-submit-btn">
        {busy ? "Sending..." : "Submit feedback"}
      </button>
    </form>
  );
}


function IntakeView({ sessionId, refreshTick, onAction }) {
  return (
    <Frame>
      <SectionLabel>Patient Intake</SectionLabel>
      <h2 className="font-display text-5xl md:text-6xl mt-4">
        Let's get you <span className="serif-italic text-[var(--ai-accent)]">set up</span>.
      </h2>
      <p className="mt-5 text-lg text-[var(--ai-fg-2)] max-w-2xl">
        Chat with the AI on the right (voice or text) — your answers auto-fill the form below. Or type directly into any field.
      </p>
      <IntakeWizard sessionId={sessionId} refreshTick={refreshTick} onAction={onAction} />
    </Frame>
  );
}
