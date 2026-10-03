import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { fetchFeaturedHome } from "../utils/content";
import ContentCard from "../components/ContentCard";
import PartnersCarousel from "../components/PartnersCarousel";
import Loader from "../components/Loader";
import Reveal, { RevealGroup, RevealItem } from "../components/Reveal";
import { TiltCard } from "../components/Motion";
import { IconChart, IconUsers, IconDoc, IconBulb, IconDb, IconGlobe, IconSearch } from "../components/Icons";
import heroPhoto from "../assets/hero-photo.jpg";
import heroPhoto1 from "../assets/hero-photo1.jpg";
import heroPhoto2 from "../assets/hero-photo2.jpg";

const DEFAULT_HERO_PHOTOS = [heroPhoto, heroPhoto1, heroPhoto2];
const HERO_SLIDE_MS = 4000;

function splitHeroTitle(title) {
  const match = title.match(/(.*?)(\bSomalia\b.*)$/i);
  if (!match) return { lead: title, accent: "" };
  return { lead: match[1], accent: match[2] };
}

const DEFAULT_HERO = {
  eyebrow: "Evidence • Data • Policy • Impact",
  title: "Better evidence for better decisions in Somalia.",
  text:
    "SOSARI is an independent Somali-led institution for research, statistics, data, policy advisory and evaluation—connecting rigorous evidence with practical decisions across Somalia and the Horn of Africa.",
};

// The last hero text/photos fetched from Firestore are kept in the browser,
// so on every visit after the first the hero paints instantly with the
// real content instead of waiting for the network. (index.html reads the
// same key to start downloading the first photo before the app JS loads.)
const HERO_CACHE_KEY = "sosari_home_hero_v1";

function readHeroCache() {
  try {
    const c = JSON.parse(localStorage.getItem(HERO_CACHE_KEY) || "null");
    if (c && c.hero && Array.isArray(c.photos) && c.photos.length > 0) return c;
  } catch {
    /* storage unavailable — fall back to defaults */
  }
  return null;
}

function writeHeroCache(hero, photos) {
  try {
    localStorage.setItem(HERO_CACHE_KEY, JSON.stringify({ hero, photos }));
  } catch {
    /* ignore */
  }
}

// Resolves once the browser has the image downloaded (or failed), so a
// photo is only swapped in when it can appear immediately — never a blank frame.
function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

const INITIAL_CACHE = typeof window !== "undefined" ? readHeroCache() : null;

/* ------------------------------------------------------------------
   3D text animation
   Every word slides up and flips in on the X axis (3D), one after the
   other. Same timing and motion on laptop and mobile: words wrap
   naturally to any screen width, and each word carries its own
   perspective so the 3D effect is identical everywhere.
   inView=false → plays on page load (hero); inView=true → plays once
   when the text scrolls onto the screen.
------------------------------------------------------------------- */
const EASE_3D = [0.22, 1, 0.36, 1];

const WORD_VARIANTS = {
  hidden: { opacity: 0, y: "0.7em", rotateX: -85 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.8, ease: EASE_3D } },
};

const WORD_STYLE = {
  display: "inline-block",
  transformOrigin: "50% 100%",
  transformPerspective: 700,
  backfaceVisibility: "hidden",
  willChange: "transform, opacity",
};

const VIEWPORT_3D = { once: true, amount: 0.2, margin: "0px 0px -8% 0px" };

function Text3D({ as = "div", text, parts, className, delay = 0, inView = true, style }) {
  const reduce = useReducedMotion();
  const list = (parts || [text])
    .map((p) => (typeof p === "string" ? { text: p } : p))
    .filter((p) => p && p.text);

  if (reduce) {
    const Plain = as;
    return (
      <Plain className={className} style={style}>
        {list.map((p, i) => (p.className ? <span key={i} className={p.className}>{p.text}</span> : p.text))}
      </Plain>
    );
  }

  const words = list.map((p) => ({ ...p, words: p.text.split(/\s+/).filter(Boolean) }));
  const total = words.reduce((n, p) => n + p.words.length, 0) || 1;
  const stagger = Math.min(0.07, 1.1 / total);
  const Tag = motion[as] || motion.div;
  const play = inView ? { whileInView: "show", viewport: VIEWPORT_3D } : { animate: "show" };

  let count = 0;
  const renderWords = (ws) =>
    ws.map((w, i) => {
      count += 1;
      const isLast = count === total;
      return (
        <span key={i}>
          <motion.span variants={WORD_VARIANTS} style={WORD_STYLE}>{w}</motion.span>
          {!isLast && " "}
        </span>
      );
    });

  return (
    <Tag
      className={className}
      style={style}
      initial="hidden"
      {...play}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {words.map((p, i) =>
        p.className ? (
          <span key={i} className={p.className}>{renderWords(p.words)}</span>
        ) : (
          <span key={i}>{renderWords(p.words)}</span>
        )
      )}
    </Tag>
  );
}

// A whole block (badge, button) that flips in with the same 3D motion.
function Block3D({ as = "div", delay = 0, className, children, style }) {
  const reduce = useReducedMotion();
  if (reduce) {
    const Plain = as;
    return <Plain className={className} style={style}>{children}</Plain>;
  }
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      className={className}
      style={{ transformOrigin: "50% 100%", transformPerspective: 700, ...style }}
      initial={{ opacity: 0, y: 24, rotateX: -70 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.85, delay, ease: EASE_3D }}
    >
      {children}
    </Tag>
  );
}

export default function Home() {
  const [hero, setHero] = useState(INITIAL_CACHE?.hero || DEFAULT_HERO);
  const [heroPhotos, setHeroPhotos] = useState(INITIAL_CACHE?.photos || DEFAULT_HERO_PHOTOS);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroSlide, setHeroSlide] = useState(0);
  const heroPhotosRef = useRef(heroPhotos);
  heroPhotosRef.current = heroPhotos;

  useEffect(() => {
    // Download the remaining slides in the background so each one is ready
    // the moment the slider reaches it.
    heroPhotos.slice(1).forEach((src) => preloadImage(src));
    const id = setInterval(() => {
      setHeroSlide((i) => (i + 1) % heroPhotos.length);
    }, HERO_SLIDE_MS);
    return () => clearInterval(id);
  }, [heroPhotos]);

  useEffect(() => {
    let mounted = true;

    // Hero settings and featured items are independent — fetch them in
    // parallel so neither waits on the other.
    async function loadHero() {
      try {
        const snap = await getDoc(doc(db, "siteSettings", "home"));
        if (!mounted || !snap.exists()) return;
        const data = snap.data();
        const nextHero = {
          eyebrow: data.heroEyebrow || DEFAULT_HERO.eyebrow,
          title: data.heroTitle || DEFAULT_HERO.title,
          text: data.heroText || DEFAULT_HERO.text,
        };
        setHero(nextHero);

        let nextPhotos = null;
        if (Array.isArray(data.heroPhotos) && data.heroPhotos.length > 0) {
          // Firestore stores each hero photo as {url, path}; the built-in
          // defaults are plain string URLs — normalise to plain strings
          // either way, since that's what the <img src> below expects.
          nextPhotos = data.heroPhotos.map((p) => (typeof p === "string" ? p : p.url)).filter(Boolean);
        }

        if (nextPhotos && nextPhotos.length > 0) {
          writeHeroCache(nextHero, nextPhotos);
          if (heroPhotosRef.current.join("|") !== nextPhotos.join("|")) {
            // Different photos from the admin panel: wait until the first one
            // is downloaded, then swap — the current photo stays visible meanwhile.
            await preloadImage(nextPhotos[0]);
            if (!mounted) return;
            setHeroPhotos(nextPhotos);
            setHeroSlide(0);
          }
        } else {
          // Admin is using the built-in photos: clear any old cached photos.
          try { localStorage.removeItem(HERO_CACHE_KEY); } catch { /* ignore */ }
          if (heroPhotosRef.current !== DEFAULT_HERO_PHOTOS) {
            setHeroPhotos(DEFAULT_HERO_PHOTOS);
            setHeroSlide(0);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    async function loadFeatured() {
      try {
        const items = await fetchFeaturedHome();
        if (mounted) setFeatured(items.slice(0, 6));
      } catch (e) {
        console.error(e);
      }
      if (mounted) setLoading(false);
    }

    loadHero();
    loadFeatured();
    return () => { mounted = false; };
  }, []);

  const { lead, accent } = splitHeroTitle(hero.title);

  return (
    <>
      <header className="hero heroV2">
        <div className="heroV2-in">
          <div className="heroV2-left">
            {/* Hero text plays its 3D animation as soon as the page opens. */}
            <Block3D as="span" className="heroBadge" key={`b-${hero.eyebrow}`}>
              <IconChart /> {hero.eyebrow}
            </Block3D>

            <Text3D
              as="h1"
              key={`t-${hero.title}`}
              inView={false}
              delay={0.15}
              parts={[lead, accent && { text: accent, className: "accent" }]}
            />
            <Text3D as="p" key={`p-${hero.text}`} inView={false} delay={0.55} text={hero.text} />
            <div className="actions">
              <Block3D delay={1.05}><Link className="btn gold" to="/our-work">Explore Our Work →</Link></Block3D>
              <Block3D delay={1.2}><Link className="btn playOutline" to="#"><span className="playCircle">▶</span> Watch Video</Link></Block3D>
            </div>

            <Text3D as="span" className="heroCursive" inView={false} delay={1.35} text="A Stronger Tomorrow" />
          </div>

          <div className="heroV2-right">
            <div className="heroPhotoContainer">
              <div className="heroPhotoFrame">
                {/* initial={false}: the first photo appears instantly; only
                    later slide changes use the slide animation. */}
                <AnimatePresence mode="popLayout" custom={1} initial={false}>
                  <motion.img
                    key={heroPhotos[heroSlide]}
                    src={heroPhotos[heroSlide]}
                    alt="SOSARI team at work"
                    className="heroPhotoImg"
                    loading="eager"
                    decoding="async"
                    fetchPriority={heroSlide === 0 ? "high" : "auto"}
                    custom={1}
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -60, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <div className="floatRow">
          <div className="floatCardWrap">
            <Link to="/section/research" className="floatCard2 fc-green">
              <span className="fc-icon"><IconDoc /></span>
              <span className="fc-text"><Text3D as="b" text="Research Insights" /><Text3D as="span" delay={0.15} text="Evidence for policy and development" /></span>
            </Link>
          </div>
          <div className="floatCardWrap">
            <Link to="/section/data" className="floatCard2 fc-cyan">
              <span className="fc-icon"><IconBulb /></span>
              <span className="fc-text"><Text3D as="b" delay={0.1} text="Reliable Statistics" /><Text3D as="span" delay={0.25} text="Trusted data, better decisions" /></span>
            </Link>
          </div>
          <div className="floatCardWrap">
            <Link to="/section/policies" className="floatCard2 fc-purple">
              <span className="fc-icon"><IconUsers /></span>
              <span className="fc-text"><Text3D as="b" delay={0.2} text="Policy Solutions" /><Text3D as="span" delay={0.35} text="Research that creates real change" /></span>
            </Link>
          </div>
          <div className="floatCardWrap">
            <Link to="/section/evaluations" className="floatCard2 fc-gold">
              <span className="fc-icon"><IconGlobe /></span>
              <span className="fc-text"><Text3D as="b" delay={0.3} text="Real Impact" /><Text3D as="span" delay={0.45} text="For people, communities and a stronger Somalia" /></span>
            </Link>
          </div>
        </div>
      </header>

      <Reveal as="div" className="strip stripCenter">
        <span className="stripLine" />
        <Text3D as="span" className="stripWords" text="STATISTICS • RESEARCH • POLICY • DEVELOPMENT" style={{ wordSpacing: "0.35em" }} />
        <span className="stripLine" />
      </Reveal>

      <section>
        <div className="wrap">
          <Text3D className="eyebrow2" text="What SOSARI does" />
          <Text3D as="h2" delay={0.1} text="A complete evidence-to-impact institution." />
          <Text3D
            as="p"
            delay={0.25}
            className="lead"
            text="SOSARI connects research, data, policy, advisory and evaluation into a single, coherent institution — not a list of stand-alone services."
          />
          <RevealGroup className="cards" stagger={0.08}>
            <RevealItem>
              <TiltCard className="card">
                <Text3D className="num" text="01 / RESEARCH" />
                <Text3D as="h3" delay={0.1} text="Research & Evidence" />
                <Text3D as="p" delay={0.2} text="Applied and policy research designed around Somalia's priority questions and real-world decisions." />
                <Link className="link" to="/section/research">Research agenda →</Link>
              </TiltCard>
            </RevealItem>
            <RevealItem>
              <TiltCard className="card">
                <Text3D className="num" text="02 / DATA" />
                <Text3D as="h3" delay={0.1} text="Statistics & Data" />
                <Text3D as="p" delay={0.2} text="Survey design, field research, digital data systems, statistical analysis, data science and GIS." />
                <Link className="link" to="/section/data">Data services →</Link>
              </TiltCard>
            </RevealItem>
            <RevealItem>
              <TiltCard className="card">
                <Text3D className="num" text="03 / POLICY" />
                <Text3D as="h3" delay={0.1} text="Policy & Advisory" />
                <Text3D as="p" delay={0.2} text="Policy analysis, strategic advisory, institutional development, programme design and technical assistance." />
                <Link className="link" to="/section/policies">Policy & advisory →</Link>
              </TiltCard>
            </RevealItem>
            <RevealItem>
              <TiltCard className="card">
                <Text3D className="num" text="04 / EVALUATION" />
                <Text3D as="h3" delay={0.1} text="MEAL & Evaluation" />
                <Text3D as="p" delay={0.2} text="Baseline, midterm, endline, impact evaluation, third-party monitoring and learning." />
                <Link className="link" to="/section/evaluations">Evaluation →</Link>
              </TiltCard>
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      <section className="dark">
        <div className="wrap">
          <Text3D className="eyebrow2" text="Research agenda" />
          <Text3D as="h2" delay={0.1} text="Thematic Research Areas" />
          <Text3D
            as="p"
            delay={0.25}
            className="lead"
            text="SOSARI's research and consultancy activities address key development, governance, and socio-economic challenges across multiple sectors, generating high-quality evidence that informs decision-making, policy development, and programme design."
          />
          <RevealGroup className="themes" stagger={0.07}>
            <RevealItem><TiltCard className="theme"><Text3D as="b" text="Human Development" /><Text3D as="p" delay={0.15} text="Health • Nutrition • Education • Population • Gender & Youth" /></TiltCard></RevealItem>
            <RevealItem><TiltCard className="theme"><Text3D as="b" text="Social Protection & Community Resilience" /><Text3D as="p" delay={0.15} text="Protection Systems • Livelihoods • Displacement • Peacebuilding" /></TiltCard></RevealItem>
            <RevealItem><TiltCard className="theme"><Text3D as="b" text="Environment & Natural Resources" /><Text3D as="p" delay={0.15} text="WASH • Climate Adaptation • Natural Resource Management" /></TiltCard></RevealItem>
            <RevealItem><TiltCard className="theme"><Text3D as="b" text="Governance & Public Policy" /><Text3D as="p" delay={0.15} text="Institutions • Service Delivery • Accountability • Rule of Law" /></TiltCard></RevealItem>
            <RevealItem><TiltCard className="theme"><Text3D as="b" text="Economic Development" /><Text3D as="p" delay={0.15} text="Private Sector • Enterprise • Markets • Employment" /></TiltCard></RevealItem>
          </RevealGroup>
        </div>
      </section>

      <section className="process">
        <div className="wrap">
          <Text3D className="eyebrow2" text="SOSARI evidence cycle" />
          <Text3D as="h2" delay={0.1} text="From a question to a decision—and from a decision to learning." />
          <RevealGroup className="flow" stagger={0.06}>
            <RevealItem><div className="step"><Text3D as="b" text="01 · FRAME" /><Text3D as="span" delay={0.12} text="Define the question" /></div></RevealItem>
            <RevealItem><div className="step"><Text3D as="b" text="02 · MEASURE" /><Text3D as="span" delay={0.12} text="Collect credible data" /></div></RevealItem>
            <RevealItem><div className="step"><Text3D as="b" text="03 · ANALYSE" /><Text3D as="span" delay={0.12} text="Generate evidence" /></div></RevealItem>
            <RevealItem><div className="step"><Text3D as="b" text="04 · TRANSLATE" /><Text3D as="span" delay={0.12} text="Inform policy" /></div></RevealItem>
            <RevealItem><div className="step"><Text3D as="b" text="05 · ACT" /><Text3D as="span" delay={0.12} text="Support decisions" /></div></RevealItem>
            <RevealItem><div className="step"><Text3D as="b" text="06 · LEARN" /><Text3D as="span" delay={0.12} text="Evaluate & improve" /></div></RevealItem>
          </RevealGroup>
        </div>
      </section>

      <section>
        <div className="wrap">
          <Text3D className="eyebrow2" text="Featured" />
          <Text3D as="h2" delay={0.1} text="Latest from SOSARI." />
          <Text3D as="p" delay={0.25} className="lead" text="Recent publications, briefs and updates selected by the SOSARI team." />
          {loading ? (
            <Loader />
          ) : featured.length === 0 ? (
            <Text3D as="p" className="lead" text="No featured content yet — add some from the admin panel." />
          ) : (
            <RevealGroup className="pubs" stagger={0.08}>
              {featured.map((item) => (
                <RevealItem key={item.id}>
                  <TiltCard><ContentCard item={item} /></TiltCard>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </section>

      <section>
        <div className="wrap">
          <Reveal className="ctaBand">
            <div>
              <Text3D className="eyebrow2" text="Work with SOSARI" />
              <Text3D as="h2" delay={0.1} text="Have a research, data, policy or evaluation challenge?" />
              <Text3D as="p" delay={0.3} text="Bring the question. SOSARI can assemble the appropriate methods, expertise and evidence pathway." />
            </div>
            <div className="actions">
              <Link className="btn" to="/partner">Start a conversation →</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <PartnersCarousel />
    </>
  );
}