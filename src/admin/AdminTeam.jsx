import { useEffect, useState } from "react";
import {
  collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase";

const EMPTY_FORM = { name: "", title: "", bio: "", quote: "", isLeader: false, order: 0, published: true };

// Same resize/compress helper used across the admin panel, so a team
// photo straight off a phone doesn't end up huge on the live site.
function resizeImageFile(file, maxDim = 900, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Resize failed")); return; }
          resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function AdminTeam() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); // null = not editing, "new" = creating
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query(collection(db, "teamMembers"), orderBy("order", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  function startNew() {
    setEditingId("new");
    setForm({ ...EMPTY_FORM, order: items.length });
    setPhotoFile(null);
    setPhotoPreview("");
    setError("");
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      title: item.title || "",
      bio: item.bio || "",
      quote: item.quote || "",
      isLeader: !!item.isLeader,
      order: item.order || 0,
      published: item.published !== false,
    });
    setPhotoFile(null);
    setPhotoPreview(item.photoUrl || "");
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPhotoFile(null);
    setPhotoPreview("");
    setError("");
  }

  function onPhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Fadlan geli magaca xubinta.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      let photoUrl = editingId !== "new" ? (items.find((i) => i.id === editingId)?.photoUrl || "") : "";
      let photoPath = editingId !== "new" ? (items.find((i) => i.id === editingId)?.photoPath || "") : "";

      if (photoFile) {
        const resized = await resizeImageFile(photoFile);
        const path = `content/team/${Date.now()}-${resized.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, resized);
        photoUrl = await getDownloadURL(storageRef);
        if (editingId !== "new") {
          const old = items.find((i) => i.id === editingId);
          if (old?.photoPath && old.photoPath !== path) {
            deleteObject(ref(storage, old.photoPath)).catch(() => {});
          }
        }
        photoPath = path;
      }

      const payload = { ...form, order: Number(form.order) || 0, photoUrl, photoPath };

      if (editingId === "new") {
        await addDoc(collection(db, "teamMembers"), {
          ...payload,
          createdAt: serverTimestamp(),
          createdAtMs: Date.now(),
        });
      } else {
        await updateDoc(doc(db, "teamMembers", editingId), payload);
      }
      cancelEdit();
    } catch (err) {
      console.error(err);
      setError(`Wax baa qaldamay: ${err.code || err.message || "khalad aan la aqoon"}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Ma hubtaa inaad tirtirto "${item.name}"?`)) return;
    try {
      await deleteDoc(doc(db, "teamMembers", item.id));
      if (item.photoPath) {
        deleteObject(ref(storage, item.photoPath)).catch(() => {});
      }
    } catch (err) {
      console.error(err);
      alert("Tirtiriddu way fashilantay.");
    }
  }

  return (
    <div className="adminPage">
      <h1>Our Team</h1>
      <p className="lead">
        Halkan waxaad ka maareysaa xubnaha team-ka ee ku muuqda bogga public-ka ee "Our Team".
        Xubin kasta waxay leedahay sawir, magac, title (jagada), iyo khibrad/sharaxaad gaaban.
      </p>

      {editingId === null && (
        <button className="btn primary" onClick={startNew}>+ Ku dar xubin cusub</button>
      )}

      {editingId !== null && (
        <form className="adminForm" onSubmit={handleSave}>
          <h3>{editingId === "new" ? "Xubin cusub" : "Wax ka beddel xubinta"}</h3>

          <label>Sawirka
            <input type="file" accept="image/*" onChange={onPhotoChange} />
          </label>
          {photoPreview && <img src={photoPreview} alt="preview" className="adminImgPreview" style={{ borderRadius: "50%", width: 120, height: 120, objectFit: "cover" }} />}

          <label>Magaca
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>Title / Jagada (tusaale: Director of MEAL and Field Operations)
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label>Khibrad / Sharaxaad gaaban (Experience / Bio)
            <textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </label>
          <label>Quote gaaban (ku muuqda goobta hoose ee card-ka, ikhtiyaari)
            <textarea rows={2} placeholder='Tusaale: "Education and service for a brighter community."' value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} />
          </label>

          <div className="adminFormRow">
            <label className="checkboxLabel">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              Published (muuqan bogga)
            </label>
            <label className="checkboxLabel">
              <input type="checkbox" checked={form.isLeader} onChange={(e) => setForm({ ...form, isLeader: e.target.checked })} />
              Leader (calaamad "★ LEADER" ku dar)
            </label>
            <label>Order (tirooyin, 0 = hore)
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
            </label>
          </div>

          {error && <p className="adminError">{error}</p>}

          <div className="adminFormActions">
            <button className="btn primary" type="submit" disabled={saving}>
              {saving ? "Keydinaya…" : "Keydi (Save)"}
            </button>
            <button className="btn outline" type="button" onClick={cancelEdit} disabled={saving}>
              Jooji
            </button>
          </div>
        </form>
      )}

      <h3 style={{ marginTop: 34 }}>Xubnaha jira ({items.length})</h3>
      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <p className="lead">Wali xubin lama darin.</p>
      ) : (
        <table className="adminTable">
          <thead>
            <tr><th></th><th>Magaca</th><th>Title</th><th>Published</th><th>Order</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.photoUrl && (
                    <img src={item.photoUrl} alt="" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }} />
                  )}
                </td>
                <td>{item.name}</td>
                <td>{item.title}</td>
                <td>{item.published !== false ? "✅" : "—"}</td>
                <td>{item.order || 0}</td>
                <td className="adminRowActions">
                  <button className="link" onClick={() => startEdit(item)}>Edit</button>
                  <button className="link adminDeleteBtn" onClick={() => handleDelete(item)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}