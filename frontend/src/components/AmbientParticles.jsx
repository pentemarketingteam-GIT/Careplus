import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * Living ambient background — floating breath-orbs that drift.
 * Tint shifts based on `hue` prop (one of: mustard, moss, forest, warm).
 */
export default function AmbientParticles({ hue = "forest" }) {
  const tint = {
    mustard: "rgba(212,165,55,0.35)",
    moss: "rgba(107,142,78,0.35)",
    forest: "rgba(45,74,43,0.35)",
    warm: "rgba(231,206,165,0.3)",
  }[hue] || "rgba(212,165,55,0.3)";

  const particles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        size: 60 + Math.random() * 200,
        x: Math.random() * 100,
        y: Math.random() * 100,
        dx: (Math.random() - 0.5) * 40,
        dy: (Math.random() - 0.5) * 40,
        dur: 12 + Math.random() * 16,
        delay: Math.random() * 6,
        blur: 40 + Math.random() * 40,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: `radial-gradient(circle, ${tint} 0%, transparent 70%)`,
            filter: `blur(${p.blur}px)`,
          }}
          animate={{
            x: [0, p.dx, 0],
            y: [0, p.dy, 0],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        />
      ))}
    </div>
  );
}
