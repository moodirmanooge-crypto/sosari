import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SECTION_INDEX } from "../config/navigation";
import { fetchSectionContent } from "../utils/content";
import ContentCard from "../components/ContentCard";
import Loader from "../components/Loader";
import NotFound from "./NotFound";

export default function SectionPage() {
  const { parent, child } = useParams();
  const sectionKey = `${parent}/${child}`;
  const meta = SECTION_INDEX[sectionKey];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchSectionContent(sectionKey).then((rows) => {
      if (mounted) {
        setItems(rows);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [sectionKey]);

  if (!meta) return <NotFound />;

  return (
    <div className="sectionPageWrap">
      <header className="pageHero">
        <div className="wrap">
          <div className="eyebrow">{meta.parentLabel}</div>
          <h1>{meta.label}</h1>
        </div>
      </header>

      <section>
        <div className="wrap">
          {loading ? (
            <Loader />
          ) : items.length === 0 ? (
            <p className="lead">
              No published content here yet. Once the SOSARI team publishes content for
              "{meta.label}" from the admin panel, it will automatically appear on this page.
            </p>
          ) : (
            <div className="pubs">
              {items.map((item) => <ContentCard key={item.id} item={item} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
