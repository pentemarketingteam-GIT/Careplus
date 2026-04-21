import { useMode } from "@/lib/ModeContext";
import { useNavigate } from "react-router-dom";

export default function ModeToggle() {
  const { mode, setMode } = useMode();
  const navigate = useNavigate();

  const set = (m) => {
    setMode(m);
    if (m === "dynamic") navigate("/ai");
    else navigate("/");
  };

  // On dynamic mode pin to top-center (fits in ai top-bar).
  // On static mode float just below the 80px header so it doesn't overlap nav.
  const topOffset = mode === "dynamic" ? "1rem" : "5.25rem";

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[60] rounded-full p-1 flex items-center gap-1 border transition-all duration-300"
      style={{
        top: topOffset,
        background: mode === "dynamic" ? "rgba(15,20,40,0.7)" : "rgba(255,255,255,0.85)",
        borderColor: mode === "dynamic" ? "rgba(255,255,255,0.1)" : "hsl(var(--soft-border))",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow: mode === "dynamic" ? "0 10px 30px -15px rgba(0,0,0,0.8)" : "0 10px 30px -18px rgba(45,49,46,0.25)",
      }}
      data-testid="mode-toggle"
    >
      <ToggleBtn active={mode === "static"} onClick={() => set("static")} testid="toggle-static" darkBg={mode === "dynamic"}>
        + STATIC
      </ToggleBtn>
      <ToggleBtn active={mode === "dynamic"} onClick={() => set("dynamic")} testid="toggle-dynamic" darkBg={mode === "dynamic"}>
        + DYNAMIC
      </ToggleBtn>
    </div>
  );
}

function ToggleBtn({ active, onClick, children, testid, darkBg }) {
  return (
    <button
      onClick={onClick}
      data-testid={testid}
      className="rounded-full px-4 py-2 text-[11px] tracking-[0.18em] font-semibold transition-all duration-300"
      style={{
        background: active ? (darkBg ? "#0B1028" : "#1a1d1f") : "transparent",
        color: active ? "#F3EFE6" : darkBg ? "rgba(255,255,255,0.6)" : "#2D312E",
        letterSpacing: "0.18em",
      }}
    >
      {children}
    </button>
  );
}
