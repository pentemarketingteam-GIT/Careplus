import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Star, ChevronDown } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FAQ = [
  {
    q: "Who qualifies for home health care?",
    a: "Patients recovering from surgery, managing chronic illness, or needing skilled assistance at home may qualify. A physician's order is typically required.",
  },
  {
    q: "Does insurance or Medicare cover home health services?",
    a: "Most services are covered by Medicare, Medicaid, and many private insurance plans when medically necessary. We help families verify coverage.",
  },
  {
    q: "How quickly can care begin?",
    a: "Once we receive the referral and physician order, we aim to start care within 24–48 hours depending on the situation.",
  },
  {
    q: "Are your caregivers licensed?",
    a: "Yes — all clinicians are licensed in Texas, and aides are certified and background-checked.",
  },
];

export default function Resources() {
  const [form, setForm] = useState({ name: "", email: "", rating: 5, feedback: "" });
  const [submitting, setSubmitting] = useState(false);
  const [openIdx, setOpenIdx] = useState(0);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.feedback.trim()) return toast.error("Please share your feedback.");
    setSubmitting(true);
    try {
      await axios.post(`${API}/survey`, { ...form, rating: Number(form.rating) });
      toast.success("Thank you! Your feedback has been received.");
      setForm({ name: "", email: "", rating: 5, feedback: "" });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="resources-page">
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-20 pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="label-xs">Resources</div>
          <h1 className="font-display text-5xl md:text-6xl mt-4 leading-[1.05] text-[hsl(var(--text-primary))] max-w-4xl">
            Helpful information, <span className="serif-italic text-[hsl(var(--brand))]">honest answers</span>.
          </h1>
          <p className="mt-6 text-lg text-[hsl(var(--text-secondary))] max-w-3xl">
            Browse frequently asked questions, download patient resources, and share your feedback with our team.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          <div className="label-xs">FAQ</div>
          <h2 className="font-display text-3xl md:text-4xl mt-3 text-[hsl(var(--text-primary))]">Frequently asked questions</h2>
          <div className="mt-8 space-y-3" data-testid="faq-list">
            {FAQ.map((item, i) => {
              const open = openIdx === i;
              return (
                <div key={i} className={`soft-card ${open ? "border-[hsl(var(--brand))]/40" : ""}`} data-testid={`faq-${i}`}>
                  <button
                    className="w-full flex items-center justify-between p-5 text-left"
                    onClick={() => setOpenIdx(open ? -1 : i)}
                    data-testid={`faq-toggle-${i}`}
                  >
                    <span className="font-display text-xl text-[hsl(var(--text-primary))]">{item.q}</span>
                    <ChevronDown className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.5} />
                  </button>
                  {open && (
                    <div className="px-5 pb-5 text-[hsl(var(--text-secondary))] leading-relaxed">{item.a}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="soft-card p-7" data-testid="survey-form">
            <div className="label-xs">Client Satisfaction</div>
            <h3 className="font-display text-2xl mt-2 text-[hsl(var(--text-primary))]">Share your feedback</h3>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-2">Your comments help us improve the care we deliver every day.</p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <input
                name="name"
                value={form.name}
                onChange={handle}
                placeholder="Your name (optional)"
                className="input-field"
                data-testid="survey-name"
              />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handle}
                placeholder="Your email (optional)"
                className="input-field"
                data-testid="survey-email"
              />

              <div>
                <div className="text-sm text-[hsl(var(--text-secondary))] mb-2">Overall satisfaction</div>
                <div className="flex items-center gap-2" data-testid="survey-rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setForm({ ...form, rating: n })}
                      data-testid={`rating-${n}`}
                      className="p-1"
                      aria-label={`Rate ${n}`}
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          n <= form.rating ? "fill-[hsl(var(--accent))] text-[hsl(var(--accent))]" : "text-[hsl(var(--soft-border))]"
                        }`}
                        strokeWidth={1.3}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                name="feedback"
                value={form.feedback}
                onChange={handle}
                rows={5}
                placeholder="Tell us about your experience..."
                className="input-field resize-none"
                data-testid="survey-feedback"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full"
                data-testid="survey-submit-btn"
              >
                {submitting ? "Sending..." : "Submit feedback"}
              </button>
            </form>
          </div>
        </div>
      </section>

      <div className="h-20" />
    </div>
  );
}
