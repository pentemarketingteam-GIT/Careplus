import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, MapPin, MessageSquareHeart, ClipboardCheck, ArrowRight, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { BRAND, SERVICES, ABOUT_POINTS } from "@/lib/brand";
import Testimonials from "@/components/Testimonials";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Home() {
  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full blur-3xl opacity-40"
          style={{ background: "radial-gradient(circle, #C9A227 0%, transparent 70%)" }} />
        <div className="absolute -bottom-24 -left-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, #2D4A2B 0%, transparent 70%)" }} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-20 pb-28 grid lg:grid-cols-12 gap-12 items-center">
          <motion.div
            className="lg:col-span-6"
            initial="hidden"
            animate="show"
            variants={fadeUp}
          >
            <div className="label-xs" data-testid="hero-overline">Home Health · Dallas, TX</div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.02] mt-5 text-[hsl(var(--text-primary))]">
              Supportive Care.
              <br />
              <span className="serif-italic text-[hsl(var(--brand))]">Compassionate Care.</span>
            </h1>
            <p className="mt-7 text-lg text-[hsl(var(--text-secondary))] max-w-xl leading-relaxed">
              Let {BRAND.name} be your source of supportive and compassionate care at home — thoughtfully planned, professionally delivered.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a href={BRAND.phoneHref} className="btn-primary" data-testid="hero-call-btn">
                <Phone className="h-4 w-4" strokeWidth={1.5} />
                Call {BRAND.phone}
              </a>
              <Link to="/contact" className="btn-ghost" data-testid="hero-appointment-btn">
                Set an Appointment
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-[hsl(var(--text-secondary))]">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[hsl(var(--brand))]" strokeWidth={1.5} /> Licensed & insured</div>
              <div className="flex items-center gap-2"><Heart className="h-4 w-4 text-[hsl(var(--accent))]" strokeWidth={1.5} /> Physician-directed</div>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-6 relative"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            data-testid="hero-media"
          >
            <div className="relative rounded-[2rem] overflow-hidden soft-card p-0">
              <img
                src="https://images.unsplash.com/photo-1658632302217-984d432b4d38?crop=entropy&cs=srgb&fm=jpg&w=1400&q=85"
                alt="Compassionate home care"
                className="w-full h-[520px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1F1B]/35 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 backdrop-blur-md bg-white/75 rounded-2xl p-5 border border-white/60">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-[hsl(var(--accent))]" strokeWidth={1.5} />
                  <div className="font-display text-xl text-[hsl(var(--text-primary))]">Care that adapts to you.</div>
                </div>
                <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
                  Personalized plans for every stage of recovery, rehabilitation, and life at home.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* QUICK ACCESS BENTO */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 -mt-8" data-testid="quick-access-section">
        <div className="grid md:grid-cols-3 gap-5">
          <QuickCard
            testid="card-service-areas"
            icon={<MapPin className="h-6 w-6" strokeWidth={1.3} />}
            eyebrow="Service Areas"
            title="Covered"
            desc="Our company serves Dallas and the surrounding counties."
            to="/contact"
            linkLabel="View areas"
          />
          <QuickCard
            testid="card-survey"
            icon={<MessageSquareHeart className="h-6 w-6" strokeWidth={1.3} />}
            eyebrow="Client Satisfaction"
            title="Survey"
            desc="Please send your feedback and comments — we listen carefully."
            to="/resources"
            linkLabel="Share feedback"
            accent
          />
          <QuickCard
            testid="card-referrals"
            icon={<ClipboardCheck className="h-6 w-6" strokeWidth={1.3} />}
            eyebrow="Submit"
            title="Your Referrals"
            desc="Send your recommendations online — fast, private, secure."
            to="/contact?referral=1"
            linkLabel="Submit referral"
          />
        </div>
      </section>

      {/* WELCOME */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-28 grid lg:grid-cols-12 gap-14 items-center" data-testid="welcome-section">
        <motion.div
          className="lg:col-span-7"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <div className="label-xs">Welcome</div>
          <h2 className="font-display text-4xl md:text-5xl leading-tight mt-4 text-[hsl(var(--text-primary))]">
            Welcome to <span className="serif-italic text-[hsl(var(--brand))]">Careplus Health Services, Inc.</span>
          </h2>
          <p className="mt-6 text-lg text-[hsl(var(--text-secondary))] max-w-2xl leading-relaxed">
            Our company offers a comprehensive range of physician-directed healthcare services for patients in their homes. We strive to provide the highest quality of care with compassion and professionalism.
          </p>

          <div className="mt-10">
            <div className="font-display text-2xl text-[hsl(var(--text-primary))]">Home Health Care is:</div>
            <ul className="mt-5 space-y-3">
              {ABOUT_POINTS.map((p, i) => (
                <motion.li
                  key={p}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                >
                  <span className="mt-2 h-1.5 w-6 rounded-full" style={{ background: "hsl(var(--accent))" }} />
                  <span className="text-[hsl(var(--text-primary))]">{p}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div
          className="lg:col-span-5 relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative rounded-[2rem] overflow-hidden soft-card">
            <img
              src="https://images.pexels.com/photos/29372724/pexels-photo-29372724.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Caring nurse and senior patient at home"
              className="w-full h-[480px] object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden md:block rounded-2xl p-5 bg-[hsl(var(--brand))] text-white shadow-xl max-w-[220px]">
            <div className="font-display text-3xl leading-none">15+ yrs</div>
            <div className="text-sm mt-1 opacity-90">of trusted home care across North Texas</div>
          </div>
        </motion.div>
      </section>

      {/* SERVICES */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-28" data-testid="services-section">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <div className="label-xs">Our Care</div>
            <h2 className="font-display text-4xl md:text-5xl leading-tight mt-3 text-[hsl(var(--text-primary))]">
              We offer the following <span className="serif-italic text-[hsl(var(--brand))]">services</span>
            </h2>
          </div>
          <Link to="/services" className="btn-ghost" data-testid="view-all-services-btn">
            View all services <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.slug}
              className="soft-card p-7 flex flex-col justify-between min-h-[240px]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              data-testid={`service-card-${s.slug}`}
            >
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex h-9 w-9 rounded-full items-center justify-center text-white font-display"
                    style={{ background: i % 2 === 0 ? "hsl(var(--brand))" : "hsl(var(--accent))" }}
                  >
                    {i + 1}
                  </span>
                  <div className="label-xs !text-[hsl(var(--text-secondary))]">{s.short}</div>
                </div>
                <h3 className="font-display text-2xl mt-4 text-[hsl(var(--text-primary))]">{s.name}</h3>
                <p className="mt-3 text-[hsl(var(--text-secondary))] leading-relaxed">{s.desc}</p>
              </div>
              <Link
                to="/services"
                className="mt-6 inline-flex items-center gap-2 text-[hsl(var(--brand))] font-medium group"
                data-testid={`service-learn-${s.slug}`}
              >
                Learn more
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <Testimonials variant="light" />

      {/* CTA STRIP */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-28" data-testid="cta-strip">
        <div className="relative overflow-hidden rounded-[2rem] p-10 md:p-16 grain"
          style={{ background: "linear-gradient(135deg, #2D4A2B 0%, #1F3520 100%)" }}>
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="label-xs !text-[#D4B85A]">Ready when you are</div>
              <h3 className="font-display text-4xl md:text-5xl text-white mt-4 leading-tight">
                Let's plan care that truly <span className="serif-italic">fits</span>.
              </h3>
              <p className="mt-5 text-[#D4CDB6] max-w-xl">
                Whether it's post-surgery recovery, daily living support, or skilled nursing — we'll build a plan together.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 md:justify-end">
              <a href={BRAND.phoneHref} className="btn-accent" data-testid="cta-call-btn">
                <Phone className="h-4 w-4" strokeWidth={1.5} /> Call {BRAND.phone}
              </a>
              <Link to="/contact" className="btn-ghost !border-white/30 !text-white hover:!bg-white/10" data-testid="cta-appointment-btn">
                Set an Appointment <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="h-20" />
    </div>
  );
}

function QuickCard({ icon, eyebrow, title, desc, to, linkLabel, accent, testid }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className={`soft-card p-7 ${accent ? "md:translate-y-6" : ""}`}
      data-testid={testid}
    >
      <div
        className="h-12 w-12 rounded-full flex items-center justify-center text-white"
        style={{ background: accent ? "hsl(var(--accent))" : "hsl(var(--brand))" }}
      >
        {icon}
      </div>
      <div className="label-xs mt-5">{eyebrow}</div>
      <h3 className="font-display text-2xl mt-1 text-[hsl(var(--text-primary))]">{title}</h3>
      <p className="mt-3 text-[hsl(var(--text-secondary))] leading-relaxed">{desc}</p>
      <Link
        to={to}
        className="mt-5 inline-flex items-center gap-2 text-[hsl(var(--brand))] font-medium"
      >
        {linkLabel} <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
      </Link>
    </motion.div>
  );
}
