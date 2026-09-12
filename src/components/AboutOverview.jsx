import { motion } from "framer-motion";
import { ABOUT_OVERVIEW } from "../config/aboutContent";
import { IconCheck } from "./Icons";

// Turns "**word**" into a bold, underline-accented <span class="kw">.
function rich(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <span key={i} className="kw">{part.slice(2, -2)}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

// Paragraphs alternate sliding in from the left and right as they scroll
// into view — a distinct entrance pattern used only for this overview,
// instead of the simple up-fade used elsewhere on the site.
function AltParagraph({ text, index }) {
  const fromLeft = index % 2 === 0;
  return (
    <motion.p
      className="aboutOverviewPara"
      initial={{ opacity: 0, x: fromLeft ? -34 : 34 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {rich(text)}
    </motion.p>
  );
}

export default function AboutOverview() {
  const { background, vision, mission, values, facts } = ABOUT_OVERVIEW;

  return (
    <section className="aboutOverview">
      <div className="wrap">
        <motion.div
          className="eyebrow2"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        >
          Who we are
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Background
        </motion.h2>

        <div className="aboutOverviewGrid">
          <div className="aboutOverviewBody">
            {background.map((para, i) => (
              <AltParagraph key={i} text={para} index={i} />
            ))}
          </div>

          <motion.div
            className="aboutFactCard"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {facts.map((f) => (
              <div key={f.label} className="aboutFactRow">
                <span className="aboutFactLabel">{f.label}</span>
                <span className="aboutFactValue">{f.value}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="aboutVM">
          <motion.div
            className="aboutVMCard"
            initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55 }}
          >
            <span className="aboutVMTag">Vision</span>
            <p>{rich(vision)}</p>
          </motion.div>
          <motion.div
            className="aboutVMCard"
            initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            <span className="aboutVMTag aboutVMTagAlt">Mission</span>
            <p>{rich(mission)}</p>
          </motion.div>
        </div>

        <motion.h3
          className="aboutValuesTitle"
          initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Our Values
        </motion.h3>
        <div className="aboutValuesGrid">
          {values.map((v, i) => (
            <motion.div
              key={v.name}
              className="aboutValueCard"
              initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
            >
              <span className="aboutValueIcon"><IconCheck /></span>
              <b>{v.name}</b>
              <p>{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}