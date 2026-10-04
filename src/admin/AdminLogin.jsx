import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import logo from "../assets/logo.png";

function friendlyAuthError(err) {
  return (
    err?.message ||
    "Login failed. Please check your username and password."
  );
}

// Icons (inline SVG — no extra package needed)
const IconUser = () => (
  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="8" r="4" />
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);
const IconEye = () => (
  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1" />
    <path d="M6.6 6.6C3.9 8.4 2 12 2 12s3.6 7 10 7a10 10 0 0 0 5.4-1.6" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <path d="m2 2 20 20" />
  </svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);

// Styles for this page only (all classes start with "al-" so nothing else
// on the site is affected).
const CSS = `
.al-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 16px;
  background:radial-gradient(900px 500px at 12% 10%,rgba(11,111,176,.35),transparent 60%),
  radial-gradient(700px 420px at 92% 95%,rgba(245,165,36,.22),transparent 60%),#071a2c;
  position:relative;overflow:hidden;font-family:inherit}
.al-wrap::before{content:"";position:absolute;inset:0;pointer-events:none;
  background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);
  background-size:44px 44px;mask-image:radial-gradient(circle at 50% 45%,#000 30%,transparent 75%)}
.al-card{position:relative;width:100%;max-width:440px;background:#fff;border-radius:22px;padding:38px 34px 30px;
  box-shadow:0 30px 70px -20px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.06);animation:al-in .6s cubic-bezier(.22,1,.36,1) both}
.al-card::before{content:"";position:absolute;left:34px;right:34px;top:0;height:4px;border-radius:0 0 6px 6px;
  background:linear-gradient(90deg,#0b6fb0,#f5a524)}
@keyframes al-in{from{opacity:0;transform:translateY(18px) scale(.98)}to{opacity:1;transform:none}}
.al-logo{display:block;height:64px;width:auto;margin:0 auto 18px;object-fit:contain}
.al-title{margin:0;text-align:center;font-size:28px;line-height:1.15;font-weight:800;color:#0b1f33;letter-spacing:-.02em}
.al-sub{margin:8px 0 26px;text-align:center;font-size:14.5px;color:#5b6b7c}
.al-field{display:block;margin-bottom:16px}
.al-label{display:block;font-size:13.5px;font-weight:700;color:#0b1f33;margin-bottom:7px}
.al-box{position:relative;display:flex;align-items:center}
.al-ico{position:absolute;left:14px;color:#8a99a8;display:flex;pointer-events:none;transition:color .2s}
.al-input{width:100%;height:50px;border:1.5px solid #dde4ec;border-radius:12px;background:#f7f9fc;
  padding:0 46px 0 44px;font-size:15.5px;color:#0b1f33;outline:none;transition:border-color .2s,box-shadow .2s,background .2s;box-sizing:border-box;font-family:inherit}
.al-input::placeholder{color:#a3b0bd}
.al-input:focus{border-color:#0b6fb0;background:#fff;box-shadow:0 0 0 4px rgba(11,111,176,.12)}
.al-box:focus-within .al-ico{color:#0b6fb0}
.al-eye{position:absolute;right:6px;width:38px;height:38px;border:0;border-radius:9px;background:transparent;color:#6b7b8b;
  display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .2s,color .2s}
.al-eye:hover{background:#eaf1f8;color:#0b6fb0}
.al-eye:focus-visible{outline:2px solid #0b6fb0;outline-offset:1px}
.al-error{display:flex;gap:9px;align-items:flex-start;margin:4px 0 16px;padding:11px 13px;border-radius:11px;
  background:#fdecec;color:#b42318;font-size:14px;line-height:1.4;animation:al-shake .35s}
.al-error svg{flex:none;margin-top:1px}
@keyframes al-shake{25%{transform:translateX(-5px)}50%{transform:translateX(5px)}75%{transform:translateX(-3px)}}
.al-btn{width:100%;height:52px;border:0;border-radius:12px;margin-top:6px;cursor:pointer;
  background:linear-gradient(135deg,#0b6fb0,#0a4f86);color:#fff;font-size:16px;font-weight:700;font-family:inherit;
  display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 12px 24px -10px rgba(11,111,176,.7);
  transition:transform .15s,box-shadow .2s,filter .2s}
.al-btn:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.06);box-shadow:0 16px 28px -10px rgba(11,111,176,.8)}
.al-btn:active:not(:disabled){transform:translateY(0)}
.al-btn:disabled{opacity:.75;cursor:wait}
.al-spin{width:18px;height:18px;border:2.5px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:al-rot .7s linear infinite}
@keyframes al-rot{to{transform:rotate(360deg)}}
.al-foot{margin-top:22px;padding-top:18px;border-top:1px solid #eef2f6;text-align:center;font-size:13.5px}
.al-foot a{color:#0b6fb0;text-decoration:none;font-weight:600}
.al-foot a:hover{text-decoration:underline}
@media (max-width:480px){.al-card{padding:32px 22px 24px;border-radius:18px}.al-card::before{left:22px;right:22px}
  .al-title{font-size:24px}.al-logo{height:56px}}
@media (prefers-reduced-motion:reduce){.al-card,.al-error{animation:none}}
`;

export default function AdminLogin() {
  const { loginWithUsername, user, adminProfile, loading } = useAdminAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();

  if (!loading && user && adminProfile) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setBusy(true);

    try {
      await loginWithUsername(username, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      console.error(err);
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="al-wrap">
      <style>{CSS}</style>

      <form className="al-card" onSubmit={handleSubmit} noValidate={false}>
        <img src={logo} alt="SOSARI" className="al-logo" />

        <h2 className="al-title">Admin Login</h2>
        <p className="al-sub">Ku soo gal si aad u maamusho website-ka SOSARI</p>

        <label className="al-field">
          <span className="al-label">Username</span>
          <span className="al-box">
            <span className="al-ico"><IconUser /></span>
            <input
              className="al-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Geli username-kaaga"
              autoComplete="username"
              required
              autoFocus
            />
          </span>
        </label>

        <label className="al-field">
          <span className="al-label">Password</span>
          <span className="al-box">
            <span className="al-ico"><IconLock /></span>
            <input
              className="al-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Geli password-kaaga"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="al-eye"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Qari password-ka" : "Muuji password-ka"}
              title={showPassword ? "Qari password-ka" : "Muuji password-ka"}
            >
              {showPassword ? <IconEyeOff /> : <IconEye />}
            </button>
          </span>
        </label>

        {error && (
          <p className="al-error" role="alert">
            <IconAlert /> <span>{error}</span>
          </p>
        )}

        <button className="al-btn" type="submit" disabled={busy}>
          {busy ? (
            <>
              <span className="al-spin" /> Gelaya…
            </>
          ) : (
            "Gal (Login)"
          )}
        </button>

        <div className="al-foot">
          <Link to="/">← Ku noqo website-ka</Link>
        </div>
      </form>
    </div>
  );
}