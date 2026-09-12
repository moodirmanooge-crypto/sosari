import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchContentForKeys } from "../utils/content";
import { exportContentAsPdf } from "../utils/pdfExport";
import Loader from "../components/Loader";
import Reveal, { RevealGroup, RevealItem } from "../components/Reveal";
import { TiltCard, BlobBg, ImageReveal, TextReveal } from "../components/Motion";
import { IconDownload, IconDoc } from "../components/Icons";

// Every leaf item under the Knowledge section — Research Reports, Policy
// Briefs, Working Papers, Technical & Statistical Reports, Evaluation
// Reports, Case Studies, Insights & Analysis.
const KNOWLEDGE_KEYS = [
  "knowledge/research-reports",
  "knowledge/policy-briefs",
  "knowledge/working-papers",
  "knowledge/technical-statistical-reports",
  "knowledge/evaluation-reports",
  "knowledge/case-studies",
  "knowledge/insights-analysis",
];

function ReportCard({ item }) {
  const [exporting, setExporting] = useState(false);

  async function handleDownload(e) {
    e.preventDefault();
    e.stopPropagation();
    setExporting(true);
    try {
      await exportContentAsPdf(item);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="pub contentCard reportCard">
      {item.imageUrl ? (
        <ImageReveal src={item.imageUrl} alt={item.title} className="contentCardImg" />
      ) : (
        <div className="reportCardIcon"><IconDoc /></div>
      )}
      {item.tag && <span className="tag">{item.tag}</span>}
      <h3>{item.title}</h3>
      {item.summary && <p>{item.summary}</p>}
      <div className="reportCardActions">
        <Link to={`/article/${item.id}`} className="cardReadMore">Read online →</Link>
        <button type="button" className="reportDownloadBtn" onClick={handleDownload} disabled={exporting}>
          <IconDownload /> {exporting ? "Preparing…" : "Download PDF"}
        </button>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchContentForKeys(KNOWLEDGE_KEYS)
      .then((rows) => mounted && setItems(rows))
      .catch((e) => console.error(e))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <div className="sectionPageWrap">
      <header className="sectionHero" style={{ "--accent": "#c9497a" }}>
        <BlobBg />
        <div className="wrap">
          <Reveal className="crumbs" as="nav" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>→</span>
            <span>Reports</span>
          </Reveal>
          <div className="eyebrow">Publications</div>
          <TextReveal text="Reports" as="h1" delay={0.1} />
          <Reveal delay={0.1} as="p" className="sectionHeroBlurb">
            Research reports, policy briefs, working papers and other published SOSARI
            documents. Read online, or download a ready-to-share PDF copy.
          </Reveal>
        </div>
      </header>

      <section>
        <div className="wrap">
          {loading ? (
            <Loader />
          ) : items.length === 0 ? (
            <p className="lead">No published reports yet — add some from the admin panel under Knowledge.</p>
          ) : (
            <RevealGroup className="pubs" stagger={0.07}>
              {items.map((item) => (
                <RevealItem key={item.id}>
                  <TiltCard><ReportCard item={item} /></TiltCard>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </section>
    </div>
  );
}