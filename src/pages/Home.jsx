import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { fetchFeaturedHome } from "../utils/content";
import ContentCard from "../components/ContentCard";
import Loader from "../components/Loader";
import { IconChart, IconUsers, IconDoc, IconBulb, IconDb, IconGlobe } from "../components/Icons";

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
              <Link className="btn primary" to="/section/research">Explore Research →</Link>
              <Link className="btn outline" to="/section/data"><IconChart /> Explore Data</Link>
              <Link className="btn outline" to="/partner"><IconUsers /> Partner With SOSARI</Link>
            </div>
          </div>

          <div className="heroV2-right">
            <div className="dotGrid" aria-hidden="true" />
            <div className="somaliaWrap" aria-hidden="true">
              <svg viewBox="0 0 300 420" className="somaliaSvg">
                <defs>
                  <clipPath id="somaliaClip">
                    <path d="M68 20 L95 35 L130 25 L165 30 L200 15 L230 20 L250 18 L282 8 L268 50 L250 90 L238 125 L222 160 L205 195 L185 230 L160 260 L130 290 L108 305 L85 320 L55 340 L28 370 L18 395 L6 360 L20 330 L4 300 L22 270 L8 235 L28 205 L14 170 L34 140 L20 105 L40 75 L26 45 Z" />
                  </clipPath>
                </defs>
                <g clipPath="url(#somaliaClip)">
                  <rect x="0" y="0" width="300" height="150" fill="#0d3a52" />
                  <rect x="0" y="0" width="300" height="150" fill="url(#cityGrad)" />
                  <rect x="0" y="150" width="300" height="150" fill="url(#saharaGrad)" />
                  <rect x="0" y="300" width="300" height="120" fill="url(#marketGrad)" />
                  <circle cx="230" cy="40" r="70" fill="#ffffff" opacity="0.06" />
                </g>
                <defs>
                  <linearGradient id="cityGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0a4163" />
                    <stop offset="100%" stopColor="#0c5a78" />
                  </linearGradient>
                  <linearGradient id="saharaGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8a7237" />
                    <stop offset="100%" stopColor="#b89a52" />
                  </linearGradient>
                  <linearGradient id="marketGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0c4a4a" />
                    <stop offset="100%" stopColor="#0a3a3a" />
                  </linearGradient>
                </defs>
                <path d="M68 20 L95 35 L130 25 L165 30 L200 15 L230 20 L250 18 L282 8 L268 50 L250 90 L238 125 L222 160 L205 195 L185 230 L160 260 L130 290 L108 305 L85 320 L55 340 L28 370 L18 395 L6 360 L20 330 L4 300 L22 270 L8 235 L28 205 L14 170 L34 140 L20 105 L40 75 L26 45 Z"
                  fill="none" stroke="#7fe0d6" strokeWidth="2" opacity="0.85" />
              </svg>
              <div className="somaliaCaption">STRONGER DATA<br />BRIGHTER SOMALIA</div>
            </div>

            <div className="floatCard floatCardTop">
              <div className="floatIcon"><IconChart /></div>
              <div className="floatText">Data Today<br />A Stronger Tomorrow</div>
              <Link to="/section/data" className="floatArrowBtn" aria-label="Explore data">→</Link>
            </div>

            <div className="floatCard floatCardList">
              <div className="floatItem"><IconDoc /> Research Insights</div>
              <div className="floatItem"><IconChart /> Reliable Statistics</div>
              <div className="floatItem"><IconBulb /> Policy Solutions</div>
              <div className="floatItem"><IconUsers /> Real Impact</div>
            </div>

            <div className="cursiveTag">Somalia Forward<br />with Evidence</div>
          </div>
        </div>

        <div className="statsBar">
          <div className="statItem"><IconDoc /><div><b>150+</b><span>Research Publications</span></div></div>
          <div className="statItem"><IconDb /><div><b>30+</b><span>Datasets & Tools</span></div></div>
          <div className="statItem"><IconUsers /><div><b>20+</b><span>Policy Partnerships</span></div></div>
          <div className="statItem"><IconGlobe /><div><b>1</b><span>Region, Greater Impact</span></div></div>
          <div className="statItem tagline">Evidence for<br />People and Progress</div>
        </div>
      </header>

      <div className="strip">
        <div className="strip-in">
          <span>Research excellence</span>
          <span>Statistical integrity</span>
          <span>Local expertise</span>
          <span>Evidence-to-policy</span>
          <span>Independent analysis</span>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="eyebrow2">What SOSARI does</div>
          <h2>A complete evidence-to-impact institution.</h2>
          <p className="lead">
            SOSARI connects research, data, policy, advisory and evaluation into a single, coherent
            institution — not a list of stand-alone services.
          </p>
          <div className="cards">
            <div className="card">
              <div className="num">01 / RESEARCH</div>
              <h3>Research & Evidence</h3>
              <p>Applied and policy research designed around Somalia's priority questions and real-world decisions.</p>
              <Link className="link" to="/section/research">Research agenda →</Link>
            </div>
            <div className="card">
              <div className="num">02 / DATA</div>
              <h3>Statistics & Data</h3>
              <p>Survey design, field research, digital data systems, statistical analysis, data science and GIS.</p>
              <Link className="link" to="/section/data">Data services →</Link>
            </div>
            <div className="card">
              <div className="num">03 / POLICY</div>
              <h3>Policy & Advisory</h3>
              <p>Policy analysis, strategic advisory, institutional development, programme design and technical assistance.</p>
              <Link className="link" to="/section/policies">Policy & advisory →</Link>
            </div>
            <div className="card">
              <div className="num">04 / EVALUATION</div>
              <h3>MEAL & Evaluation</h3>
              <p>Baseline, midterm, endline, impact evaluation, third-party monitoring and learning.</p>
              <Link className="link" to="/section/evaluations">Evaluation →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="dark">
        <div className="wrap">
          <div className="eyebrow2">Research agenda</div>
          <h2>Thematic Research Areas</h2>
          <p className="lead">
            SOSARI's research and consultancy activities address key development, governance, and
            socio-economic challenges across multiple sectors, generating high-quality evidence
            that informs decision-making, policy development, and programme design.
          </p>
          <div className="themes">
            <div className="theme"><b>Human Development</b><p>Health • Nutrition • Education • Population • Gender & Youth</p></div>
            <div className="theme"><b>Social Protection & Community Resilience</b><p>Protection Systems • Livelihoods • Displacement • Peacebuilding</p></div>
            <div className="theme"><b>Environment & Natural Resources</b><p>WASH • Climate Adaptation • Natural Resource Management</p></div>
            <div className="theme"><b>Governance & Public Policy</b><p>Institutions • Service Delivery • Accountability • Rule of Law</p></div>
            <div className="theme"><b>Economic Development</b><p>Private Sector • Enterprise • Markets • Employment</p></div>
          </div>
        </div>
      </section>

      <section className="process">
        <div className="wrap">
          <div className="eyebrow2">SOSARI evidence cycle</div>
          <h2>From a question to a decision—and from a decision to learning.</h2>
          <div className="flow">
            <div className="step"><b>01 · FRAME</b><span>Define the question</span></div>
            <div className="step"><b>02 · MEASURE</b><span>Collect credible data</span></div>
            <div className="step"><b>03 · ANALYSE</b><span>Generate evidence</span></div>
            <div className="step"><b>04 · TRANSLATE</b><span>Inform policy</span></div>
            <div className="step"><b>05 · ACT</b><span>Support decisions</span></div>
            <div className="step"><b>06 · LEARN</b><span>Evaluate & improve</span></div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="eyebrow2">Featured</div>
          <h2>Latest from SOSARI.</h2>
          <p className="lead">Recent publications, briefs and updates selected by the SOSARI team.</p>
          {loading ? (
            <Loader />
          ) : featured.length === 0 ? (
            <p className="lead">No featured content yet — add some from the admin panel.</p>
          ) : (
            <div className="pubs">
              {featured.map((item) => <ContentCard key={item.id} item={item} />)}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="ctaBand">
            <div>
              <div className="eyebrow2">Partner with SOSARI</div>
              <h2>Have a research, data, policy or evaluation challenge?</h2>
              <p>Bring the question. SOSARI can assemble the appropriate methods, expertise and evidence pathway.</p>
            </div>
            <div className="actions">
              <Link className="btn" to="/partner">Start a conversation →</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}