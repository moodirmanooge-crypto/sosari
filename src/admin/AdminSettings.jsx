import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EmailAuthProvider, reauthenticateWithCredential,
  verifyBeforeUpdateEmail, updatePassword,
} from "firebase/auth";
import { auth } from "../firebase";
import { useAdminAuth } from "../contexts/AdminAuthContext";

// Friendly Somali messages for the Firebase Auth error codes most likely
// to come up here.
function friendlyError(err) {
  const code = err?.code || "";
  if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
    return "Password-ka hadda jira waa qalad. Fadlan isku day mar kale.";
  }
  if (code === "auth/too-many-requests") {
    return "Isku day badan ayaa la sameeyay. Fadlan mar dambe isku day.";
  }
  if (code === "auth/weak-password") {
    return "Password-ka cusub waa khafiif — ugu yaraan 6 xaraf isticmaal.";
  }
  if (code === "auth/email-already-in-use") {
    return "Email-kan horey ayaa loo isticmaalay.";
  }
  if (code === "auth/invalid-email") {
    return "Email-ka qaabkiisu ma saxna.";
  }
  if (code === "auth/requires-recent-login") {
    return "Fadlan mar kale geli password-kaaga hadda jira, kadibna isku day mar kale.";
  }
  return err?.message || "Wax baa qaldamay. Fadlan isku day mar kale.";
}

export default function AdminSettings() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const emailChanged = newEmail.trim() && newEmail.trim() !== user.email;
    const passwordChanged = newPassword.trim().length > 0;

    if (!currentPassword) {
      setError("Fadlan geli password-kaaga hadda jira si loo xaqiijiyo.");
      return;
    }
    if (!emailChanged && !passwordChanged) {
      setError("Wax isbeddel ah ma jiraan — geli email cusub ama password cusub.");
      return;
    }
    if (passwordChanged && newPassword !== confirmPassword) {
      setError("Labada password ee cusub isku mid ma aha.");
      return;
    }
    if (passwordChanged && newPassword.length < 6) {
      setError("Password-ka cusub waa inuu ugu yaraan 6 xaraf yahay.");
      return;
    }

    setSaving(true);
    try {
      // Firebase requires a recent sign-in before allowing sensitive
      // changes like email/password — this is exactly the "confirm the
      // current password first" step.
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      if (emailChanged) {
        // Firebase now requires the new address to be verified before the
        // change takes effect — it sends a link there instead of switching
        // immediately. The current login keeps working until they click it.
        await verifyBeforeUpdateEmail(auth.currentUser, newEmail.trim());
      }
      if (passwordChanged) {
        await updatePassword(auth.currentUser, newPassword);
      }

      if (passwordChanged) {
        setSuccess("Password-ka waa la beddelay. Fadlan mar kale soo gal adigoo isticmaalaya password-ka cusub…");
        setTimeout(async () => {
          await logout();
          navigate("/admin/login");
        }, 1800);
      } else if (emailChanged) {
        setSuccess(
          `Waxaan email cusub "${newEmail.trim()}" u dirnay link xaqiijin ah. Fur email-kaas oo gujii link-ga si ay email-ku u isbeddesho. Ilaa markaas, wali waxaad ku soo gali kartaa email-kaaga hore.`
        );
      }
    } catch (err) {
      console.error(err);
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="adminPage">
      <h1>Settings</h1>
      <p className="lead">Cusboonaysii email-kaaga ama password-kaaga. Waxaad marka hore geli doontaa password-kaaga hadda jira.</p>

      <form className="adminSettingsForm" onSubmit={handleSubmit}>
        <label>
          Password-ka hadda jira <span className="req">*</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Geli password-kaaga hadda jira"
            autoComplete="current-password"
            required
          />
        </label>

        <div className="adminSettingsDivider" />

        <label>
          Email cusub
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label>
          Password cusub
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Ka tag maran haddii aadan bedelin"
            autoComplete="new-password"
          />
        </label>

        <label>
          Xaqiiji password-ka cusub
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ku celi password-ka cusub"
            autoComplete="new-password"
          />
        </label>

        {error && <div className="adminSettingsMsg adminSettingsMsgError">{error}</div>}
        {success && <div className="adminSettingsMsg adminSettingsMsgOk">{success}</div>}

        <button type="submit" className="btn primary" disabled={saving}>
          {saving ? "Keydinaya…" : "Keydi isbeddelka"}
        </button>
      </form>
    </div>
  );
}