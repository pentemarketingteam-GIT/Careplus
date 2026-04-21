import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { BRAND } from "@/lib/brand";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Contact() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialTab = params.get("referral") ? "referral" : "contact";
  const [tab, setTab] = useState(initialTab);

  return (
    <div data-testid="contact-page">
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-20 pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="label-xs">Contact</div>
          <h1 className="font-display text-5xl md:text-6xl mt-4 leading-[1.05] text-[hsl(var(--text-primary))] max-w-4xl">
            Let's start a <span className="serif-italic text-[hsl(var(--brand))]">conversation</span>.
          </h1>
          <p className="mt-6 text-lg text-[hsl(var(--text-secondary))] max-w-3xl">
            Reach out about services, set an appointment, or submit a referral. We usually respond within one business day.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-4">
          <div className="soft-card p-7" data-testid="contact-info">
            <div className="label-xs">Reach us directly</div>
            <div className="mt-6 space-y-5">
              <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone">
                <a href={BRAND.phoneHref} className="hover:text-[hsl(var(--brand))]" data-testid="contact-phone-link">{BRAND.phone}</a>
              </InfoRow>
              <InfoRow icon={<Mail className="h-4 w-4" />} label="Email">
                <a href={`mailto:${BRAND.email}`} className="hover:text-[hsl(var(--brand))]">{BRAND.email}</a>
              </InfoRow>
              <InfoRow icon={<MapPin className="h-4 w-4" />} label="Service Area">
                {BRAND.address}
              </InfoRow>
              <InfoRow icon={<Clock className="h-4 w-4" />} label="Hours">
                {BRAND.hours}
              </InfoRow>
            </div>
          </div>

          <div className="mt-6 soft-card p-7" style={{ background: "hsl(var(--brand))" }}>
            <div className="label-xs !text-[#D4B85A]">Urgent?</div>
            <div className="font-display text-2xl text-white mt-2">Call us right now.</div>
            <a href={BRAND.phoneHref} className="btn-accent mt-5 w-full" data-testid="urgent-call-btn">
              <Phone className="h-4 w-4" strokeWidth={1.5} /> {BRAND.phone}
            </a>
          </div>
        </aside>

        <div className="lg:col-span-8">
          <div className="flex items-center gap-2 mb-5" data-testid="form-tabs">
            <TabBtn active={tab === "contact"} onClick={() => setTab("contact")} testid="tab-contact">Contact & Appointment</TabBtn>
            <TabBtn active={tab === "referral"} onClick={() => setTab("referral")} testid="tab-referral">Submit a Referral</TabBtn>
          </div>

          {tab === "contact" ? <ContactForm /> : <ReferralForm />}
        </div>
      </section>

      <div className="h-20" />
    </div>
  );
}

function TabBtn({ active, onClick, children, testid }) {
  return (
    <button
      onClick={onClick}
      data-testid={testid}
      className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
        active
          ? "bg-[hsl(var(--brand))] text-white"
          : "bg-white border border-[hsl(var(--soft-border))] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-secondary))]"
      }`}
    >
      {children}
    </button>
  );
}

function InfoRow({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="h-8 w-8 rounded-full flex items-center justify-center text-white mt-0.5"
        style={{ background: "hsl(var(--brand))" }}>
        {icon}
      </span>
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-[hsl(var(--text-secondary))] font-semibold">{label}</div>
        <div className="text-[hsl(var(--text-primary))] mt-0.5">{children}</div>
      </div>
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error("Please fill in required fields.");
    setSubmitting(true);
    try {
      await axios.post(`${API}/contact`, form);
      toast.success("Thanks! We'll be in touch shortly.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="soft-card p-7 space-y-4" data-testid="contact-form">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Full name *" name="name" value={form.name} onChange={handle} testid="contact-name" required />
        <Field label="Email *" name="email" type="email" value={form.email} onChange={handle} testid="contact-email" required />
        <Field label="Phone" name="phone" value={form.phone} onChange={handle} testid="contact-phone" />
        <Field label="Subject" name="subject" value={form.subject} onChange={handle} testid="contact-subject" placeholder="e.g. Appointment request" />
      </div>
      <div>
        <Label>Message *</Label>
        <textarea
          name="message"
          value={form.message}
          onChange={handle}
          rows={5}
          className="input-field resize-none"
          data-testid="contact-message"
          required
        />
      </div>
      <button type="submit" disabled={submitting} className="btn-primary" data-testid="contact-submit-btn">
        {submitting ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}

function ReferralForm() {
  const [form, setForm] = useState({
    referrer_name: "", referrer_phone: "", referrer_email: "",
    patient_name: "", patient_phone: "", patient_condition: "", notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.referrer_name || !form.referrer_phone || !form.patient_name)
      return toast.error("Please fill in required fields.");
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.referrer_email) delete payload.referrer_email;
      await axios.post(`${API}/referrals`, payload);
      toast.success("Referral received. Thank you!");
      setForm({ referrer_name: "", referrer_phone: "", referrer_email: "", patient_name: "", patient_phone: "", patient_condition: "", notes: "" });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="soft-card p-7 space-y-4" data-testid="referral-form">
      <div className="label-xs">About you</div>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Your name *" name="referrer_name" value={form.referrer_name} onChange={handle} testid="ref-name" required />
        <Field label="Your phone *" name="referrer_phone" value={form.referrer_phone} onChange={handle} testid="ref-phone" required />
        <Field label="Your email" name="referrer_email" type="email" value={form.referrer_email} onChange={handle} testid="ref-email" />
      </div>
      <div className="hair-divider" />
      <div className="label-xs">About the patient</div>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Patient name *" name="patient_name" value={form.patient_name} onChange={handle} testid="ref-patient-name" required />
        <Field label="Patient phone" name="patient_phone" value={form.patient_phone} onChange={handle} testid="ref-patient-phone" />
      </div>
      <Field label="Condition / reason" name="patient_condition" value={form.patient_condition} onChange={handle} testid="ref-condition" placeholder="e.g. post-surgical recovery" />
      <div>
        <Label>Additional notes</Label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handle}
          rows={4}
          className="input-field resize-none"
          data-testid="ref-notes"
        />
      </div>
      <button type="submit" disabled={submitting} className="btn-primary" data-testid="referral-submit-btn">
        {submitting ? "Submitting..." : "Submit referral"}
      </button>
    </form>
  );
}

function Label({ children }) {
  return <div className="text-sm text-[hsl(var(--text-secondary))] mb-1.5">{children}</div>;
}

function Field({ label, testid, ...props }) {
  return (
    <div>
      <Label>{label}</Label>
      <input className="input-field" data-testid={testid} {...props} />
    </div>
  );
}
