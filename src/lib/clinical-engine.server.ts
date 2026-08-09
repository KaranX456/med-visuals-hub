/**
 * Core clinical business logic. Server-only.
 * Stage 1 — NLP hypothesis extraction from free symptom text (simulated).
 * Stage 2 — Bayesian probabilistic scoring against mock FAERS / DrugBank datasets.
 * Disclosure gate — three-criteria rule that decides whether a cause may be named to a patient.
 */

export type ConfidenceTier = "well-established" | "emerging" | "rare-contested";
export type Urgency = "emergency" | "same-day" | "scheduled" | "monitor";

/* ------------------------------------------------------------------ */
/* Mock structured datasets                                            */
/* ------------------------------------------------------------------ */

type LexiconEntry = {
  concept: string;
  system: string;
  snomed: string;
  synonyms: string[];
  redFlag?: boolean;
};

const SYMPTOM_LEXICON: LexiconEntry[] = [
  { concept: "Night sweats", system: "Systemic", snomed: "42984000", synonyms: ["night sweat", "sweating at night", "soaked sheets", "sweats"] },
  { concept: "Fatigue", system: "Systemic", snomed: "84229001", synonyms: ["tired", "exhausted", "no energy", "worn out", "fatigue"] },
  { concept: "Dry cough", system: "Respiratory", snomed: "11833005", synonyms: ["dry cough", "tickly cough", "cough without phlegm"] },
  { concept: "Productive cough", system: "Respiratory", snomed: "28743005", synonyms: ["phlegm", "sputum", "wet cough", "coughing up"] },
  { concept: "Headache", system: "Neurological", snomed: "25064002", synonyms: ["headache", "head ache", "migraine", "head pain"] },
  { concept: "Fever", system: "Systemic", snomed: "386661006", synonyms: ["fever", "temperature", "hot and cold", "chills", "febrile"] },
  { concept: "Nausea", system: "Gastrointestinal", snomed: "422587007", synonyms: ["nausea", "queasy", "sick to my stomach"] },
  { concept: "Weight loss", system: "Systemic", snomed: "89362005", synonyms: ["losing weight", "weight loss", "clothes loose"] },
  { concept: "Dizziness", system: "Neurological", snomed: "404640003", synonyms: ["dizzy", "lightheaded", "room spinning", "vertigo"] },
  { concept: "Chest pain", system: "Cardiovascular", snomed: "29857009", synonyms: ["chest pain", "chest tightness", "pressure in my chest"], redFlag: true },
  { concept: "Breathlessness", system: "Respiratory", snomed: "267036007", synonyms: ["short of breath", "breathless", "can't breathe", "gasping"], redFlag: true },
  { concept: "Palpitations", system: "Cardiovascular", snomed: "80313002", synonyms: ["heart racing", "palpitations", "fluttering"] },
  { concept: "Rash", system: "Dermatological", snomed: "271807003", synonyms: ["rash", "spots", "hives", "itchy skin"] },
  { concept: "Joint pain", system: "Musculoskeletal", snomed: "57676002", synonyms: ["joint pain", "achy joints", "sore knees"] },
  { concept: "Insomnia", system: "Neurological", snomed: "193462001", synonyms: ["can't sleep", "insomnia", "waking up at night"] },
];

const DURATION_PATTERNS: { re: RegExp; label: string; chronicity: "acute" | "subacute" | "chronic" }[] = [
  { re: /\b(\d+)\s*(day|days)\b/i, label: "days", chronicity: "acute" },
  { re: /\b(\d+)\s*(week|weeks)\b/i, label: "weeks", chronicity: "subacute" },
  { re: /\b(\d+)\s*(month|months)\b/i, label: "months", chronicity: "chronic" },
  { re: /\b(\d+)\s*(year|years)\b/i, label: "years", chronicity: "chronic" },
];

const SEVERITY_CUES: { re: RegExp; weight: number; label: string }[] = [
  { re: /\b(unbearable|worst|severe|excruciating|10\/10)\b/i, weight: 9, label: "severe" },
  { re: /\b(bad|strong|intense|really)\b/i, weight: 6, label: "moderate-severe" },
  { re: /\b(mild|slight|a bit|little)\b/i, weight: 3, label: "mild" },
];

/** Mock FAERS-style adverse-event signal table. */
type FaersRow = {
  drug: string;
  reaction: string;
  reports: number;
  prr: number; // proportional reporting ratio
  tier: ConfidenceTier;
  benign: boolean;
  labelled: boolean; // appears in the approved product label (DrugBank)
  plain: string;
};

export const FAERS: FaersRow[] = [
  { drug: "Sertraline", reaction: "Night sweats", reports: 14320, prr: 4.8, tier: "well-established", benign: true, labelled: true, plain: "Night sweating is a documented and common side effect of sertraline. It usually settles within a few weeks and is not harmful." },
  { drug: "Sertraline", reaction: "Nausea", reports: 28911, prr: 5.4, tier: "well-established", benign: true, labelled: true, plain: "Nausea is one of the most commonly reported sertraline effects, especially in the first weeks. Taking it with food often helps." },
  { drug: "Sertraline", reaction: "Insomnia", reports: 12040, prr: 3.1, tier: "well-established", benign: true, labelled: true, plain: "Sleep disturbance is a known sertraline effect. Morning dosing usually reduces it." },
  { drug: "Sertraline", reaction: "Palpitations", reports: 2180, prr: 1.9, tier: "emerging", benign: false, labelled: false, plain: "" },
  { drug: "Metformin", reaction: "Nausea", reports: 31200, prr: 6.1, tier: "well-established", benign: true, labelled: true, plain: "Stomach upset is very common with metformin, particularly on an empty stomach or after a dose increase." },
  { drug: "Metformin", reaction: "Fatigue", reports: 9440, prr: 2.2, tier: "emerging", benign: false, labelled: false, plain: "" },
  { drug: "Metformin", reaction: "Dizziness", reports: 5120, prr: 1.6, tier: "rare-contested", benign: false, labelled: false, plain: "" },
  { drug: "Cetirizine", reaction: "Fatigue", reports: 8800, prr: 4.0, tier: "well-established", benign: true, labelled: true, plain: "Drowsiness and daytime tiredness are documented cetirizine effects. Evening dosing usually helps." },
  { drug: "Cetirizine", reaction: "Headache", reports: 4100, prr: 2.4, tier: "emerging", benign: true, labelled: true, plain: "" },
];

/** Mock DrugBank interaction / label facts. */
export const DRUGBANK: Record<string, { class: string; timing: string; interactions: string[] }> = {
  Sertraline: { class: "SSRI", timing: "Take with food, same time daily.", interactions: ["NSAIDs (bleeding risk)", "Tramadol (serotonin syndrome)"] },
  Metformin: { class: "Biguanide", timing: "Never on an empty stomach.", interactions: ["Contrast media (hold before imaging)", "Alcohol (lactic acidosis)"] },
  Cetirizine: { class: "H1 antihistamine", timing: "Evening dosing preferred.", interactions: ["CNS depressants (additive sedation)"] },
};

/** Mock epidemiological priors per region (prevalence per 1,000 adults). */
type ConditionModel = {
  condition: string;
  icd10: string;
  tier: ConfidenceTier;
  prior: number;
  /** likelihood of each concept given the condition */
  likelihood: Record<string, number>;
  labSignals?: { marker: string; direction: "high" | "low"; lr: number }[];
  why: string;
};

export const CONDITION_MODELS: ConditionModel[] = [
  {
    condition: "SSRI-associated hyperhidrosis",
    icd10: "R61",
    tier: "well-established",
    prior: 0.09,
    likelihood: { "Night sweats": 0.82, Fatigue: 0.35, Insomnia: 0.3, Nausea: 0.25 },
    why: "Temporal onset shortly after starting an SSRI, with sweating dominant and no systemic red flags.",
  },
  {
    condition: "Type 2 diabetes — suboptimal control",
    icd10: "E11.65",
    tier: "well-established",
    prior: 0.07,
    likelihood: { Fatigue: 0.62, "Weight loss": 0.4, Dizziness: 0.3, "Night sweats": 0.3 },
    labSignals: [{ marker: "HbA1c", direction: "high", lr: 3.4 }],
    why: "Persistent fatigue with rising glycaemic markers and imperfect adherence to metformin.",
  },
  {
    condition: "Iron-deficiency anaemia",
    icd10: "D50.9",
    tier: "well-established",
    prior: 0.06,
    likelihood: { Fatigue: 0.78, Dizziness: 0.45, Breathlessness: 0.4, Palpitations: 0.35, Headache: 0.3 },
    labSignals: [{ marker: "Ferritin", direction: "low", lr: 4.2 }, { marker: "Haemoglobin", direction: "low", lr: 3.0 }],
    why: "Fatigue with exertional breathlessness and low iron stores.",
  },
  {
    condition: "Pulmonary tuberculosis",
    icd10: "A15.0",
    tier: "well-established",
    prior: 0.02,
    likelihood: { "Night sweats": 0.75, "Weight loss": 0.7, Fatigue: 0.6, "Dry cough": 0.55, Fever: 0.6, "Productive cough": 0.5 },
    why: "Regional prevalence is materially higher than the global baseline; the sweats-cough-weight triad must be excluded.",
  },
  {
    condition: "Subclinical hypothyroidism",
    icd10: "E02",
    tier: "emerging",
    prior: 0.04,
    likelihood: { Fatigue: 0.7, "Weight loss": 0.1, "Joint pain": 0.3, Insomnia: 0.25, Headache: 0.25 },
    labSignals: [{ marker: "TSH", direction: "high", lr: 3.8 }],
    why: "Non-specific fatigue pattern; only separable on thyroid function testing.",
  },
  {
    condition: "Generalised anxiety with somatic features",
    icd10: "F41.1",
    tier: "emerging",
    prior: 0.05,
    likelihood: { Palpitations: 0.6, Insomnia: 0.55, Fatigue: 0.5, Headache: 0.45, "Chest pain": 0.3, "Night sweats": 0.3 },
    why: "Symptom cluster is diurnal and stress-linked, with normal structured markers.",
  },
  {
    condition: "Post-viral inflammatory syndrome",
    icd10: "B94.8",
    tier: "rare-contested",
    prior: 0.015,
    likelihood: { Fatigue: 0.75, "Joint pain": 0.5, Headache: 0.4, "Dry cough": 0.35, "Night sweats": 0.3 },
    why: "Community reporting is heavy but structured evidence remains contested — listed for completeness only.",
  },
];

/** Regional prevalence multipliers (mock epidemiology layer). */
const REGION_MULTIPLIERS: Record<string, Record<string, number>> = {
  "east-africa": { "Pulmonary tuberculosis": 6.5, "Iron-deficiency anaemia": 1.8, "Type 2 diabetes — suboptimal control": 1.2 },
  "western-europe": { "Pulmonary tuberculosis": 0.4, "Subclinical hypothyroidism": 1.3 },
  global: {},
};

/* ------------------------------------------------------------------ */
/* Stage 1 — hypothesis extraction                                     */
/* ------------------------------------------------------------------ */

export type ExtractedConcept = {
  concept: string;
  system: string;
  snomed: string;
  matchedPhrase: string;
  confidence: number;
  redFlag: boolean;
};

export type Stage1Result = {
  concepts: ExtractedConcept[];
  duration: { label: string; chronicity: string } | null;
  severity: { score: number; label: string } | null;
  negated: string[];
  hypotheses: { label: string; rationale: string; tier: ConfidenceTier }[];
  narrative: string;
};

const NEGATIONS = ["no ", "not ", "without ", "denies ", "never "];

export function extractHypotheses(text: string): Stage1Result {
  const lower = ` ${text.toLowerCase().replace(/\s+/g, " ")} `;
  const concepts: ExtractedConcept[] = [];
  const negated: string[] = [];

  for (const entry of SYMPTOM_LEXICON) {
    let matched: string | null = null;
    for (const syn of entry.synonyms) {
      if (lower.includes(syn.toLowerCase())) {
        matched = syn;
        break;
      }
    }
    if (!matched) continue;
    const idx = lower.indexOf(matched.toLowerCase());
    const window = lower.slice(Math.max(0, idx - 22), idx);
    if (NEGATIONS.some((n) => window.includes(n))) {
      negated.push(entry.concept);
      continue;
    }
    const exact = matched.toLowerCase() === entry.concept.toLowerCase();
    concepts.push({
      concept: entry.concept,
      system: entry.system,
      snomed: entry.snomed,
      matchedPhrase: matched,
      confidence: Math.min(0.97, (exact ? 0.9 : 0.72) + matched.length / 200),
      redFlag: Boolean(entry.redFlag),
    });
  }

  let duration: Stage1Result["duration"] = null;
  for (const d of DURATION_PATTERNS) {
    const m = lower.match(d.re);
    if (m) {
      duration = { label: `${m[1]} ${d.label}`, chronicity: d.chronicity };
      break;
    }
  }

  let severity: Stage1Result["severity"] = null;
  for (const s of SEVERITY_CUES) {
    if (s.re.test(lower)) {
      severity = { score: s.weight, label: s.label };
      break;
    }
  }

  const systems = [...new Set(concepts.map((c) => c.system))];
  const hypotheses: Stage1Result["hypotheses"] = [];
  if (concepts.some((c) => c.redFlag)) {
    hypotheses.push({
      label: "Red-flag pattern present",
      rationale: "At least one concept in this description routes straight to urgency assessment, ahead of any scoring.",
      tier: "well-established",
    });
  }
  if (systems.length >= 2) {
    hypotheses.push({
      label: "Multi-system presentation",
      rationale: `Concepts span ${systems.join(", ")} — a systemic driver is worth scoring in Stage 2.`,
      tier: "emerging",
    });
  }
  if (duration?.chronicity === "chronic") {
    hypotheses.push({
      label: "Chronic course",
      rationale: "Duration measured in months or years shifts weight away from acute infective causes.",
      tier: "well-established",
    });
  }
  if (concepts.length > 0 && hypotheses.length === 0) {
    hypotheses.push({
      label: "Single-system pattern",
      rationale: `Focused on ${systems[0] ?? "one system"} — narrow the Stage 2 candidate set accordingly.`,
      tier: "emerging",
    });
  }

  const narrative = concepts.length
    ? `Extracted ${concepts.length} clinical concept${concepts.length === 1 ? "" : "s"}${duration ? ` over ${duration.label}` : ""}${severity ? `, described as ${severity.label}` : ""}. These are hypotheses for a clinician to test — not a diagnosis.`
    : "No recognised clinical concepts were found. Try describing what you feel, where, and for how long.";

  return { concepts, duration, severity, negated, hypotheses, narrative };
}

/* ------------------------------------------------------------------ */
/* Stage 2 — Bayesian scoring                                          */
/* ------------------------------------------------------------------ */

export type Stage2Input = {
  concepts: string[];
  region?: string | undefined;
  labs?: { marker: string; status: "high" | "low" | "normal" }[] | undefined;
  medications?: string[] | undefined;
};

export type ScoredCandidate = {
  id: string;
  condition: string;
  icd10: string;
  tier: ConfidenceTier;
  probability: number;
  why: string;
  evidence: { source: string; detail: string; kind: string; contribution: number }[];
};

export function bayesianScore(input: Stage2Input): { candidates: ScoredCandidate[]; note: string } {
  const region = input.region ?? "global";
  const multipliers = REGION_MULTIPLIERS[region] ?? {};
  const present = new Set(input.concepts);

  const raw = CONDITION_MODELS.map((model) => {
    const regionMult = multipliers[model.condition] ?? 1;
    let posterior = model.prior * regionMult;
    const evidence: ScoredCandidate["evidence"] = [];

    if (regionMult !== 1) {
      evidence.push({
        source: "Regional epidemiology",
        detail: `Prevalence in ${region.replace("-", " ")} is ${regionMult}× the baseline prior.`,
        kind: "prior",
        contribution: regionMult > 1 ? 0.12 : -0.08,
      });
    }

    for (const concept of present) {
      const lr = model.likelihood[concept];
      if (lr === undefined) {
        posterior *= 0.75; // unexplained symptom mildly penalises the candidate
        continue;
      }
      posterior *= 1 + lr * 2;
      evidence.push({
        source: `Symptom: ${concept}`,
        detail: `Likelihood given this condition ${(lr * 100).toFixed(0)}%.`,
        kind: "symptom",
        contribution: lr / 4,
      });
    }

    for (const lab of input.labs ?? []) {
      const signal = model.labSignals?.find((s) => s.marker.toLowerCase() === lab.marker.toLowerCase());
      if (!signal) continue;
      if (signal.direction === lab.status) {
        posterior *= signal.lr;
        evidence.push({
          source: `Lab: ${lab.marker}`,
          detail: `${lab.status === "high" ? "Elevated" : "Reduced"} — likelihood ratio ${signal.lr}.`,
          kind: "structured",
          contribution: signal.lr / 12,
        });
      } else if (lab.status === "normal") {
        posterior *= 0.5;
        evidence.push({
          source: `Lab: ${lab.marker}`,
          detail: "Within reference range — argues against this candidate.",
          kind: "structured",
          contribution: -0.1,
        });
      }
    }

    for (const drug of input.medications ?? []) {
      const hits = FAERS.filter((f) => f.drug === drug && present.has(f.reaction) && f.tier === "well-established");
      for (const hit of hits) {
        if (model.condition.toLowerCase().includes(drug.toLowerCase()) || model.condition.startsWith("SSRI")) {
          posterior *= 1.6;
          evidence.push({
            source: `FAERS: ${drug} / ${hit.reaction}`,
            detail: `${hit.reports.toLocaleString()} reports, PRR ${hit.prr}. ${DRUGBANK[drug]?.class ?? ""} label match: ${hit.labelled ? "yes" : "no"}.`,
            kind: "pharmacovigilance",
            contribution: 0.15,
          });
        }
      }
    }

    return { model, posterior, evidence };
  });

  const total = raw.reduce((sum, r) => sum + r.posterior, 0) || 1;
  const candidates = raw
    .map(({ model, posterior, evidence }) => ({
      id: model.icd10.toLowerCase().replace(/\W+/g, "-"),
      condition: model.condition,
      icd10: model.icd10,
      tier: model.tier,
      probability: posterior / total,
      why: model.why,
      evidence,
    }))
    .filter((c) => c.probability >= 0.01)
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 6);

  return {
    candidates,
    note: "Normalised posterior across the modelled candidate set. Confidence is tiered per condition category — never a single flat number.",
  };
}

/* ------------------------------------------------------------------ */
/* Disclosure gate                                                     */
/* ------------------------------------------------------------------ */

export type GateResult = {
  id: string;
  symptom: string;
  linkedTo: string | null;
  tier: ConfidenceTier | null;
  wellEstablished: boolean;
  directLink: boolean;
  benign: boolean;
  disclosed: boolean;
  urgency: Urgency;
  plainLanguage: string;
  source: string;
};

const RED_FLAG_CONCEPTS = new Set(["Chest pain", "Breathlessness"]);

/** All three gates must pass before a cause is named to a patient. */
export function disclosureGate(input: { symptoms: string[]; medications: string[] }): GateResult[] {
  return input.symptoms.map((symptom, i) => {
    const matches = input.medications
      .flatMap((drug) => FAERS.filter((f) => f.drug === drug && f.reaction.toLowerCase() === symptom.toLowerCase()))
      .sort((a, b) => b.prr - a.prr);
    const best = matches[0];

    const wellEstablished = best?.tier === "well-established";
    const directLink = Boolean(best && best.labelled && best.prr >= 2);
    const benign = Boolean(best?.benign) && !RED_FLAG_CONCEPTS.has(symptom);
    const disclosed = wellEstablished && directLink && benign;

    const urgency: Urgency = RED_FLAG_CONCEPTS.has(symptom)
      ? "same-day"
      : disclosed
        ? "monitor"
        : matches.length
          ? "scheduled"
          : "monitor";

    return {
      id: `gate-${i}-${symptom.toLowerCase().replace(/\W+/g, "-")}`,
      symptom,
      linkedTo: best?.drug ?? null,
      tier: best?.tier ?? null,
      wellEstablished,
      directLink,
      benign,
      disclosed,
      urgency,
      plainLanguage: disclosed
        ? best!.plain ||
          `${symptom} is a documented, common and reversible effect of ${best!.drug}. Mention it at your next visit.`
        : RED_FLAG_CONCEPTS.has(symptom)
          ? `${symptom} is not something this tool will explain. Get it looked at today.`
          : `We are not naming a cause for ${symptom}. The evidence does not clear all three gates, so you get urgency guidance only: raise it at your next scheduled visit, sooner if it worsens.`,
      source: best
        ? `FAERS ${best.reports.toLocaleString()} reports · PRR ${best.prr} · DrugBank label match ${best.labelled ? "yes" : "no"}`
        : "No structured pharmacovigilance signal found for this symptom against your active medications",
    };
  });
}