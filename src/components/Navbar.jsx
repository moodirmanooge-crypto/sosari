import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV } from "../config/navigation";
import logo from "../assets/logo.png";
import {
  IconSearch, IconPin, IconMail, IconFacebook, IconX, IconLinkedIn,
  IconYoutube, IconTelegram, IconGlobe, IconChevronRight,
} from "./Icons";

// Simple, direct navigation: every item — top-level or mobile — is a plain
// link that goes straight to its own page. No hover dropdown, no tap-to-expand
// accordion. Each destination page (SectionLanding) already lists all of its
// sub-sections there, so nothing is lost by removing the popup menus.
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function isActive(key) {
    return location.pathname === `/section/${key}` || location.pathname.startsWith(`/section/${key}/`);
  }

  return (
    <>
      <div className="top">
        <div className="topLeft">
          <span className="topPin"><IconPin /> Somalia</span>
          <span className="topSep">|</span>
          <span>Independent • Data Driven • For a Better Tomorrow</span>
        </div>
        <div className="topRight">
          <a href="mailto:info@sosari.com" className="topMail"><IconMail /> info@sosari.com</a>
          <span className="topSocial">
            <a href="#" aria-label="Facebook"><IconFacebook /></a>
            <a href="#" aria-label="X (Twitter)"><IconX /></a>
            <a href="#" aria-label="LinkedIn"><IconLinkedIn /></a>
            <a href="#" aria-label="YouTube"><IconYoutube /></a>
            <a href="#" aria-label="Telegram"><IconTelegram /></a>
          </span>
          <button type="button" className="langBtn">
            <IconGlobe /> EN <IconChevronRight className="langArrow" />
          </button>
        </div>
      </div>

      <nav className={`nav${scrolled ? " navScrolled" : ""}`}>
        <span className="navAccentBar" aria-hidden="true" />
        <Link className="brand" to="/">
          <img className="official-logo" src={logo} alt="SOSARI — Somali Statistics and Research Institute" />
        </Link>

        <div className="menu">
          <div className="mi">
            <Link to="/" className={isHome ? "navActive" : ""}>Home</Link>
          </div>

          {NAV.map((group) => (
            <div className="mi" key={group.key}>
              <Link to={`/section/${group.key}`} className={isActive(group.key) ? "navActive" : ""}>
                {group.label}
              </Link>
            </div>
          ))}

          <button className="searchBtn" aria-label="Search" type="button" title="Search">
            <IconSearch />
          </button>
          <Link className="cta" to="/partner">
            PARTNER WITH SOSARI <span className="ctaArrow">→</span>
          </Link>
        </div>

        <div className="mobile" onClick={() => setMobileOpen((v) => !v)}>☰</div>
      </nav>

      {mobileOpen && (
        <div className="mobileMenu">
          <Link to="/" onClick={() => setMobileOpen(false)}>
            Home
          </Link>
          {NAV.map((group) => (
            <Link
              key={group.key}
              to={`/section/${group.key}`}
              onClick={() => setMobileOpen(false)}
            >
              {group.label}
            </Link>
          ))}
          <Link className="cta mobileCta" to="/partner" onClick={() => setMobileOpen(false)}>
            PARTNER WITH SOSARI
          </Link>
        </div>
      )}
    </>
  );
}