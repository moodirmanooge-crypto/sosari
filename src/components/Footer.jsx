import { Link } from "react-router-dom";
import { FOOTER_NAV } from "../config/navigation";
import logo2 from "../assets/logo2.png";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="foot">
        <div>
          <div className="brand">
            <img className="official-logo footer-logo" src={logo2} alt="SOSARI — Somali Statistics and Research Institute" />
          </div>
          <p style={{ fontSize: 11, color: "#9bb0bd" }}>Evidence. Data. Policy. Impact.</p>
        </div>

        {FOOTER_NAV.map((col) => (
          <div key={col.title}>
            <h4>{col.title}</h4>
            {col.items.map((it) =>
              it.key === "__partner__" ? (
                <Link key={it.label} to="/partner">{it.label}</Link>
              ) : (
                <Link key={it.label} to={`/section/${it.key}`}>{it.label}</Link>
              )
            )}
          </div>
        ))}
      </div>
      <div className="copy">
        © {new Date().getFullYear()} Somali Statistics and Research Institute (SOSARI). All rights reserved.
        &nbsp; • &nbsp; Privacy &nbsp; • &nbsp; Research Ethics &nbsp; • &nbsp; Safeguarding &nbsp; • &nbsp; Accessibility
        &nbsp; • &nbsp; <Link to="/admin/login" style={{ color: "#5a7180" }}>Admin</Link>
      </div>
    </footer>
  );
}