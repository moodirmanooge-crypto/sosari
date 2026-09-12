import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Real Firebase Auth session drives everything. As soon as Firebase
  // confirms who's signed in, we load the one admin doc (sosariAdmin/admin)
  // for the display name/role. This is a single-admin system — whoever
  // successfully authenticates with valid Firebase Auth credentials for
  // this project IS the admin, so we don't re-check email equality here.
  // (That equality check used to sign the admin out right after they
  // verified a changed email, because Firestore's stored email hadn't
  // caught up yet — see AdminSettings.) We self-heal instead: if the
  // signed-in email differs from what's stored, we just update Firestore
  // to match, so both stay in sync automatically.
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
        if (snap.exists()) {
          const data = snap.data();
          if (data.email !== firebaseUser.email) {
            // Keep Firestore in sync after an email change completes.
            await setDoc(ref, { email: firebaseUser.email }, { merge: true });
          }
          setUser(firebaseUser);
          setAdminProfile({ username: data.username, role: data.role || "admin" });
        } else {
          // No admin record at all — sign them back out.
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