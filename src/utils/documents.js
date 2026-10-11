// Helpers for the downloadable documents (PDF, Word, Excel, PowerPoint …)
// that the admin attaches to a content item. Each document is stored in
// Firestore on the content doc as:
//   documents: [{ url, path, name, size, type }]

// File types the admin is allowed to upload as a downloadable document.
export const DOCUMENT_ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.rtf,.odt,.ods,.odp,.zip";

// Largest single document the admin can upload (in bytes).
export const MAX_DOCUMENT_BYTES = 50 * 1024 * 1024; // 50 MB

// Returns the list of documents for an item. Also understands the older
// single-document shape (documentUrl / documentName) just in case.
export function getItemDocuments(item) {
  if (!item) return [];
  if (Array.isArray(item.documents)) return item.documents.filter((d) => d && d.url);
  if (item.documentUrl) {
    return [{ url: item.documentUrl, path: item.documentPath || "", name: item.documentName || "document", size: item.documentSize || 0 }];
  }
  return [];
}

// "report.final.PDF" -> "PDF"
export function getDocumentExt(name = "") {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  return m ? m[1].toUpperCase() : "FILE";
}

// Short label for the download button: "PDF", "WORD", "EXCEL" …
export function getDocumentLabel(name = "") {
  const ext = getDocumentExt(name);
  if (ext === "PDF") return "PDF";
  if (ext === "DOC" || ext === "DOCX" || ext === "ODT" || ext === "RTF") return "WORD";
  if (ext === "XLS" || ext === "XLSX" || ext === "ODS" || ext === "CSV") return "EXCEL";
  if (ext === "PPT" || ext === "PPTX" || ext === "ODP") return "SLIDES";
  if (ext === "ZIP") return "ZIP";
  return ext;
}

export function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Makes a filename safe for a Storage path / Content-Disposition header.
export function safeFileName(name = "document") {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\w.\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return cleaned || "document";
}