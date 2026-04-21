import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import { SERVICES, BRAND } from "@/lib/brand";

export default function Services() {
  return (
    <div data-testid="services-page">
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-20 pb-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="label-xs">Our Services</div>
          <h1 className="font-display text-5xl md:text-6xl mt-4 text-[hsl(var(--text-primary))] leading-[1.05] max-w-4xl">
            A full range of <span className="serif-italic text-[hsl(var(--brand))]">physician-directed</span> home care.
          </h1>
          <p className="mt-6 text-lg text-[hsl(var(--text-secondary))] max-w-3xl">
            From skilled nursing to specialized therapies, our services are coordinated, clinically led, and centered on the comfort of home.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-6 lg:px-10 space-y-10">
        {SERVICES.map((s, i) => (
          <motion.article
            key={s.slug}
            className="grid lg:grid-cols-12 gap-8 items-center soft-card overflow-hidden p-0"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            data-testid={`service-row-${s.slug}`}
          >
            <div className={`lg:col-span-5 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
              <div className="h-[320px] lg:h-[360px] overflow-hidden">
                <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="lg:col-span-7 p-8 lg:p-12">
              <div className="flex items-center gap-3">
                <span
                  className="h-9 w-9 rounded-full flex items-center justify-center text-white font-display"
                  style={{ background: i % 2 === 0 ? "hsl(var(--brand))" : "hsl(var(--accent))" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="label-xs !text-[hsl(var(--text-secondary))]">{s.short}</div>
              </div>
              <h2 className="font-display text-3xl md:text-4xl mt-4 text-[hsl(var(--text-primary))]">{s.name}</h2>
              <p className="mt-4 text-[hsl(var(--text-secondary))] leading-relaxed text-lg">{s.desc}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/contact" className="btn-primary text-sm" data-testid={`service-request-${s.slug}`}>
                  Request this service <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
                <a href={BRAND.phoneHref} className="btn-ghost text-sm" data-testid={`service-call-${s.slug}`}>
                  <Phone className="h-4 w-4" strokeWidth={1.5} /> {BRAND.phone}
                </a>
              </div>
            </div>
          </motion.article>
        ))}
      </section>

      <div className="h-20" />
    </div>
  );
}
