import { useState } from "react";
import { LogIn, LogOut, UserCircle2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

/**
 * @param {"light"|"dark"} variant
 */
export default function AuthButton({ variant = "light" }) {
  const { user, loading, login, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) return null;

  const dark = variant === "dark";

  if (!user) {
    return (
      <button
        onClick={login}
        data-testid="auth-login-btn"
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-all ${
          dark
            ? "border-white/15 text-[#F0EADB] hover:border-[#D4A537]/60 hover:bg-white/[0.05]"
            : "border-[hsl(var(--soft-border))] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-secondary))]"
        }`}
      >
        <LogIn className="h-4 w-4" strokeWidth={1.5} />
        Sign in
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        data-testid="auth-user-btn"
        className={`flex items-center gap-2 rounded-full px-2 py-1 border transition-all ${
          dark
            ? "border-white/15 hover:border-[#D4A537]/60"
            : "border-[hsl(var(--soft-border))] hover:bg-[hsl(var(--bg-secondary))]"
        }`}
      >
        {user.picture ? (
          <img src={user.picture} alt={user.name} className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <UserCircle2 className={`h-7 w-7 ${dark ? "text-[#F0EADB]" : "text-[hsl(var(--text-primary))]"}`} strokeWidth={1.3} />
        )}
        <span className={`text-sm pr-2 ${dark ? "text-[#F0EADB]" : "text-[hsl(var(--text-primary))]"}`}>
          {user.name.split(" ")[0]}
        </span>
      </button>
      {open && (
        <div
          className={`absolute right-0 mt-2 w-60 rounded-2xl border shadow-xl z-50 overflow-hidden ${
            dark ? "bg-[#0F1A14] border-white/10" : "bg-white border-[hsl(var(--soft-border))]"
          }`}
          onMouseLeave={() => setOpen(false)}
          data-testid="auth-menu"
        >
          <div className={`px-4 py-3 border-b ${dark ? "border-white/10" : "border-[hsl(var(--soft-border))]"}`}>
            <div className={`font-medium truncate ${dark ? "text-[#F0EADB]" : "text-[hsl(var(--text-primary))]"}`}>{user.name}</div>
            <div className={`text-xs truncate ${dark ? "text-[#B5AD99]" : "text-[hsl(var(--text-secondary))]"}`}>{user.email}</div>
          </div>
          <button
            onClick={logout}
            data-testid="auth-logout-btn"
            className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 transition-colors ${
              dark ? "text-[#D4CDB6] hover:bg-white/[0.05]" : "text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-secondary))]"
            }`}
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
