import confetti from "canvas-confetti";

export function celebrate() {
  const colors = ["#D4A537", "#C9A227", "#6B8E4E", "#2D4A2B", "#F0EADB"];
  const defaults = { origin: { y: 0.7 }, colors, scalar: 0.9, zIndex: 9999 };
  confetti({ ...defaults, particleCount: 60, spread: 70, startVelocity: 42 });
  setTimeout(
    () => confetti({ ...defaults, particleCount: 40, spread: 100, startVelocity: 28, origin: { y: 0.65, x: 0.3 } }),
    180
  );
  setTimeout(
    () => confetti({ ...defaults, particleCount: 40, spread: 100, startVelocity: 28, origin: { y: 0.65, x: 0.7 } }),
    320
  );
}
