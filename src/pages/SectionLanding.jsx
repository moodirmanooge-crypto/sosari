import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { NAV } from "../config/navigation";
import { SECTION_META, DEFAULT_SECTION_META } from "../config/sectionMeta";
import { fetchContentForKeys } from "../utils/content";
import ContentCard from "../components/ContentCard";
import Loader from "../components/Loader";
import Reveal, { RevealGroup, RevealItem } from "../components/Reveal";
import { TextReveal, TiltCard, BlobBg } from "../components/Motion";
import AboutOverview from "../components/AboutOverview";
import {
  IconHome, IconChevronRight, IconInstitution, IconFlask, IconDb,
  IconBulb, IconChart, IconDoc, IconChat, IconArrow,
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

export default function SectionLanding() {
  const { parent } = useParams();
  const group = NAV.find((g) => g.key === parent);
  const meta = SECTION_META[parent] || DEFAULT_SECTION_META;
  const Icon = ICONS[meta.icon] || IconDoc;

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

  const flatItems = group.items || (group.groups ? group.groups.flatMap((g) => g.items) : []);

  return (
    <div className="sectionPageWrap">
      <header className="sectionHero" style={{ "--accent": meta.accent }}>
        <BlobBg />
        <div className="wrap">
          <Reveal className="crumbs" as="nav" aria-label="Breadcrumb">
            <Link to="/"><IconHome /> Home</Link>
            <IconChevronRight className="crumbSep" />
            <span>{group.label}</span>
          </Reveal>

          <div className="sectionHeroBody">
            <Reveal delay={0.05} className="sectionIconBadge">
              <Icon />
            </Reveal>
            <div>
              <Reveal delay={0.1} className="eyebrow">{meta.tagline}</Reveal>
              <TextReveal text={group.label} as="h1" delay={0.14} />
              <Reveal delay={0.22} as="p" className="sectionHeroBlurb">{meta.blurb}</Reveal>
            </div>
          </div>
        </div>
      </header>

      {parent === "about" && <AboutOverview />}

      <section>
        <div className="wrap">
          <Reveal className="eyebrow2">Explore</Reveal>
          <Reveal as="h2" delay={0.05}>
            {group.groups ? `Themes under ${group.label}` : `Sub-sections under ${group.label}`}
          </Reveal>

          {group.groups ? (
            <div className="groupBlocks">
              {group.groups.map((g, gi) => (
                <div key={g.subcap} className="groupBlock">
                  <Reveal as="h3" delay={gi * 0.04} className="groupBlockTitle">{g.subcap}</Reveal>
                  <RevealGroup className="chipGrid" stagger={0.05}>
                    {g.items.map((it) => (
                      <RevealItem key={it.key}>
                        <Link to={`/section/${it.key}`} className="chip">
                          {it.label}
                          <IconArrow className="chipArrow" />
                        </Link>
                      </RevealItem>
                    ))}
                  </RevealGroup>
                </div>
              ))}
            </div>
          ) : (
            <RevealGroup className="cards" stagger={0.06}>
              {flatItems.map((it, i) => (
                <RevealItem key={it.key}>
                  <TiltCard>
                    <Link className="card sectionSubCard" to={`/section/${it.key}`}>
                      <div className="num">{String(i + 1).padStart(2, "0")}</div>
                      <h3>{it.label}</h3>
                      <span className="link">Explore →</span>
                    </Link>
                  </TiltCard>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </section>

      <section className="knowledge">
        <div className="wrap">
          <Reveal className="eyebrow2">Latest</Reveal>
          <Reveal as="h2" delay={0.05}>Recent content in {group.label}</Reveal>
          {loading ? (
            <Loader />
          ) : items.length === 0 ? (
            <Reveal as="p" className="lead">No published content yet in this section.</Reveal>
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
    </div>
  );
}