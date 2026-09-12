import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { contextFields, type MockScenarioKey, mockScenarios } from "./data";

export type PaymentField = { label: string; value: string };
export type PaymentContextValue = {
  fields: PaymentField[];
  prompt: string;
  scenario: MockScenarioKey;
  urgency: "today" | "flexible";
};

type PaymentContextStore = PaymentContextValue & {
  setDraft: (next: PaymentContextValue) => void;
};

const initialValue: PaymentContextValue = {
  fields: contextFields.map(([label, value]) => ({ label, value })),
  prompt: mockScenarios.golden.prompt,
  scenario: "golden",
  urgency: "today",
};

const PaymentContext = createContext<PaymentContextStore | undefined>(undefined);

export function PaymentContextProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<PaymentContextValue>(initialValue);
  const value = useMemo(() => ({ ...draft, setDraft }), [draft]);
  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
}

export function usePaymentContext() {
  const value = useContext(PaymentContext);
  if (!value) throw new Error("usePaymentContext must be used inside PaymentContextProvider");
  return value;
}

export function getPaymentValue(fields: PaymentField[], label: string, fallback: string) {
  return fields.find((field) => field.label === label)?.value || fallback;
}