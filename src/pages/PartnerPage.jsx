import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function PartnerPage() {
  const [form, setForm] = useState({ name: "", email: "", organization: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("sending");
    try {
      await addDoc(collection(db, "messages"), {
        ...form,
        createdAt: serverTimestamp(),
        createdAtMs: Date.now(),
        read: false,
      });
      setStatus("sent");
      setForm({ name: "", email: "", organization: "", message: "" });
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <div className="sectionPageWrap">
      <header className="pageHero">
        <div className="wrap">
          <div className="eyebrow">Partner with SOSARI</div>
          <h1>Start a conversation.</h1>
          <p>Bring the question. SOSARI can assemble the appropriate methods, expertise and evidence pathway.</p>
        </div>
      </header>

      <section>
        <div className="wrap" style={{ maxWidth: 640 }}>
          {status === "sent" ? (
            <div className="box">
              <h3>Mahadsanid!</h3>
              <p>Fariintaada waa la helay. Kooxda SOSARI ayaa dhawaan kula soo xiriiri doonta.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="partnerForm">
              <label>
                Full name
                <input required value={form.name} onChange={(e) => update("name", e.target.value)} />
              </label>
              <label>
                Email
                <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
              </label>
              <label>
                Organization (optional)
                <input value={form.organization} onChange={(e) => update("organization", e.target.value)} />
              </label>
              <label>
                Message
                <textarea required rows={6} value={form.message} onChange={(e) => update("message", e.target.value)} />
              </label>
              <button className="btn primary" type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
              {status === "error" && <p style={{ color: "crimson" }}>Wax baa qaldamay. Isku day mar kale.</p>}
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
