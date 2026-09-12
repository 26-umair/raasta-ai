export const goldenPrompt = "I'm a PSEB-registered web developer in Pakistan. A UK client needs to pay me £2,500 today. They can use Wise or bank transfer. I already have Payoneer and a Meezan account, prefer Islamic banking, and I'd like to keep some foreign currency for software subscriptions.";

export const contextFields = [
  ["Client", "United Kingdom"], ["Amount", "£2,500"], ["Payment source", "Direct client"],
  ["Work", "Web development"], ["Category", "IT / ITeS"], ["PSEB", "Registered"],
  ["Current bank", "Meezan"], ["Existing payment route", "Payoneer"],
  ["Keep foreign currency", "Yes"], ["Islamic banking", "Preferred"], ["Timing", "Payment due today"],
] as const;

export const analysisSteps = [
  "Understanding your payment",
  "Checking routes available in Pakistan",
  "Applying your preferences",
  "Comparing documentation and FX options",
  "Ranking your best routes",
];

export const prcSteps = [
  "Reading document", "Extracting payment details", "Checking payment classification", "Comparing with your freelancer profile",
];
