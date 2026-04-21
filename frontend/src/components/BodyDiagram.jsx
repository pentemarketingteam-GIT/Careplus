import { motion } from "framer-motion";
import { useState } from "react";
import { BODY_REGIONS } from "@/lib/content";

/**
 * Clickable stylized body diagram. Tapping a region invokes onPick(region).
 */
export default function BodyDiagram({ onPick }) {
  const [hover, setHover] = useState(null);
  return (
    <div className="flex flex-col items-center" data-testid="body-diagram">
      <svg
        viewBox="0 0 500 520"
        className="max-w-md w-full h-auto drop-shadow-[0_20px_40px_rgba(212,165,55,0.15)]"
      >
        {/* Simple stylized body silhouette */}
        <g stroke="#D4A537" strokeWidth="1.5" fill="rgba(212,165,55,0.04)">
          {/* head */}
          <ellipse cx="250" cy="60" rx="38" ry="44" />
          {/* neck */}
          <rect x="236" y="100" width="28" height="18" rx="6" />
          {/* torso */}
          <path d="M175 130 Q 250 118 325 130 L 315 290 Q 250 300 185 290 Z" />
          {/* arms */}
          <path d="M175 135 Q 140 190 130 260 Q 125 280 118 295" strokeLinecap="round" fill="none" />
          <path d="M325 135 Q 360 190 370 260 Q 375 280 382 295" strokeLinecap="round" fill="none" />
          {/* hands */}
          <circle cx="118" cy="300" r="14" />
          <circle cx="382" cy="300" r="14" />
          {/* hips */}
          <path d="M185 290 Q 250 305 315 290 L 310 340 Q 250 352 190 340 Z" />
          {/* legs */}
          <path d="M210 345 Q 212 420 225 490" strokeLinecap="round" fill="none" />
          <path d="M290 345 Q 288 420 275 490" strokeLinecap="round" fill="none" />
          {/* feet */}
          <ellipse cx="225" cy="498" rx="20" ry="9" />
          <ellipse cx="275" cy="498" rx="20" ry="9" />
        </g>

        {/* Interactive hotspots */}
        {BODY_REGIONS.map((r) => {
          const isHover = hover === r.id;
          return (
            <g key={r.id}>
              <motion.circle
                cx={r.cx}
                cy={r.cy}
                r={r.r}
                fill={isHover ? "rgba(212,165,55,0.25)" : "rgba(212,165,55,0.08)"}
                stroke="#D4A537"
                strokeWidth={isHover ? "2" : "1"}
                strokeDasharray={isHover ? "0" : "3 3"}
                animate={{ r: isHover ? r.r + 4 : r.r }}
                transition={{ duration: 0.25 }}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHover(r.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onPick?.(r)}
                data-testid={`body-region-${r.id}`}
              />
              {isHover && (
                <text
                  x={r.cx}
                  y={r.cy + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontFamily="Manrope, sans-serif"
                  fontWeight="600"
                  fill="#F0EADB"
                  style={{ pointerEvents: "none" }}
                >
                  {r.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <p className="mt-6 text-sm text-[#B5AD99] text-center max-w-md">
        Tap any region to get a personalized care suggestion.
      </p>
    </div>
  );
}
