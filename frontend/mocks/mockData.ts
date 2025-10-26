import type { User } from "@/types";

export const mockUsers: User[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@migeprof.gov.rw",
    role: "admin",
    status: "active",
  },
  {
    id: "2",
    username: "stakeholder_admin",
    email: "admin@care.org",
    role: "stakeholder_admin",
    status: "active",
    stakeholderId: "care-rwanda",
    stakeholderName: "CARE Rwanda",
    subClusters: [
      { id: "family-gbv", name: "Family Promotion & Anti-GBV" },
      { id: "women", name: "Women Empowerment" },
    ],
  },
  {
    id: "3",
    username: "stakeholder_user",
    email: "user@care.org",
    role: "stakeholder_user",
    status: "active",
    stakeholderId: "care-rwanda",
    stakeholderName: "CARE Rwanda",
    subClusters: [{ id: "family-gbv", name: "Family Promotion & Anti-GBV" }],
  },
  {
    id: "4",
    username: "gbv_focal",
    email: "gbv.focal@migeprof.gov.rw",
    role: "subclusterfocalperson",
    status: "active",
    subClusters: [{ id: "family-gbv", name: "Family Promotion & Anti-GBV" }],
  },
  {
    id: "5",
    username: "worldvision_admin",
    email: "admin@worldvision.org",
    role: "stakeholder_admin",
    status: "active",
    stakeholderId: "worldvision-rwanda",
    stakeholderName: "World Vision Rwanda",
    subClusters: [
      { id: "youth", name: "Youth Development" },
      { id: "family-gbv", name: "Family Promotion & Anti-GBV" },
    ],
  },
  {
    id: "6",
    username: "youth_focal",
    email: "youth.focal@migeprof.gov.rw",
    role: "subclusterfocalperson",
    status: "active",
    subClusters: [{ id: "youth", name: "Youth Development" }],
  },
];

export const auditLogs = [
  {
    ts: new Date().toISOString(),
    actor: "admin",
    action: "LOGIN",
    details: "admin signed in",
  },
  {
    ts: new Date().toISOString(),
    actor: "admin",
    action: "CREATE_USER",
    details: "stakeholder2",
  },
];

export const subClusters = [
  { id: "family-gbv", name: "Family Promotion & Anti-GBV" },
  { id: "child-protection", name: "Child Protection" },
  { id: "women", name: "Women Empowerment" },
  { id: "youth", name: "Youth Development" },
  { id: "social-protection", name: "Social Protection" },
];

export const kpiCategories = [
  // Family Promotion & Anti-GBV Categories
  { id: "gbv-prevention", name: "GBV Prevention", subCluster: "family-gbv" },
  { id: "gbv-response", name: "GBV Response", subCluster: "family-gbv" },
  {
    id: "reintegration",
    name: "Reintegration for GBV Victims",
    subCluster: "family-gbv",
  },
  {
    id: "family-promotion",
    name: "Family Promotion",
    subCluster: "family-gbv",
  },

  // Child Protection Categories
  {
    id: "child-protection-services",
    name: "Child Protection Services",
    subCluster: "child-protection",
  },
  {
    id: "family-reunification",
    name: "Family Reunification",
    subCluster: "child-protection",
  },
  {
    id: "capacity-building",
    name: "Capacity Building",
    subCluster: "child-protection",
  },

  // Women Empowerment Categories
  {
    id: "economic-empowerment",
    name: "Economic Empowerment",
    subCluster: "women",
  },
  { id: "leadership", name: "Leadership", subCluster: "women" },
  {
    id: "financial-inclusion",
    name: "Financial Inclusion",
    subCluster: "women",
  },

  // Youth Development Categories
  { id: "skills-development", name: "Skills Development", subCluster: "youth" },
  { id: "entrepreneurship", name: "Entrepreneurship", subCluster: "youth" },
  { id: "youth-engagement", name: "Youth Engagement", subCluster: "youth" },

  // Social Protection Categories
  {
    id: "social-safety-nets",
    name: "Social Safety Nets",
    subCluster: "social-protection",
  },
  {
    id: "disability-support",
    name: "Disability Support",
    subCluster: "social-protection",
  },
];

export const kpis = [
  // Family Promotion & Anti-GBV Sub-Cluster KPIs
  {
    id: "capacity-building-workshops",
    name: "Number of capacity building and workshops",
    unit: "workshops",
    subCluster: "family-gbv",
    category: "gbv-prevention",
    description: "Capacity building sessions and workshops conducted",
    disaggregation: [
      {
        id: "workshop-type",
        name: "Workshop Type",
        options: [
          { id: "community", name: "Community" },
          { id: "school", name: "School" },
          { id: "institutional", name: "Institutional" },
        ],
      },
    ],
  },
  {
    id: "people-reached",
    name: "Number of people reached",
    unit: "people",
    subCluster: "family-gbv",
    category: "gbv-prevention",
    description:
      "Total number of people reached through GBV prevention activities",
    disaggregation: [
      {
        id: "gender",
        name: "Gender",
        options: [
          { id: "male", name: "Male" },
          { id: "female", name: "Female" },
        ],
      },
    ],
  },
  {
    id: "awareness-campaigns",
    name: "Number of awareness campaigns conducted",
    unit: "campaigns",
    subCluster: "family-gbv",
    category: "gbv-prevention",
    description: "Awareness campaigns through various media channels",
    disaggregation: [
      {
        id: "media-type",
        name: "Media Type",
        options: [
          { id: "radio", name: "Radio" },
          { id: "tv", name: "TV" },
          { id: "social-media", name: "Social Media" },
        ],
      },
    ],
  },

  // GBV Response Category
  {
    id: "reported-gbv-cases",
    name: "Number of reported GBV cases",
    unit: "cases",
    subCluster: "family-gbv",
    category: "gbv-response",
    description: "GBV cases officially reported through various channels",
    disaggregation: [
      {
        id: "reporting-channel",
        name: "Reporting Channel",
        options: [
          { id: "hotline", name: "Hotline" },
          { id: "health-facility", name: "Health Facility" },
          { id: "police", name: "Police" },
        ],
      },
    ],
  },
  {
    id: "victims-medical-psychological",
    name: "Number of victims who received medical and psychological support",
    unit: "victims",
    subCluster: "family-gbv",
    category: "gbv-response",
    description: "GBV victims accessing medical and psychological services",
    disaggregation: [
      {
        id: "support-type",
        name: "Support Type",
        options: [
          { id: "medical", name: "Medical" },
          { id: "psychological", name: "Psychological" },
          { id: "both", name: "Both" },
        ],
      },
    ],
  },
  {
    id: "victims-safe-shelters",
    name: "Number of victims provided with safe shelters",
    unit: "victims",
    subCluster: "family-gbv",
    category: "gbv-response",
    description: "GBV victims provided with safe shelter accommodation",
    disaggregation: [
      {
        id: "shelter-type",
        name: "Shelter Type",
        options: [
          { id: "safe-house", name: "Safe House" },
          { id: "temporary-shelter", name: "Temporary Shelter" },
        ],
      },
    ],
  },

  // Reintegration for GBV Victims Category
  {
    id: "victims-reintegrated",
    name: "Number of GBV victims successfully reintegrated",
    unit: "victims",
    subCluster: "family-gbv",
    category: "reintegration",
    description: "GBV victims successfully reintegrated into communities",
    disaggregation: [
      {
        id: "reintegration-type",
        name: "Reintegration Type",
        options: [
          { id: "family", name: "Family" },
          { id: "community", name: "Community" },
        ],
      },
    ],
  },

  // Family Promotion Category
  {
    id: "family-counseling-sessions",
    name: "Number of family counseling sessions conducted",
    unit: "sessions",
    subCluster: "family-gbv",
    category: "family-promotion",
    description: "Family counseling and mediation sessions",
    disaggregation: [],
  },
  {
    id: "positive-parenting-training",
    name: "Number of positive parenting training sessions",
    unit: "sessions",
    subCluster: "family-gbv",
    category: "family-promotion",
    description: "Training sessions on positive parenting techniques",
    disaggregation: [
      {
        id: "participant-type",
        name: "Participant Type",
        options: [
          { id: "parents", name: "Parents" },
          { id: "caregivers", name: "Caregivers" },
        ],
      },
    ],
  },

  // Child Protection Sub-Cluster KPIs
  {
    id: "children-case-management",
    name: "Number of children in case management",
    unit: "children",
    subCluster: "child-protection",
    category: "child-protection-services",
    description: "Children receiving case management services",
    disaggregation: [
      {
        id: "age-group",
        name: "Age Group",
        options: [
          { id: "0-5", name: "0-5 years" },
          { id: "6-12", name: "6-12 years" },
          { id: "13-17", name: "13-17 years" },
        ],
      },
    ],
  },
  {
    id: "child-friendly-spaces",
    name: "Number of child-friendly spaces established",
    unit: "spaces",
    subCluster: "child-protection",
    category: "child-protection-services",
    description: "Safe spaces established for children's activities",
    disaggregation: [],
  },
  {
    id: "child-protection-committees",
    name: "Number of child protection committees formed",
    unit: "committees",
    subCluster: "child-protection",
    category: "child-protection-services",
    description: "Community child protection committees established",
    disaggregation: [],
  },

  // Family Reunification Category
  {
    id: "children-reunified",
    name: "Number of children reunified with families",
    unit: "children",
    subCluster: "child-protection",
    category: "family-reunification",
    description: "Children successfully reunified with their families",
    disaggregation: [],
  },
  {
    id: "family-tracing-cases",
    name: "Number of family tracing cases completed",
    unit: "cases",
    subCluster: "child-protection",
    category: "family-reunification",
    description: "Family tracing and reunification cases completed",
    disaggregation: [],
  },

  // Capacity Building Category
  {
    id: "case-workers-trained",
    name: "Number of case workers trained",
    unit: "workers",
    subCluster: "child-protection",
    category: "capacity-building",
    description: "Case workers receiving professional training",
    disaggregation: [
      {
        id: "training-type",
        name: "Training Type",
        options: [
          { id: "basic", name: "Basic" },
          { id: "advanced", name: "Advanced" },
        ],
      },
    ],
  },
  {
    id: "community-volunteers-trained",
    name: "Number of community volunteers trained",
    unit: "volunteers",
    subCluster: "child-protection",
    category: "capacity-building",
    description: "Community volunteers trained in child protection",
    disaggregation: [],
  },
  {
    id: "training-materials-developed",
    name: "Number of training materials developed",
    unit: "materials",
    subCluster: "child-protection",
    category: "capacity-building",
    description: "Training materials and resources developed",
    disaggregation: [],
  },

  // Women Empowerment Sub-Cluster KPIs
  {
    id: "women-vocational-training",
    name: "Number of women completing vocational training",
    unit: "women",
    subCluster: "women",
    category: "economic-empowerment",
    description: "Women who completed vocational skills training",
    disaggregation: [
      {
        id: "sector",
        name: "Sector",
        options: [
          { id: "agriculture", name: "Agriculture" },
          { id: "handicrafts", name: "Handicrafts" },
          { id: "services", name: "Services" },
        ],
      },
    ],
  },
  {
    id: "business-startups",
    name: "Number of women-led business startups",
    unit: "businesses",
    subCluster: "women",
    category: "economic-empowerment",
    description: "New businesses started by women entrepreneurs",
    disaggregation: [],
  },
  {
    id: "income-generating-activities",
    name: "Number of income-generating activities supported",
    unit: "activities",
    subCluster: "women",
    category: "economic-empowerment",
    description: "Income-generating activities established for women",
    disaggregation: [],
  },

  // Leadership Category
  {
    id: "women-leadership-training",
    name: "Number of women in leadership training",
    unit: "women",
    subCluster: "women",
    category: "leadership",
    description: "Women participating in leadership development programs",
    disaggregation: [],
  },
  {
    id: "women-community-positions",
    name: "Number of women in community leadership positions",
    unit: "women",
    subCluster: "women",
    category: "leadership",
    description: "Women holding formal community leadership roles",
    disaggregation: [],
  },

  // Financial Inclusion Category
  {
    id: "women-financial-literacy",
    name: "Number of women trained in financial literacy",
    unit: "women",
    subCluster: "women",
    category: "financial-inclusion",
    description: "Women receiving financial literacy education",
    disaggregation: [],
  },
  {
    id: "savings-groups-formed",
    name: "Number of women savings groups formed",
    unit: "groups",
    subCluster: "women",
    category: "financial-inclusion",
    description: "Savings and credit groups established for women",
    disaggregation: [],
  },
  {
    id: "women-bank-accounts",
    name: "Number of women accessing formal bank accounts",
    unit: "women",
    subCluster: "women",
    category: "financial-inclusion",
    description: "Women who opened their first formal bank account",
    disaggregation: [],
  },

  // Youth Development Sub-Cluster KPIs
  {
    id: "youth-vocational-training",
    name: "Number of youth in vocational training",
    unit: "youth",
    subCluster: "youth",
    category: "skills-development",
    description: "Youth enrolled in vocational skills training programs",
    disaggregation: [
      {
        id: "training-field",
        name: "Training Field",
        options: [
          { id: "technical", name: "Technical" },
          { id: "agricultural", name: "Agricultural" },
          { id: "business", name: "Business" },
        ],
      },
    ],
  },
  {
    id: "life-skills-training",
    name: "Number of youth in life skills training",
    unit: "youth",
    subCluster: "youth",
    category: "skills-development",
    description: "Youth participating in life skills development programs",
    disaggregation: [],
  },
  {
    id: "digital-literacy-training",
    name: "Number of youth in digital literacy training",
    unit: "youth",
    subCluster: "youth",
    category: "skills-development",
    description: "Youth trained in basic digital skills and computer literacy",
    disaggregation: [],
  },

  // Entrepreneurship Category
  {
    id: "youth-business-plans",
    name: "Number of youth business plans developed",
    unit: "plans",
    subCluster: "youth",
    category: "entrepreneurship",
    description: "Business plans developed by young entrepreneurs",
    disaggregation: [],
  },
  {
    id: "youth-startups-funded",
    name: "Number of youth startups receiving funding",
    unit: "startups",
    subCluster: "youth",
    category: "entrepreneurship",
    description: "Youth-led businesses that received startup funding",
    disaggregation: [],
  },
  {
    id: "entrepreneurship-workshops",
    name: "Number of entrepreneurship workshops conducted",
    unit: "workshops",
    subCluster: "youth",
    category: "entrepreneurship",
    description: "Workshops on entrepreneurship and business management",
    disaggregation: [],
  },

  // Youth Engagement Category
  {
    id: "youth-clubs-established",
    name: "Number of youth clubs established",
    unit: "clubs",
    subCluster: "youth",
    category: "youth-engagement",
    description: "Youth clubs and associations formed in communities",
    disaggregation: [],
  },
  {
    id: "youth-community-projects",
    name: "Number of youth-led community projects",
    unit: "projects",
    subCluster: "youth",
    category: "youth-engagement",
    description: "Community development projects led by youth",
    disaggregation: [],
  },

  // Social Protection Sub-Cluster KPIs
  {
    id: "households-cash-assistance",
    name: "Number of households receiving cash assistance",
    unit: "households",
    subCluster: "social-protection",
    category: "social-safety-nets",
    description: "Vulnerable households receiving social cash transfers",
    disaggregation: [
      {
        id: "assistance-type",
        name: "Assistance Type",
        options: [
          { id: "regular", name: "Regular" },
          { id: "emergency", name: "Emergency" },
        ],
      },
    ],
  },
  {
    id: "vulnerable-children-supported",
    name: "Number of vulnerable children supported",
    unit: "children",
    subCluster: "social-protection",
    category: "social-safety-nets",
    description: "Children from vulnerable households receiving support",
    disaggregation: [],
  },
  {
    id: "social-protection-awareness",
    name: "Number of social protection awareness sessions",
    unit: "sessions",
    subCluster: "social-protection",
    category: "social-safety-nets",
    description: "Community awareness sessions on social protection",
    disaggregation: [],
  },

  // Disability Support Category
  {
    id: "persons-disability-assisted",
    name: "Number of persons with disability assisted",
    unit: "persons",
    subCluster: "social-protection",
    category: "disability-support",
    description: "Persons with disabilities receiving specialized support",
    disaggregation: [
      {
        id: "disability-type",
        name: "Disability Type",
        options: [
          { id: "physical", name: "Physical" },
          { id: "sensory", name: "Sensory" },
          { id: "intellectual", name: "Intellectual" },
        ],
      },
    ],
  },
  {
    id: "assistive-devices-provided",
    name: "Number of assistive devices provided",
    unit: "devices",
    subCluster: "social-protection",
    category: "disability-support",
    description: "Assistive devices and mobility aids provided",
    disaggregation: [],
  },
];

export const sampleStakeholders = [
  {
    id: "1",
    organizationName: "CARE Rwanda",
    contactPerson: "Jean Baptiste Uwimana",
    email: "j.uwimana@care.org",
    phone: "+250 788 123 456",
    category: "Implementing Partner",
    subClusters: [
      { id: "family-gbv", name: "Family Promotion & Anti-GBV" },
      { id: "women", name: "Women Empowerment" },
    ],
    district: "Gasabo",
    province: "Kigali City",
    status: "Active",
    activePlans: 3,
    completedReports: 8,
    joinDate: "2023-01-15",
  },
  {
    id: "2",
    organizationName: "UN Women Rwanda",
    contactPerson: "Marie Claire Mukamana",
    email: "marie.mukamana@unwomen.org",
    phone: "+250 788 234 567",
    category: "Development Partner",
    subClusters: [{ id: "women", name: "Women Empowerment" }],
    district: "Nyarugenge",
    province: "Kigali City",
    status: "Active",
    activePlans: 2,
    completedReports: 12,
    joinDate: "2022-08-20",
  },
  {
    id: "3",
    organizationName: "World Vision Rwanda",
    contactPerson: "David Nkurunziza",
    email: "david.nkurunziza@wvi.org",
    phone: "+250 788 345 678",
    category: "Implementing Partner",
    subClusters: [
      { id: "youth", name: "Youth Development" },
      { id: "family-gbv", name: "Family Promotion & Anti-GBV" },
    ],
    district: "Kicukiro",
    province: "Kigali City",
    status: "Inactive",
    activePlans: 0,
    completedReports: 5,
    joinDate: "2023-03-10",
  },
  {
    id: "4",
    organizationName: "Partners in Health Rwanda",
    contactPerson: "Agnes Binagwaho",
    email: "a.binagwaho@pih.org",
    phone: "+250 788 456 789",
    category: "Implementing Partner",
    subClusters: [{ id: "family-gbv", name: "Family Promotion & Anti-GBV" }],
    district: "Burera",
    province: "Northern Province",
    status: "Active",
    activePlans: 1,
    completedReports: 3,
    joinDate: "2023-06-01",
  },
];

export const plansData = [
  { month: "Jul", plans: 8 },
  { month: "Aug", plans: 10 },
  { month: "Sep", plans: 9 },
  { month: "Oct", plans: 11 },
  { month: "Nov", plans: 12 },
  { month: "Dec", plans: 13 },
];

export const reportsData = [
  { quarter: "Q1", reports: 12 },
  { quarter: "Q2", reports: 9 },
  { quarter: "Q3", reports: 7 },
  { quarter: "Q4", reports: 10 },
];

export const stakeholdersData = [
  { name: "Family Promotion", value: 10 },
  { name: "Child Protection", value: 8 },
  { name: "Women Empowerment", value: 6 },
  { name: "Youth Development", value: 3 },
];

export const existingPlans = [
  {
    id: "1",
    stakeholder: "CARE Rwanda",
    kpi: "Number of GBV trainings",
    location: "Kigali District",
    plannedValue: 15,
    status: "Active",
  },
  {
    id: "2",
    stakeholder: "UN Women",
    kpi: "Number of GBV trainings",
    location: "Kigali District",
    plannedValue: 8,
    status: "Planning",
  },
];

export const financialYears = [
  { id: "2024-2025", name: "July 2024 - June 2025" },
  { id: "2025-2026", name: "July 2025 - June 2026" },
];

export const provinces = [
  { id: "eastern", name: "EASTERN" },
  { id: "kigali", name: "KIGALI" },
  { id: "northern", name: "NORTHERN" },
  { id: "southern", name: "SOUTHERN" },
  { id: "western", name: "WESTERN" },
];

export const districts = [
  { id: "bugesera", name: "Bugesera", provinceId: "eastern" },
  { id: "gatsibo", name: "Gatsibo", provinceId: "eastern" },
  { id: "kayonza", name: "Kayonza", provinceId: "eastern" },
  { id: "kirehe", name: "Kirehe", provinceId: "eastern" },
  { id: "ngoma", name: "Ngoma", provinceId: "eastern" },
  { id: "nyagatare", name: "Nyagatare", provinceId: "eastern" },
  { id: "rwamagana", name: "Rwamagana", provinceId: "eastern" },
  { id: "gasabo", name: "Gasabo", provinceId: "kigali" },
  { id: "kicukiro", name: "Kicukiro", provinceId: "kigali" },
  { id: "nyarugenge", name: "Nyarugenge", provinceId: "kigali" },
  { id: "burera", name: "Burera", provinceId: "northern" },
  { id: "gakenke", name: "Gakenke", provinceId: "northern" },
  { id: "gicumbi", name: "Gicumbi", provinceId: "northern" },
  { id: "musanze", name: "Musanze", provinceId: "northern" },
  { id: "rulindo", name: "Rulindo", provinceId: "northern" },
  { id: "gisagara", name: "Gisagara", provinceId: "southern" },
  { id: "huye", name: "Huye", provinceId: "southern" },
  { id: "kamonyi", name: "Kamonyi", provinceId: "southern" },
  { id: "muhanga", name: "Muhanga", provinceId: "southern" },
  { id: "nyamagabe", name: "Nyamagabe", provinceId: "southern" },
  { id: "nyanza", name: "Nyanza", provinceId: "southern" },
  { id: "nyaruguru", name: "Nyaruguru", provinceId: "southern" },
  { id: "ruhango", name: "Ruhango", provinceId: "southern" },
  { id: "karongi", name: "Karongi", provinceId: "western" },
  { id: "ngororero", name: "Ngororero", provinceId: "western" },
  { id: "nyabihu", name: "Nyabihu", provinceId: "western" },
  { id: "nyamasheke", name: "Nyamasheke", provinceId: "western" },
  { id: "rubavu", name: "Rubavu", provinceId: "western" },
  { id: "rusizi", name: "Rusizi", provinceId: "western" },
  { id: "rutsiro", name: "Rutsiro", provinceId: "western" },
];

export const actionPlans = [
  {
    id: "1",
    title: "GBV Prevention Training Program",
    description:
      "Comprehensive training program for community leaders on GBV prevention",
    subCluster: "family-gbv",
    kpi: "Number of capacity building and workshops",
    plannedValue: 15,
    actualValue: 8,
    progress: 53,
    status: "Active",
    level: "District",
    location: "Gasabo District",
    financialYear: "2024-2025",
    dueDate: "2025-03-15",
    stakeholder: "CARE Rwanda",
    stakeholderId: "care-rwanda",
  },
  {
    id: "2",
    title: "Women Economic Empowerment Initiative",
    description:
      "Supporting women entrepreneurs through skills training and microfinance",
    subCluster: "women",
    kpi: "Number of women completing vocational training",
    plannedValue: 500,
    actualValue: 320,
    progress: 64,
    status: "Active",
    level: "Province",
    location: "Kigali City",
    financialYear: "2024-2025",
    dueDate: "2025-04-20",
    stakeholder: "UN Women Rwanda",
    stakeholderId: "2",
  },
  {
    id: "3",
    title: "Youth Leadership Development",
    description:
      "Building leadership capacity among young people in rural communities",
    subCluster: "youth",
    kpi: "Number of youth in life skills training",
    plannedValue: 25,
    actualValue: 0,
    progress: 0,
    status: "Planning",
    level: "Country",
    location: "Rwanda",
    financialYear: "2025-2026",
    dueDate: "2025-07-01",
    stakeholder: "World Vision Rwanda",
    stakeholderId: "worldvision-rwanda",
  },
  {
    id: "4",
    title: "Child Protection Program",
    description: "Establishing child protection committees in communities",
    subCluster: "child-protection",
    kpi: "Number of child protection committees formed",
    plannedValue: 10,
    actualValue: 6,
    progress: 60,
    status: "Active",
    level: "District",
    location: "Nyarugenge District",
    financialYear: "2024-2025",
    dueDate: "2025-02-28",
    stakeholder: "World Vision Rwanda",
    stakeholderId: "worldvision-rwanda",
  },
  {
    id: "5",
    title: "Social Protection Support Initiative",
    description: "Providing cash assistance to vulnerable households",
    subCluster: "social-protection",
    kpi: "Number of households receiving cash assistance",
    plannedValue: 200,
    actualValue: 150,
    progress: 75,
    status: "Active",
    level: "District",
    location: "Huye District",
    financialYear: "2024-2025",
    dueDate: "2025-05-30",
    stakeholder: "Partners in Health Rwanda",
    stakeholderId: "4",
  },
];

export const sampleReports = [
  {
    id: "1",
    actionPlanTitle: "GBV Prevention Training Program",
    quarter: "Q1 2024",
    quarterPeriod: "Jul-Sep 2024",
    kpi: "Number of capacity building and workshops",
    plannedValue: 15,
    actualValue: 8,
    achievement: 53,
    status: "Submitted",
    submittedDate: "2024-10-05",
    dueDate: "2024-10-15",
    stakeholder: "CARE Rwanda",
    stakeholderId: "care-rwanda",
    location: "Gasabo District",
    hasDocument: true,
    progressSummary:
      "Successfully conducted 8 training sessions reaching 240 community members...",
    subCluster: "family-gbv",
  },
  {
    id: "2",
    actionPlanTitle: "Women Economic Empowerment Initiative",
    quarter: "Q1 2024",
    quarterPeriod: "Jul-Sep 2024",
    kpi: "Number of women completing vocational training",
    plannedValue: 500,
    actualValue: 320,
    achievement: 64,
    status: "Submitted",
    submittedDate: "2024-09-28",
    dueDate: "2024-10-15",
    stakeholder: "UN Women Rwanda",
    stakeholderId: "2",
    location: "Kigali City",
    hasDocument: true,
    progressSummary:
      "Reached 320 women through skills training and microfinance programs...",
    subCluster: "women",
  },
  {
    id: "3",
    actionPlanTitle: "Youth Leadership Development",
    quarter: "Q2 2024",
    quarterPeriod: "Oct-Dec 2024",
    kpi: "Number of youth in life skills training",
    plannedValue: 25,
    actualValue: null,
    achievement: 0,
    status: "Due",
    submittedDate: null,
    dueDate: "2025-01-15",
    stakeholder: "World Vision Rwanda",
    stakeholderId: "worldvision-rwanda",
    location: "Rwanda",
    hasDocument: false,
    progressSummary: null,
    subCluster: "youth",
  },
  {
    id: "4",
    actionPlanTitle: "Child Protection Program",
    quarter: "Q1 2024",
    quarterPeriod: "Jul-Sep 2024",
    kpi: "Number of child protection committees formed",
    plannedValue: 10,
    actualValue: 6,
    achievement: 60,
    status: "Submitted",
    submittedDate: "2024-10-10",
    dueDate: "2024-10-15",
    stakeholder: "World Vision Rwanda",
    stakeholderId: "worldvision-rwanda",
    location: "Nyarugenge District",
    hasDocument: true,
    progressSummary:
      "Established 6 child protection committees across target communities...",
    subCluster: "child-protection",
  },
];

export const quarters = [
  { id: "q1", name: "Q1 (July - September)", period: "Jul-Sep 2024" },
  { id: "q2", name: "Q2 (October - December)", period: "Oct-Dec 2024" },
  { id: "q3", name: "Q3 (January - March)", period: "Jan-Mar 2025" },
  { id: "q4", name: "Q4 (April - June)", period: "Apr-Jun 2025" },
];

export const stakeholderCategories = [
  { id: "ngo", name: "NGO" },
  { id: "gov", name: "Government" },
  { id: "cso", name: "Civil Society" },
];

export const existingdisaggregation = ["Gender", "Age Group", "Location"];

export const sampleComments = [
  {
    id: "c1",
    target: "Plan #1",
    text: "Please align targets with district capacity",
    author: "focal1",
  },
  {
    id: "c2",
    target: "Report Q1 - Plan #3",
    text: "Include gender disaggregation details",
    author: "focal1",
  },
];

export interface Notification {
  id: string;
  type: "deadline" | "success" | "info" | "warning";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionRequired?: boolean;
}

export const notifications: Notification[] = [
  {
    id: "1",
    type: "deadline",
    title: "Report Deadline Approaching",
    message:
      "Q3 2024 action plan report is due in 3 days. Please submit your progress data.",
    timestamp: "2024-01-15T10:30:00Z",
    isRead: false,
    actionRequired: true,
  },
  {
    id: "2",
    type: "success",
    title: "Action Plan Approved",
    message:
      "Your Gender Equality Initiative 2024 action plan has been approved by the Sub-Cluster Focal Person.",
    timestamp: "2024-01-14T14:20:00Z",
    isRead: false,
  },
  {
    id: "3",
    type: "info",
    title: "New Comment on Report",
    message:
      'Sarah Johnson commented on your Q2 2024 progress report: "Great work on achieving 95% of planned targets."',
    timestamp: "2024-01-14T09:15:00Z",
    isRead: true,
  },
  {
    id: "4",
    type: "warning",
    title: "KPI Target Behind Schedule",
    message:
      "Women Leadership Training program is currently at 60% of planned target. Consider reviewing implementation strategy.",
    timestamp: "2024-01-13T16:45:00Z",
    isRead: true,
  },
  {
    id: "5",
    type: "info",
    title: "System Maintenance Scheduled",
    message:
      "The platform will undergo scheduled maintenance on January 20th from 2:00 AM to 4:00 AM EAT.",
    timestamp: "2024-01-12T11:00:00Z",
    isRead: true,
  },
];
