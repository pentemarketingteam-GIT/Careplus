import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/content";

/**
 * Dual-theme testimonial grid.
 * @param {"light"|"dark"} variant
 */
export default function Testimonials({ variant = "light" }) {
  const dark = variant === "dark";
  return (
    <section
      className={dark ? "" : "mx-auto max-w-7xl px-6 lg:px-10 mt-28"}
      data-testid="testimonials-section"
    >
      {!dark && (
        <div className="flex items-end justify-between flex-wrap gap-6 mb-10">
          <div>
            <div className="label-xs">Voices of Care</div>
            <h2 className="font-display text-4xl md:text-5xl mt-3 text-[hsl(var(--text-primary))]">
              Families we've had the <span className="serif-italic text-[hsl(var(--brand))]">honor</span> of serving.
            </h2>
          </div>
        </div>
      )}
      <div className="grid md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <motion.article
            key={t.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className={
              dark
                ? "relative rounded-3xl p-8 border ai-border ai-surface-2"
                : "relative rounded-3xl p-8 soft-card"
            }
            data-testid={`testimonial-${t.id}`}
          >
            <div
              className="absolute -top-6 left-8 h-12 w-12 rounded-full flex items-center justify-center font-display text-xl"
              style={{
                background: dark ? "rgba(212,165,55,0.18)" : "hsl(var(--bg-secondary))",
                color: dark ? "var(--ai-accent)" : "hsl(var(--accent))",
                border: dark ? "1px solid rgba(212,165,55,0.4)" : "1px solid hsl(var(--soft-border))",
              }}
            >
              {t.initial}
            </div>
            <blockquote
              className={`serif-italic text-lg leading-relaxed mt-4 ${
                dark ? "text-[var(--ai-quote)]" : "text-[hsl(var(--text-secondary))]"
              }`}
            >
              "{t.quote}"
            </blockquote>
            <div className="mt-6 flex items-center gap-1">
              {Array.from({ length: t.rating }).map((_, idx) => (
                <Star
                  key={idx}
                  className="h-4 w-4 fill-[var(--ai-accent)] text-[var(--ai-accent)]"
                  strokeWidth={1.2}
                />
              ))}
            </div>
            <div className="mt-5">
              <div
                className={`font-semibold ${
                  dark ? "text-[var(--ai-fg)]" : "text-[hsl(var(--text-primary))]"
                }`}
              >
                {t.name}
              </div>
              <div
                className={`text-sm ${
                  dark ? "text-[var(--ai-fg-3)]" : "text-[hsl(var(--text-secondary))]"
                }`}
              >
                {t.role}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
