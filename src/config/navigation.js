// Central navigation configuration.
// Every navbar item (top-level label AND every dropdown link) maps to a
// unique "sectionKey" used to store & fetch content from Firestore
// (collection "content", field sectionKey).
//
// Changing this file changes the navbar AND automatically creates
// working pages for every item (no other code changes required).

export const NAV = [
  {
    label: "ABOUT",
    key: "about",
    cap: "Institution",
    items: [
      { label: "Who We Are", key: "about/who-we-are" },
      { label: "Vision, Mission & Values", key: "about/vision-mission-values" },
      { label: "Governance & Independence", key: "about/governance-independence" },
      { label: "Leadership", key: "about/leadership" },
      { label: "Our Team", key: "about/our-team" },
      { label: "Experts, Fellows & Associates", key: "about/experts-fellows-associates" },
      { label: "Partners & Networks", key: "about/partners-networks" },
      { label: "Careers", key: "about/careers" },
    ],
  },
  {
    label: "RESEARCH AREAS",
    key: "research-areas",
    groups: [
      {
        subcap: "Human Development",
        items: [
          { label: "Health", key: "research-areas/health" },
          { label: "Nutrition", key: "research-areas/nutrition" },
          { label: "Education", key: "research-areas/education" },
        ],
      },
      {
        subcap: "Social Protection & Community Resilience",
        items: [
          { label: "Protection", key: "research-areas/protection" },
          { label: "Livelihoods", key: "research-areas/livelihoods" },
          { label: "Community Resilience", key: "research-areas/community-resilience" },
        ],
      },
      {
        subcap: "Environment & Natural Resources",
        items: [
          { label: "Water, Sanitation & Hygiene (WASH)", key: "research-areas/wash" },
          { label: "Climate Change", key: "research-areas/climate-change" },
          { label: "Natural Resource Management", key: "research-areas/natural-resource-management" },
        ],
      },
      {
        subcap: "Governance & Policy Systems",
        items: [
          { label: "Governance", key: "research-areas/governance" },
          { label: "Public Policy", key: "research-areas/public-policy" },
          { label: "Institutional Development", key: "research-areas/institutional-development" },
        ],
      },
      {
        subcap: "Economic Development",
        items: [
          { label: "Private Sector Development", key: "research-areas/private-sector-development" },
          { label: "Enterprise & Market Systems", key: "research-areas/enterprise-market-systems" },
          { label: "Employment & Economic Inclusion", key: "research-areas/employment-economic-inclusion" },
        ],
      },
    ],
  },
  {
    label: "DATA",
    key: "data",
    cap: "Statistics & analytics",
    items: [
      { label: "SOSARI Data Portal", key: "data/sosari-data-portal" },
      { label: "Surveys & Field Research", key: "data/surveys-field-research" },
      { label: "Digital Data Collection", key: "data/digital-data-collection" },
      { label: "Statistics & Analysis", key: "data/statistics-analysis" },
      { label: "Data Science & Analytics", key: "data/data-science-analytics" },
      { label: "GIS & Geospatial Analysis", key: "data/gis-geospatial-analysis" },
      { label: "Data Quality & Management", key: "data/data-quality-management" },
    ],
  },
  {
    label: "POLICIES",
    key: "policies",
    cap: "Evidence to decisions",
    items: [
      { label: "Policy Research", key: "policies/policy-research" },
      { label: "Policy Analysis", key: "policies/policy-analysis" },
      { label: "Strategic Advisory", key: "policies/strategic-advisory" },
      { label: "Institutional Development", key: "policies/institutional-development" },
      { label: "Programme Design", key: "policies/programme-design" },
      { label: "Technical Assistance", key: "policies/technical-assistance" },
      { label: "Policy Dialogue", key: "policies/policy-dialogue" },
    ],
  },
  {
    label: "EVALUATIONS",
    key: "evaluations",
    cap: "Measurement & learning",
    items: [
      { label: "Monitoring", key: "evaluations/monitoring" },
      { label: "Baseline Studies", key: "evaluations/baseline-studies" },
      { label: "Midterm Reviews", key: "evaluations/midterm-reviews" },
      { label: "Endline Evaluations", key: "evaluations/endline-evaluations" },
      { label: "Impact Evaluation", key: "evaluations/impact-evaluation" },
      { label: "Third-Party Monitoring", key: "evaluations/third-party-monitoring" },
      { label: "Accountability & Learning", key: "evaluations/accountability-learning" },
    ],
  },
  {
    label: "PUBLICATIONS",
    key: "publications",
    cap: "Authoritative knowledge",
    items: [
      { label: "Research Reports", key: "publications/research-reports" },
      { label: "Policy Briefs", key: "publications/policy-briefs" },
      { label: "Working Papers", key: "publications/working-papers" },
      { label: "Discussion Papers", key: "publications/discussion-papers" },
      { label: "Technical Reports", key: "publications/technical-reports" },
      { label: "Statistical Reports", key: "publications/statistical-reports" },
      { label: "Evaluation Reports", key: "publications/evaluation-reports" },
      { label: "Academic Articles", key: "publications/academic-articles" },
      { label: "Commentaries & Analysis", key: "publications/commentaries-analysis" },
      { label: "Case Studies", key: "publications/case-studies" },
      { label: "Annual Reports", key: "publications/annual-reports" },
    ],
  },
  {
    label: "FORUMS",
    key: "forums",
    cap: "Convening & dialogue",
    items: [
      { label: "Forums & Dialogues", key: "forums/forums-dialogues" },
      { label: "SOSARI Policy Forum", key: "forums/sosari-policy-forum" },
      { label: "Research Dialogues", key: "forums/research-dialogues" },
      { label: "Expert Roundtables", key: "forums/expert-roundtables" },
      { label: "Conferences & Webinars", key: "forums/conferences-webinars" },
      { label: "Podcasts", key: "forums/podcasts" },
      { label: "Expert Conversations", key: "forums/expert-conversations" },
      { label: "Research Explained", key: "forums/research-explained" },
      { label: "Videos", key: "forums/videos" },
      { label: "Research Briefings", key: "forums/research-briefings" },
      { label: "Panel Discussions", key: "forums/panel-discussions" },
      { label: "Event Recordings", key: "forums/event-recordings" },
      { label: "Media Centre", key: "forums/media-centre" },
    ],
  },
];

export const FOOTER_NAV = [
  {
    title: "INSTITUTE",
    items: [
      { label: "About SOSARI", key: "about/who-we-are" },
      { label: "Leadership & Governance", key: "about/leadership" },
      { label: "Team & Experts", key: "about/our-team" },
      { label: "Partners & Networks", key: "about/partners-networks" },
      { label: "Careers", key: "about/careers" },
    ],
  },
  {
    title: "WORK",
    items: [
      { label: "Research", key: "research-areas", isParent: true },
      { label: "Data & Statistics", key: "data", isParent: true },
      { label: "Policy & Advisory", key: "policies", isParent: true },
      { label: "MEAL & Evaluation", key: "evaluations", isParent: true },
      { label: "Capacity Development", key: "policies/institutional-development" },
    ],
  },
  {
    title: "PUBLICATIONS & FORUMS",
    items: [
      { label: "Publications", key: "publications", isParent: true },
      { label: "Policy Briefs", key: "publications/policy-briefs" },
      { label: "Forums & Dialogues", key: "forums/forums-dialogues" },
      { label: "Podcasts & Videos", key: "forums/podcasts" },
      { label: "Datasets", key: "data/sosari-data-portal" },
      { label: "Insights", key: "forums/research-explained" },
      { label: "Contact", key: "__partner__" },
    ],
  },
];

// Flat lookup: sectionKey -> { label, parentLabel, parentKey }
export function buildSectionIndex() {
  const idx = {};
  for (const group of NAV) {
    const parentItems = group.items || (group.groups ? group.groups.flatMap((g) => g.items) : []);
    idx[group.key] = { label: group.label, parentLabel: group.label, parentKey: group.key, isParent: true };
    for (const it of parentItems) {
      idx[it.key] = { label: it.label, parentLabel: group.label, parentKey: group.key };
    }
  }
  return idx;
}

export const SECTION_INDEX = buildSectionIndex();
