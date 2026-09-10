import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { NAV } from "../config/navigation";
import { fetchContentForKeys } from "../utils/content";
import ContentCard from "../components/ContentCard";
import Loader from "../components/Loader";
import NotFound from "./NotFound";

export default function SectionLanding() {
  const { parent } = useParams();
  const group = NAV.find((g) => g.key === parent);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!group) return;
    let mounted = true;
    setLoading(true);
    const allKeys = group.items
      ? group.items.map((i) => i.key)
      : group.groups.flatMap((g) => g.items.map((i) => i.key));
    fetchContentForKeys(allKeys).then((rows) => {
      if (mounted) {
        setItems(rows.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0)));
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [parent]);

  if (!group) return <NotFound />;

  return (
    <div className="sectionPageWrap">
      <header className="pageHero">
        <div className="wrap">
          <div className="eyebrow">{group.cap || "SOSARI"}</div>
          <h1>{group.label}</h1>
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="eyebrow2">Explore</div>
          <h2>Sub-sections under {group.label}</h2>
          <div className="cards">
            {(group.items || group.groups.flatMap((g) => g.items)).map((it) => (
              <Link className="card" key={it.key} to={`/section/${it.key}`}>
                <h3>{it.label}</h3>
                <span className="link">View →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="knowledge">
        <div className="wrap">
          <div className="eyebrow2">Latest</div>
          <h2>Recent content in {group.label}</h2>
          {loading ? (
            <Loader />
          ) : items.length === 0 ? (
            <p className="lead">No published content yet in this section.</p>
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
