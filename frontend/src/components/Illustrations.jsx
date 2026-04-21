/**
 * Line-art illustrations for services. Self-drawing on view transition.
 */
import { motion } from "framer-motion";

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i = 0) => ({
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 1.4, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.3, delay: i * 0.15 } },
  }),
};

function Base({ children, size = 240 }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      initial="hidden"
      animate="visible"
      fill="none"
      stroke="#D4A537"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </motion.svg>
  );
}

export function IllSkilledNursing(props) {
  return (
    <Base {...props}>
      {/* stethoscope */}
      <motion.path variants={draw} custom={0} d="M60 40 Q55 90 90 110 Q125 130 140 100 Q145 85 140 70" />
      <motion.circle variants={draw} custom={1} cx="60" cy="38" r="4" />
      <motion.circle variants={draw} custom={1} cx="140" cy="68" r="4" />
      <motion.circle variants={draw} custom={2} cx="140" cy="130" r="14" />
      <motion.path variants={draw} custom={3} d="M140 144 L 140 160" />
      <motion.path variants={draw} custom={3} d="M134 160 L 146 160" />
    </Base>
  );
}

export function IllPhysicalTherapy(props) {
  return (
    <Base {...props}>
      {/* walking figure */}
      <motion.circle variants={draw} custom={0} cx="100" cy="45" r="14" />
      <motion.path variants={draw} custom={1} d="M100 60 L 100 115" />
      <motion.path variants={draw} custom={2} d="M100 80 L 135 70" />
      <motion.path variants={draw} custom={2} d="M100 80 L 65 95" />
      <motion.path variants={draw} custom={3} d="M100 115 L 80 160" />
      <motion.path variants={draw} custom={3} d="M100 115 L 125 155" />
      {/* ground line */}
      <motion.path variants={draw} custom={4} d="M40 175 L 160 175" />
    </Base>
  );
}

export function IllOccupationalTherapy(props) {
  return (
    <Base {...props}>
      {/* hand holding star */}
      <motion.path variants={draw} custom={0} d="M50 120 Q 50 80 90 80 Q 130 80 130 120 L 130 160 L 50 160 Z" />
      <motion.path variants={draw} custom={1} d="M90 40 L 97 62 L 120 62 L 102 76 L 109 98 L 90 84 L 71 98 L 78 76 L 60 62 L 83 62 Z" />
    </Base>
  );
}

export function IllSpeechTherapy(props) {
  return (
    <Base {...props}>
      {/* speech bubble with soundwave */}
      <motion.path variants={draw} custom={0} d="M40 60 Q 40 40 60 40 L 140 40 Q 160 40 160 60 L 160 110 Q 160 130 140 130 L 90 130 L 70 150 L 75 130 L 60 130 Q 40 130 40 110 Z" />
      <motion.path variants={draw} custom={1} d="M65 85 L 65 85" />
      <motion.path variants={draw} custom={1} d="M75 75 L 75 95" />
      <motion.path variants={draw} custom={2} d="M90 65 L 90 105" />
      <motion.path variants={draw} custom={2} d="M105 75 L 105 95" />
      <motion.path variants={draw} custom={3} d="M120 85 L 120 85" />
      <motion.path variants={draw} custom={3} d="M135 70 L 135 100" />
    </Base>
  );
}

export function IllHomeHealthAide(props) {
  return (
    <Base {...props}>
      {/* house with heart */}
      <motion.path variants={draw} custom={0} d="M40 100 L 100 50 L 160 100 L 160 160 L 40 160 Z" />
      <motion.path variants={draw} custom={1} d="M75 160 L 75 120 L 125 120 L 125 160" />
      <motion.path variants={draw} custom={2} d="M100 90 C 92 82 80 82 80 95 C 80 108 100 118 100 118 C 100 118 120 108 120 95 C 120 82 108 82 100 90 Z" />
    </Base>
  );
}

export function IllMedicalSocialWork(props) {
  return (
    <Base {...props}>
      {/* two figures connected */}
      <motion.circle variants={draw} custom={0} cx="70" cy="60" r="12" />
      <motion.circle variants={draw} custom={0} cx="130" cy="60" r="12" />
      <motion.path variants={draw} custom={1} d="M55 100 Q 70 85 85 100 L 85 140 L 55 140 Z" />
      <motion.path variants={draw} custom={1} d="M115 100 Q 130 85 145 100 L 145 140 L 115 140 Z" />
      <motion.path variants={draw} custom={2} d="M85 115 C 95 108 105 108 115 115" />
      <motion.path variants={draw} custom={3} d="M90 155 L 110 155" />
    </Base>
  );
}

export const SERVICE_ILLUSTRATIONS = {
  "skilled-nursing": IllSkilledNursing,
  "physical-therapy": IllPhysicalTherapy,
  "occupational-therapy": IllOccupationalTherapy,
  "speech-therapy": IllSpeechTherapy,
  "home-health-aide": IllHomeHealthAide,
  "medical-social-work": IllMedicalSocialWork,
};
