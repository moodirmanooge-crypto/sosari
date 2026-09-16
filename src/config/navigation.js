// Central navigation configuration.
// Every navbar item (top-level label AND every dropdown link) maps to a
// unique "sectionKey" used to store & fetch content from Firestore
// (collection "content", field sectionKey).
//
// This mirrors the SOSARI prototype navbar exactly:
// ABOUT | RESEARCH (two-level) | DATA & STATISTICS | POLICY & ADVISORY |
// EVALUATIONS | KNOWLEDGE | DIALOGUE | (CTA) PARTNER WITH SOSARI
//
// Changing this file changes the navbar AND automatically creates
// working pages for every item (no other code changes required).

export const DEFAULT_NAV = [
  {
    label: "About",
    key: "about",
    cap: "Institution",
    items: [
      { label: "Who We Are", key: "about/who-we-are" },
      { label: "Vision, Mission & Values", key: "about/vision-mission-values" },
      { label: "Governance & Independence", key: "about/governance-independence" },
      { label: "Leadership", key: "about/leadership" },
      { label: "Our Team", key: "about/our-team" },
      { label: "Partners & Networks", key: "about/partners-networks" },
      { label: "Careers", key: "about/careers" },
      { label: "Annual Report", key: "knowledge/annual-report" },
    ],
  },
  {
    label: "Research Areas",
    key: "research",
    groups: [
      {
        subcap: "Human Development",
        items: [
          { label: "Health & Health Systems", key: "research/health-health-systems" },
          { label: "Nutrition & Food Security", key: "research/nutrition-food-security" },
          { label: "Education & Skills", key: "research/education-skills" },
          { label: "Population & Demographic Change", key: "research/population-demographic-change" },
        ],
      },
      {
        subcap: "Environment & Natural Resources",
        items: [
          { label: "WASH", key: "research/wash" },
          { label: "Climate Change & Adaptation", key: "research/climate-change-adaptation" },
          { label: "Environmental Sustainability", key: "research/environmental-sustainability" },
          { label: "Agriculture & Rangelands", key: "research/agriculture-rangelands" },
          { label: "Disaster Risk & Resilience", key: "research/disaster-risk-resilience" },
        ],
      },
      {
        subcap: "Governance & Public Policy",
        items: [
          { label: "Governance & Institutions", key: "research/governance-institutions" },
          { label: "Public Policy & Service Delivery", key: "research/public-policy-service-delivery" },
          { label: "Public Administration & Local Governance", key: "research/public-administration-local-governance" },
          { label: "Accountability & Citizen Engagement", key: "research/accountability-citizen-engagement" },
          { label: "Justice & Rule of Law", key: "research/justice-rule-of-law" },
        ],
      },
      {
        subcap: "Social Protection & Inclusion",
        items: [
          { label: "Social Protection", key: "research/social-protection" },
          { label: "Livelihoods & Household Resilience", key: "research/livelihoods-household-resilience" },
          { label: "Gender, Youth & Social Inclusion", key: "research/gender-youth-social-inclusion" },
          { label: "Displacement & Durable Solutions", key: "research/displacement-durable-solutions" },
          { label: "Social Cohesion & Peacebuilding", key: "research/social-cohesion-peacebuilding" },
        ],
      },
      {
        subcap: "Economic Development",
        items: [
          { label: "Private Sector & Enterprise Development", key: "research/private-sector-enterprise-development" },
          { label: "Markets & Value Chains", key: "research/markets-value-chains" },
          { label: "Employment & Labour Markets", key: "research/employment-labour-markets" },
          { label: "Financial & Economic Inclusion", key: "research/financial-economic-inclusion" },
        ],
      },
    ],
  },
  {
    label: "Data & Statistics",
    key: "data",
    cap: "Statistics & Analytics",
    items: [
      { label: "SOSARI Data Portal", key: "data/sosari-data-portal" },
      { label: "Surveys & Field Research", key: "data/surveys-field-research" },
      { label: "Statistical Analysis & Evidence", key: "data/statistical-analysis-evidence" },
      { label: "GIS & Geospatial Analysis", key: "data/gis-geospatial-analysis" },
    ],
  },
  {
    label: "Policy & Advisory",
    key: "policies",
    cap: "Evidence to decisions",
    items: [
      { label: "Applied Policy Research", key: "policies/applied-policy-research" },
      { label: "Policy Analysis & Reform", key: "policies/policy-analysis-reform" },
      { label: "Strategic & Institutional Advisory", key: "policies/strategic-institutional-advisory" },
      { label: "Programme & Project Design", key: "policies/programme-project-design" },
      { label: "Technical Assistance", key: "policies/technical-assistance" },
      { label: "Policy & Programme Implementation", key: "policies/policy-programme-implementation" },
    ],
  },
  {
    label: "Evaluations",
    key: "evaluations",
    cap: "Measurement, evaluation & learning",
    items: [
      { label: "Monitoring & Results Tracking", key: "evaluations/monitoring-results-tracking" },
      { label: "Baseline & Diagnostic Studies", key: "evaluations/baseline-diagnostic-studies" },
      { label: "Midterm & Process Reviews", key: "evaluations/midterm-process-reviews" },
      { label: "Endline & Outcome Evaluations", key: "evaluations/endline-outcome-evaluations" },
      { label: "Impact Evaluation", key: "evaluations/impact-evaluation" },
      { label: "Third-Party Monitoring", key: "evaluations/third-party-monitoring" },
    ],
  },
  {
    label: "Knowledge",
    key: "knowledge",
    cap: "Evidence & Knowledge",
    items: [
      { label: "Publications", key: "knowledge/publications" },
      { label: "Research Reports", key: "knowledge/research-reports" },
      { label: "Research Papers", key: "knowledge/research-papers" },
      { label: "Policy Briefs", key: "knowledge/policy-briefs" },
      { label: "Case Studies", key: "knowledge/case-studies" },
      { label: "Insights & Analysis", key: "knowledge/insights-analysis" },
    ],
  },
  {
    label: "Dialogue",
    key: "dialogue",
    cap: "Convening & Dialogue",
    items: [
      { label: "SOSARI Policy Forum", key: "dialogue/sosari-policy-forum" },
      { label: "Policy & Stakeholder Dialogues", key: "dialogue/policy-stakeholder-dialogues" },
      { label: "Expert Roundtables", key: "dialogue/expert-roundtables" },
      { label: "Conferences & Webinars", key: "dialogue/conferences-webinars" },
    ],
  },
];

export const FOOTER_NAV = [
  {
    title: "INSTITUTE",
    items: [
      { label: "About SOSARI", key: "about/who-we-are" },
      { label: "Leadership & Governance", key: "about/leadership" },
      { label: "Our Team", key: "about/our-team" },
      { label: "Partners & Networks", key: "about/partners-networks" },
      { label: "Careers", key: "about/careers" },
    ],
  },
  {
    title: "WORK",
    items: [
      { label: "Research", key: "research", isParent: true },
      { label: "Data & Statistics", key: "data", isParent: true },
      { label: "Policy & Advisory", key: "policies", isParent: true },
      { label: "Evaluation & Learning", key: "evaluations", isParent: true },
      { label: "Capacity Development", key: "policies/technical-assistance" },
    ],
  },
  {
    title: "KNOWLEDGE & ENGAGEMENT",
    items: [
      { label: "Knowledge", key: "knowledge", isParent: true },
      { label: "Data & Statistics", key: "data", isParent: true },
      { label: "Dialogue", key: "dialogue", isParent: true },
      { label: "Insights", key: "knowledge/insights-analysis" },
      { label: "Contact", key: "__partner__" },
    ],
  },
];

// Flat lookup: sectionKey -> { label, parentLabel, parentKey }
export function buildSectionIndex(nav = DEFAULT_NAV) {
  const idx = {};
  for (const group of nav) {
    const parentItems = group.items || (group.groups ? group.groups.flatMap((g) => g.items) : []);
    idx[group.key] = { label: group.label, parentLabel: group.label, parentKey: group.key, isParent: true };
    for (const it of parentItems) {
      idx[it.key] = { label: it.label, parentLabel: group.label, parentKey: group.key };
    }
  }
  return idx;
}

export const SECTION_INDEX = buildSectionIndex(DEFAULT_NAV);