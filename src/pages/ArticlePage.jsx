import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { SECTION_INDEX } from "../config/navigation";
import { SECTION_META, DEFAULT_SECTION_META } from "../config/sectionMeta";
import { TextReveal, ImageReveal, BlobBg } from "../components/Motion";
import Loader from "../components/Loader";
import Reveal from "../components/Reveal";
import { IconHome, IconChevronRight } from "../components/Icons";
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

  const sectionKey = (item.sectionKey || "").trim();
  const meta = SECTION_INDEX[sectionKey];
  const parentMeta = meta ? (SECTION_META[meta.parentKey] || DEFAULT_SECTION_META) : DEFAULT_SECTION_META;
  const sectionHref = meta ? `/section/${sectionKey}` : "/";

  return (
    <article className="sectionPageWrap">
      <header className="sectionHero" style={{ "--accent": parentMeta.accent }}>
        <BlobBg />
        <div className="wrap">
          {meta && (
            <Reveal className="crumbs" as="nav" aria-label="Breadcrumb">
              <Link to="/"><IconHome /> Home</Link>
              <IconChevronRight className="crumbSep" />
              <Link to={`/section/${meta.parentKey}`}>{meta.parentLabel}</Link>
              <IconChevronRight className="crumbSep" />
              <Link to={sectionHref}>{meta.label}</Link>
            </Reveal>
          )}
          <TextReveal text={item.title} as="h1" delay={0.08} />
          {item.summary && <Reveal delay={0.14} as="p">{item.summary}</Reveal>}
        </div>
      </header>

      <section>
        <div className="wrap articleBody">
          {item.imageUrl && (
            <ImageReveal src={item.imageUrl} alt={item.title} className="articleImgWrap" />
          )}
          {item.author && (
            <Reveal delay={0.05} as="p" className="lead">
              <b>{item.author}</b>{item.date ? ` — ${item.date}` : ""}
            </Reveal>
          )}
          <Reveal delay={0.1} className="articleText">
            {(item.body || "").split("\n").map((para, i) => para.trim() ? <p key={i}>{para}</p> : <br key={i} />)}
          </Reveal>
        </div>
      </section>

      <section>
        <div className="wrap">
          <Reveal className="articleCloserLinks">
            <Link to={sectionHref} className="link">
              ← Back to {meta ? meta.label : "Home"}
            </Link>
          </Reveal>
          <Reveal delay={0.06} className="ctaBand">
            <div>
              <div className="eyebrow2">Keep exploring</div>
              <h2>{meta ? `More in ${meta.label}` : "Explore SOSARI"}</h2>
              <p>Browse related research, data and publications from SOSARI.</p>
            </div>
            <div className="actions">
              <Link className="btn outline" to={sectionHref}>View all →</Link>
              <Link className="btn" to="/partner">Partner With SOSARI →</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </article>
  );
}