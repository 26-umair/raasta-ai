// Deterministic mapper: editable Ask-page display fields -> engine v1.2 input contract.
// Display labels are never sent to the backend as-is.
import type { AnalyzePaymentContext } from "@/integrations/external-supabase/analyze-payment";
import type { PaymentField } from "./payment-context";

function read(fields: PaymentField[], label: string) {
  return (fields.find((field) => field.label === label)?.value ?? "").trim();
}

const CURRENCY_SYMBOLS: Array<[string, string]> = [
  ["£", "GBP"],
  ["$", "USD"],
  ["€", "EUR"],
  ["₹", "INR"],
];

const CURRENCY_CODES = ["USD", "GBP", "EUR", "AED", "CAD", "AUD", "SGD", "PKR"];

export function parseAmount(value: string): { amount?: number; currency?: string } {
  const digits = value.replace(/[^0-9.]/g, "");
  const amount = digits ? Number.parseFloat(digits) : Number.NaN;
  const upper = value.toUpperCase();
  let currency = CURRENCY_CODES.find((code) => upper.includes(code));
  if (!currency) {
    currency = CURRENCY_SYMBOLS.find(([symbol]) => value.includes(symbol))?.[1];
  }
  const result: { amount?: number; currency?: string } = {};
  if (Number.isFinite(amount) && amount > 0) result.amount = amount;
  if (currency) result.currency = currency;
  return result;
}

const COUNTRIES: Array<[RegExp, string]> = [
  [/united kingdom|\buk\b|britain|england/i, "GB"],
  [/united states|\busa?\b|america/i, "US"],
  [/canada/i, "CA"],
  [/australia/i, "AU"],
  [/germany/i, "DE"],
  [/france/i, "FR"],
  [/netherlands/i, "NL"],
  [/singapore/i, "SG"],
  [/emirates|\buae\b|dubai/i, "AE"],
  [/saudi/i, "SA"],
];

export function countryCode(value: string): string {
  return COUNTRIES.find(([pattern]) => pattern.test(value))?.[1] ?? "";
}

const ACCOUNT_TOKENS: Array<[RegExp, string]> = [
  [/meezan/i, "meezan"],
  [/\bhbl\b/i, "hbl"],
  [/faysal/i, "faysal"],
  [/\bubl\b/i, "ubl"],
  [/alfalah/i, "alfalah"],
  [/payoneer/i, "payoneer"],
  [/wise/i, "wise"],
  [/upwork/i, "upwork"],
  [/nayapay/i, "nayapay"],
  [/jazzcash/i, "jazzcash"],
  [/sadapay/i, "sadapay"],
];

function accountsFrom(text: string): string[] {
  return ACCOUNT_TOKENS.filter(([pattern]) => pattern.test(text)).map(([, token]) => token);
}

/**
 * Payer capability is independent from the freelancer's own receiving accounts:
 * owning Payoneer never implies the client can pay through Payoneer.
 */
function clientRails(prompt: string, source: string): string[] {
  const rails = new Set<string>();
  // Only sentences describing the payer can add a rail; "I already have Payoneer"
  // describes the freelancer's receiving setup, not the client's capability.
  const payerSentences = prompt
    .split(/[.;\n]/)
    .filter((sentence) => /\b(they|client|clients|sender|he|she|company)\b/i.test(sentence))
    .filter((sentence) => !/\bi (already )?(have|use|hold)\b/i.test(sentence));
  const payerText = `${payerSentences.join(" ")} ${source}`;
  if (/bank transfer|wire|swift/i.test(payerText)) rails.add("bank_transfer");
  if (/wise/i.test(payerText)) rails.add("wise");
  if (/payoneer/i.test(payerText)) rails.add("payoneer");
  if (rails.size === 0) rails.add("bank_transfer");
  return [...rails];
}

// ---------- Reverse mapping: engine normalizedContext -> display fields ----------

const COUNTRY_NAMES: Record<string, string> = {
  GB: "United Kingdom",
  US: "United States",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  NL: "Netherlands",
  SG: "Singapore",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
};

const CURRENCY_FORMATS: Record<string, string> = { GBP: "£", USD: "$", EUR: "€" };

export function formatAmount(amount?: number, currency?: string): string {
  if (amount === undefined || !Number.isFinite(amount)) return "Amount not provided";
  const formatted = amount.toLocaleString("en-US", { maximumFractionDigits: 2 });
  const symbol = currency ? CURRENCY_FORMATS[currency] : undefined;
  if (symbol) return `${symbol}${formatted}`;
  return currency ? `${currency} ${formatted}` : formatted;
}

const ACCOUNT_NAMES: Record<string, string> = {
  meezan: "Meezan",
  hbl: "HBL",
  hbl_islamic: "HBL",
  faysal: "Faysal Bank",
  ubl: "UBL",
  alfalah: "Bank Alfalah",
  payoneer: "Payoneer",
  wise: "Wise",
  upwork: "Upwork",
  nayapay: "NayaPay",
  jazzcash: "JazzCash",
  sadapay: "SadaPay",
};

// Tokens that describe a payment route rather than a traditional bank account.
const ROUTE_TOKENS = new Set(["payoneer", "wise", "upwork", "jazzcash"]);

const INCOME_SOURCE_LABELS: Record<string, string> = {
  upwork: "Upwork",
  fiverr: "Fiverr",
  marketplace: "Marketplace / platform",
  direct_client: "Direct client",
};

const CATEGORY_LABELS: Record<string, string> = {
  it_ites: "IT / ITeS",
  design_creative: "Design / Creative",
  other: "Other services",
};

/**
 * Converts the backend's normalizedContext into the editable "Here's what I
 * understood" cards. This is display-only — the stored normalizedContext
 * stays the source of truth for the compare call.
 */
export function fieldsFromContext(context: AnalyzePaymentContext): PaymentField[] {
  const accounts = (context.existingAccounts ?? [])
    .map((token) => ACCOUNT_NAMES[token] ?? token)
    .filter(Boolean);
  const banks = accounts.filter(
    (name, index) =>
      !ROUTE_TOKENS.has(context.existingAccounts[index]) && accounts.indexOf(name) === index,
  );
  const routes = context.existingAccounts
    .filter((token) => ROUTE_TOKENS.has(token))
    .map((token) => ACCOUNT_NAMES[token] ?? token);

  const keepFx =
    context.fxRetentionPreference === "required"
      ? "Yes"
      : context.fxRetentionPreference === "preferred"
        ? "Preferred"
        : "No";
  const islamic =
    context.islamicBankingPreference === "required"
      ? "Required"
      : context.islamicBankingPreference === "preferred"
        ? "Preferred"
        : "No preference";
  const timing =
    context.timingRequirement === "flexible"
      ? "Timing is flexible"
      : context.urgency === "today"
        ? "Payment due today"
        : context.urgency === "this_week"
          ? "Due this week"
          : "Not specified";

  return [
    {
      label: "Client",
      value: (COUNTRY_NAMES[context.clientCountry] ?? context.clientCountry) || "Not specified",
    },
    { label: "Amount", value: formatAmount(context.amount, context.currency) },
    {
      label: "Payment source",
      value: INCOME_SOURCE_LABELS[context.incomeSource] ?? "Direct client",
    },
    { label: "Work", value: context.serviceDescription || "Freelance services" },
    { label: "Category", value: CATEGORY_LABELS[context.serviceCategory] ?? "Other services" },
    {
      label: "PSEB",
      value:
        context.psebStatus === "registered"
          ? "Registered"
          : context.psebStatus === "not_registered"
            ? "Not registered"
            : "Not sure",
    },
    { label: "Current bank", value: banks.join(", ") || "Not specified" },
    { label: "Existing payment route", value: routes.join(", ") || "None mentioned" },
    { label: "Keep foreign currency", value: keepFx },
    { label: "Islamic banking", value: islamic },
    { label: "Timing", value: timing },
  ];
}

export function buildAnalysisContext(
  fields: PaymentField[],
  prompt: string,
): AnalyzePaymentContext {
  const amountField = read(fields, "Amount");
  const { amount, currency } = parseAmount(amountField);
  const source = read(fields, "Payment source");
  const work = read(fields, "Work") || "Freelance services";
  const category = read(fields, "Category");
  const pseb = read(fields, "PSEB");
  const bank = read(fields, "Current bank");
  const existingRoute = read(fields, "Existing payment route");
  const keepFx = read(fields, "Keep foreign currency");
  const islamic = read(fields, "Islamic banking");
  const timing = read(fields, "Timing");
  const client = read(fields, "Client");

  const incomeSource = /upwork/i.test(source)
    ? "upwork"
    : /fiverr/i.test(source)
      ? "fiverr"
      : /marketplace|platform/i.test(source)
        ? "marketplace"
        : "direct_client";

  const fxRetentionPreference: AnalyzePaymentContext["fxRetentionPreference"] = /no|none/i.test(
    keepFx,
  )
    ? "no_preference"
    : /yes|usd|gbp|eur|preferred/i.test(keepFx)
      ? "preferred"
      : "no_preference";

  const islamicBankingPreference: AnalyzePaymentContext["islamicBankingPreference"] =
    /required|must/i.test(islamic)
      ? "required"
      : /preferred|yes/i.test(islamic)
        ? "preferred"
        : "no_preference";

  const priorities = ["clean_documentation"];
  if (fxRetentionPreference !== "no_preference") priorities.push("keep_foreign_currency");
  priorities.push("balanced");

  const rails = clientRails(prompt, source);
  const accounts = [...new Set([...accountsFrom(bank), ...accountsFrom(existingRoute)])];

  const context: AnalyzePaymentContext = {
    rawText: prompt,
    clientCountry: countryCode(client),
    clientType: /individual|personal/i.test(`${client} ${source}`) ? "individual" : "business",
    incomeSource,
    serviceDescription: work,
    serviceCategory: /it|software|tech|develop|design|writing|marketing/i.test(
      `${category} ${work}`,
    )
      ? "it_ites"
      : "other",
    psebStatus: /not registered|no/i.test(pseb)
      ? "not_registered"
      : /registered/i.test(pseb)
        ? "registered"
        : "unknown",
    existingAccounts: accounts,
    hasEsfca: /esfca/i.test(`${bank} ${existingRoute}`),
    fxRetentionPreference,
    islamicBankingPreference,
    urgency: /today|urgent/i.test(timing) ? "today" : "not_urgent",
    timingRequirement: "unknown",
    priorities,
    clientCanUse: rails,
    requestedRails: rails,
    paymentFrequency: /one[- ]off|one time|single/i.test(prompt) ? "one_off" : "recurring",
    userExperienceLevel: "beginner",
    confirmedByUser: true,
  };
  if (amount !== undefined) context.amount = amount;
  if (currency !== undefined) context.currency = currency;
  return context;
}
