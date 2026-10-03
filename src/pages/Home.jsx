import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
            {/* Hero text renders immediately — no scroll/fade-in delay. */}
            <span className="heroBadge"><IconChart /> {hero.eyebrow}</span>

            <h1>
              {lead}
              {accent && <span className="accent">{accent}</span>}
            </h1>
            <p>{hero.text}</p>
            <div className="actions">
              <div><Link className="btn gold" to="/our-work">Explore Our Work →</Link></div>
              <div><Link className="btn playOutline" to="#"><span className="playCircle">▶</span> Watch Video</Link></div>
            </div>

            <span className="heroCursive">A Stronger Tomorrow</span>
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
              <span className="fc-text"><b>Research Insights</b>Evidence for policy and development</span>
            </Link>
          </div>
          <div className="floatCardWrap">
            <Link to="/section/data" className="floatCard2 fc-cyan">
              <span className="fc-icon"><IconBulb /></span>
              <span className="fc-text"><b>Reliable Statistics</b>Trusted data, better decisions</span>
            </Link>
          </div>
          <div className="floatCardWrap">
            <Link to="/section/policies" className="floatCard2 fc-purple">
              <span className="fc-icon"><IconUsers /></span>
              <span className="fc-text"><b>Policy Solutions</b>Research that creates real change</span>
            </Link>
          </div>
          <div className="floatCardWrap">
            <Link to="/section/evaluations" className="floatCard2 fc-gold">
              <span className="fc-icon"><IconGlobe /></span>
              <span className="fc-text"><b>Real Impact</b>For people, communities and a stronger Somalia</span>
            </Link>
          </div>
        </div>
      </header>

      <Reveal as="div" className="strip stripCenter">
        <span className="stripLine" />
        <span className="stripWords">STATISTICS &nbsp;•&nbsp; RESEARCH &nbsp;•&nbsp; POLICY &nbsp;•&nbsp; DEVELOPMENT</span>
        <span className="stripLine" />
      </Reveal>

      <section>
        <div className="wrap">
          <Reveal className="eyebrow2">What SOSARI does</Reveal>
          <Reveal as="h2" delay={0.05}>A complete evidence-to-impact institution.</Reveal>
          <Reveal as="p" delay={0.1} className="lead">
            SOSARI connects research, data, policy, advisory and evaluation into a single, coherent
            institution — not a list of stand-alone services.
          </Reveal>
          <RevealGroup className="cards" stagger={0.08}>
            <RevealItem>
              <TiltCard className="card">
                <div className="num">01 / RESEARCH</div>
                <h3>Research & Evidence</h3>
                <p>Applied and policy research designed around Somalia's priority questions and real-world decisions.</p>
                <Link className="link" to="/section/research">Research agenda →</Link>
              </TiltCard>
            </RevealItem>
            <RevealItem>
              <TiltCard className="card">
                <div className="num">02 / DATA</div>
                <h3>Statistics & Data</h3>
                <p>Survey design, field research, digital data systems, statistical analysis, data science and GIS.</p>
                <Link className="link" to="/section/data">Data services →</Link>
              </TiltCard>
            </RevealItem>
            <RevealItem>
              <TiltCard className="card">
                <div className="num">03 / POLICY</div>
                <h3>Policy & Advisory</h3>
                <p>Policy analysis, strategic advisory, institutional development, programme design and technical assistance.</p>
                <Link className="link" to="/section/policies">Policy & advisory →</Link>
              </TiltCard>
            </RevealItem>
            <RevealItem>
              <TiltCard className="card">
                <div className="num">04 / EVALUATION</div>
                <h3>MEAL & Evaluation</h3>
                <p>Baseline, midterm, endline, impact evaluation, third-party monitoring and learning.</p>
                <Link className="link" to="/section/evaluations">Evaluation →</Link>
              </TiltCard>
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      <section className="dark">
        <div className="wrap">
          <Reveal className="eyebrow2">Research agenda</Reveal>
          <Reveal as="h2" delay={0.05}>Thematic Research Areas</Reveal>
          <Reveal as="p" delay={0.1} className="lead">
            SOSARI's research and consultancy activities address key development, governance, and
            socio-economic challenges across multiple sectors, generating high-quality evidence
            that informs decision-making, policy development, and programme design.
          </Reveal>
          <RevealGroup className="themes" stagger={0.07}>
            <RevealItem><TiltCard className="theme"><b>Human Development</b><p>Health • Nutrition • Education • Population • Gender & Youth</p></TiltCard></RevealItem>
            <RevealItem><TiltCard className="theme"><b>Social Protection & Community Resilience</b><p>Protection Systems • Livelihoods • Displacement • Peacebuilding</p></TiltCard></RevealItem>
            <RevealItem><TiltCard className="theme"><b>Environment & Natural Resources</b><p>WASH • Climate Adaptation • Natural Resource Management</p></TiltCard></RevealItem>
            <RevealItem><TiltCard className="theme"><b>Governance & Public Policy</b><p>Institutions • Service Delivery • Accountability • Rule of Law</p></TiltCard></RevealItem>
            <RevealItem><TiltCard className="theme"><b>Economic Development</b><p>Private Sector • Enterprise • Markets • Employment</p></TiltCard></RevealItem>
          </RevealGroup>
        </div>
      </section>

      <section className="process">
        <div className="wrap">
          <Reveal className="eyebrow2">SOSARI evidence cycle</Reveal>
          <Reveal as="h2" delay={0.05}>From a question to a decision—and from a decision to learning.</Reveal>
          <RevealGroup className="flow" stagger={0.06}>
            <RevealItem><div className="step"><b>01 · FRAME</b><span>Define the question</span></div></RevealItem>
            <RevealItem><div className="step"><b>02 · MEASURE</b><span>Collect credible data</span></div></RevealItem>
            <RevealItem><div className="step"><b>03 · ANALYSE</b><span>Generate evidence</span></div></RevealItem>
            <RevealItem><div className="step"><b>04 · TRANSLATE</b><span>Inform policy</span></div></RevealItem>
            <RevealItem><div className="step"><b>05 · ACT</b><span>Support decisions</span></div></RevealItem>
            <RevealItem><div className="step"><b>06 · LEARN</b><span>Evaluate & improve</span></div></RevealItem>
          </RevealGroup>
        </div>
      </section>

      <section>
        <div className="wrap">
          <Reveal className="eyebrow2">Featured</Reveal>
          <Reveal as="h2" delay={0.05}>Latest from SOSARI.</Reveal>
          <Reveal as="p" delay={0.1} className="lead">Recent publications, briefs and updates selected by the SOSARI team.</Reveal>
          {loading ? (
            <Loader />
          ) : featured.length === 0 ? (
            <Reveal as="p" className="lead">No featured content yet — add some from the admin panel.</Reveal>
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
              <div className="eyebrow2">Work with SOSARI</div>
              <h2>Have a research, data, policy or evaluation challenge?</h2>
              <p>Bring the question. SOSARI can assemble the appropriate methods, expertise and evidence pathway.</p>
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