import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { auth, db } from "../firebase";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser || !firebaseUser.email) {
        setUser(null);
        setAdminProfile(null);
        setLoading(false);
        return;
      }
      try {
        const ref = doc(db, "SosarAdmin", firebaseUser.email);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setUser(firebaseUser);
          setAdminProfile({ id: snap.id, ...snap.data() });
        } else {
          // Not an authorized admin — sign them back out.
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
  // username up in the "SosarAdmin" collection to find the linked email,
  // then authenticate securely against Firebase Authentication using
  // that email + the password the admin typed.
  async function loginWithUsername(username, password) {
    const q = query(
      collection(db, "SosarAdmin"),
      where("username", "==", username.trim()),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      throw new Error("Username-kan lama helin. Fadlan hubi username-ka.");
    }
    const adminDoc = snap.docs[0].data();
    if (!adminDoc.email) {
      throw new Error("Admin-kan email lama xirin. La xiriir maamulaha.");
    }
    await signInWithEmailAndPassword(auth, adminDoc.email, password);
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
