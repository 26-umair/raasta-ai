// Typed client for the deployed `analyze-payment` Edge Function (engine v1.2.0).
// No mock fallbacks: a backend failure surfaces as an error, never as fake data.
import { externalSupabase } from "./client";
import { getExternalSession } from "./session";

export type TimingRequirement = "unknown" | "receive_today" | "send_today" | "flexible";
export type Urgency = "today" | "this_week" | "not_urgent";

export type AnalyzePaymentContext = {
  rawText: string;
  amount?: number;
  currency?: string;
  clientCountry: string;
  clientType: "business" | "individual";
  incomeSource: string;
  serviceDescription: string;
  serviceCategory: string;
  psebStatus: "registered" | "not_registered" | "unknown";
  existingAccounts: string[];
  hasEsfca: boolean;
  fxRetentionPreference: "required" | "preferred" | "no_preference";
  islamicBankingPreference: "required" | "preferred" | "no_preference";
  urgency: Urgency;
  timingRequirement: TimingRequirement;
  priorities: string[];
  clientCanUse: string[];
  requestedRails: string[];
  paymentFrequency: "one_off" | "recurring";
  userExperienceLevel: "beginner" | "intermediate" | "advanced";
  confirmedByUser: boolean;
};

export type RouteCost = {
  status: string;
  certainty: string;
  grossAmount: number | null;
  grossCurrency: string | null;
  feeMin: number | null;
  feeMax: number | null;
  netBeforeFxMin: number | null;
  netBeforeFxMax: number | null;
  referenceFxRateToPkr: number | null;
  estimatedPkrMin: number | null;
  estimatedPkrMax: number | null;
  notes: string[];
};

export type RouteOption = {
  routeId: string;
  routeName: string;
  mode: "now" | "long_term";
  score: number;
  eliminated: boolean;
  eliminationReasons: string[];
  reasons: string[];
  tradeoffs: string[];
  confidence: string;
  sourceFreshness: string;
  cost: RouteCost;
  breakdown: Record<string, number>;
};

export type ClarificationOption = {
  label: string;
  patch: Partial<AnalyzePaymentContext>;
};

export type Clarification = {
  needed: boolean;
  field: string | null;
  reason: string | null;
  question: string | null;
  answerOptions: ClarificationOption[];
  simulatedTopRoutes?: string[];
};

export type Guardrail = {
  code: string;
  severity: "info" | "warning" | "error" | string;
  title: string;
  message: string;
};

export type SensitivityItem = {
  label: string;
  contextPatch: Partial<AnalyzePaymentContext>;
  changed: boolean;
  previousBestNow: string | null;
  nextBestNow: string | null;
  previousBestLongTerm: string | null;
  nextBestLongTerm: string | null;
  explanation: string;
};

export type ValidationIssue = {
  field: string;
  severity: "error" | "warning" | string;
  message: string;
};

export type ContextFact = {
  field: string;
  value: string;
  status: "user_confirmed" | "needs_verification" | "verified" | "detected" | string;
  note?: string;
};

export type AnalyzePaymentResult = {
  bestNow: RouteOption | null;
  bestLongTerm: RouteOption | null;
  alternatives: RouteOption[];
  allNow: RouteOption[];
  allLongTerm: RouteOption[];
  clarification: Clarification;
  guardrails: Guardrail[];
  sensitivity: SensitivityItem[];
  validation: { valid: boolean; issues: ValidationIssue[] };
  contextFacts: ContextFact[];
  // Optional newer contract fields — read defensively; may be absent.
  trustFacts?: ContextFact[];
  pakistanContext?: Array<{ title: string; detail: string } | string>;
  evidence?: Array<{ label: string; source?: string; note?: string } | string>;
  clientInstructions?: { full?: string; simple?: string; email?: string };
  disclaimers?: string[];
};

export type AnalyzePaymentResponse = {
  ok: boolean;
  engineVersion?: string;
  error?: string;
  result?: AnalyzePaymentResult;
};

export const ANALYSIS_AS_OF_DATE = "2026-09-12";

const GENERIC_FAILURE =
  "Raasta couldn't compare the routes right now. Your details are still here — try again.";

/** Calls the deployed engine. Throws a user-safe Error on any failure. */
export async function analyzePayment(
  context: AnalyzePaymentContext,
): Promise<{ result: AnalyzePaymentResult; engineVersion?: string }> {
  try {
    await getExternalSession();
  } catch {
    throw new Error(GENERIC_FAILURE);
  }

  const payload = {
    type: "analyze_payment",
    context,
    assumptions: { asOfDate: ANALYSIS_AS_OF_DATE },
  };
  console.log("Compare payload", payload);

  const { data, error } = await externalSupabase.functions.invoke<AnalyzePaymentResponse>(
    "analyze-payment",
    { body: payload },
  );

  console.log("Compare response", data);
  console.log("Compare error", error);

  // Failure only when: invoke error, ok === false, or missing result.
  // A null bestNow with ok === true is a valid clarification/guardrail state.
  if (error) {
    console.error("[analyze-payment] invoke failed", error);
    throw new Error(GENERIC_FAILURE);
  }
  if (!data?.ok || !data.result) {
    console.error("[analyze-payment] engine returned an error", data?.error);
    throw new Error(GENERIC_FAILURE);
  }
  const payload: { result: AnalyzePaymentResult; engineVersion?: string } = {
    result: data.result,
  };
  if (data.engineVersion) payload.engineVersion = data.engineVersion;
  return payload;
}
