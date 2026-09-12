export const goldenPrompt =
  "I'm a PSEB-registered web developer in Pakistan. A UK client needs to pay me £2,500 today. They can use Wise or bank transfer. I already have Payoneer and a Meezan account, prefer Islamic banking, and I'd like to keep some foreign currency for software subscriptions.";

export const contextFields = [
  ["Client", "United Kingdom"],
  ["Amount", "£2,500"],
  ["Payment source", "Direct client"],
  ["Work", "Web development"],
  ["Category", "IT / ITeS"],
  ["PSEB", "Registered"],
  ["Current bank", "Meezan"],
  ["Existing payment route", "Payoneer"],
  ["Keep foreign currency", "Yes"],
  ["Islamic banking", "Preferred"],
  ["Timing", "Payment due today"],
] as const;

export const mockScenarios = {
  golden: { prompt: goldenPrompt, overrides: {} },
  usClient: {
    prompt:
      "A US client is paying me $3,000 for web development. I use Payoneer and Meezan, and the payment is due today.",
    overrides: { Client: "United States", Amount: "$3,000", "Payment source": "Direct client" },
  },
  upwork: {
    prompt: "I need to withdraw my freelance earnings from Upwork to Pakistan.",
    overrides: {
      Client: "International clients",
      Amount: "Amount not provided",
      "Payment source": "Upwork",
      "Existing payment route": "Upwork withdrawal",
      Timing: "Not specified",
    },
  },
  keepUsd: {
    prompt: "I want to receive freelance income in Pakistan and keep part of it in USD.",
    overrides: {
      Client: "Not specified",
      Amount: "Amount not provided",
      "Keep foreign currency": "Yes — USD",
      Timing: "Not specified",
    },
  },
  islamic: {
    prompt: "I want a payment route that matches my Islamic banking preference.",
    overrides: {
      Client: "Not specified",
      Amount: "Amount not provided",
      "Islamic banking": "Preferred",
      Timing: "Not specified",
    },
  },
  wiseOnly: {
    prompt: "My client only uses Wise. How should I receive the payment in Pakistan?",
    overrides: {
      Client: "Not specified",
      Amount: "Amount not provided",
      "Payment source": "Direct client via Wise",
      "Existing payment route": "Wise sender",
      Timing: "Not specified",
    },
  },
  psebUnknown: {
    prompt: "I don't know what PSEB is, but I need to receive freelance income in Pakistan.",
    overrides: {
      Client: "Not specified",
      Amount: "Amount not provided",
      PSEB: "Not sure",
      Timing: "Not specified",
    },
  },
} as const;

export type MockScenarioKey = keyof typeof mockScenarios;

export const exampleScenarios: Array<{ label: string; key: Exclude<MockScenarioKey, "golden"> }> = [
  { label: "US client paying $3,000", key: "usClient" },
  { label: "Upwork withdrawal", key: "upwork" },
  { label: "I want to keep USD", key: "keepUsd" },
  { label: "Islamic banking preferred", key: "islamic" },
  { label: "Client only uses Wise", key: "wiseOnly" },
  { label: "I don't know what PSEB is", key: "psebUnknown" },
];

export function fieldsForScenario(key: MockScenarioKey) {
  const overrides: Partial<Record<string, string>> = mockScenarios[key].overrides;
  return contextFields.map(([label, value]) => ({ label, value: overrides[label] ?? value }));
}

export const analysisSteps = [
  "Understanding your payment",
  "Checking routes available in Pakistan",
  "Applying your preferences",
  "Comparing documentation and FX options",
  "Ranking your best routes",
];

export const prcSteps = [
  "Reading document",
  "Extracting payment details",
  "Checking payment classification",
  "Comparing with your freelancer profile",
];
