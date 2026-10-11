import { jsPDF } from "jspdf";
import logo from "../assets/logo.png";

// =====================================================================
// Builds a clean, Word-style A4 PDF for ANY content item straight from
// what the admin typed (title, author, date, summary, body text, cover
// image and gallery photos) — so every article on the site can be
// downloaded as a PDF even if the admin never uploaded one.
// =====================================================================

const NAVY = [7, 31, 52];
const BLUE = [8, 110, 173];
const TEAL = [7, 134, 125];
const MUTED = [97, 116, 131];
const TEXT = [33, 41, 48];
const LINE = [214, 224, 231];

const PAGE_MARGIN_X = 62; // ~2.2 cm, like a Word document
const PAGE_TOP = 64;
const PAGE_BOTTOM = 66;
const BODY_SIZE = 11;
const BODY_LEADING = 16.5;
const MAX_IMAGE_PX = 1600; // images are scaled down to keep the PDF light

// ---------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

function drawToJpeg(img) {
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;
  if (!w || !h) return null;
  const scale = Math.min(1, MAX_IMAGE_PX / Math.max(w, h));
  w = Math.round(w * scale);
  h = Math.round(h * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff"; // transparent PNGs get a white background
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return { dataUrl: canvas.toDataURL("image/jpeg", 0.86), w, h };
}

function loadImgElement(src, crossOrigin) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Loads an image into a JPEG data URL + its pixel size. Tries two ways
// (direct CORS image, then fetch → blob). Returns null if the image
// can't be read — the PDF is still created, just without that picture.
async function loadImage(src) {
  if (!src) return null;
  try {
    const img = await loadImgElement(src, true);
    const out = drawToJpeg(img);
    if (out) return out;
  } catch { /* try next way */ }
  try {
    const res = await fetch(src, { mode: "cors" });
    if (!res.ok) return null;
    const dataUrl = await blobToDataUrl(await res.blob());
    const img = await loadImgElement(dataUrl, false);
    return drawToJpeg(img);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------

// The built-in PDF fonts only know Latin characters. Swap the common
// "smart" characters for plain ones and drop anything else (emoji…) so
// nothing turns into garbage symbols in the PDF.
function cleanText(str = "") {
  return String(str)
    .replace(/\r\n?/g, "\n")
    .replace(/[‘’‚′]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/[–−]/g, "-")
    .replace(/—/g, " - ")
    .replace(/…/g, "...")
    .replace(/[•●▪■]/g, "-")
    .replace(/ /g, " ")
    .replace(/\t/g, "    ")
    .replace(/[^\n\x20-\x7E -ÿ]/g, "");
}

// Splits the body into blocks: headings, bullet points, numbered points
// and normal paragraphs.
function parseBody(body) {
  const lines = cleanText(body).split("\n");
  const blocks = [];
  let para = [];

  const flush = () => {
    if (para.length) blocks.push({ type: "p", text: para.join(" ").replace(/\s+/g, " ").trim() });
    para = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }

    const bullet = /^[-*•]\s+(.*)$/.exec(line);
    const numbered = /^(\d{1,3}[.)])\s+(.*)$/.exec(line);
    const mdHeading = /^#{1,4}\s+(.*)$/.exec(line);
    const looksLikeHeading =
      line.length <= 80 &&
      !/[.,;!?]$/.test(line) &&
      (line.endsWith(":") || (line === line.toUpperCase() && /[A-Z]/.test(line)));

    if (mdHeading) { flush(); blocks.push({ type: "h", text: mdHeading[1] }); }
    else if (bullet) { flush(); blocks.push({ type: "li", marker: "-", text: bullet[1] }); }
    else if (numbered) { flush(); blocks.push({ type: "li", marker: numbered[1], text: numbered[2] }); }
    else if (looksLikeHeading) { flush(); blocks.push({ type: "h", text: line.replace(/:$/, "") }); }
    else para.push(line);
  }
  flush();
  return blocks;
}

function slugify(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

// ---------------------------------------------------------------------
// PDF builder
// ---------------------------------------------------------------------

export async function exportContentAsPdf(item) {
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const left = PAGE_MARGIN_X;
  const right = pageW - PAGE_MARGIN_X;
  const contentW = right - left;
  const bottomLimit = pageH - PAGE_BOTTOM;

  const title = cleanText(item.title || "Untitled");
  doc.setProperties({
    title,
    subject: cleanText(item.summary || ""),
    author: cleanText(item.author || "SOSARI"),
    creator: "SOSARI - sosari.org",
  });

  // Load every picture at the same time (faster), before drawing.
  const gallerySrcs = (Array.isArray(item.gallery) ? item.gallery : []).map((g) => g?.url).filter(Boolean);
  const [brandLogo, cover, ...galleryImgs] = await Promise.all([
    loadImage(logo),
    loadImage(item.imageUrl),
    ...gallerySrcs.map((u) => loadImage(u)),
  ]);

  let y = PAGE_TOP;

  const newPage = () => {
    doc.addPage();
    y = PAGE_TOP;
  };
  const ensure = (h) => {
    if (y + h > bottomLimit) newPage();
  };

  // Places an image keeping its shape, never wider than maxW or taller
  // than maxH. Moves to a new page if it doesn't fit on this one.
  const placeImage = (img, maxW, maxH, x = left) => {
    let w = maxW;
    let h = (img.h / img.w) * w;
    if (h > maxH) { h = maxH; w = (img.w / img.h) * h; }
    ensure(h);
    const cx = x + (maxW - w) / 2;
    doc.addImage(img.dataUrl, "JPEG", cx, y, w, h, undefined, "FAST");
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.5);
    doc.rect(cx, y, w, h);
    y += h;
  };

  // --- Letterhead (first page) ---
  if (brandLogo) {
    const logoH = 40;
    const logoW = (brandLogo.w / brandLogo.h) * logoH;
    doc.addImage(brandLogo.dataUrl, "JPEG", left, y - 14, logoW, logoH, undefined, "FAST");
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...NAVY);
    doc.text("SOSARI", left, y + 12);
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text("Somali Statistics and Research Institute", right, y, { align: "right" });
  doc.text("www.sosari.org", right, y + 12, { align: "right" });
  y += 38;
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(1.6);
  doc.line(left, y, left + contentW * 0.62, y);
  doc.setDrawColor(...TEAL);
  doc.line(left + contentW * 0.62, y, right, y);
  y += 34;

  // --- Tag ---
  if (item.tag) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...TEAL);
    doc.setCharSpace(1.2);
    doc.text(cleanText(item.tag).toUpperCase(), left, y);
    doc.setCharSpace(0);
    y += 20;
  }

  // --- Title ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.setTextColor(...NAVY);
  const titleLines = doc.splitTextToSize(title, contentW);
  titleLines.forEach((line) => {
    ensure(26);
    doc.text(line, left, y);
    y += 26;
  });
  y += 2;

  // --- Author / date ---
  const byline = [cleanText(item.author || ""), cleanText(item.date || "")].filter(Boolean).join("   |   ");
  if (byline) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.splitTextToSize(byline, contentW).forEach((line) => {
      ensure(15);
      doc.text(line, left, y);
      y += 15;
    });
  }
  y += 10;

  // --- Cover image ---
  if (cover) {
    placeImage(cover, contentW, 300);
    y += 22;
  }

  // --- Summary (shaded box, like an abstract) ---
  if (item.summary) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(cleanText(item.summary), contentW - 28);
    const boxH = lines.length * 16 + 22;
    if (boxH < bottomLimit - PAGE_TOP) ensure(boxH);
    doc.setFillColor(242, 247, 250);
    doc.rect(left, y, contentW, Math.min(boxH, bottomLimit - y), "F");
    doc.setFillColor(...BLUE);
    doc.rect(left, y, 3, Math.min(boxH, bottomLimit - y), "F");
    doc.setTextColor(...NAVY);
    y += 20;
    lines.forEach((line) => {
      ensure(16);
      doc.text(line, left + 16, y);
      y += 16;
    });
    y += 26;
  }

  // --- Body ---
  const blocks = parseBody(item.body || "");
  blocks.forEach((b, idx) => {
    if (b.type === "h") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...NAVY);
      const lines = doc.splitTextToSize(b.text, contentW);
      ensure(lines.length * 18 + 8 + BODY_LEADING * 2); // keep heading with its text
      y += idx === 0 ? 0 : 6;
      lines.forEach((line) => { doc.text(line, left, y); y += 18; });
      y += 4;
      return;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(BODY_SIZE);
    doc.setTextColor(...TEXT);

    if (b.type === "li") {
      const indent = 18;
      const lines = doc.splitTextToSize(b.text, contentW - indent);
      lines.forEach((line, i) => {
        ensure(BODY_LEADING);
        if (i === 0) doc.text(b.marker === "-" ? "•" : b.marker, left + 4, y);
        doc.text(line, left + indent, y);
        y += BODY_LEADING;
      });
      y += 3;
      return;
    }

    // Normal paragraph — justified like Word, last line left-aligned.
    const lines = doc.splitTextToSize(b.text, contentW);
    lines.forEach((line, i) => {
      ensure(BODY_LEADING);
      const isLast = i === lines.length - 1;
      const words = line.trim().split(/\s+/);
      if (isLast || words.length < 2) {
        doc.text(line, left, y);
      } else {
        // Spread the words so the line fills the full width (justified).
        const widths = words.map((w) => doc.getTextWidth(w));
        const total = widths.reduce((a, c) => a + c, 0);
        const space = (contentW - total) / (words.length - 1);
        let x = left;
        words.forEach((w, k) => { doc.text(w, x, y); x += widths[k] + space; });
      }
      y += BODY_LEADING;
    });
    y += 9;
  });

  // --- Gallery photos (2 per row, each keeps its own shape) ---
  const photos = galleryImgs.filter(Boolean);
  if (photos.length > 0) {
    y += 10;
    ensure(40 + 160);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...NAVY);
    doc.text("Photos", left, y);
    y += 14;

    const gap = 14;
    const colW = (contentW - gap) / 2;
    const maxH = 190;
    for (let i = 0; i < photos.length; i += 2) {
      const row = photos.slice(i, i + 2);
      const sizes = row.map((img) => {
        let w = colW;
        let h = (img.h / img.w) * w;
        if (h > maxH) { h = maxH; w = (img.w / img.h) * h; }
        return { w, h };
      });
      const rowH = Math.max(...sizes.map((s) => s.h));
      ensure(rowH + gap);
      row.forEach((img, j) => {
        const { w, h } = sizes[j];
        const x = left + j * (colW + gap) + (colW - w) / 2;
        const top = y + (rowH - h) / 2;
        doc.addImage(img.dataUrl, "JPEG", x, top, w, h, undefined, "FAST");
        doc.setDrawColor(...LINE);
        doc.setLineWidth(0.5);
        doc.rect(x, top, w, h);
      });
      y += rowH + gap;
    }
  }

  // --- Header (pages 2+) and footer on every page ---
  const pageCount = doc.internal.getNumberOfPages();
  const shortTitle = title.length > 70 ? `${title.slice(0, 67)}...` : title;
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    if (p > 1) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text("SOSARI", left, 36);
      doc.text(shortTitle, right, 36, { align: "right" });
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.5);
      doc.line(left, 42, right, 42);
    }
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.5);
    doc.line(left, pageH - 44, right, pageH - 44);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`(c) ${new Date().getFullYear()} SOSARI - Somali Statistics and Research Institute  |  www.sosari.org`, left, pageH - 30);
    doc.text(`Page ${p} of ${pageCount}`, right, pageH - 30, { align: "right" });
  }

  doc.save(`${slugify(item.title) || "sosari-document"}.pdf`);
}