import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const snap = await getDocs(collection(db, "messages"));
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
    setMessages(rows);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function markRead(m) {
    await updateDoc(doc(db, "messages", m.id), { read: true });
    load();
  }

  async function remove(m) {
    if (!window.confirm("Ma hubtaa inaad tirtirto fariintan?")) return;
    await deleteDoc(doc(db, "messages", m.id));
    load();
  }

  return (
    <div className="adminPage">
      <h1>Partner Messages</h1>
      <p className="lead">Fariimaha laga soo diray bogga "Partner With SOSARI".</p>
      {loading ? (
        <p>Loading…</p>
      ) : messages.length === 0 ? (
        <p className="lead">Fariin lama helin wali.</p>
      ) : (
        <div className="adminMessagesList">
          {messages.map((m) => (
            <div key={m.id} className={`adminMessageCard ${m.read ? "read" : "unread"}`}>
              <div className="adminMessageHead">
                <b>{m.name}</b> — <span>{m.email}</span>
                {m.organization && <span> · {m.organization}</span>}
              </div>
              <p>{m.message}</p>
              <div className="adminRowActions">
                {!m.read && <button className="link" onClick={() => markRead(m)}>Mark as read</button>}
                <button className="link adminDeleteBtn" onClick={() => remove(m)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
