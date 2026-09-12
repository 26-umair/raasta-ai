import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  analyzePayment,
  type AnalyzePaymentContext,
  type AnalyzePaymentResult,
} from "@/integrations/external-supabase/analyze-payment";
import { contextFields, type MockScenarioKey, mockScenarios } from "./data";

export type PaymentField = { label: string; value: string };
export type PaymentContextValue = {
  fields: PaymentField[];
  prompt: string;
  scenario: MockScenarioKey;
  urgency: "today" | "flexible";
};

export type AnalysisState = {
  result?: AnalyzePaymentResult;
  request?: AnalyzePaymentContext;
  engineVersion?: string;
  loading: boolean;
  error?: string;
};

type PaymentContextStore = PaymentContextValue & {
  setDraft: (next: PaymentContextValue) => void;
  analysis: AnalysisState;
  runAnalysis: (context: AnalyzePaymentContext) => Promise<AnalyzePaymentResult | undefined>;
  patchAnalysis: (
    patch: Partial<AnalyzePaymentContext>,
  ) => Promise<AnalyzePaymentResult | undefined>;
  resetAnalysis: () => void;
};

const initialValue: PaymentContextValue = {
  fields: contextFields.map(([label, value]) => ({ label, value })),
  prompt: mockScenarios.golden.prompt,
  scenario: "golden",
  urgency: "today",
};

const PaymentContext = createContext<PaymentContextStore>({
  ...initialValue,
  setDraft: () => {},
  analysis: { loading: false },
  runAnalysis: async () => undefined,
  patchAnalysis: async () => undefined,
  resetAnalysis: () => {},
});

export function PaymentContextProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<PaymentContextValue>(initialValue);
  const [analysis, setAnalysis] = useState<AnalysisState>({ loading: false });
  const requestId = useRef(0);

  const runAnalysis = useCallback(async (context: AnalyzePaymentContext) => {
    const id = ++requestId.current;
    setAnalysis((current) => {
      const next: AnalysisState = { loading: true, request: context };
      if (current.result) next.result = current.result;
      if (current.engineVersion) next.engineVersion = current.engineVersion;
      return next;
    });
    try {
      const { result, engineVersion } = await analyzePayment(context);
      if (id !== requestId.current) return undefined;
      const next: AnalysisState = { loading: false, result, request: context };
      if (engineVersion) next.engineVersion = engineVersion;
      setAnalysis(next);
      return result;
    } catch (error) {
      if (id !== requestId.current) return undefined;
      setAnalysis({
        loading: false,
        request: context,
        error:
          error instanceof Error
            ? error.message
            : "Raasta couldn't compare the routes right now. Your details are still here — try again.",
      });
      return undefined;
    }
  }, []);

  const patchAnalysis = useCallback(
    async (patch: Partial<AnalyzePaymentContext>) => {
      const base = analysis.request;
      if (!base) return undefined;
      return runAnalysis({ ...base, ...patch });
    },
    [analysis.request, runAnalysis],
  );

  const resetAnalysis = useCallback(() => {
    requestId.current += 1;
    setAnalysis({ loading: false });
  }, []);

  const value = useMemo(
    () => ({ ...draft, setDraft, analysis, runAnalysis, patchAnalysis, resetAnalysis }),
    [analysis, draft, patchAnalysis, resetAnalysis, runAnalysis],
  );
  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
}

export function usePaymentContext() {
  return useContext(PaymentContext);
}

export function getPaymentValue(fields: PaymentField[], label: string, fallback: string) {
  return fields.find((field) => field.label === label)?.value || fallback;
}
