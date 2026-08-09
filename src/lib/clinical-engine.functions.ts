import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const stage1Schema = z.object({ text: z.string().trim().min(1).max(4000) });

const stage2Schema = z.object({
  concepts: z.array(z.string().max(120)).max(30),
  region: z.string().max(40).optional(),
  labs: z
    .array(z.object({ marker: z.string().max(60), status: z.enum(["high", "low", "normal"]) }))
    .max(30)
    .optional(),
  medications: z.array(z.string().max(80)).max(30).optional(),
});

const gateSchema = z.object({
  symptoms: z.array(z.string().max(120)).max(30),
  medications: z.array(z.string().max(80)).max(30),
});

/** Stage 1 — simulated NLP hypothesis extraction from free symptom text. */
export const runStage1Extraction = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => stage1Schema.parse(input))
  .handler(async ({ data }) => {
    const { extractHypotheses } = await import("./clinical-engine.server");
    return extractHypotheses(data.text);
  });

/** Stage 2 — Bayesian probabilistic scoring against structured mock datasets. */
export const runStage2Scoring = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => stage2Schema.parse(input))
  .handler(async ({ data }) => {
    const { bayesianScore } = await import("./clinical-engine.server");
    return bayesianScore(data);
  });

/** Disclosure gate — three criteria must pass before a cause is named. */
export const runDisclosureGate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => gateSchema.parse(input))
  .handler(async ({ data }) => {
    const { disclosureGate } = await import("./clinical-engine.server");
    return { findings: disclosureGate(data) };
  });