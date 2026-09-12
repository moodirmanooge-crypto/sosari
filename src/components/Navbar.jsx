import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV } from "../config/navigation";
import logo from "../assets/logo.png";
import {
  IconSearch, IconPin, IconMail, IconFacebook, IconX, IconLinkedIn,
  IconYoutube, IconTelegram, IconGlobe, IconChevronRight, IconHome,
  IconUsers, IconChart, IconDoc, IconCheck, IconBulb, IconChat,
  IconArrow, IconHandshake,
} from "./Icons";

// Visual identity for each mobile-menu row: a soft tint background, an
// accent colour for the icon/button, an icon, and a one-line description.
const MOBILE_MENU_STYLE = {
  about: { bg: "#eef2f8", fg: "#2f6fed", icon: IconUsers, desc: "Learn about SOSARI" },
  research: { bg: "#eafaf1", fg: "#1fa35c", icon: IconSearch, desc: "Explore our research work" },
  data: { bg: "#eaf2fd", fg: "#2f6fed", icon: IconChart, desc: "Access reliable data and insights" },
  policies: { bg: "#f2edfb", fg: "#8b5cf6", icon: IconDoc, desc: "Policy insights and expert advice" },
  evaluations: { bg: "#eafaf1", fg: "#17b3a0", icon: IconCheck, desc: "Assessing impact and results" },
  knowledge: { bg: "#fdf1e0", fg: "#e0a02c", icon: IconBulb, desc: "Publications, reports and resources" },
  dialogue: { bg: "#fdeaf0", fg: "#e0507a", icon: IconChat, desc: "Engage, discuss and collaborate" },
};

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

  // Lock background scroll while the full-screen mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

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
          <div className="mi">
            <Link to="/reports" className={location.pathname === "/reports" ? "navActive" : ""}>Reports</Link>
          </div>

          <button className="searchBtn" aria-label="Search" type="button" title="Search">
            <IconSearch />
          </button>
          <Link className="cta" to="/partner">
            PARTNER WITH SOSARI <span className="ctaArrow">→</span>
          </Link>
        </div>

        <div className="mobile" onClick={() => setMobileOpen(true)} aria-label="Open menu">☰</div>
      </nav>

      {mobileOpen && (
        <div className="mobileMenuOverlay">
          <div className="mobileMenuHeader">
            <div className="mobileMenuBrand">
              <img src={logo} alt="SOSARI" className="mobileMenuLogo" />
              <span className="mobileMenuTagline">Data Today &nbsp;•&nbsp; Better Decisions Tomorrow</span>
            </div>
            <button className="mobileMenuClose" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <IconX />
            </button>
          </div>

          <div className="mobileMenuKicker">Explore &nbsp;•&nbsp; Learn &nbsp;•&nbsp; Engage</div>

          <div className="mobileMenuList">
            <Link to="/" onClick={() => setMobileOpen(false)} className="mobileMenuItem mobileMenuItemHome">
              <span className="mmIcon"><IconHome /></span>
              <span className="mmText"><b>Home</b><span>Back to our main page</span></span>
              <span className="mmBtn">Click now <IconArrow /></span>
            </Link>

            {NAV.map((group) => {
              const style = MOBILE_MENU_STYLE[group.key] || {};
              const Icon = style.icon || IconDoc;
              return (
                <Link
                  key={group.key}
                  to={`/section/${group.key}`}
                  onClick={() => setMobileOpen(false)}
                  className="mobileMenuItem"
                  style={{ "--mmBg": style.bg, "--mmFg": style.fg }}
                >
                  <span className="mmIcon"><Icon /></span>
                  <span className="mmText"><b>{group.label}</b><span>{style.desc}</span></span>
                  <span className="mmBtn">Click now <IconArrow /></span>
                </Link>
              );
            })}
            <Link
              to="/reports"
              onClick={() => setMobileOpen(false)}
              className="mobileMenuItem"
              style={{ "--mmBg": "#eef2f8", "--mmFg": "#0876bd" }}
            >
              <span className="mmIcon"><IconDoc /></span>
              <span className="mmText"><b>Reports</b><span>Download published SOSARI reports</span></span>
              <span className="mmBtn">Click now <IconArrow /></span>
            </Link>
          </div>

          <Link to="/partner" onClick={() => setMobileOpen(false)} className="mobileMenuPartner">
            <span className="mmPartnerIcon"><IconHandshake /></span>
            <span className="mmPartnerText">
              <small>BE A PART OF OUR MISSION</small>
              <b>PARTNER WITH SOSARI</b>
              <span>Stronger data. Brighter Somalia.</span>
            </span>
            <span className="mmBtn mmBtnLight">Click now <IconArrow /></span>
          </Link>

          <div className="mobileMenuSocial">
            <a href="#" aria-label="Facebook"><IconFacebook /></a>
            <a href="#" aria-label="X (Twitter)"><IconX /></a>
            <a href="#" aria-label="LinkedIn"><IconLinkedIn /></a>
            <a href="#" aria-label="YouTube"><IconYoutube /></a>
          </div>
          <p className="mobileMenuFoot">A data-driven Somalia for a better tomorrow</p>
        </div>
      )}
    </>
  );
}