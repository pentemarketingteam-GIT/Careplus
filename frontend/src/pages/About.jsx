import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, ShieldCheck, Users, Sparkles, ArrowRight } from "lucide-react";
import { ABOUT_POINTS, BRAND } from "@/lib/brand";

export default function About() {
  return (
    <div data-testid="about-page">
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-20 pb-16">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="label-xs">About Us</div>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mt-4 text-[hsl(var(--text-primary))] max-w-4xl">
            Personalized home healthcare,
            <br />
            <span className="serif-italic text-[hsl(var(--brand))]">rooted in compassion.</span>
          </h1>
          <p className="mt-6 text-lg text-[hsl(var(--text-secondary))] max-w-3xl leading-relaxed">
            {BRAND.name} offers a comprehensive range of physician-directed healthcare services for patients in their homes. Our team works closely with families and physicians to deliver care that's thoughtful, dignified, and deeply personal.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-12 gap-12 items-stretch">
        <motion.div
          className="lg:col-span-6 relative rounded-[2rem] overflow-hidden soft-card min-h-[420px]"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="https://images.unsplash.com/photo-1516841273335-e39b37888115?auto=format&fit=crop&w=1400&q=85"
            alt="Home healthcare team with patient"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          className="lg:col-span-6 flex flex-col justify-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="label-xs">Our Philosophy</div>
          <h2 className="font-display text-4xl md:text-5xl mt-3 text-[hsl(var(--text-primary))] leading-tight">
            Home is where <span className="serif-italic text-[hsl(var(--brand))]">healing</span> happens best.
          </h2>
          <p className="mt-5 text-[hsl(var(--text-secondary))] leading-relaxed">
            We believe that great care begins with listening. Every patient has a story, a routine, and a rhythm — and our plans are built around them, not the other way around.
          </p>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {[
              { icon: <Heart className="h-5 w-5" />, title: "Compassion", desc: "Kindness guides every interaction." },
              { icon: <ShieldCheck className="h-5 w-5" />, title: "Safety", desc: "Clinically-led, standards-driven." },
              { icon: <Users className="h-5 w-5" />, title: "Partnership", desc: "Families at the center, always." },
              { icon: <Sparkles className="h-5 w-5" />, title: "Quality", desc: "Continuous training, honest care." },
            ].map((v) => (
              <div key={v.title} className="soft-card p-5" data-testid={`value-${v.title.toLowerCase()}`}>
                <div className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                  style={{ background: "hsl(var(--brand))" }}>
                  {v.icon}
                </div>
                <div className="font-display text-xl mt-3 text-[hsl(var(--text-primary))]">{v.title}</div>
                <div className="text-sm text-[hsl(var(--text-secondary))] mt-1">{v.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-24">
        <div className="rounded-[2rem] p-10 md:p-14" style={{ background: "hsl(var(--bg-secondary))" }}>
          <div className="label-xs">Home Health Care is</div>
          <h2 className="font-display text-3xl md:text-4xl mt-3 text-[hsl(var(--text-primary))] max-w-2xl">
            A path to healing — without leaving the place you love.
          </h2>
          <ul className="mt-8 grid md:grid-cols-2 gap-4">
            {ABOUT_POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-[hsl(var(--soft-border))]">
                <span className="mt-1.5 h-1.5 w-6 rounded-full" style={{ background: "hsl(var(--accent))" }} />
                <span className="text-[hsl(var(--text-primary))]">{p}</span>
              </li>
            ))}
          </ul>
          <Link to="/services" className="btn-primary mt-10 inline-flex" data-testid="about-explore-services-btn">
            Explore our services <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      <div className="h-20" />
    </div>
  );
}
