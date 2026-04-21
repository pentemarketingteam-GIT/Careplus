import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { BRAND, NAV_LINKS } from "@/lib/brand";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="glass-nav sticky top-0 z-50" data-testid="site-header">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 flex items-center justify-between h-20">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-3 group">
          <span
            className="h-10 w-10 rounded-full flex items-center justify-center text-white font-display text-xl"
            style={{ background: "hsl(var(--brand))" }}
          >
            c+
          </span>
          <div className="leading-tight">
            <div className="font-display text-xl tracking-tight text-[hsl(var(--text-primary))]">
              Careplus
            </div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--text-secondary))]">
              Health Services, Inc.
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-8" data-testid="desktop-nav">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              data-testid={`nav-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[hsl(var(--brand))]"
                    : "text-[hsl(var(--text-primary))] hover:text-[hsl(var(--brand))]"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href={BRAND.phoneHref}
            data-testid="header-call-btn"
            className="btn-primary text-sm"
          >
            <Phone className="h-4 w-4" strokeWidth={1.5} />
            {BRAND.phone}
          </a>
        </div>

        <button
          className="lg:hidden p-2 rounded-full border border-[hsl(var(--soft-border))]"
          onClick={() => setOpen(!open)}
          data-testid="mobile-menu-toggle"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-[hsl(var(--soft-border))] bg-white" data-testid="mobile-nav">
          <div className="px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                data-testid={`mobile-nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={({ isActive }) =>
                  `text-base font-medium ${
                    isActive ? "text-[hsl(var(--brand))]" : "text-[hsl(var(--text-primary))]"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <a href={BRAND.phoneHref} className="btn-primary text-sm mt-2" data-testid="mobile-call-btn">
              <Phone className="h-4 w-4" strokeWidth={1.5} />
              {BRAND.phone}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
