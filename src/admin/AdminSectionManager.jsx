import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase";
import { SECTION_INDEX } from "../config/navigation";

const EMPTY_FORM = {
  title: "", summary: "", body: "", tag: "", author: "", date: "",
  published: true, featuredHome: false, order: 0,
};

export default function AdminSectionManager() {
  const { parent, child } = useParams();
  const sectionKey = `${parent}/${child}`;
  const meta = SECTION_INDEX[sectionKey];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); // null = not editing, "new" = creating
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadItems() {
    setLoading(true);
    const q = query(collection(db, "content"), where("sectionKey", "==", sectionKey));
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
    setItems(rows);
    setLoading(false);
  }

  useEffect(() => {
    loadItems();
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKey]);

  function startNew() {
    setEditingId("new");
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview("");
    setError("");
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      summary: item.summary || "",
      body: item.body || "",
      tag: item.tag || "",
      author: item.author || "",
      date: item.date || "",
      published: item.published !== false,
      featuredHome: !!item.featuredHome,
      order: item.order || 0,
    });
    setImageFile(null);
    setImagePreview(item.imageUrl || "");
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview("");
    setError("");
  }

  function onImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Fadlan geli title (cinwaan).");
      return;
    }
    setSaving(true);
    setError("");
    try {
      let imageUrl = editingId !== "new" ? (items.find((i) => i.id === editingId)?.imageUrl || "") : "";
      let imagePath = editingId !== "new" ? (items.find((i) => i.id === editingId)?.imagePath || "") : "";

      if (imageFile) {
        const path = `content/${sectionKey}/${Date.now()}-${imageFile.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
        // delete old image if replacing
        if (editingId !== "new") {
          const old = items.find((i) => i.id === editingId);
          if (old?.imagePath && old.imagePath !== path) {
            deleteObject(ref(storage, old.imagePath)).catch(() => {});
          }
        }
        imagePath = path;
      }

      const payload = {
        ...form,
        order: Number(form.order) || 0,
        sectionKey,
        imageUrl,
        imagePath,
      };

      if (editingId === "new") {
        await addDoc(collection(db, "content"), {
          ...payload,
          createdAt: serverTimestamp(),
          createdAtMs: Date.now(),
        });
      } else {
        await updateDoc(doc(db, "content", editingId), payload);
      }

      await loadItems();
      cancelEdit();
    } catch (err) {
      console.error(err);
      setError("Wax baa qaldamay markii la keydinayay. Isku day mar kale.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Ma hubtaa inaad tirtirto "${item.title}"?`)) return;
    try {
      await deleteDoc(doc(db, "content", item.id));
      if (item.imagePath) {
        deleteObject(ref(storage, item.imagePath)).catch(() => {});
      }
      await loadItems();
    } catch (err) {
      console.error(err);
      alert("Tirtiriddu way fashilantay.");
    }
  }

  if (!meta) {
    return <div className="adminPage"><p>Qaybtan lama helin.</p></div>;
  }

  return (
    <div className="adminPage">
      <h1>{meta.parentLabel} / {meta.label}</h1>
      <p className="lead">Content-ka halkan lagu daro wuxuu si toos ah ugu muuqan doonaa bogga public-ka ee "{meta.label}".</p>

      {editingId === null && (
        <button className="btn primary" onClick={startNew}>+ Ku dar content cusub</button>
      )}

      {editingId !== null && (
        <form className="adminForm" onSubmit={handleSave}>
          <h3>{editingId === "new" ? "Content cusub" : "Wax ka beddel content"}</h3>

          <label>Title
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </label>

          <label>Summary (kooban)
            <textarea rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          </label>

          <label>Qoraalka buuxa (Body)
            <textarea rows={8} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </label>

          <div className="adminFormRow">
            <label>Tag (tusaale: POLICY BRIEF)
              <input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
            </label>
            <label>Qoraa (Author)
              <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </label>
            <label>Taariikh
              <input placeholder="e.g. 2026" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </label>
          </div>

          <label>Sawir (image)
            <input type="file" accept="image/*" onChange={onImageChange} />
          </label>
          {imagePreview && <img src={imagePreview} alt="preview" className="adminImgPreview" />}

          <div className="adminFormRow">
            <label className="checkboxLabel">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              Published (muuqan bogga)
            </label>
            <label className="checkboxLabel">
              <input type="checkbox" checked={form.featuredHome} onChange={(e) => setForm({ ...form, featuredHome: e.target.checked })} />
              Ku muuji bogga Home (Featured)
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

      <h3 style={{ marginTop: 34 }}>Content-ka jira ({items.length})</h3>
      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <p className="lead">Wali content lagama darin qaybtan.</p>
      ) : (
        <table className="adminTable">
          <thead>
            <tr><th>Title</th><th>Published</th><th>Featured</th><th>Order</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.published !== false ? "✅" : "—"}</td>
                <td>{item.featuredHome ? "⭐" : "—"}</td>
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
