import { IconDownload } from "./Icons";
import { getItemDocuments, getDocumentLabel, formatBytes } from "../utils/documents";

// "DOWNLOAD PDF" box shown at the BOTTOM of an opened article.
// It only appears when the admin attached a PDF/document to the item —
// attaching one is optional. No attachment = no download button.
//
// Files are uploaded with `Content-Disposition: attachment`, so clicking
// the button downloads the file with its original name.
export default function DocumentDownloads({ item }) {
  const docs = getItemDocuments(item);
  if (docs.length === 0) return null;

  return (
    <div className="docDownloads">
      <div className="docDownloadsTitle">Download</div>
      <ul className="docDownloadsList">
        {docs.map((d, i) => (
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
        ))}
      </ul>
    </div>
  );
}