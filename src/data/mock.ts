/** Realistic mock data for the AI Health Companion demo. No backend. */

export type ConfidenceTier = "well-established" | "emerging" | "rare-contested";
export type Urgency = "emergency" | "same-day" | "scheduled" | "monitor";

export const patient = {
  id: "pt-4821",
  name: "Amara Wanjiru",
  age: 34,
  sex: "Female",
  region: "Nairobi, Kenya",
  altitude: "1,795 m",
  climate: "Highland subtropical",
  initials: "AW",
  lastSync: "Today, 08:14",
};

export const symptomEntries = [
  {
    id: "s1",
    name: "Night sweats",
    onset: "2026-07-21",
    severity: 6,
    frequency: "4–5 nights / week",
    notes: "Started roughly a week after the new medication.",
    tags: ["Systemic"],
  },
  {
    id: "s2",
    name: "Fatigue",
    onset: "2026-07-18",
    severity: 5,
    frequency: "Most days",
    notes: "Worse in the afternoon, improves after rest.",
    tags: ["Systemic", "Energy"],
  },
  {
    id: "s3",
    name: "Dry cough",
    onset: "2026-07-29",
    severity: 3,
    frequency: "Intermittent",
    notes: "No sputum. Slightly worse outdoors on dusty days.",
    tags: ["Respiratory"],
  },
  {
    id: "s4",
    name: "Headache",
    onset: "2026-08-01",
    severity: 4,
    frequency: "2–3 times / week",
    notes: "Frontal, dull. Responds to hydration.",
    tags: ["Neurological"],
  },
];

export const symptomTrajectory = [
  { date: "Jul 14", sweats: 0, fatigue: 2, cough: 0, headache: 1 },
  { date: "Jul 18", sweats: 1, fatigue: 5, cough: 0, headache: 1 },
  { date: "Jul 21", sweats: 4, fatigue: 5, cough: 0, headache: 2 },
  { date: "Jul 25", sweats: 6, fatigue: 6, cough: 1, headache: 2 },
  { date: "Jul 29", sweats: 6, fatigue: 5, cough: 3, headache: 3 },
  { date: "Aug 01", sweats: 5, fatigue: 5, cough: 3, headache: 4 },
  { date: "Aug 04", sweats: 6, fatigue: 4, cough: 2, headache: 3 },
  { date: "Aug 06", sweats: 5, fatigue: 4, cough: 2, headache: 2 },
];

export const medications = [
  {
    id: "m1",
    name: "Sertraline",
    dose: "50 mg",
    schedule: "Once daily, morning",
    started: "2026-07-12",
    adherence: 92,
    timingGuidance: "Take with food to reduce nausea. Consistent time each day.",
    takenToday: true,
  },
  {
    id: "m2",
    name: "Metformin",
    dose: "500 mg",
    schedule: "Twice daily with meals",
    started: "2025-11-03",
    adherence: 78,
    timingGuidance: "Never on an empty stomach. Skip a dose rather than double up.",
    takenToday: false,
  },
  {
    id: "m3",
    name: "Cetirizine",
    dose: "10 mg",
    schedule: "As needed, evening",
    started: "2026-03-19",
    adherence: 100,
    timingGuidance: "May cause drowsiness — evening dosing preferred.",
    takenToday: true,
  },
];

export const adherenceTrend = [
  { week: "W1", sertraline: 100, metformin: 86 },
  { week: "W2", sertraline: 100, metformin: 79 },
  { week: "W3", sertraline: 86, metformin: 71 },
  { week: "W4", sertraline: 93, metformin: 64 },
  { week: "W5", sertraline: 92, metformin: 78 },
];

/** Disclosure gate: all three criteria must pass before a plain-language cause is named. */
export const disclosureFindings = [
  {
    id: "d1",
    symptom: "Night sweats",
    linkedTo: "Sertraline",
    tier: "well-established" as ConfidenceTier,
    directLink: true,
    benign: true,
    disclosed: true,
    plainLanguage:
      "Night sweating is a documented and common side effect of sertraline. It usually settles over a few weeks and is not harmful. Mention it at your next visit — a dose or timing change often helps.",
    source: "FAERS · DrugBank drug→side-effect record",
  },
  {
    id: "d2",
    symptom: "Dry cough + fatigue",
    linkedTo: "Multiple possible causes",
    tier: "emerging" as ConfidenceTier,
    directLink: false,
    benign: false,
    disclosed: false,
    plainLanguage:
      "This combination has more than one possible explanation, so we are not naming a cause. Based on how long it has lasted, book a scheduled visit within the next week.",
    source: "Routed to urgency guidance only",
  },
  {
    id: "d3",
    symptom: "Headache",
    linkedTo: "Dehydration pattern",
    tier: "well-established" as ConfidenceTier,
    directLink: false,
    benign: true,
    disclosed: false,
    plainLanguage:
      "We can see a pattern between your low-fluid days and your headaches, but we can't confirm a single cause. Keep logging — and see a doctor if it changes character.",
    source: "Routed to urgency guidance only",
  },
];

export const triageAssessments = [
  {
    id: "t1",
    symptom: "Chest tightness with breathlessness",
    urgency: "emergency" as Urgency,
    guidance: "Call emergency services now. Do not drive yourself.",
    rationale: "Conservative routing: cardiopulmonary red-flag combination.",
  },
  {
    id: "t2",
    symptom: "Dry cough persisting past 7 days",
    urgency: "scheduled" as Urgency,
    guidance: "Book a scheduled visit within the next 7 days.",
    rationale: "Duration threshold crossed; no red flags logged.",
  },
  {
    id: "t3",
    symptom: "Night sweats on a new medication",
    urgency: "monitor" as Urgency,
    guidance: "Common and monitorable. Log nightly and raise at your next visit.",
    rationale: "Well-established, direct, benign — disclosure gate passed.",
  },
  {
    id: "t4",
    symptom: "Fever above 39°C for 2 days",
    urgency: "same-day" as Urgency,
    guidance: "Seek same-day care at a clinic today.",
    rationale: "Sustained high fever with regional malaria prevalence prior.",
  },
];

export const labResults = [
  {
    id: "l1",
    panel: "Complete Blood Count",
    date: "2026-08-02",
    source: "Photo + on-device OCR",
    reviewed: true,
    values: [
      { name: "Haemoglobin", value: 11.4, unit: "g/dL", low: 12, high: 15.5, flag: "low" },
      { name: "WBC", value: 7.2, unit: "10⁹/L", low: 4, high: 11, flag: "normal" },
      { name: "Platelets", value: 268, unit: "10⁹/L", low: 150, high: 400, flag: "normal" },
    ],
  },
  {
    id: "l2",
    panel: "Metabolic Panel",
    date: "2026-07-15",
    source: "Manual entry",
    reviewed: true,
    values: [
      { name: "HbA1c", value: 6.8, unit: "%", low: 4, high: 5.7, flag: "high" },
      { name: "Fasting glucose", value: 7.1, unit: "mmol/L", low: 3.9, high: 5.6, flag: "high" },
      { name: "Creatinine", value: 74, unit: "µmol/L", low: 45, high: 90, flag: "normal" },
    ],
  },
  {
    id: "l3",
    panel: "Thyroid Function",
    date: "2026-08-05",
    source: "Photo + on-device OCR",
    reviewed: false,
    values: [
      { name: "TSH", value: 2.4, unit: "mIU/L", low: 0.4, high: 4, flag: "normal" },
      { name: "Free T4", value: 15.1, unit: "pmol/L", low: 12, high: 22, flag: "normal" },
    ],
  },
];

export const hba1cTrend = [
  { month: "Feb", value: 7.6 },
  { month: "Mar", value: 7.4 },
  { month: "Apr", value: 7.3 },
  { month: "May", value: 7.1 },
  { month: "Jun", value: 7.0 },
  { month: "Jul", value: 6.8 },
];

export const medicalHistory = {
  conditions: [
    { name: "Type 2 diabetes", since: "2025", status: "Active" },
    { name: "Allergic rhinitis", since: "2019", status: "Intermittent" },
  ],
  allergies: [
    { name: "Penicillin", reaction: "Urticaria", severity: "High" },
    { name: "Shellfish", reaction: "Oral itching", severity: "Low" },
  ],
  surgeries: [{ name: "Appendectomy", year: "2014" }],
  family: [
    { relation: "Mother", condition: "Type 2 diabetes" },
    { relation: "Father", condition: "Hypertension" },
  ],
};

export const moodCheckIns = [
  { date: "Jul 24", mood: 3, sleep: 5.5, energy: 3 },
  { date: "Jul 27", mood: 4, sleep: 6.2, energy: 4 },
  { date: "Jul 30", mood: 3, sleep: 5.0, energy: 3 },
  { date: "Aug 02", mood: 5, sleep: 7.1, energy: 5 },
  { date: "Aug 04", mood: 6, sleep: 7.4, energy: 6 },
  { date: "Aug 06", mood: 6, sleep: 7.0, energy: 5 },
];

export const environmentContext = {
  location: "Nairobi, Kenya",
  temperature: 21,
  condition: "Overcast, light showers",
  humidity: 78,
  aqi: 62,
  pollen: "Moderate — grass",
  nudges: [
    "Humidity is high today; if you notice more congestion, that pattern is common locally.",
    "Air quality is moderate. Consider indoor exercise if you are cough-sensitive.",
  ],
  prevalence: [
    { condition: "Seasonal influenza", level: 68, trend: "rising" },
    { condition: "Malaria (regional)", level: 24, trend: "stable" },
    { condition: "Allergic rhinitis", level: 54, trend: "rising" },
  ],
};

export const communityThreads = [
  {
    id: "c1",
    subreddit: "r/sertraline",
    title: "Night sweats week 3 — did it stop for you?",
    matchedSymptom: "Night sweats",
    replies: 214,
    sentiment: "Mostly resolved within 4–6 weeks",
    excerpt:
      "Soaked the sheets for about a month, then it tapered off. My doctor moved my dose to the morning and it helped.",
  },
  {
    id: "c2",
    subreddit: "r/diabetes_t2",
    title: "Metformin timing and afternoon crashes",
    matchedSymptom: "Fatigue",
    replies: 87,
    sentiment: "Mixed experiences",
    excerpt: "Splitting the dose with lunch instead of a big morning dose made my afternoons manageable.",
  },
  {
    id: "c3",
    subreddit: "r/AskDocs",
    title: "Dry cough for 10 days, no fever",
    matchedSymptom: "Dry cough",
    replies: 45,
    sentiment: "Advised to see a clinician",
    excerpt: "Everyone said the same thing: after ten days it's worth getting listened to properly.",
  },
];

export const prepQuestions = [
  "Could the night sweats be related to starting sertraline last month?",
  "Is my metformin dose still right given my HbA1c is 6.8%?",
  "My haemoglobin came back at 11.4 — should that be followed up?",
  "Should the dry cough be investigated if it lasts beyond two weeks?",
  "Is there a timing change that would reduce the afternoon fatigue?",
];

/* ---------------- Doctor side ---------------- */

export const doctorQueue = [
  {
    id: "pt-4821",
    name: "Amara Wanjiru",
    age: 34,
    reason: "Night sweats, fatigue, dry cough",
    slot: "09:30",
    flags: ["Med side-effect flag", "Low Hb"],
    risk: "medium",
    shared: true,
  },
  {
    id: "pt-3390",
    name: "David Kimathi",
    age: 57,
    reason: "Post-MI follow-up, adherence review",
    slot: "10:15",
    flags: ["Adherence 61%"],
    risk: "high",
    shared: true,
  },
  {
    id: "pt-5104",
    name: "Leila Hassan",
    age: 28,
    reason: "Recurrent migraines",
    slot: "11:00",
    flags: [],
    risk: "low",
    shared: true,
  },
  {
    id: "pt-2277",
    name: "Joseph Otieno",
    age: 45,
    reason: "Rash — photo triage escalation",
    slot: "11:45",
    flags: ["Photo flagged"],
    risk: "medium",
    shared: false,
  },
];

export type Candidate = {
  id: string;
  condition: string;
  icd10: string;
  probability: number;
  tier: ConfidenceTier;
  evidence: { source: string; kind: "prior" | "likelihood" | "patient"; contribution: number; detail: string }[];
  why: string;
};

export const differential: Candidate[] = [
  {
    id: "dx1",
    condition: "SSRI-associated hyperhidrosis",
    icd10: "R61",
    probability: 0.41,
    tier: "well-established",
    why: "Temporal onset one week after sertraline initiation, with a direct structured drug→side-effect record and no competing red flags in the logged data.",
    evidence: [
      { source: "FAERS", kind: "likelihood", contribution: 0.22, detail: "Sertraline → hyperhidrosis: 8,412 reports, strong signal." },
      { source: "DrugBank", kind: "likelihood", contribution: 0.11, detail: "Labelled adverse reaction, common frequency band." },
      { source: "Patient log", kind: "patient", contribution: 0.08, detail: "Onset 7 days post-initiation; adherence 92%." },
    ],
  },
  {
    id: "dx2",
    condition: "Anaemia of chronic disease",
    icd10: "D63.8",
    probability: 0.23,
    tier: "well-established",
    why: "Haemoglobin 11.4 g/dL with sustained fatigue and a known chronic metabolic condition; supported by structured lab input routed directly to Stage 2.",
    evidence: [
      { source: "Lab (CBC)", kind: "patient", contribution: 0.12, detail: "Hb 11.4 g/dL (ref 12.0–15.5)." },
      { source: "ICD-10 comorbidity map", kind: "prior", contribution: 0.06, detail: "T2DM raises baseline likelihood." },
      { source: "PubMed structured", kind: "likelihood", contribution: 0.05, detail: "Fatigue co-occurrence in mild anaemia." },
    ],
  },
  {
    id: "dx3",
    condition: "Post-viral bronchial irritation",
    icd10: "J20.9",
    probability: 0.16,
    tier: "emerging",
    why: "Dry cough onset later than other symptoms, no fever logged, and regional respiratory surveillance is currently elevated.",
    evidence: [
      { source: "Regional surveillance", kind: "prior", contribution: 0.09, detail: "Influenza-like illness index 68 and rising." },
      { source: "Patient log", kind: "patient", contribution: 0.07, detail: "Cough onset day 11, non-productive." },
    ],
  },
  {
    id: "dx4",
    condition: "Subclinical thyroid dysfunction",
    icd10: "E03.9",
    probability: 0.09,
    tier: "rare-contested",
    why: "Symptom overlap only. TSH and free T4 both within reference range, so this ranks low and is retained for completeness.",
    evidence: [
      { source: "Lab (TFT)", kind: "patient", contribution: -0.06, detail: "TSH 2.4 mIU/L — within range, lowers probability." },
      { source: "PubMed structured", kind: "likelihood", contribution: 0.04, detail: "Non-specific symptom overlap." },
    ],
  },
];

export const communityInsightsForDoctor = [
  {
    id: "ci1",
    pattern: "Night sweats reported as time-limited on SSRI initiation",
    volume: 214,
    subreddits: ["r/sertraline", "r/antidepressants"],
    note: "Lived-experience signal only. Not scored, not part of the clinical evidence trail.",
  },
  {
    id: "ci2",
    pattern: "Split metformin dosing described as reducing afternoon fatigue",
    volume: 87,
    subreddits: ["r/diabetes_t2"],
    note: "Hypothesis-generation layer. No probability contribution.",
  },
];

export const interactionFlags = [
  {
    id: "f1",
    severity: "high" as const,
    title: "Documented allergy conflict",
    detail: "Penicillin allergy on file (urticaria). Any beta-lactam selection requires override confirmation.",
    source: "Patient intake · allergy register",
  },
  {
    id: "f2",
    severity: "moderate" as const,
    title: "Sertraline → hyperhidrosis",
    detail: "New symptom matches a labelled adverse reaction for an active medication.",
    source: "FAERS · DrugBank",
  },
  {
    id: "f3",
    severity: "low" as const,
    title: "Metformin + contrast media",
    detail: "If imaging with iodinated contrast is ordered, review temporary suspension.",
    source: "DrugBank interaction record",
  },
];

export const treatmentOptions = [
  {
    id: "tr1",
    drug: "Sertraline dose adjustment",
    dosing: "Reduce to 25 mg daily for 2 weeks, then reassess",
    guideline: "NICE CG90 · Depression in adults",
    note: "First-line management of tolerable SSRI adverse effects.",
  },
  {
    id: "tr2",
    drug: "Terazosin",
    dosing: "1 mg nocte, titrate to response",
    guideline: "DrugBank · off-label hyperhidrosis reference",
    note: "Consider only if adverse effect persists past 6 weeks.",
  },
  {
    id: "tr3",
    drug: "Oral iron (ferrous fumarate)",
    dosing: "210 mg twice daily with vitamin C",
    guideline: "WHO anaemia management guideline",
    note: "Pending ferritin confirmation.",
  },
];

export const soapDraft = {
  subjective:
    "34-year-old female reports night sweats for ~16 days (4–5 nights/week, severity 6/10), persistent fatigue for 19 days, and an intermittent dry cough for 8 days. Symptoms began approximately one week after starting sertraline 50 mg. No fever, weight loss, or haemoptysis logged. Adherence: sertraline 92%, metformin 78%.",
  objective:
    "Patient-logged vitals stable. CBC 2026-08-02: Hb 11.4 g/dL (low), WBC 7.2, Plt 268. Metabolic panel 2026-07-15: HbA1c 6.8%, fasting glucose 7.1 mmol/L. TFT 2026-08-05 within reference range.",
  assessment:
    "Most consistent with SSRI-associated hyperhidrosis (structured drug→side-effect link, temporal fit). Mild anaemia noted and warrants iron studies. Dry cough likely post-viral given elevated regional ILI activity; reassess if persists beyond 14 days.",
  plan:
    "1) Discuss sertraline timing/dose adjustment. 2) Order ferritin, B12, folate. 3) Review cough in 7 days. 4) Reinforce metformin adherence — consider split dosing. 5) Patient to continue symptom logging.",
};

export const monitoringSeries = [
  { week: "W1", adherence: 93, symptomBurden: 3, mood: 3 },
  { week: "W2", adherence: 90, symptomBurden: 5, mood: 3 },
  { week: "W3", adherence: 79, symptomBurden: 7, mood: 4 },
  { week: "W4", adherence: 78, symptomBurden: 6, mood: 5 },
  { week: "W5", adherence: 85, symptomBurden: 5, mood: 6 },
];

export const crisisFlags = [
  { id: "cf1", date: "2026-07-25", label: "Sleep below 5h for 3 consecutive nights", level: "watch" },
  { id: "cf2", date: "2026-07-30", label: "Mood self-score dropped 2 points in a week", level: "watch" },
];

export const confirmedDiagnoses = [
  { id: "cd1", patient: "M. Achieng", predictedTop1: "SSRI-associated hyperhidrosis", confirmed: "SSRI-associated hyperhidrosis", hit: "top-1", date: "2026-07-30" },
  { id: "cd2", patient: "D. Kimathi", predictedTop1: "Stable angina", confirmed: "GERD", hit: "miss", date: "2026-07-28" },
  { id: "cd3", patient: "L. Hassan", predictedTop1: "Tension headache", confirmed: "Migraine without aura", hit: "top-3", date: "2026-07-22" },
  { id: "cd4", patient: "J. Otieno", predictedTop1: "Contact dermatitis", confirmed: "Contact dermatitis", hit: "top-1", date: "2026-07-19" },
];

/* ---------------- Admin / validation ---------------- */

export const accuracyByCategory = [
  { category: "Drug side effects", top1: 0.74, top3: 0.91, n: 412, tier: "well-established" as ConfidenceTier },
  { category: "Common infections", top1: 0.63, top3: 0.85, n: 388, tier: "well-established" as ConfidenceTier },
  { category: "Dermatology (photo)", top1: 0.52, top3: 0.69, n: 246, tier: "emerging" as ConfidenceTier },
  { category: "Metabolic / endocrine", top1: 0.58, top3: 0.8, n: 197, tier: "well-established" as ConfidenceTier },
  { category: "Rare / contested", top1: 0.21, top3: 0.38, n: 64, tier: "rare-contested" as ConfidenceTier },
];

export const accuracyOverTime = [
  { month: "Feb", top1: 0.49, top3: 0.7 },
  { month: "Mar", top1: 0.52, top3: 0.73 },
  { month: "Apr", top1: 0.55, top3: 0.76 },
  { month: "May", top1: 0.58, top3: 0.79 },
  { month: "Jun", top1: 0.6, top3: 0.82 },
  { month: "Jul", top1: 0.62, top3: 0.84 },
];

export const literatureBenchmarks = [
  { analog: "Crowdsourced dermatology photo diagnoses", finding: "~69% top-comment match against expert graders", caution: "Photo-only, no clinical context" },
  { analog: "Crowdsourced stem-cell / retinal treatment discussions", finding: "36% inaccurate overall; 54% inaccurate among purely factual claims", caution: "Treatment claims, not diagnosis" },
  { analog: "STD subreddit response study", finding: "87% received a reply, most within a day", caution: "No verified accuracy measure" },
];

export const sourceContributions = [
  { source: "FAERS", share: 26 },
  { source: "DrugBank", share: 21 },
  { source: "Geo/epi priors", share: 19 },
  { source: "PubMed structured", share: 17 },
  { source: "ICD-10 maps", share: 11 },
  { source: "Patient labs", share: 6 },
];

export const pipelineHealth = [
  { name: "Reddit NLP ingest", status: "healthy", latency: "1.2s", volume: "18.4k posts/day" },
  { name: "Symptom vocabulary extractor", status: "healthy", latency: "340ms", volume: "9.1k extractions/day" },
  { name: "Geo/epi prior service", status: "degraded", latency: "2.8s", volume: "Surveillance feed 6h stale" },
  { name: "FAERS likelihood index", status: "healthy", latency: "180ms", volume: "Rebuilt 04:00 UTC" },
  { name: "Bayesian scorer", status: "healthy", latency: "620ms", volume: "3.2k rankings/day" },
];

export const regulatoryItems = [
  {
    id: "r1",
    title: "Doctor-facing CDS — SaMD classification",
    status: "In review",
    risk: "high",
    detail: "Likely falls under Software as a Medical Device in most target jurisdictions. Requires clinical validation and a quality management system, not just an internal test pass.",
  },
  {
    id: "r2",
    title: "Patient wellness/triage companion",
    status: "Cleared for build track",
    risk: "low",
    detail: "Substantially lower regulatory risk. Reasonable candidate for the first build and ship track.",
  },
  {
    id: "r3",
    title: "Disclosure-gate exception (Section 3, Feature 8)",
    status: "Flagged for early review",
    risk: "high",
    detail: "Naming a plain-language cause for well-established/direct/benign findings resembles patient-facing CDS rather than pure triage. Narrow and gated by design, but the specific feature to run past the regulatory consultant early.",
  },
  {
    id: "r4",
    title: "Liability and scope-of-claim language",
    status: "Drafting",
    risk: "medium",
    detail: "What the app does and does not claim to do must be designed in from the start, not added later.",
  },
  {
    id: "r5",
    title: "Clinical advisor engagement",
    status: "Open",
    risk: "medium",
    detail: "Engage a health-tech regulatory consultant and a named clinical advisor before finalizing the doctor-facing CDS spec.",
  },
];

export const openNextSteps = [
  { id: "n1", label: "Define validation dataset and hit-rate methodology for real accuracy testing", done: true },
  { id: "n2", label: "Map specific condition categories into confidence tiers", done: true },
  { id: "n3", label: "Detail the evidence trail card schema (per-candidate fields shown to the doctor)", done: true },
  { id: "n4", label: "Mock up key screens: symptom organizer, photo triage, lab review, differential panel", done: false },
  { id: "n5", label: "Scope MVP: patient wellness/triage track vs. longer-runway doctor CDS track", done: false },
];

export const photoTriageCases = [
  {
    id: "p1",
    area: "Left forearm",
    date: "2026-08-04",
    verdict: "worth-a-look" as const,
    note: "Border irregularity detected. Flagged for a clinician's eyes — no condition named.",
  },
  {
    id: "p2",
    area: "Right ankle",
    date: "2026-07-28",
    verdict: "monitor" as const,
    note: "Appearance consistent with common, self-limiting patterns. Re-photograph in 7 days.",
  },
];