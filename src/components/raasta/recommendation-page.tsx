import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clipboard,
  Copy,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type {
  AnalyzePaymentContext,
  ContextFact,
  RouteOption,
} from "@/integrations/external-supabase/analyze-payment";
import { SectionHeading, StatusBadge, type StatusType } from "./shared";
import { copyText } from "./clipboard";
import { getPaymentValue, usePaymentContext } from "./payment-context";

const SAME_DAY_GUARDRAIL = "same_day_receipt_not_confidently_available";

function routeSteps(routeName: string) {
  return routeName
    .split("→")
    .map((part) => part.trim())
    .filter(Boolean);
}

function scoreLabel(value: number | undefined, labels: [string, string, string]) {
  const score = value ?? 0;
  if (score >= 0.8) return labels[0];
  if (score >= 0.45) return labels[1];
  return labels[2];
}

function factStatus(status: string): { type: StatusType; label: string } {
  if (status === "user_confirmed") return { type: "detected", label: "User confirmed" };
  if (status === "needs_verification") return { type: "needs", label: "Needs verification" };
  if (status === "verified") return { type: "verified", label: "Verified" };
  return { type: "detected", label: "Detected" };
}

const FACT_LABELS: Record<string, string> = {
  amount: "Amount",
  currency: "Currency",
  clientCountry: "Client country",
  incomeSource: "Payment source",
  serviceCategory: "Service category",
  psebStatus: "PSEB status",
  clientCanUse: "Client can pay with",
  timingRequirement: "Timing requirement",
};

export function RecommendationPage({ startsFlexible = false }: { startsFlexible?: boolean }) {
  const payment = usePaymentContext();
  const { analysis } = payment;
  const result = analysis.result;
  const baseRequest = useRef<AnalyzePaymentContext | undefined>(undefined);
  if (!baseRequest.current && analysis.request) baseRequest.current = analysis.request;

  const [waitTwoDays, setWaitTwoDays] = useState(startsFlexible);
  const [noFx, setNoFx] = useState(false);
  const [noIslamic, setNoIslamic] = useState(false);
  const [instructions, setInstructions] = useState(false);
  const [copied, setCopied] = useState<string>();
  const [simple, setSimple] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [updated, setUpdated] = useState(false);

  const amount = getPaymentValue(payment.fields, "Amount", "—");
  const country = getPaymentValue(payment.fields, "Client", "Not specified");
  const work = getPaymentValue(payment.fields, "Work", "Freelance work");
  const bank = getPaymentValue(payment.fields, "Current bank", "your bank");

  const applySensitivity = async (next: { wait?: boolean; fx?: boolean; islamic?: boolean }) => {
    const base = baseRequest.current;
    if (!base) return;
    const wait = next.wait ?? waitTwoDays;
    const fx = next.fx ?? noFx;
    const islamic = next.islamic ?? noIslamic;
    setWaitTwoDays(wait);
    setNoFx(fx);
    setNoIslamic(islamic);
    const patch: AnalyzePaymentContext = { ...base };
    if (wait) {
      patch.timingRequirement = "flexible";
      patch.urgency = "not_urgent";
    }
    if (fx) patch.fxRetentionPreference = "no_preference";
    if (islamic) patch.islamicBankingPreference = "no_preference";
    const outcome = await payment.runAnalysis(patch);
    if (outcome) setUpdated(wait || fx || islamic);
  };

  useEffect(() => {
    if (!analysis.loading && !analysis.result && !analysis.error) setUpdated(false);
  }, [analysis.error, analysis.loading, analysis.result]);

  const bestNow = result?.bestNow ?? null;
  const bestLongTerm = result?.bestLongTerm ?? null;
  const sameDayBlocked = Boolean(
    result?.guardrails.some((guardrail) => guardrail.code === SAME_DAY_GUARDRAIL),
  );
  const warnings = (result?.guardrails ?? []).filter(
    (guardrail) => guardrail.severity === "warning" || guardrail.severity === "error",
  );

  const routeName = bestNow?.routeName ?? "";
  const fullOpening =
    "Hi, here's the recommended way to pay this invoice. Please use the payment details provided below and include the invoice reference so the payment can be identified correctly.";
  const simpleMessage =
    "Hi, please use the payment details below for this invoice and include the invoice reference when sending the payment. Let me know once it's sent. Thank you.";
  const detailsText = `Payment method: ${routeName} receiving details\nAccount name: YOUR NAME\nInvoice reference: INV-XXXX\nAmount: ${amount}`;
  const displayedMessage = simple
    ? `${simpleMessage}\n\n${detailsText}`
    : `${fullOpening}\n\n${detailsText}\n\nThank you — please let me know once the payment is sent.`;
  const emailMessage = `Subject: Payment instructions for invoice INV-XXXX\n\n${displayedMessage}`;
  const copy = async (kind: string, text: string) => {
    const success = await copyText(text);
    setCopyError(!success);
    if (!success) return;
    setCopied(kind);
    window.setTimeout(() => setCopied(undefined), 1600);
  };

  if (!result && !analysis.loading) {
    return (
      <div className="page-shell centered-state">
        <div className="empty-state">
          <Sparkles />
          <h1>No analysis yet</h1>
          <p>
            {analysis.error ??
              "Describe your payment on Ask Raasta and I'll compare the routes for you."}
          </p>
          <Link to="/" className="text-action">
            Start on Ask Raasta
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell recommendation-page">
      <header className="payment-header">
        <div>
          <p className="eyebrow">Payment analyzed</p>
          <h1>
            <span className="money">{amount}</span> · {country} → Pakistan · {work}
          </h1>
        </div>
        <div className="payment-actions">
          <Link to="/" className="text-action">
            Edit context
          </Link>
          <button
            className="trust-button"
            type="button"
            onClick={() => window.dispatchEvent(new Event("raasta:open-sources"))}
          >
            <ShieldCheck /> Rule sources · Sep 12, 2026
          </button>
        </div>
      </header>

      {analysis.loading && (
        <div className="update-note" role="status">
          <CheckCircle2 />
          <span>
            <strong>Updating recommendation</strong> with your change…
          </span>
        </div>
      )}
      {!analysis.loading && updated && (
        <div className="update-note" role="status">
          <CheckCircle2 />
          <span>
            <strong>Recommendation updated</strong> using your adjusted preferences.
          </span>
        </div>
      )}
      {analysis.error && (
        <div className="analysis-error" role="status">
          <p>{analysis.error}</p>
          <Button onClick={() => void applySensitivity({})}>Retry</Button>
        </div>
      )}

      <SectionHeading
        title="Best route for this payment"
        description="Ranked by Raasta's Pakistan route engine for your timing, setup and preferences."
      />
      <div className={cn("recommendation-grid", updated && "reranked")}>
        {bestNow ? (
          <RouteCard route={bestNow} />
        ) : (
          <NoRouteCard
            sameDay={sameDayBlocked}
            onRelax={() => void applySensitivity({ wait: true })}
          />
        )}
        {bestLongTerm && <LongTermCard route={bestLongTerm} />}
      </div>

      {warnings.length > 0 && (
        <section className="section-block">
          <SectionHeading
            title="Things Raasta will not assume"
            description="Limits the engine applies instead of guessing."
          />
          <div className="alternatives">
            {warnings.map((guardrail) => (
              <article className="alternative-card" key={guardrail.code}>
                <span>
                  <AlertTriangle /> Important
                </span>
                <h3>{guardrail.title}</h3>
                <p>{guardrail.message}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="section-block">
        <SectionHeading
          title="Why Raasta chose this"
          description="The recommendation changes when your situation changes."
        />
        <div className="reasoning-chain">
          {(bestNow ?? bestLongTerm)?.reasons.slice(0, 5).map((reason, index, list) => (
            <div className="reason-step" key={reason}>
              <div>
                <Check />
                <span>{index + 1}</span>
              </div>
              <strong>Reason {index + 1}</strong>
              <small>{reason}</small>
              {index < list.length - 1 && <ChevronRight className="reason-arrow" />}
            </div>
          ))}
        </div>
        {(bestNow ?? bestLongTerm)?.tradeoffs.length ? (
          <ul className="bank-question-list">
            {(bestNow ?? bestLongTerm)?.tradeoffs.map((tradeoff) => (
              <li key={tradeoff}>{tradeoff}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="section-block sensitivity">
        <SectionHeading
          title="What would change my recommendation?"
          description="Each change is sent back to the engine and re-ranked."
        />
        <div className="toggle-row">
          <ToggleChip
            selected={waitTwoDays}
            disabled={analysis.loading}
            onClick={() => void applySensitivity({ wait: !waitTwoDays })}
          >
            I can wait 2 days
          </ToggleChip>
          <ToggleChip
            selected={noFx}
            disabled={analysis.loading}
            onClick={() => void applySensitivity({ fx: !noFx })}
          >
            I don't need to keep FX
          </ToggleChip>
          <ToggleChip
            selected={noIslamic}
            disabled={analysis.loading}
            onClick={() => void applySensitivity({ islamic: !noIslamic })}
          >
            Islamic banking isn't required
          </ToggleChip>
        </div>
        {result?.sensitivity.map((item) => (
          <p className="sensitivity-note" key={item.label}>
            {item.explanation}
          </p>
        ))}
      </section>

      <div className="info-accordions">
        <Disclosure title="🇵🇰 Pakistan Context" subtitle="Why local factors matter">
          <PakistanContext facts={result?.contextFacts ?? []} />
        </Disclosure>
        <Disclosure title="Estimated Cost Breakdown" subtitle="No fake precision">
          <CostBreakdown route={bestNow ?? bestLongTerm} />
        </Disclosure>
      </div>

      {(result?.alternatives.length ?? 0) > 0 && (
        <section className="section-block">
          <SectionHeading
            title="Other routes worth knowing"
            description="The closest alternatives the engine ranked."
          />
          <div className="alternatives">
            {result?.alternatives.slice(0, 2).map((alternative) => (
              <article className="alternative-card" key={alternative.routeId}>
                <span>{alternative.mode === "now" ? "Usable now" : "Longer-term setup"}</span>
                <h3>{alternative.routeName}</h3>
                <div>
                  <strong>Why consider it</strong>
                  <p>{alternative.reasons[0] ?? "Ranked close to the recommended route."}</p>
                </div>
                <div>
                  <strong>Why it wasn't #1</strong>
                  <p>{alternative.tradeoffs[0] ?? "It scored lower on your priorities."}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="next-steps">
        <SectionHeading
          title="What should I do next?"
          description="A simple checklist for this payment."
        />
        <ol>
          {[
            "Confirm the route",
            "Check your receiving account",
            "Send payment instructions to your client",
            "Save your invoice and payment proof",
            "Check the PRC/ePRC after the payment arrives",
          ].map((item, index) => (
            <li key={item}>
              <span>{index + 1}</span>
              <div>
                <strong>{item}</strong>
                <small>
                  {
                    [
                      bestNow
                        ? `Use ${bestNow.routeName} for this payment.`
                        : `No same-day route is available — review ${bestLongTerm?.routeName ?? "the long-term setup"} or change your timing.`,
                      `Confirm your ${bank} receiving details before sharing them.`,
                      "Use a clear invoice reference so the payment can be identified.",
                      "Keep both together for your payment records.",
                      "Compare the classification with the work you completed.",
                    ][index]
                  }
                </small>
              </div>
            </li>
          ))}
        </ol>
        {bestNow && (
          <Button size="lg" onClick={() => setInstructions(true)}>
            <Mail /> Generate Instructions for Client
          </Button>
        )}
      </section>
      <p className="disclaimer">
        Raasta provides informational guidance only. Fees, timing, tax and regulatory outcomes
        depend on your account and circumstances and should be verified where needed.
      </p>
      <Sheet open={instructions} onOpenChange={setInstructions}>
        <SheetContent className="instructions-drawer">
          <SheetHeader>
            <SheetTitle>Client Payment Instructions</SheetTitle>
            <SheetDescription>
              A ready-to-share message using placeholder details only.
            </SheetDescription>
          </SheetHeader>
          <div className="message-preview">
            <p>{simple ? simpleMessage : fullOpening}</p>
            <dl>
              <div>
                <dt>Payment method</dt>
                <dd>{routeName} receiving details</dd>
              </div>
              <div>
                <dt>Account name</dt>
                <dd>YOUR NAME</dd>
              </div>
              <div>
                <dt>Invoice reference</dt>
                <dd className="money">INV-XXXX</dd>
              </div>
              <div>
                <dt>Amount</dt>
                <dd className="money">{amount}</dd>
              </div>
            </dl>
            {!simple && <p>Thank you — please let me know once the payment is sent.</p>}
          </div>
          <div className="drawer-actions">
            <Button onClick={() => copy("message", displayedMessage)}>
              <Copy />
              {copied === "message" ? "Copied" : "Copy"}
            </Button>
            <Button variant="outline" onClick={() => copy("email", emailMessage)}>
              <Clipboard />
              {copied === "email" ? "Copied" : "Copy email version"}
            </Button>
            <Button variant="ghost" onClick={() => setSimple((current) => !current)}>
              {simple ? "Use full version" : "Make it simpler"}
            </Button>
          </div>
          {copyError && (
            <p className="copy-error" role="status">
              Couldn't copy automatically. Please select the text manually.
            </p>
          )}
          <p className="helper-text">
            Replace every placeholder with your own verified payment details before sending.
          </p>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function RouteCard({ route }: { route: RouteOption }) {
  const steps = routeSteps(route.routeName);
  return (
    <article className="route-card primary-route">
      <div className="route-card-top">
        <span className="route-badge">BEST NOW</span>
        <StatusBadge type="estimated" help="Timing and cost may vary by account and transaction." />
      </div>
      <h2>{route.routeName}</h2>
      <p>{route.reasons[0] ?? "Ranked highest for your current setup."}</p>
      <div className="route-flow">
        {steps.map((node, index) => (
          <div key={node} className="route-flow-part">
            <span>
              <Building2 />
              {node}
            </span>
            {index < steps.length - 1 && <ArrowRight />}
          </div>
        ))}
      </div>
      <div className="route-metrics">
        <Metric
          label="Cost"
          value={route.cost.certainty === "estimated" ? "Estimated" : route.cost.certainty}
          type="estimated"
        />
        <Metric
          label="Timing fit"
          value={scoreLabel(route.breakdown["urgency"], ["Strong", "Moderate", "Limited"])}
          type="estimated"
        />
        <Metric
          label="Keep foreign currency"
          value={scoreLabel(route.breakdown["fxRetention"], ["Supported", "Partial", "Limited"])}
          type={(route.breakdown["fxRetention"] ?? 0) >= 0.8 ? "verified" : "needs"}
        />
        <Metric
          label="Payment records"
          value={scoreLabel(route.breakdown["documentation"], [
            "Strong",
            "Workable",
            "May need verification",
          ])}
          type={(route.breakdown["documentation"] ?? 0) >= 0.8 ? "verified" : "needs"}
        />
      </div>
    </article>
  );
}

function NoRouteCard({ sameDay, onRelax }: { sameDay: boolean; onRelax: () => void }) {
  return (
    <article className="route-card primary-route">
      <div className="route-card-top">
        <span className="route-badge">BEST NOW</span>
        <StatusBadge type="needs" help="Raasta will not label an uncertain route as same-day." />
      </div>
      <h2>
        {sameDay
          ? "No route can be confidently recommended for same-day receipt"
          : "No route can be confidently recommended right now"}
      </h2>
      <p>
        The routes Raasta models do not confidently get funds into your account today. If your
        client only needs to send the payment today, change the timing requirement and compare
        again.
      </p>
      <div className="drawer-actions">
        <Button variant="outline" onClick={onRelax}>
          Compare with flexible timing
        </Button>
        <Link to="/" className="text-action">
          Edit timing or context
        </Link>
      </div>
    </article>
  );
}

function LongTermCard({ route }: { route: RouteOption }) {
  return (
    <article className="route-card long-term">
      <div className="route-card-top">
        <span className="route-badge soft">BEST LONG-TERM</span>
      </div>
      <h2>{route.routeName}</h2>
      <p>{route.reasons[0] ?? "A stronger setup for recurring export income."}</p>
      <ul className="benefit-list">
        {route.reasons.slice(1, 4).map((reason) => (
          <li key={reason}>
            <Check />
            {reason}
          </li>
        ))}
      </ul>
      <p className="term-helper">
        <strong>ESFCA</strong> is a linked account that can let eligible exporters retain part of
        their earnings in foreign currency.
      </p>
    </article>
  );
}

function Metric({
  label,
  value,
  type,
}: {
  label: string;
  value: string;
  type: "verified" | "estimated" | "needs";
}) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
      <StatusBadge
        type={type}
        help={
          type === "verified"
            ? "Grounded in the engine's current rule set."
            : type === "estimated"
              ? "This can vary by provider, account or timing."
              : "Your exact setup should be confirmed."
        }
      />
    </div>
  );
}

function ToggleChip({
  selected,
  onClick,
  disabled,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      className={cn("toggle-chip", selected && "selected")}
      onClick={onClick}
    >
      <span>{selected && <Check />}</span>
      {children}
    </button>
  );
}

function PakistanContext({ facts }: { facts: ContextFact[] }) {
  return (
    <div className="context-list">
      {facts.map((fact) => {
        const status = factStatus(fact.status);
        return (
          <div key={fact.field}>
            <div>
              <span>{FACT_LABELS[fact.field] ?? fact.field}</span>
              <strong>{fact.value}</strong>
              <p>{fact.note ?? "Used by the engine when ranking your routes."}</p>
            </div>
            <StatusBadge type={status.type} label={status.label} />
          </div>
        );
      })}
      <p className="legal-note">
        Raasta provides informational guidance only. Tax and regulatory outcomes should be verified
        with qualified professionals or the relevant institution.
      </p>
    </div>
  );
}

function CostBreakdown({ route }: { route: RouteOption | null }) {
  if (!route) return <p className="helper-text">No cost view is available without a route.</p>;
  const { cost } = route;
  const range = (min: number | null, max: number | null) =>
    min === null && max === null
      ? "Estimated"
      : `${min ?? "?"} – ${max ?? "?"} ${cost.grossCurrency ?? ""}`.trim();
  const rows: Array<[string, string]> = [
    [
      "Client sends",
      cost.grossAmount !== null ? `${cost.grossAmount} ${cost.grossCurrency ?? ""}`.trim() : "—",
    ],
    ["Provider fee", range(cost.feeMin, cost.feeMax)],
    ["Bank / intermediary charges", "Variable"],
    ["Estimated amount in PKR", range(cost.estimatedPkrMin, cost.estimatedPkrMax)],
  ];
  return (
    <div className="cost-grid">
      {rows.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong className={label === "Client sends" ? "money" : ""}>{value}</strong>
        </div>
      ))}
      {cost.notes.map((note) => (
        <p key={note}>{note}</p>
      ))}
    </div>
  );
}

function Disclosure({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <details className="disclosure">
      <summary>
        <span className="accordion-title">
          {title} <small>{subtitle}</small>
        </span>
        <ChevronDown />
      </summary>
      <div className="disclosure-content">{children}</div>
    </details>
  );
}
