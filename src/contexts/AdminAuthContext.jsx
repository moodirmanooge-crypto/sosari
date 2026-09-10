import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Real Firebase Auth session drives everything. As soon as Firebase
  // confirms who's signed in, we cross-check them against the one admin
  // doc (sosariAdmin/admin) by email, purely to load the display name/role.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser || !firebaseUser.email) {
        setUser(null);
        setAdminProfile(null);
        setLoading(false);
        return;
      }
      try {
        const ref = doc(db, "sosariAdmin", "admin");
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data().email === firebaseUser.email) {
          setUser(firebaseUser);
          setAdminProfile({ username: snap.data().username, role: snap.data().role || "admin" });
        } else {
          // Signed in to Firebase Auth but not the registered admin — kick them out.
          await signOut(auth);
          setUser(null);
          setAdminProfile(null);
        }
      } catch (e) {
        console.error(e);
        setUser(null);
        setAdminProfile(null);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  // Login flow: the admin types a USERNAME (not an email). We look the
  // username up in sosariAdmin/admin to find the linked email, then
  // authenticate for real against Firebase Authentication with that
  // email + the password the admin typed. The password itself is never
  // stored in or checked against Firestore — Firebase Auth owns it.
  async function loginWithUsername(username, password) {
    const ref = doc(db, "sosariAdmin", "admin");
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().username !== username.trim()) {
      throw new Error("Username-kan lama helin. Fadlan hubi username-ka.");
    }
    const email = snap.data().email;
    if (!email) {
      throw new Error("Admin-kan email lama xirin. La xiriir maamulaha.");
    }
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <AdminAuthContext.Provider value={{ user, adminProfile, loading, loginWithUsername, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}