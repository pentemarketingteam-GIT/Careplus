import { motion } from "framer-motion";
import { VISIT_TOUR } from "@/lib/content";

export default function TourCards() {
  return (
    <div className="mt-10 space-y-5" data-testid="tour-cards">
      {VISIT_TOUR.map((t, i) => (
        <motion.div
          key={t.step}
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          className="flex items-start gap-5 rounded-2xl p-6 border border-white/10 bg-white/[0.03]"
          data-testid={`tour-step-${t.step}`}
        >
          <div
            className="h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center font-display text-2xl text-[#1A1F1B]"
            style={{ background: "linear-gradient(135deg, #D4A537, #C9A227)" }}
          >
            {t.step}
          </div>
          <div>
            <div className="font-display text-2xl text-[#F0EADB]">{t.title}</div>
            <p className="text-[#C5BFA8] mt-2 leading-relaxed">{t.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
