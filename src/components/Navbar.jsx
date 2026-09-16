import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useNavigation } from "../contexts/NavigationContext";
import logo from "../assets/logo.png";
import {
  IconSearch, IconPin, IconMail, IconFacebook, IconX, IconLinkedIn,
  IconYoutube, IconTelegram, IconGlobe, IconChevronRight, IconHome,
  IconUsers, IconChart, IconDoc, IconCheck, IconBulb, IconChat,
  IconArrow, IconHandshake, IconWhatsApp,
} from "./Icons";

const MOBILE_MENU_STYLE = {
  about: { bg: "#eef2f8", fg: "#2f6fed", icon: IconUsers, desc: "Learn about SOSARI" },
  research: { bg: "#eafaf1", fg: "#1fa35c", icon: IconSearch, desc: "Explore our research work" },
  data: { bg: "#eaf2fd", fg: "#2f6fed", icon: IconChart, desc: "Access reliable data and insights" },
  policies: { bg: "#f2edfb", fg: "#8b5cf6", icon: IconDoc, desc: "Policy insights and expert advice" },
  evaluations: { bg: "#eafaf1", fg: "#17b3a0", icon: IconCheck, desc: "Assessing impact and results" },
  knowledge: { bg: "#fdf1e0", fg: "#e0a02c", icon: IconBulb, desc: "Publications, reports and resources" },
  dialogue: { bg: "#fdeaf0", fg: "#e0507a", icon: IconChat, desc: "Engage, discuss and collaborate" },
};

// Flattens the nav config into one searchable list of every real page on
// the site: "Home", every top-level section, and every sub-page under it
// (including the nested Research categories) — each with its own link.
function buildSearchIndex(NAV) {
  const index = [
    { label: "Home", group: "", to: "/" },
    { label: "Our Work", group: "", to: "/our-work" },
    { label: "Work With SOSARI", group: "", to: "/partner" },
  ];
  NAV.forEach((group) => {
    index.push({ label: group.label, group: "", to: `/section/${group.key}` });
    if (group.groups) {
      group.groups.forEach((g) => {
        g.items.forEach((it) => {
          index.push({ label: it.label, group: `${group.label} — ${g.subcap}`, to: `/section/${it.key}` });
        });
      });
    } else if (group.items) {
      group.items.forEach((it) => {
        index.push({ label: it.label, group: group.label, to: `/section/${it.key}` });
      });
    }
  });
  return index;
}

export default function Navbar() {
  const { nav: NAV } = useNavigation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openKey, setOpenKey] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  const searchIndex = useMemo(() => buildSearchIndex(NAV), [NAV]);
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return searchIndex.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 12);
  }, [searchQuery, searchIndex]);

  function openSearch() {
    setSearchOpen(true);
    setSearchQuery("");
  }
  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery("");
  }
  function goToResult(to) {
    closeSearch();
    navigate(to);
  }

  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    function onKey(e) {
      if (e.key === "Escape") closeSearch();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Close any open dropdown the moment the route changes — this is what
  // prevents a dropdown from staying visually open (covering the new page)
  // right after the person picks an item from it.
  useEffect(() => {
    setOpenKey(null);
  }, [location.pathname]);

  function isActive(key) {
    return location.pathname === `/section/${key}` || location.pathname.startsWith(`/section/${key}/`);
  }

  return (
    <>
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
            <div
              className="mi"
              key={group.key}
              onMouseEnter={() => setOpenKey(group.key)}
              onMouseLeave={() => setOpenKey((k) => (k === group.key ? null : k))}
            >
              <Link
                to={`/section/${group.key}`}
                className={isActive(group.key) ? "navActive" : ""}
                onClick={(e) => { setOpenKey(null); e.currentTarget.blur(); }}
              >
                {group.label}
              </Link>

              {group.groups ? (
                <div className={`drop research-menu${openKey === group.key ? " dropOpen" : ""}`}>
                  {group.groups.map((g, gi) => (
                    <div key={g.subcap} className="researchGroupCol" style={{ "--gi": gi }}>
                      <div className="subcap">{g.subcap}</div>
                      {g.items.map((it, idx) => (
                        <Link
                          key={it.key}
                          to={`/section/${it.key}`}
                          style={{ "--i": idx }}
                          onClick={(e) => { setOpenKey(null); e.currentTarget.blur(); }}
                        >
                          {it.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`drop${openKey === group.key ? " dropOpen" : ""}`}>
                  <div className="cap">{group.cap}</div>
                  {group.items.map((it, idx) => (
                    <Link
                      key={it.key}
                      to={`/section/${it.key}`}
                      style={{ "--i": idx }}
                      onClick={(e) => { setOpenKey(null); e.currentTarget.blur(); }}
                    >
                      {it.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button className="searchBtn" aria-label="Search" type="button" title="Search" onClick={openSearch}>
            <IconSearch />
          </button>
          <Link className="cta" to="/partner">
            WORK WITH SOSARI <span className="ctaArrow">→</span>
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
              <span className="mmBtn" aria-label="Open"><IconArrow /></span>
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
                  <span className="mmBtn" aria-label="Open"><IconArrow /></span>
                </Link>
              );
            })}
          </div>

          <Link to="/partner" onClick={() => setMobileOpen(false)} className="mobileMenuPartner">
            <span className="mmPartnerIcon"><IconHandshake /></span>
            <span className="mmPartnerText">
              <small>BE A PART OF OUR MISSION</small>
              <b>WORK WITH SOSARI</b>
              <span>Stronger data. Brighter Somalia.</span>
            </span>
            <span className="mmBtn mmBtnLight" aria-label="Open"><IconArrow /></span>
          </Link>

          <div className="mobileMenuSocial">
            <a href="https://wa.me/252612880114" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><IconWhatsApp /></a>
            <a href="https://www.facebook.com/share/1adtVKQ2KX/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><IconFacebook /></a>
            <a href="https://www.linkedin.com/company/somali-statistics-and-research-institute-sosari/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><IconLinkedIn /></a>
          </div>
          <p className="mobileMenuFoot">A data-driven Somalia for a better tomorrow</p>
        </div>
      )}

      {searchOpen && (
        <div className="siteSearchOverlay" onClick={closeSearch}>
          <div className="siteSearchBox" onClick={(e) => e.stopPropagation()}>
            <div className="siteSearchInputRow">
              <IconSearch />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search the site… (e.g. Who We Are)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="button" className="siteSearchClose" onClick={closeSearch} aria-label="Close search">
                <IconX />
              </button>
            </div>

            {searchQuery.trim() && (
              <div className="siteSearchResults">
                {searchResults.length === 0 ? (
                  <p className="siteSearchEmpty">No pages match "{searchQuery}".</p>
                ) : (
                  searchResults.map((r) => (
                    <button
                      key={r.to}
                      type="button"
                      className="siteSearchResultItem"
                      onClick={() => goToResult(r.to)}
                    >
                      <span className="siteSearchResultLabel">{r.label}</span>
                      {r.group && <span className="siteSearchResultGroup">{r.group}</span>}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}