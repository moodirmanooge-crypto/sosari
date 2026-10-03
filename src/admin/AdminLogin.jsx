import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import logo from "../assets/logo.png";

function friendlyAuthError(err) {
  return (
    err?.message ||
    "Login failed. Please check your username and password."
  );
}

export default function AdminLogin() {
  const { loginWithUsername, user, adminProfile, loading } = useAdminAuth();

  const [username, setUsername] = useState("admin@sosari.com");
  const [password, setPassword] = useState("");
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
    <div className="adminLoginWrap">
      <form className="adminLoginBox" onSubmit={handleSubmit}>
        <img src={logo} alt="SOSARI" className="adminLoginLogo" />

        <h2>Admin Login</h2>

        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        {error && <p className="adminError">{error}</p>}

        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? "Gelaya…" : "Gal (Login)"}
        </button>
      </form>
    </div>
  );
}
