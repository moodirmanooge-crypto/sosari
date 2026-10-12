import { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const AdminAuthContext = createContext(null);

const ADMIN_SESSION_KEY = "sosari_admin_session";

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading] = useState(false); // nothing to restore — no saved session

  // Firestore is the source of truth for this admin login.
  // Document: sosariAdmin/admin
  // Fields:
  // username: "admin@sosari.com"
  // password: "123456"
  // email: "admin@sosari.com"
  // role: "superadmin"
  // The admin session is kept ONLY in memory (never saved in the browser).
  // So every time /admin is opened — a new tab, a new window, typing the
  // URL again, or a page refresh — the admin must log in with the password.
  // Moving between admin pages inside the panel stays logged in.
  useEffect(() => {
    // Remove any old saved session left by the previous version of the site.
    try { localStorage.removeItem(ADMIN_SESSION_KEY); } catch { /* ignore */ }
    try { sessionStorage.removeItem(ADMIN_SESSION_KEY); } catch { /* ignore */ }
  }, []);

  async function loginWithUsername(username, password) {
    const cleanUsername = username.trim();

    const ref = doc(db, "sosariAdmin", "admin");
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      throw new Error("Admin account-ka Firestore lagama helin.");
    }

    const data = snap.data();

    // Username-ka Firestore ayaa la isticmaalaa.
    if (String(data.username || "").trim() !== cleanUsername) {
      throw new Error("Username-kan lama helin. Fadlan hubi username-ka.");
    }

    // PASSWORD-KA SAXDA AH WAXAA SI TOOS AH LOOGA AKHRIYAA FIRESTORE.
    if (data.password === undefined || data.password === null) {
      throw new Error("Password field-ka Firestore kama jiro.");
    }

    // Exact comparison: waxa Firestore ku jira ayaa la hubinayaa.
    if (String(password) !== String(data.password)) {
      throw new Error("Wrong password");
    }

    // Login successful.
    const session = {
      uid: "firestore-admin",
      email: data.email || data.username || "",
      username: data.username || data.email || "",
      role: data.role || "admin",
      loggedInAt: Date.now(),
    };

    setUser({
      uid: session.uid,
      email: session.email,
    });

    setAdminProfile({
      username: session.username,
      role: session.role,
    });

    return true;
  }

  // Email/username iyo password-ka admin-ka waxaa si toos ah looga badalaa
  // Firestore (sosariAdmin/admin) — Firebase Auth lama isticmaalo.
  // newEmail / newPassword: kan madhan ayaan la badalin.
  async function changeAdminCredentials({ currentPassword, newEmail, newPassword } = {}) {
    const ref = doc(db, "sosariAdmin", "admin");
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      throw new Error("Admin account-ka Firestore lagama helin.");
    }

    const data = snap.data();

    if (String(currentPassword ?? "") !== String(data.password ?? "")) {
      throw new Error("Password-ka hadda jira waa khalad.");
    }

    const updates = {};
    const cleanEmail = String(newEmail ?? "").trim();
    const currentEmail = String(data.email || data.username || "").trim();

    if (cleanEmail && cleanEmail !== currentEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        throw new Error("Email-ka cusub sax maaha.");
      }
      updates.email = cleanEmail;
      updates.username = cleanEmail;
    }

    if (newPassword) {
      if (String(newPassword).length < 6) {
        throw new Error("Password-ka cusub waa inuu ka koobnaadaa ugu yaraan 6 xaraf.");
      }
      if (String(newPassword) !== String(data.password)) {
        updates.password = String(newPassword);
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new Error("Wax isbeddel ah lama samayn.");
    }

    await updateDoc(ref, updates);

    // Session-ka iyo state-ka ayaa la cusboonaysiinayaa si admin-ku uusan u bixin.
    const email = updates.email || currentEmail;
    const username = updates.username || data.username || email;
    const role = data.role || "admin";

    setUser({ uid: "firestore-admin", email });
    setAdminProfile({ username, role });

    return true;
  }

  async function logout() {
    setUser(null);
    setAdminProfile(null);
  }

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        adminProfile,
        loading,
        loginWithUsername,
        changeAdminCredentials,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);

  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return ctx;
}