import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { fetchFeaturedHome } from "../utils/content";
import ContentCard from "../components/ContentCard";
import Loader from "../components/Loader";

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

  return (
    <>
      <header className="hero">
        <div className="heroGlow" aria-hidden="true"></div>
        <div className="heroGrid" aria-hidden="true"></div>
        <div className="hero-in">
          <div className="eyebrow reveal">{hero.eyebrow}</div>
          <h1 className="reveal" style={{ "--reveal-delay": "80ms" }}>{hero.title}</h1>
          <p className="reveal" style={{ "--reveal-delay": "160ms" }}>{hero.text}</p>
          <div className="actions reveal" style={{ "--reveal-delay": "240ms" }}>
            <Link className="btn" to="/section/research-areas">Explore Research →</Link>
            <Link className="btn outline" to="/section/data">Explore Data</Link>
            <Link className="btn outline" to="/partner">Partner With SOSARI</Link>
          </div>
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
              <Link className="link" to="/section/research-areas">Research agenda →</Link>
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
            <div className="theme"><b>Human Development</b><p>Health • Nutrition • Education</p></div>
            <div className="theme"><b>Social Protection & Community Resilience</b><p>Protection • Livelihoods • Community Resilience</p></div>
            <div className="theme"><b>Environment & Natural Resources</b><p>WASH • Climate Change • Natural Resource Management</p></div>
            <div className="theme"><b>Governance & Policy Systems</b><p>Governance • Public Policy • Institutional Development</p></div>
            <div className="theme"><b>Economic Development</b><p>Private Sector • Enterprise & Markets • Employment</p></div>
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