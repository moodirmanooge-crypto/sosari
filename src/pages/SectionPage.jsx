import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SECTION_INDEX, NAV } from "../config/navigation";
import { SECTION_META, DEFAULT_SECTION_META } from "../config/sectionMeta";
import { fetchSectionContent } from "../utils/content";
import ContentCard from "../components/ContentCard";
import Loader from "../components/Loader";
import Reveal, { RevealGroup, RevealItem } from "../components/Reveal";
import { TextReveal, TiltCard, BlobBg } from "../components/Motion";
import {
  IconHome, IconChevronRight, IconInstitution, IconFlask, IconDb,
  IconBulb, IconChart, IconDoc, IconChat,
} from "../components/Icons";
import NotFound from "./NotFound";

const ICONS = {
  institution: IconInstitution,
  flask: IconFlask,
  db: IconDb,
  bulb: IconBulb,
  chart: IconChart,
  doc: IconDoc,
  chat: IconChat,
};

export default function SectionPage() {
  const { parent, child } = useParams();
  const sectionKey = `${parent}/${child}`;
  const meta = SECTION_INDEX[sectionKey];
  const parentMeta = SECTION_META[parent] || DEFAULT_SECTION_META;
  const Icon = ICONS[parentMeta.icon] || IconDoc;

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

  // Sibling sub-sections, so a leaf page still offers a way to explore
  // the rest of its parent group — never a dead end.
  const parentGroup = NAV.find((g) => g.key === parent);
  const siblings = parentGroup
    ? (parentGroup.items || parentGroup.groups.flatMap((g) => g.items)).filter((it) => it.key !== sectionKey)
    : [];

  return (
    <div className="sectionPageWrap">
      <header className="sectionHero" style={{ "--accent": parentMeta.accent }}>
        <BlobBg />
        <div className="wrap">
          <Reveal className="crumbs" as="nav" aria-label="Breadcrumb">
            <Link to="/"><IconHome /> Home</Link>
            <IconChevronRight className="crumbSep" />
            <Link to={`/section/${meta.parentKey}`}>{meta.parentLabel}</Link>
            <IconChevronRight className="crumbSep" />
            <span>{meta.label}</span>
          </Reveal>

          <div className="sectionHeroBody">
            <Reveal delay={0.05} className="sectionIconBadge small">
              <Icon />
            </Reveal>
            <div>
              <Reveal delay={0.1} className="eyebrow">{parentMeta.tagline}</Reveal>
              <TextReveal text={meta.label} as="h1" delay={0.14} />
            </div>
          </div>
        </div>
      </header>

      <section>
        <div className="wrap">
          {loading ? (
            <Loader />
          ) : items.length === 0 ? (
            <Reveal as="p" className="lead">
              No published content here yet. Once the SOSARI team publishes content for
              "{meta.label}" from the admin panel, it will automatically appear on this page.
            </Reveal>
          ) : (
            <RevealGroup className="pubs" stagger={0.07}>
              {items.map((item) => (
                <RevealItem key={item.id}>
                  <TiltCard><ContentCard item={item} /></TiltCard>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </section>

      {siblings.length > 0 && (
        <section className="knowledge">
          <div className="wrap">
            <Reveal className="eyebrow2">Also under {meta.parentLabel}</Reveal>
            <Reveal as="h2" delay={0.05}>Related sub-sections</Reveal>
            <RevealGroup className="chipGrid" stagger={0.04}>
              {siblings.slice(0, 10).map((it) => (
                <RevealItem key={it.key}>
                  <Link to={`/section/${it.key}`} className="chip">{it.label}</Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}
    </div>
  );
}