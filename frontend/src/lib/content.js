export const TESTIMONIALS = [
  {
    id: "sarah",
    initial: "S",
    name: "Sarah J.",
    role: "Daughter of Patient",
    rating: 5,
    quote:
      "The nurses at CarePlus treated my mother like their own family. Their compassion and professionalism gave us peace of mind during a difficult time.",
  },
  {
    id: "robert",
    initial: "R",
    name: "Robert M.",
    role: "Former Patient",
    rating: 5,
    quote:
      "After my surgery, the physical therapy team helped me regain my independence. I couldn't have recovered without their dedicated care.",
  },
  {
    id: "elena",
    initial: "E",
    name: "Elena R.",
    role: "Recovery Patient",
    rating: 5,
    quote:
      "From the first visit, I felt comfortable and cared for. The entire team went above and beyond to ensure my recovery was smooth.",
  },
];

export const TEAM = [
  {
    id: "mdavis",
    name: "Dr. Maya Davis, RN",
    role: "Director of Clinical Services",
    bio: "20+ years in home healthcare. Leads care planning and clinical standards for every case.",
    color: "#2D4A2B",
  },
  {
    id: "jthompson",
    name: "James Thompson, DPT",
    role: "Lead Physical Therapist",
    bio: "Specializes in post-surgical and geriatric rehabilitation. Believes in movement as medicine.",
    color: "#6B8E4E",
  },
  {
    id: "aparker",
    name: "Aisha Parker, OTR/L",
    role: "Occupational Therapy Lead",
    bio: "Designs adaptive routines so patients keep doing what they love at home.",
    color: "#C9A227",
  },
  {
    id: "lsanders",
    name: "Luis Sanders, LCSW",
    role: "Medical Social Worker",
    bio: "Guides families through resources, insurance, and long-term care planning with empathy.",
    color: "#8F6E23",
  },
];

// Body regions → suggested service slugs
export const BODY_REGIONS = [
  { id: "head", label: "Head / Cognition", suggest: "speech-therapy", cx: 250, cy: 60, r: 38 },
  { id: "chest", label: "Chest / Heart", suggest: "skilled-nursing", cx: 250, cy: 160, r: 42 },
  { id: "shoulder", label: "Shoulder", suggest: "physical-therapy", cx: 180, cy: 135, r: 26 },
  { id: "hand", label: "Hand / Wrist", suggest: "occupational-therapy", cx: 130, cy: 240, r: 24 },
  { id: "hip", label: "Hip / Back", suggest: "physical-therapy", cx: 250, cy: 260, r: 34 },
  { id: "knee", label: "Knee", suggest: "physical-therapy", cx: 230, cy: 360, r: 22 },
  { id: "foot", label: "Foot / Mobility", suggest: "home-health-aide", cx: 240, cy: 450, r: 22 },
];

// Tour of a typical home visit
export const VISIT_TOUR = [
  { step: 1, title: "Arrival", desc: "Your clinician arrives on time, introduces themselves, and takes a moment to settle in with you and your family." },
  { step: 2, title: "Assessment", desc: "A thorough review of vitals, medications, and how you're feeling today — everything documented in your care plan." },
  { step: 3, title: "Care Delivery", desc: "Skilled treatment, therapy, or personal care — performed with dignity, patience, and evidence-based technique." },
  { step: 4, title: "Education", desc: "We teach you and your family how to continue care between visits — clear instructions, no jargon." },
  { step: 5, title: "Coordination", desc: "Notes sent to your physician, updates to your records, and scheduling the next visit before we leave." },
];
