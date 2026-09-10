import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const DEFAULTS = {
  heroEyebrow: "Evidence • Data • Policy • Impact",
  heroTitle: "Better evidence for better decisions in Somalia.",
  heroText:
    "SOSARI is an independent Somali-led institution for research, statistics, data, policy advisory and evaluation—connecting rigorous evidence with practical decisions across Somalia and the Horn of Africa.",
};

export default function AdminHomeSettings() {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "siteSettings", "home")).then((snap) => {
      if (snap.exists()) setForm({ ...DEFAULTS, ...snap.data() });
      setLoading(false);
    });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await setDoc(doc(db, "siteSettings", "home"), form, { merge: true });
      setSaved(true);
    } catch (err) {
      console.error(err);
      alert("Keydintu way fashilantay.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="adminPage"><p>Loading…</p></div>;

  return (
    <div className="adminPage">
      <h1>Home Page Settings</h1>
      <p className="lead">
        Waxaad halkan ka maareysaa qoraalka ugu horreeya ee bogga Home (Hero section).
        Content-ka "Featured on Home" waxaa lagu shubaa halka qaybta content-ka
        ee kasta (dooro checkbox "Ku muuji bogga Home").
      </p>
      <form className="adminForm" onSubmit={handleSave}>
        <label>Eyebrow (qoraal gaaban ee sare)
          <input value={form.heroEyebrow} onChange={(e) => setForm({ ...form, heroEyebrow: e.target.value })} />
        </label>
        <label>Hero Title
          <textarea rows={2} value={form.heroTitle} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} />
        </label>
        <label>Hero Text
          <textarea rows={4} value={form.heroText} onChange={(e) => setForm({ ...form, heroText: e.target.value })} />
        </label>
        <div className="adminFormActions">
          <button className="btn primary" type="submit" disabled={saving}>
            {saving ? "Keydinaya…" : "Keydi"}
          </button>
          {saved && <span style={{ color: "green", marginLeft: 10 }}>✅ La keydiyay</span>}
        </div>
      </form>
    </div>
  );
}
