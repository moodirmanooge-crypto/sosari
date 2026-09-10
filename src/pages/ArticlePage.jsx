import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { SECTION_INDEX } from "../config/navigation";
import Loader from "../components/Loader";
import NotFound from "./NotFound";

export default function ArticlePage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getDoc(doc(db, "content", id))
      .then((snap) => {
        if (!mounted) return;
        if (snap.exists()) {
          setItem({ id: snap.id, ...snap.data() });
        } else {
          setNotFound(true);
        }
      })
      .catch(() => mounted && setNotFound(true))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <Loader full />;
  if (notFound || !item) return <NotFound />;

  const meta = SECTION_INDEX[item.sectionKey];

  return (
    <article className="sectionPageWrap">
      <header className="pageHero">
        <div className="wrap">
          {meta && (
            <div className="eyebrow">
              <Link to={`/section/${item.sectionKey}`} style={{ color: "inherit" }}>
                {meta.parentLabel} / {meta.label}
              </Link>
            </div>
          )}
          <h1>{item.title}</h1>
          {item.summary && <p>{item.summary}</p>}
        </div>
      </header>

      <section>
        <div className="wrap articleBody">
          {item.imageUrl && (
            <img src={item.imageUrl} alt={item.title} className="articleImg" />
          )}
          {item.author && <p className="lead"><b>{item.author}</b>{item.date ? ` — ${item.date}` : ""}</p>}
          <div className="articleText">
            {(item.body || "").split("\n").map((para, i) => para.trim() ? <p key={i}>{para}</p> : <br key={i} />)}
          </div>
        </div>
      </section>
    </article>
  );
}
