import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, GraduationCap, Clock, Smile } from "lucide-react";

const OPENINGS = [
  { title: "Registered Nurse (RN)", type: "Full-time · Field", loc: "Dallas, TX" },
  { title: "Physical Therapist", type: "Full-time · Field", loc: "Dallas & surrounding counties" },
  { title: "Occupational Therapist", type: "Part-time · Field", loc: "Dallas, TX" },
  { title: "Home Health Aide (HHA)", type: "Full-time / Part-time", loc: "Multiple areas" },
  { title: "Speech-Language Pathologist", type: "PRN · Field", loc: "Dallas, TX" },
  { title: "Medical Social Worker", type: "Part-time · Field", loc: "Dallas, TX" },
];

const PERKS = [
  { icon: <Heart className="h-5 w-5" />, title: "Purposeful work", desc: "Change lives, one home visit at a time." },
  { icon: <Clock className="h-5 w-5" />, title: "Flexible schedules", desc: "Full-time, part-time, and PRN options." },
  { icon: <GraduationCap className="h-5 w-5" />, title: "Growth & training", desc: "Continuing education support." },
  { icon: <Smile className="h-5 w-5" />, title: "Supportive team", desc: "Clinical leadership that has your back." },
];

export default function Careers() {
  return (
    <div data-testid="careers-page">
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-20 pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="label-xs">Careers</div>
          <h1 className="font-display text-5xl md:text-6xl mt-4 leading-[1.05] text-[hsl(var(--text-primary))] max-w-4xl">
            Do the work that <span className="serif-italic text-[hsl(var(--brand))]">matters most</span>.
          </h1>
          <p className="mt-6 text-lg text-[hsl(var(--text-secondary))] max-w-3xl">
            Join a team of clinicians and caregivers who believe great care is personal. We're always looking for compassionate professionals across North Texas.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-6 lg:px-10 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {PERKS.map((p) => (
          <div key={p.title} className="soft-card p-6" data-testid={`perk-${p.title.toLowerCase().replace(/\s+/g, "-")}`}>
            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white" style={{ background: "hsl(var(--brand))" }}>
              {p.icon}
            </div>
            <div className="font-display text-xl mt-3 text-[hsl(var(--text-primary))]">{p.title}</div>
            <div className="text-sm text-[hsl(var(--text-secondary))] mt-1">{p.desc}</div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-20">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="label-xs">Open Positions</div>
            <h2 className="font-display text-4xl mt-3 text-[hsl(var(--text-primary))]">Currently hiring</h2>
          </div>
          <Link to="/contact" className="btn-ghost" data-testid="careers-apply-general-btn">
            General application <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>

        <div className="mt-10 divide-y divide-[hsl(var(--soft-border))] border border-[hsl(var(--soft-border))] rounded-2xl bg-white">
          {OPENINGS.map((o, i) => (
            <motion.div
              key={o.title}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 hover:bg-[hsl(var(--bg-secondary))] transition-colors"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              data-testid={`opening-${i}`}
            >
              <div>
                <div className="font-display text-2xl text-[hsl(var(--text-primary))]">{o.title}</div>
                <div className="text-sm text-[hsl(var(--text-secondary))] mt-1">{o.type} · {o.loc}</div>
              </div>
              <Link to="/contact" className="btn-primary text-sm self-start md:self-auto" data-testid={`apply-${i}`}>
                Apply now <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="h-20" />
    </div>
  );
}
