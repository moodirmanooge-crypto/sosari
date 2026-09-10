import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// Fetch all published content docs for a given sectionKey, sorted newest first.
export async function fetchSectionContent(sectionKey) {
  const q = query(collection(db, "content"), where("sectionKey", "==", sectionKey));
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return rows
    .filter((r) => r.published !== false)
    .sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
}

// Fetch content for many section keys at once (used by landing/overview pages).
export async function fetchContentForKeys(keys) {
  const results = await Promise.all(keys.map((k) => fetchSectionContent(k)));
  return results.flat();
}

// Fetch items flagged to appear on the Home page.
export async function fetchFeaturedHome() {
  const q = query(collection(db, "content"), where("featuredHome", "==", true));
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return rows
    .filter((r) => r.published !== false)
    .sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
}
