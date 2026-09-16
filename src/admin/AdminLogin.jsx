import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import logo from "../assets/logo.png";

// Firebase Auth returns raw codes like "Firebase: Error (auth/invalid-credential)."
// This turns them into plain messages for the admin instead.
function friendlyAuthError(err) {
  const code = err?.code || "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Wrong password";
    case "auth/user-not-found":
      return "No account found with that username.";
    case "auth/invalid-email":
      return "That username/email isn't valid.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      // Custom errors thrown by loginWithUsername (e.g. unknown username)
      // don't have a Firebase auth code — keep their own message.
      return err?.message || "Login failed. Please check your username and password.";
  }
}

export default function AdminLogin() {
  const { loginWithUsername, user, adminProfile, loading } = useAdminAuth();
  const [username, setUsername] = useState("");
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
      navigate("/admin");
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
          <input value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="adminError">{error}</p>}
        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? "Gelaya…" : "Gal (Login)"}
        </button>
      </form>
    </div>
  );
}