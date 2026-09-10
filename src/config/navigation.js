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
      { label: "Partners & Networks", key: "about/partners-networks" },
      { label: "Careers", key: "about/careers" },
    ],
  },
  {
    label: "RESEARCH",
    key: "research",
    groups: [
      {
        subcap: "Human Development",
        items: [
          { label: "Health & Health Systems", key: "research/health-health-systems" },
          { label: "Nutrition & Food Security", key: "research/nutrition-food-security" },
          { label: "Education & Skills Development", key: "research/education-skills-development" },
          { label: "Population & Demographic Change", key: "research/population-demographic-change" },
          { label: "Gender, Youth & Social Inclusion", key: "research/gender-youth-social-inclusion" },
        ],
      },
      {
        subcap: "Social Protection & Community Resilience",
        items: [
          { label: "Social Protection Systems", key: "research/social-protection-systems" },
          { label: "Livelihoods & Household Resilience", key: "research/livelihoods-household-resilience" },
          { label: "Community Resilience", key: "research/community-resilience" },
          { label: "Displacement, Protection & Durable Solutions", key: "research/displacement-protection-durable-solutions" },
          { label: "Social Cohesion & Peacebuilding", key: "research/social-cohesion-peacebuilding" },
          { label: "Vulnerability & Inclusion", key: "research/vulnerability-inclusion" },
        ],
      },
      {
        subcap: "Environment & Natural Resources",
        items: [
          { label: "Water, Sanitation & Hygiene (WASH)", key: "research/wash" },
          { label: "Climate Change & Adaptation", key: "research/climate-change-adaptation" },
          { label: "Environmental Sustainability", key: "research/environmental-sustainability" },
          { label: "Natural Resource Management", key: "research/natural-resource-management" },
          { label: "Land, Agriculture & Rangelands", key: "research/land-agriculture-rangelands" },
          { label: "Disaster Risk & Environmental Resilience", key: "research/disaster-risk-environmental-resilience" },
        ],
      },
      {
        subcap: "Governance & Public Policy",
        items: [
          { label: "Governance & Institutions", key: "research/governance-institutions" },
          { label: "Public Policy & Service Delivery", key: "research/public-policy-service-delivery" },
          { label: "Public Administration & Local Governance", key: "research/public-administration-local-governance" },
          { label: "Accountability, Transparency & Citizen Engagement", key: "research/accountability-transparency-citizen-engagement" },
          { label: "Justice, Rule of Law & Social Institutions", key: "research/justice-rule-of-law-social-institutions" },
          { label: "Decentralisation & State–Society Relations", key: "research/decentralisation-state-society-relations" },
        ],
      },
      {
        subcap: "Economic Development",
        items: [
          { label: "Private Sector Development", key: "research/private-sector-development" },
          { label: "Enterprise & Entrepreneurship", key: "research/enterprise-entrepreneurship" },
          { label: "Markets & Value Chains", key: "research/markets-value-chains" },
          { label: "Employment, Skills & Labour Markets", key: "research/employment-skills-labour-markets" },
          { label: "Economic Inclusion & Financial Access", key: "research/economic-inclusion-financial-access" },
          { label: "Local Economic Development", key: "research/local-economic-development" },
        ],
      },
    ],
  },
  {
    label: "DATA & STATISTICS",
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
    label: "POLICY & ADVISORY",
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
    label: "EVALUATIONS",
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
    label: "KNOWLEDGE",
    key: "knowledge",
    cap: "Evidence & Knowledge",
    items: [
      { label: "Research Reports", key: "knowledge/research-reports" },
      { label: "Policy Briefs", key: "knowledge/policy-briefs" },
      { label: "Working Papers", key: "knowledge/working-papers" },
      { label: "Technical & Statistical Reports", key: "knowledge/technical-statistical-reports" },
      { label: "Evaluation Reports", key: "knowledge/evaluation-reports" },
      { label: "Case Studies", key: "knowledge/case-studies" },
      { label: "Insights & Analysis", key: "knowledge/insights-analysis" },
    ],
  },
  {
    label: "DIALOGUE",
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