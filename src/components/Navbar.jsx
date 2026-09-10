import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NAV } from "../config/navigation";
import logo from "../assets/logo.png";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openKey, setOpenKey] = useState(null);
  const navigate = useNavigate();

  function goto(key) {
    setMobileOpen(false);
    setOpenKey(null);
    navigate(`/section/${key}`);
  }

  return (
    <>
      <div className="top">
        <span>Independent • Somali-led • Multidisciplinary</span>
        <span>Somalia & Horn of Africa • EN / SO / AR</span>
      </div>

      <nav className="nav">
        <Link className="brand" to="/">
          <img className="official-logo" src={logo} alt="SOSARI — Somali Statistics and Research Institute" />
        </Link>

        <div className="menu">
          {NAV.map((group) => (
            <div className="mi" key={group.key}>
              <a href={`/section/${group.key}`} onClick={(e) => { e.preventDefault(); goto(group.key); }}>
                {group.label}
              </a>

              {group.groups ? (
                <div className="drop research-menu">
                  {group.groups.map((g) => (
                    <div key={g.subcap}>
                      <div className="subcap">{g.subcap}</div>
                      {g.items.map((it) => (
                        <Link key={it.key} to={`/section/${it.key}`}>{it.label}</Link>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="drop">
                  <div className="cap">{group.cap}</div>
                  {group.items.map((it) => (
                    <Link key={it.key} to={`/section/${it.key}`}>{it.label}</Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link className="cta" to="/partner">PARTNER WITH SOSARI</Link>
        </div>

        <div className="mobile" onClick={() => setMobileOpen((v) => !v)}>☰</div>
      </nav>

      {mobileOpen && (
        <div className="mobileMenu">
          {NAV.map((group) => (
            <div key={group.key} className="mobileGroup">
              <button className="mobileGroupLabel" onClick={() => setOpenKey(openKey === group.key ? null : group.key)}>
                {group.label} <span>{openKey === group.key ? "−" : "+"}</span>
              </button>
              {openKey === group.key && (
                <div className="mobileSub">
                  <Link to={`/section/${group.key}`} onClick={() => setMobileOpen(false)} className="mobileOverview">
                    Overview: {group.label}
                  </Link>
                  {(group.items || group.groups.flatMap((g) => g.items)).map((it) => (
                    <Link key={it.key} to={`/section/${it.key}`} onClick={() => setMobileOpen(false)}>
                      {it.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link className="cta mobileCta" to="/partner" onClick={() => setMobileOpen(false)}>
            PARTNER WITH SOSARI
          </Link>
        </div>
      )}
    </>
  );
}
