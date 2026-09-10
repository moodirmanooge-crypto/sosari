import { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const AdminAuthContext = createContext(null);

// Session is kept in sessionStorage only (cleared when the tab closes).
// This avoids re-reading Firestore on every page refresh.
const SESSION_KEY = "sosari_admin_session";

export function AdminAuthProvider({ children }) {
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on first load.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) setAdminProfile(JSON.parse(raw));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login flow: read the single admin doc directly from Firestore
  // (sosariAdmin/admin) and compare username + password against it.
  async function loginWithUsername(username, password) {
    const ref = doc(db, "sosariAdmin", "admin");
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      throw new Error("Admin-ka lama helin. La xiriir maamulaha.");
    }
    const data = snap.data();
    if (data.username !== username.trim() || String(data.password) !== password) {
      throw new Error("Username-ka ama password-ka waa khalad. Fadlan isku day mar kale.");
    }
    const profile = { username: data.username, role: data.role || "admin" };
    setAdminProfile(profile);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    return profile;
  }

  function logout() {
    setAdminProfile(null);
    sessionStorage.removeItem(SESSION_KEY);
  }

  return (
    <AdminAuthContext.Provider
      value={{ user: adminProfile, adminProfile, loading, loginWithUsername, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}