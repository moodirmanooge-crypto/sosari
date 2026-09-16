import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase";

const DEFAULTS = {
  heroEyebrow: "Evidence • Data • Policy • Impact",
  heroTitle: "Better evidence for better decisions in Somalia.",
  heroText:
    "SOSARI is an independent Somali-led institution for research, statistics, data, policy advisory and evaluation—connecting rigorous evidence with practical decisions across Somalia and the Horn of Africa.",
  heroPhotos: [], // [] = use the site's default built-in photos
};

// Same size presets as the section content editor, so hero photos get
// resized/compressed the same predictable way before upload.
const IMAGE_SIZE_PRESETS = {
  large: { label: "Weyn (1920px)", maxDim: 1920, quality: 0.85 },
  medium: { label: "Dhexdhexaad (1200px) — la talinayo", maxDim: 1200, quality: 0.82 },
  small: { label: "Yar (800px)", maxDim: 800, quality: 0.78 },
};

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

export default function AdminHomeSettings() {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Hero photos: existing (already saved, {url, path}) + newly picked
  // files waiting to be uploaded on Save, plus removal tracking.
  const [heroExisting, setHeroExisting] = useState([]);
  const [heroNewFiles, setHeroNewFiles] = useState([]);
  const [heroNewPreviews, setHeroNewPreviews] = useState([]);
  const [heroSize, setHeroSize] = useState("medium");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "siteSettings", "home")).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setForm({ ...DEFAULTS, ...data });
        setHeroExisting(Array.isArray(data.heroPhotos) ? data.heroPhotos : []);
      }
      setLoading(false);
    });
  }, []);

  function onHeroFilesChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setHeroNewFiles((prev) => [...prev, ...files]);
    setHeroNewPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  }

  function removeExistingHeroPhoto(index) {
    setHeroExisting((prev) => prev.filter((_, i) => i !== index));
  }
  function removeNewHeroPhoto(index) {
    setHeroNewFiles((prev) => prev.filter((_, i) => i !== index));
    setHeroNewPreviews((prev) => prev.filter((_, i) => i !== index));
  }
  function moveExistingHeroPhoto(index, dir) {
    setHeroExisting((prev) => {
      const arr = prev.slice();
      const target = index + dir;
      if (target < 0 || target >= arr.length) return prev;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      let uploadedHero = [];
      if (heroNewFiles.length > 0) {
        setUploading(true);
        const preset = IMAGE_SIZE_PRESETS[heroSize] || IMAGE_SIZE_PRESETS.medium;
        uploadedHero = await Promise.all(
          heroNewFiles.map(async (file, idx) => {
            const resized = await resizeImageFile(file, preset.maxDim, preset.quality);
            const path = `content/home/hero/${Date.now()}-${idx}-${resized.name}`;
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, resized);
            const url = await getDownloadURL(storageRef);
            return { url, path };
          })
        );
        setUploading(false);
      }

      // Delete any previously-saved hero photos the admin removed.
      const prevSnap = await getDoc(doc(db, "siteSettings", "home"));
      const prevPhotos = Array.isArray(prevSnap.data()?.heroPhotos) ? prevSnap.data().heroPhotos : [];
      const keptPaths = new Set(heroExisting.map((p) => p.path));
      prevPhotos.forEach((p) => {
        if (p.path && !keptPaths.has(p.path)) {
          deleteObject(ref(storage, p.path)).catch(() => {});
        }
      });

      const heroPhotos = [...heroExisting, ...uploadedHero];

      await setDoc(doc(db, "siteSettings", "home"), { ...form, heroPhotos }, { merge: true });
      setHeroExisting(heroPhotos);
      setHeroNewFiles([]);
      setHeroNewPreviews([]);
      setSaved(true);
    } catch (err) {
      console.error(err);
      setError("Keydintu way fashilantay. Isku day mar kale.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  if (loading) return <div className="adminPage"><p>Loading…</p></div>;

  return (
    <div className="adminPage">
      <h1>Home Page Settings</h1>
      <p className="lead">
        Waxaad halkan ka maareysaa qoraalka ugu horreeya ee bogga Home (Hero section)
        iyo sawirrada isbadalaya ee bogga Home ka muuqda. Content-ka "Featured on Home"
        waxaa lagu shubaa halka qaybta content-ka ee kasta (dooro checkbox "Ku muuji bogga Home").
      </p>

      {error && <p className="adminError">{error}</p>}

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

        <div className="adminFormDivider" />

        <h3 style={{ margin: "4px 0 0" }}>Sawirrada Hero-ga (isbadalaya)</h3>
        <p className="lead" style={{ margin: "2px 0 10px" }}>
          Kuwan waa sawirrada saddexda ah ee bogga Home ku wareega. Waxaad ku dari kartaa
          dhowr sawir hal mar, mid ka saari kartaa, ama isku dari kartaa kuwa hore iyo kuwa cusub.
          Haddii aadan wax sawir ah gelin, bogga wuxuu isticmaali doonaa saddexda sawir ee asalka ah.
        </p>

        <label>Ku dar sawir(ro) cusub (waxaad dooran kartaa dhowr mar hal mar)
          <input type="file" accept="image/*" multiple onChange={onHeroFilesChange} />
        </label>
        <label>Cabbirka sawirrada (Image size)
          <select value={heroSize} onChange={(e) => setHeroSize(e.target.value)}>
            {Object.entries(IMAGE_SIZE_PRESETS).map(([key, p]) => (
              <option key={key} value={key}>{p.label}</option>
            ))}
          </select>
        </label>

        {(heroExisting.length > 0 || heroNewPreviews.length > 0) && (
          <div className="adminGalleryGrid">
            {heroExisting.map((p, i) => (
              <div className="adminGalleryThumb" key={`existing-${p.path || i}`}>
                <img src={p.url} alt="" />
                <div className="adminGalleryThumbControls">
                  <button type="button" onClick={() => moveExistingHeroPhoto(i, -1)} disabled={i === 0}>↑</button>
                  <button type="button" onClick={() => moveExistingHeroPhoto(i, 1)} disabled={i === heroExisting.length - 1}>↓</button>
                </div>
                <button type="button" className="adminGalleryRemove" onClick={() => removeExistingHeroPhoto(i)}>✕</button>
              </div>
            ))}
            {heroNewPreviews.map((src, i) => (
              <div className="adminGalleryThumb adminGalleryThumbNew" key={`new-${i}`}>
                <img src={src} alt="" />
                <button type="button" className="adminGalleryRemove" onClick={() => removeNewHeroPhoto(i)}>✕</button>
              </div>
            ))}
          </div>
        )}

        <div className="adminFormActions">
          <button className="btn primary" type="submit" disabled={saving}>
            {uploading ? "Sawirrada waa la soo shubayaa…" : saving ? "Keydinaya…" : "Keydi"}
          </button>
          {saved && <span style={{ color: "green", marginLeft: 10 }}>✅ La keydiyay</span>}
        </div>
      </form>
    </div>
  );
}