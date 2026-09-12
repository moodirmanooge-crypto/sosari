import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { fetchFeaturedHome } from "../utils/content";
import ContentCard from "../components/ContentCard";
import Loader from "../components/Loader";
import Reveal, { RevealGroup, RevealItem } from "../components/Reveal";
import { TiltCard } from "../components/Motion";
import { IconChart, IconUsers, IconDoc, IconBulb, IconDb, IconGlobe, IconSearch } from "../components/Icons";
import heroPhoto from "../assets/hero-photo.jpg";

// Splits "...in Somalia." off the end of the headline so it can be
// rendered in the accent (teal) color, like the SOSARI brand hero.
function splitHeroTitle(title) {
  const match = title.match(/(.*?)(\bin\s+Somalia\.?\s*)$/i);
  if (!match) return { lead: title, accent: "" };
  return { lead: match[1], accent: match[2] };
}

const DEFAULT_HERO = {
  eyebrow: "Evidence • Data • Policy • Impact",
  title: "Better evidence for better decisions in Somalia.",
  text:
    "SOSARI is an independent Somali-led institution for research, statistics, data, policy advisory and evaluation—connecting rigorous evidence with practical decisions across Somalia and the Horn of Africa.",
};

export default function Home() {
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const snap = await getDoc(doc(db, "siteSettings", "home"));
        if (mounted && snap.exists()) {
          const data = snap.data();
          setHero({
            eyebrow: data.heroEyebrow || DEFAULT_HERO.eyebrow,
            title: data.heroTitle || DEFAULT_HERO.title,
            text: data.heroText || DEFAULT_HERO.text,
          });
        }
      } catch (e) {
        console.error(e);
      }
      try {
        const items = await fetchFeaturedHome();
        if (mounted) setFeatured(items.slice(0, 6));
      } catch (e) {
        console.error(e);
      }
      if (mounted) setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  const { lead, accent } = splitHeroTitle(hero.title);

  return (
    <>
      <header className="hero heroV2">
        <div className="heroV2-in">
          <div className="heroV2-left">
            <div className="pillBadge"><IconChart /> {hero.eyebrow}</div>
            <h1>
              {lead}
              {accent && <span className="accent">{accent}</span>}
            </h1>
            <p>{hero.text}</p>
            <div className="actions">
              <Link className="btn primary" to="/section/research"><IconSearch /> Explore Research</Link>
              <Link className="btn outline" to="/section/data"><IconChart /> Explore Data</Link>
              <Link className="btn outline" to="/partner"><IconUsers /> Partner With SOSARI</Link>
            </div>

            <div className="heroStatsInline">
              <div className="heroStatItem">
                <span className="heroStatIcon"><IconDoc /></span>
                <div><b>100+</b><span>Research Projects</span></div>
              </div>
              <div className="heroStatItem">
                <span className="heroStatIcon"><IconUsers /></span>
                <div><b>50+</b><span>Partners & Collaborators</span></div>
              </div>
              <div className="heroStatItem">
                <span className="heroStatIcon"><IconChart /></span>
                <div><b>10+</b><span>Years of Impact</span></div>
              </div>
            </div>
          </div>

          <div className="heroV2-right">
            <div className="dotGrid" aria-hidden="true" />

            <svg viewBox="0 0 300 420" className="somaliaGlow" aria-hidden="true">
              <defs>
                <linearGradient id="glowFill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3fd9c7" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#0876bd" stopOpacity="0.15" />
                </linearGradient>
              </defs>
              <path
                d="M68 20 L95 35 L130 25 L165 30 L200 15 L230 20 L250 18 L282 8 L268 50 L250 90 L238 125 L222 160 L205 195 L185 230 L160 260 L130 290 L108 305 L85 320 L55 340 L28 370 L18 395 L6 360 L20 330 L4 300 L22 270 L8 235 L28 205 L14 170 L34 140 L20 105 L40 75 L26 45 Z"
                fill="url(#glowFill)" stroke="#7fe0d6" strokeWidth="1.5" opacity="0.9" />
              {[[68,20],[282,8],[205,195],[130,290],[18,395],[8,235],[40,75]].map(([x,y],i) => (
                <circle key={i} cx={x} cy={y} r="2.6" fill="#bff3ea" />
              ))}
            </svg>

            {/* Real photo — swap by replacing src/assets/hero-photo.jpg with
                your own licensed image; the frame/caption stay as-is. */}
            <div className="heroPhotoFrame">
              <img src={heroPhoto} alt="SOSARI team at work" className="heroPhotoImg" />
              <div className="heroPhotoScrim" />
              <div className="heroPhotoCaption">
                <span>STRONGER DATA<br />BRIGHTER SOMALIA</span>
                <Link to="/section/data" className="heroPhotoArrow" aria-label="Explore data">→</Link>
              </div>
            </div>

            <div className="floatStack">
              <Link to="/section/data" className="floatCard2 fc-blue">
                <span className="fc-icon"><IconChart /></span>
                <span className="fc-text"><b>Data Today</b>A Stronger Tomorrow</span>
                <span className="fc-arrow">→</span>
              </Link>
              <Link to="/section/research" className="floatCard2 fc-green">
                <span className="fc-icon"><IconDoc /></span>
                <span className="fc-text"><b>Research Insights</b>Evidence for policy and development</span>
                <span className="fc-arrow">→</span>
              </Link>
              <Link to="/section/data" className="floatCard2 fc-cyan">
                <span className="fc-icon"><IconBulb /></span>
                <span className="fc-text"><b>Reliable Statistics</b>Trusted data, better decisions</span>
                <span className="fc-arrow">→</span>
              </Link>
              <Link to="/section/policies" className="floatCard2 fc-purple">
                <span className="fc-icon"><IconUsers /></span>
                <span className="fc-text"><b>Policy Solutions</b>Research that creates real change</span>
                <span className="fc-arrow">→</span>
              </Link>
              <Link to="/section/evaluations" className="floatCard2 fc-gold">
                <span className="fc-icon"><IconGlobe /></span>
                <span className="fc-text"><b>Real Impact</b>For people, communities and a stronger Somalia</span>
                <span className="fc-arrow">→</span>
              </Link>
            </div>
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
              <div className="eyebrow2">Partner with SOSARI</div>
              <h2>Have a research, data, policy or evaluation challenge?</h2>
              <p>Bring the question. SOSARI can assemble the appropriate methods, expertise and evidence pathway.</p>
            </div>
            <div className="actions">
              <Link className="btn" to="/partner">Start a conversation →</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}