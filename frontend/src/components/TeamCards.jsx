import { motion } from "framer-motion";
import { useState } from "react";
import { TEAM } from "@/lib/content";

export default function TeamCards() {
  return (
    <div className="mt-10 grid sm:grid-cols-2 gap-5" data-testid="team-cards">
      {TEAM.map((m, i) => (
        <TeamCard key={m.id} member={m} idx={i} />
      ))}
    </div>
  );
}

function TeamCard({ member, idx }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: idx * 0.08 }}
      className="relative h-56 cursor-pointer"
      style={{ perspective: 1200 }}
      onClick={() => setFlipped((f) => !f)}
      data-testid={`team-card-${member.id}`}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl border border-white/10 p-5"
        style={{
          background: "rgba(255,255,255,0.04)",
          transformStyle: "preserve-3d",
        }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 p-6 flex flex-col justify-between rounded-2xl"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center font-display text-2xl text-white"
            style={{ background: member.color }}
          >
            {member.name
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div>
            <div className="font-display text-2xl text-[#F0EADB]">{member.name}</div>
            <div className="text-xs tracking-[0.18em] uppercase text-[#D4A537] mt-1">
              {member.role}
            </div>
            <div className="text-[10px] text-[#B5AD99] mt-2">Tap to read bio →</div>
          </div>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 p-6 flex flex-col justify-center rounded-2xl"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "rgba(212,165,55,0.08)",
            border: "1px solid rgba(212,165,55,0.3)",
          }}
        >
          <div className="text-[#F0EADB] leading-relaxed">{member.bio}</div>
          <div className="text-[10px] text-[#B5AD99] mt-4">Tap to flip back ←</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
