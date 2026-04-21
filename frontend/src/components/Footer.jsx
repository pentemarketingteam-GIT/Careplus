import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { BRAND, NAV_LINKS, SERVICES } from "@/lib/brand";

export default function Footer() {
  return (
    <footer
      className="relative mt-24 text-[#F4F1EA]"
      style={{ background: "#1A1F1B" }}
      data-testid="site-footer"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <div className="label-xs text-[#C9A227]">get in touch</div>
            <h3 className="font-display text-4xl md:text-5xl leading-tight mt-4 text-[#F4F1EA]">
              Care that feels like family,
              <br />
              <span className="serif-italic text-[#D4B85A]">right at home.</span>
            </h3>
            <a
              href={BRAND.phoneHref}
              className="btn-accent mt-8 text-base"
              data-testid="footer-call-btn"
            >
              <Phone className="h-4 w-4" strokeWidth={1.5} />
              Call {BRAND.phone}
            </a>
          </div>

          <div className="lg:col-span-3">
            <div className="label-xs text-[#C9A227]">Navigate</div>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-[#D4CDB6] hover:text-white transition-colors"
                    data-testid={`footer-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <div className="label-xs text-[#C9A227]">Reach us</div>
            <ul className="mt-5 space-y-4 text-[#D4CDB6]">
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-1 text-[#C9A227]" strokeWidth={1.5} />
                <a href={BRAND.phoneHref} className="hover:text-white">{BRAND.phone}</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-1 text-[#C9A227]" strokeWidth={1.5} />
                <a href={`mailto:${BRAND.email}`} className="hover:text-white">{BRAND.email}</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 text-[#C9A227]" strokeWidth={1.5} />
                <span>{BRAND.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-4 w-4 mt-1 text-[#C9A227]" strokeWidth={1.5} />
                <span>{BRAND.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between gap-4 text-sm text-[#B5AD99]">
          <div>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</div>
          <div className="flex gap-6 flex-wrap">
            {SERVICES.slice(0, 4).map((s) => (
              <Link key={s.slug} to="/services" className="hover:text-white">
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
