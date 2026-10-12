import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase";
import { useNavigation } from "../contexts/NavigationContext";
import { PARTNERS_NETWORKS_CATEGORIES } from "../pages/SectionPage";
import {
  DOCUMENT_ACCEPT, MAX_DOCUMENT_BYTES, getItemDocuments, getDocumentLabel, formatBytes, safeFileName,
} from "../utils/documents";

// Uploads one document (PDF, Word …) to Storage. It's saved with
// Content-Disposition "attachment" so when a visitor clicks the download
// button, the browser downloads the file with its original name.
function uploadDocumentFile(file, sectionKey, onProgress) {
  const name = safeFileName(file.name);
  const path = `content/${sectionKey}/documents/${Date.now()}-${name}`;
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, file, {
    contentType: file.type || "application/octet-stream",
    contentDisposition: `attachment; filename="${name}"`,
  });
  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => onProgress?.(snap.bytesTransferred, snap.totalBytes),
      reject,
      async () => {
        try {
          const url = await getDownloadURL(storageRef);
          resolve({ url, path, name: file.name, size: file.size, type: file.type || "" });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

const EMPTY_FORM = {
  title: "", summary: "", body: "", tag: "", author: "", date: "",
  published: true, featuredHome: false, order: 0, category: PARTNERS_NETWORKS_CATEGORIES[0],
};

// Preset max dimensions the admin can pick before uploading, so a photo
// straight off a phone doesn't end up huge on the live site.
const IMAGE_SIZE_PRESETS = {
  large: { label: "Weyn (1920px)", maxDim: 1920, quality: 0.85 },
  medium: { label: "Dhexdhexaad (1200px) — la talinayo", maxDim: 1200, quality: 0.82 },
  small: { label: "Yar (800px)", maxDim: 800, quality: 0.78 },
};

// Resizes/compresses an image file in the browser before it's uploaded,
// so the admin can shrink a large photo's size without extra software.
function resizeImageFile(file, maxDim, quality) {
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

// Turns a Firebase error into a clear message that says WHICH step failed
// and WHY, so the problem can be fixed instead of guessed.
function explainSaveError(step, err) {
  const code = err?.code || "";
  let why = err?.message || String(err);
  if (code === "storage/unauthorized") {
    why = "Firebase Storage Rules ma oggola upload-kan. Hubi Storage -> Rules (eeg storage.rules).";
  } else if (code === "storage/unauthenticated") {
    why = "Login-kaagu wuu dhacay. Log out samee oo dib u gal.";
  } else if (code === "storage/quota-exceeded") {
    why = "Storage-ka Firebase wuu buuxsamay (quota).";
  } else if (code === "storage/retry-limit-exceeded" || code === "storage/canceled") {
    why = "Internet-ka ayaa go'ay inta faylka la soo gelinayay. Isku day mar kale.";
  } else if (code === "permission-denied") {
    why = "Firestore Rules ma oggola keydintan. Hubi Firestore -> Rules.";
  } else if (code === "invalid-argument") {
    why = "Xogta la keydinayo ayaa qaldan ama aad u weyn: " + (err?.message || "");
  }
  return `Keydintu way fashilantay — tallaabada: ${step}. Sababta: ${why}${code ? ` [${code}]` : ""}`;
}

export default function AdminSectionManager() {
  const { sectionIndex: SECTION_INDEX } = useNavigation();
  const { parent, child } = useParams();
  const sectionKey = `${parent}/${child}`;
  const meta = SECTION_INDEX[sectionKey];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); // null = not editing, "new" = creating
  const [form, setForm] = useState(EMPTY_FORM);

  // Cover image
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageSize, setImageSize] = useState("medium");

  // Gallery (more photos)
  const [galleryExisting, setGalleryExisting] = useState([]); // [{url, path}] already saved
  const [galleryNewFiles, setGalleryNewFiles] = useState([]); // File[] not yet uploaded
  const [galleryNewPreviews, setGalleryNewPreviews] = useState([]); // object URLs matching galleryNewFiles
  const [gallerySize, setGallerySize] = useState("medium");

  // Downloadable documents (PDF, Word, Excel …) that visitors can download
  const [docsExisting, setDocsExisting] = useState([]); // [{url, path, name, size, type}] already saved
  const [docsNewFiles, setDocsNewFiles] = useState([]); // File[] not yet uploaded
  const [uploadProgress, setUploadProgress] = useState(""); // text shown while uploading

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
    resetFormState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKey]);

  function resetFormState() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview("");
    setImageSize("medium");
    setGalleryExisting([]);
    setGalleryNewFiles([]);
    setGalleryNewPreviews([]);
    setGallerySize("medium");
    setDocsExisting([]);
    setDocsNewFiles([]);
    setUploadProgress("");
  }

  function startNew() {
    resetFormState();
    setEditingId("new");
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
      category: item.category || PARTNERS_NETWORKS_CATEGORIES[0],
    });
    setImageFile(null);
    setImagePreview(item.imageUrl || "");
    setImageSize("medium");
    setGalleryExisting(Array.isArray(item.gallery) ? item.gallery : []);
    setGalleryNewFiles([]);
    setGalleryNewPreviews([]);
    setGallerySize("medium");
    setDocsExisting(getItemDocuments(item));
    setDocsNewFiles([]);
    setUploadProgress("");
    setError("");
  }

  function cancelEdit() {
    resetFormState();
    setError("");
  }

  function onImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function onGalleryFilesChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setGalleryNewFiles((prev) => [...prev, ...files]);
    setGalleryNewPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = ""; // allow picking the same file again / adding more right after
  }

  function removeExistingGalleryPhoto(index) {
    setGalleryExisting((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNewGalleryPhoto(index) {
    setGalleryNewFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryNewPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function onDocumentFilesChange(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    const tooBig = files.filter((f) => f.size > MAX_DOCUMENT_BYTES);
    if (tooBig.length > 0) {
      setError(`Faylkan aad buu u weyn yahay (ugu badnaan ${formatBytes(MAX_DOCUMENT_BYTES)}): ${tooBig.map((f) => f.name).join(", ")}`);
    } else {
      setError("");
    }
    const ok = files.filter((f) => f.size <= MAX_DOCUMENT_BYTES);
    setDocsNewFiles((prev) => [...prev, ...ok]);
  }

  function removeExistingDocument(index) {
    setDocsExisting((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNewDocument(index) {
    setDocsNewFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Fadlan geli title (cinwaan).");
      return;
    }
    setSaving(true);
    setError("");
    // Which step is running — shown in the error message if something fails.
    let step = "diyaarinta";
    // Old files are only deleted AFTER the database save succeeds, so a
    // failed save never leaves the site pointing at deleted photos/files.
    const pathsToDelete = [];
    try {
      let imageUrl = editingId !== "new" ? (items.find((i) => i.id === editingId)?.imageUrl || "") : "";
      let imagePath = editingId !== "new" ? (items.find((i) => i.id === editingId)?.imagePath || "") : "";

      if (imageFile) {
        step = "upload-ka sawirka hore (cover image)";
        const preset = IMAGE_SIZE_PRESETS[imageSize] || IMAGE_SIZE_PRESETS.medium;
        const resized = await resizeImageFile(imageFile, preset.maxDim, preset.quality);
        const path = `content/${sectionKey}/${Date.now()}-${resized.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, resized);
        imageUrl = await getDownloadURL(storageRef);
        // delete old cover image if replacing
        if (editingId !== "new") {
          const old = items.find((i) => i.id === editingId);
          if (old?.imagePath && old.imagePath !== path) {
            pathsToDelete.push(old.imagePath);
          }
        }
        imagePath = path;
      }

      // Upload any newly-added gallery photos (resized first).
      let uploadedGallery = [];
      if (galleryNewFiles.length > 0) {
        step = "upload-ka sawirrada dheeriga ah (gallery)";
        const preset = IMAGE_SIZE_PRESETS[gallerySize] || IMAGE_SIZE_PRESETS.medium;
        uploadedGallery = await Promise.all(
          galleryNewFiles.map(async (file, idx) => {
            const resized = await resizeImageFile(file, preset.maxDim, preset.quality);
            const path = `content/${sectionKey}/gallery/${Date.now()}-${idx}-${resized.name}`;
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, resized);
            const url = await getDownloadURL(storageRef);
            return { url, path };
          })
        );
      }

      // Delete any existing gallery photos the admin removed from this item.
      if (editingId !== "new") {
        const old = items.find((i) => i.id === editingId);
        const oldGallery = Array.isArray(old?.gallery) ? old.gallery : [];
        const keptPaths = new Set(galleryExisting.map((g) => g.path));
        oldGallery.forEach((g) => {
          if (g.path && !keptPaths.has(g.path)) {
            pathsToDelete.push(g.path);
          }
        });
      }

      const gallery = [...galleryExisting, ...uploadedGallery];

      // Upload newly-added documents one by one (shows progress for big PDFs).
      const uploadedDocs = [];
      for (let i = 0; i < docsNewFiles.length; i++) {
        const file = docsNewFiles[i];
        step = `upload-ka dokumentiga "${file.name}"`;
        const uploaded = await uploadDocumentFile(file, sectionKey, (done, total) => {
          const pct = total ? Math.round((done / total) * 100) : 0;
          setUploadProgress(`Dokumentiga ${i + 1}/${docsNewFiles.length} ayaa la soo gelinayaa… ${pct}%`);
        });
        uploadedDocs.push(uploaded);
      }
      setUploadProgress("");

      // Delete any existing documents the admin removed from this item.
      if (editingId !== "new") {
        const old = items.find((i) => i.id === editingId);
        const keptDocPaths = new Set(docsExisting.map((d) => d.path));
        getItemDocuments(old).forEach((d) => {
          if (d.path && !keptDocPaths.has(d.path)) {
            pathsToDelete.push(d.path);
          }
        });
      }

      const documents = [...docsExisting, ...uploadedDocs];

      const payload = {
        ...form,
        order: Number(form.order) || 0,
        sectionKey,
        imageUrl,
        imagePath,
        gallery,
        documents,
      };

      step = "keydinta Firestore (database)";
      if (editingId === "new") {
        await addDoc(collection(db, "content"), {
          ...payload,
          createdAt: serverTimestamp(),
          createdAtMs: Date.now(),
        });
      } else {
        await updateDoc(doc(db, "content", editingId), payload);
      }
      pathsToDelete.forEach((path) => deleteObject(ref(storage, path)).catch(() => {}));

      await loadItems();
      cancelEdit();
    } catch (err) {
      console.error(err);
      setError(explainSaveError(step, err));
      setUploadProgress("");
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
      if (Array.isArray(item.gallery)) {
        item.gallery.forEach((g) => {
          if (g.path) deleteObject(ref(storage, g.path)).catch(() => {});
        });
      }
      getItemDocuments(item).forEach((d) => {
        if (d.path) deleteObject(ref(storage, d.path)).catch(() => {});
      });
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

          {sectionKey === "about/partners-networks" && (
            <label>Category (qaybta uu ku hoos yaal bogga)
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {PARTNERS_NETWORKS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </label>
          )}

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

          {/* COVER IMAGE */}
          <label>Sawirka hore (Cover image)
            <input type="file" accept="image/*" onChange={onImageChange} />
          </label>
          {imagePreview && <img src={imagePreview} alt="preview" className="adminImgPreview" />}
          <label>Cabbirka sawirka hore (Image size)
            <select value={imageSize} onChange={(e) => setImageSize(e.target.value)}>
              {Object.entries(IMAGE_SIZE_PRESETS).map(([key, p]) => (
                <option key={key} value={key}>{p.label}</option>
              ))}
            </select>
          </label>

          {/* GALLERY */}
          <label>Sawirro dheeri ah (More photos) — waxaad dhamaystiri kartaa marar badan
            <input type="file" accept="image/*" multiple onChange={onGalleryFilesChange} />
          </label>
          <label>Cabbirka sawirrada dheeriga ah (Gallery image size)
            <select value={gallerySize} onChange={(e) => setGallerySize(e.target.value)}>
              {Object.entries(IMAGE_SIZE_PRESETS).map(([key, p]) => (
                <option key={key} value={key}>{p.label}</option>
              ))}
            </select>
          </label>

          {(galleryExisting.length > 0 || galleryNewPreviews.length > 0) && (
            <div className="adminGalleryGrid">
              {galleryExisting.map((g, i) => (
                <div className="adminGalleryThumb" key={`existing-${g.path || i}`}>
                  <img src={g.url} alt="" />
                  <button type="button" className="adminGalleryRemove" onClick={() => removeExistingGalleryPhoto(i)}>✕</button>
                </div>
              ))}
              {galleryNewPreviews.map((src, i) => (
                <div className="adminGalleryThumb adminGalleryThumbNew" key={`new-${i}`}>
                  <img src={src} alt="" />
                  <button type="button" className="adminGalleryRemove" onClick={() => removeNewGalleryPhoto(i)}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* DOWNLOADABLE DOCUMENTS */}
          <label>Dokumenti la soo dejin karo (PDF, Word, Excel, PowerPoint …) — booqde kastaa wuu soo dejin karaa
            <input type="file" accept={DOCUMENT_ACCEPT} multiple onChange={onDocumentFilesChange} />
          </label>
          <p className="adminHint">
            Dokumenti kasta oo halkan aad ku darto wuxuu bogga ka muuqanayaa isagoo leh badhanka "Download PDF".
            Ugu badnaan {formatBytes(MAX_DOCUMENT_BYTES)} fayl kasta.
          </p>
          {(docsExisting.length > 0 || docsNewFiles.length > 0) && (
            <ul className="adminDocList">
              {docsExisting.map((d, i) => (
                <li className="adminDocItem" key={`doc-existing-${d.path || i}`}>
                  <span className="adminDocItemName">
                    <span className="docExtBadge">{getDocumentLabel(d.name)}</span>
                    <a href={d.url} target="_blank" rel="noopener noreferrer">{d.name}</a>
                    {d.size ? <span className="adminDocItemSize">{formatBytes(d.size)}</span> : null}
                  </span>
                  <button type="button" className="link adminDeleteBtn" onClick={() => removeExistingDocument(i)}>Ka saar</button>
                </li>
              ))}
              {docsNewFiles.map((f, i) => (
                <li className="adminDocItem isNew" key={`doc-new-${i}-${f.name}`}>
                  <span className="adminDocItemName">
                    <span className="docExtBadge">{getDocumentLabel(f.name)}</span>
                    {f.name}
                    <span className="adminDocItemSize">{formatBytes(f.size)} · cusub</span>
                  </span>
                  <button type="button" className="link adminDeleteBtn" onClick={() => removeNewDocument(i)}>Ka saar</button>
                </li>
              ))}
            </ul>
          )}

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

          {uploadProgress && <p className="adminDocProgress">{uploadProgress}</p>}
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
            <tr><th>Title</th><th>Dokumenti</th><th>Published</th><th>Featured</th><th>Order</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{getItemDocuments(item).length > 0 ? `📄 ${getItemDocuments(item).length}` : "—"}</td>
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