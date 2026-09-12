// Gives every top-level navbar section its own identity (icon, short
// tagline, and a bespoke blurb) so /section/<parent> pages don't all look
// like the same generic template — each one reads like it was written for
// that section specifically.

export const SECTION_META = {
  about: {
    icon: "institution",
    tagline: "Institution",
    accent: "#0876bd",
    blurb:
      "Who SOSARI is, how it is governed, and the people leading its research, statistics and policy work across Somalia.",
  },
  research: {
    icon: "flask",
    tagline: "Research Agenda",
    accent: "#07867d",
    blurb:
      "Applied, policy-relevant research organised around five thematic pillars — from human development to economic growth.",
  },
  data: {
    icon: "db",
    tagline: "Statistics & Analytics",
    accent: "#6753c9",
    blurb:
      "Surveys, field research, statistical analysis and geospatial evidence behind the SOSARI Data & Evidence Portal.",
  },
  policies: {
    icon: "bulb",
    tagline: "Evidence to Decisions",
    accent: "#c98a1f",
    blurb:
      "Policy research, strategic advisory and implementation support that turns rigorous evidence into practical decisions.",
  },
  evaluations: {
    icon: "chart",
    tagline: "Measurement & Learning",
    accent: "#1f9d6b",
    blurb:
      "Monitoring, baseline and endline studies, and impact evaluation that track what works, for whom, and why.",
  },
  knowledge: {
    icon: "doc",
    tagline: "Evidence & Knowledge",
    accent: "#c9497a",
    blurb:
      "Research reports, policy briefs, working papers and analysis that make SOSARI's evidence accessible and usable.",
  },
  dialogue: {
    icon: "chat",
    tagline: "Convening & Dialogue",
    accent: "#e07a3f",
    blurb:
      "Forums, roundtables, conferences and conversations that connect SOSARI's evidence directly to decision-makers.",
  },
};

export const DEFAULT_SECTION_META = {
  icon: "doc",
  tagline: "SOSARI",
  accent: "#086ead",
  blurb: "",
};