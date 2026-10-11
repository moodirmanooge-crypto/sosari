import { useState } from "react";
import { IconDownload } from "./Icons";
import { getItemDocuments, getDocumentLabel, formatBytes } from "../utils/documents";

// Orange "DOWNLOAD PDF" button(s) shown on every content item. Any visitor
// can click them — no login needed.
//
// - If the admin attached document(s) (PDF, Word …), those files are offered.
// - If not, the site builds a clean PDF on the spot from the item itself
//   (title, author, summary, text, cover image and photos).
//
// variant="compact" -> just the button(s) (used on cards)
// variant="full"    -> a box listing each file with its name + size
export default function DocumentDownloads({ item, variant = "compact" }) {
  const docs = getItemDocuments(item);
  const [busy, setBusy] = useState(false);

  async function handleGenerate(e) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      // jsPDF is only downloaded when someone actually clicks the button.
      const { exportContentAsPdf } = await import("../utils/pdfExport");
      await exportContentAsPdf(item);
    } catch (err) {
      console.error(err);
      alert("Sorry, the PDF could not be created. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const generatedButton = (
    <button type="button" className="docDownloadBtn" onClick={handleGenerate} disabled={busy}>
      <IconDownload /> {busy ? "Preparing…" : "Download PDF"}
    </button>
  );

  if (variant === "full") {
    return (
      <div className="docDownloads">
        <div className="docDownloadsTitle">Download</div>
        <ul className="docDownloadsList">
          {docs.length === 0 ? (
            <li className="docDownloadsRow">
              <span className="docDownloadsName">
                <span className="docExtBadge">PDF</span>
                <span className="docDownloadsFile">{item?.title || "Document"}</span>
              </span>
              {generatedButton}
            </li>
          ) : (
            docs.map((d, i) => (
              <li key={d.path || d.url || i} className="docDownloadsRow">
                <span className="docDownloadsName">
                  <span className="docExtBadge">{getDocumentLabel(d.name)}</span>
                  <span className="docDownloadsFile">{d.name}</span>
                  {d.size ? <span className="docDownloadsSize">{formatBytes(d.size)}</span> : null}
                </span>
                <a
                  className="docDownloadBtn"
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={d.name}
                >
                  <IconDownload /> Download {getDocumentLabel(d.name)}
                </a>
              </li>
            ))
          )}
        </ul>
      </div>
    );
  }

  return (
    <div className="docDownloadActions">
      {docs.length === 0
        ? generatedButton
        : docs.map((d, i) => (
            <a
              key={d.path || d.url || i}
              className="docDownloadBtn"
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              download={d.name}
              title={d.name}
            >
              <IconDownload /> Download {getDocumentLabel(d.name)}
            </a>
          ))}
    </div>
  );
}