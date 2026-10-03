import { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const AdminAuthContext = createContext(null);

const ADMIN_SESSION_KEY = "sosari_admin_session";

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Firestore is the source of truth for this admin login.
  // Document: sosariAdmin/admin
  // Fields:
  // username: "admin@sosari.com"
  // password: "123456"
  // email: "admin@sosari.com"
  // role: "superadmin"
  useEffect(() => {
    async function restoreSession() {
      try {
        const saved = localStorage.getItem(ADMIN_SESSION_KEY);

        if (!saved) {
          setUser(null);
          setAdminProfile(null);
          setLoading(false);
          return;
        }

        const ref = doc(db, "sosariAdmin", "admin");
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          localStorage.removeItem(ADMIN_SESSION_KEY);
          setUser(null);
          setAdminProfile(null);
          setLoading(false);
          return;
        }

        const data = snap.data();

        setUser({
          uid: "firestore-admin",
          email: data.email || data.username || "",
        });

        setAdminProfile({
          username: data.username || data.email || "",
          role: data.role || "admin",
        });
      } catch (error) {
        console.error("Admin session restore error:", error);
        localStorage.removeItem(ADMIN_SESSION_KEY);
        setUser(null);
        setAdminProfile(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
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

    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));

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

  async function logout() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
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
