import { jsPDF } from "jspdf";
import logo from "../assets/logo.png";

// Loads an image URL into a base64 data URL + its natural pixel size, so it
// can be embedded in the PDF. Falls back gracefully if the image can't be
// loaded (e.g. blocked by CORS) — the PDF still generates without it.
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve({ dataUrl: canvas.toDataURL("image/jpeg", 0.92), w: img.naturalWidth, h: img.naturalHeight });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Generates a branded, nicely formatted PDF for a single content item
// (title, image, author/date, body) and triggers a download.
export async function exportContentAsPdf(item) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 54;
  const contentW = pageW - margin * 2;
  let y = margin;

  const navy = [7, 31, 52];
  const blue = [8, 110, 173];
  const teal = [7, 134, 125];
  const muted = [97, 116, 131];

  // --- Header band with logo ---
  doc.setFillColor(...navy);
  doc.rect(0, 0, pageW, 92, "F");
  const brandLogo = await loadImage(logo);
  if (brandLogo) {
    const logoH = 34;
    const logoW = (brandLogo.w / brandLogo.h) * logoH;
    doc.addImage(brandLogo.dataUrl, "JPEG", margin, 29, logoW, logoH);
  } else {
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("SOSARI", margin, 52);
  }
  doc.setTextColor(180, 210, 225);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Somali Statistics and Research Institute", pageW - margin, 40, { align: "right" });
  doc.text("Evidence · Data · Policy · Impact", pageW - margin, 54, { align: "right" });
  y = 130;

  // --- Tag ---
  if (item.tag) {
    doc.setTextColor(...teal);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(item.tag.toUpperCase(), margin, y);
    y += 18;
  }

  // --- Title ---
  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  const titleLines = doc.splitTextToSize(item.title || "Untitled", contentW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 26 + 6;

  // --- Author / date ---
  if (item.author || item.date) {
    doc.setTextColor(...muted);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text([item.author, item.date].filter(Boolean).join("  —  "), margin, y);
    y += 20;
  }

  // --- Rule ---
  doc.setDrawColor(220, 229, 235);
  doc.line(margin, y, pageW - margin, y);
  y += 20;

  // --- Image ---
  if (item.imageUrl) {
    const img = await loadImage(item.imageUrl);
    if (img) {
      const maxImgW = contentW;
      const maxImgH = 240;
      let w = maxImgW;
      let h = (img.h / img.w) * w;
      if (h > maxImgH) { h = maxImgH; w = (img.w / img.h) * h; }
      if (y + h > pageH - margin) { doc.addPage(); y = margin; }
      doc.addImage(img.dataUrl, "JPEG", margin, y, w, h);
      y += h + 20;
    }
  }

  // --- Summary ---
  if (item.summary) {
    doc.setTextColor(...blue);
    doc.setFont("helvetica", "bolditalic");
    doc.setFontSize(11.5);
    const summaryLines = doc.splitTextToSize(item.summary, contentW);
    summaryLines.forEach((line) => {
      if (y > pageH - margin) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += 16;
    });
    y += 10;
  }

  // --- Body paragraphs ---
  doc.setTextColor(30, 40, 48);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const paragraphs = (item.body || "").split("\n").filter((p) => p.trim());
  paragraphs.forEach((para) => {
    const lines = doc.splitTextToSize(para, contentW);
    lines.forEach((line) => {
      if (y > pageH - margin) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += 16;
    });
    y += 10;
  });

  // --- Footer on every page ---
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setDrawColor(220, 229, 235);
    doc.line(margin, pageH - 40, pageW - margin, pageH - 40);
    doc.setTextColor(...muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("© SOSARI — Somali Statistics and Research Institute", margin, pageH - 26);
    doc.text(`Page ${p} of ${pageCount}`, pageW - margin, pageH - 26, { align: "right" });
  }

  const safeName = (item.title || "sosari-report").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  doc.save(`${safeName || "sosari-report"}.pdf`);
}