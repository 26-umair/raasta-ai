import { useState, type ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clipboard,
  Copy,
  Landmark,
  Mail,
  Route,
  ShieldCheck,
  Timer,
  WalletCards,
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
import { SectionHeading, StatusBadge } from "./shared";
import { copyText } from "./clipboard";
import { getPaymentValue, usePaymentContext, type PaymentField } from "./payment-context";

const immediate = {
  title: "Payoneer → Meezan",
  reason:
    "Best fit for this payment because it's due today and you already have this setup available.",
  route: ["UK Client", "Payoneer", "Meezan Bank"],
};
const optimal = {
  title: "Meezan Freelancer Account + ESFCA",
  reason:
    "Better for recurring IT export income because it matches your foreign-currency goal, Islamic banking preference and documentation needs.",
  route: ["UK Client", "Bank transfer", "Meezan Freelancer + ESFCA"],
};

export function RecommendationPage({ startsFlexible = false }: { startsFlexible?: boolean }) {
  const payment = usePaymentContext();
  const [flexible, setFlexible] = useState(startsFlexible);
  const [noFx, setNoFx] = useState(false);
  const [noIslamic, setNoIslamic] = useState(false);
  const [instructions, setInstructions] = useState(false);
  const [copied, setCopied] = useState<string>();
  const [simple, setSimple] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const amount = getPaymentValue(payment.fields, "Amount", "£2,500");
  const country = getPaymentValue(payment.fields, "Client", "United Kingdom");
  const work = getPaymentValue(payment.fields, "Work", "Web development");
  const bank = getPaymentValue(payment.fields, "Current bank", "Meezan");
  const source = getPaymentValue(payment.fields, "Payment source", "Direct client");
  const existingRoute = getPaymentValue(payment.fields, "Existing payment route", "Payoneer");
  const hasMeezan = bank.toLowerCase().includes("meezan");
  const routeProvider = existingRoute.toLowerCase().includes("upwork")
    ? "Upwork withdrawal"
    : existingRoute.toLowerCase().includes("wise") || source.toLowerCase().includes("wise")
      ? "Wise"
      : existingRoute;
  const currentRoute = {
    ...immediate,
    title: `${routeProvider} → ${bank}`,
    reason: `Best-fit mock example for this payment because ${payment.urgency === "today" ? "timing is the main constraint" : "it uses the context you provided"}.`,
    route: [`${country} client`, routeProvider, `${bank} Bank`],
  };
  const futureBank = hasMeezan ? "Meezan Freelancer Account + ESFCA" : "Freelancer Account + ESFCA";
  const futureRoute = {
    ...optimal,
    title: futureBank,
    reason: `A longer-term mock option aligned with your foreign-currency, banking and documentation preferences.`,
    route: [`${country} client`, "Bank transfer", futureBank],
  };
  const best = flexible ? futureRoute : currentRoute;
  const fullOpening =
    "Hi Sarah, here's the recommended way to pay this invoice. Please use the payment details provided below and include the invoice reference so the payment can be identified correctly.";
  const simpleMessage =
    "Hi Sarah, please use the payment details below for this invoice and include the invoice reference when sending the payment. Let me know once it's sent. Thank you.";
  const detailsText = `Payment method: ${routeProvider} receiving details\nAccount name: YOUR NAME\nInvoice reference: INV-XXXX\nAmount: ${amount}`;
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
  return (
    <div className="page-shell recommendation-page">
      <header className="payment-header">
        <div>
          <p className="eyebrow">Payment analyzed</p>
          <h1>
            <span className="money">{amount}</span> · {country} → Pakistan · {work}
          </h1>
          {payment.scenario !== "golden" && (
            <p className="mock-context-note">
              Mock recommendation example based on the selected scenario.
            </p>
          )}
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
            <ShieldCheck /> Verified rules · Sep 12, 2026
          </button>
        </div>
      </header>
      {flexible && (
        <div className="update-note" role="status">
          <CheckCircle2 />
          <span>
            <strong>Recommendation updated</strong> because urgency is no longer the main
            constraint.
          </span>
        </div>
      )}
      <SectionHeading
        title="Best route for this payment"
        description="Ranked for your current timing, setup and preferences."
      />
      <div className={cn("recommendation-grid", flexible && "reranked")}>
        <RouteCard kind="best" data={best} flexible={flexible} />
        {!flexible && <LongTermCard title={futureBank} />}
      </div>
      <section className="section-block">
        <SectionHeading
          title="Why Raasta chose this"
          description="The recommendation changes when your situation changes."
        />
        <div className="reasoning-chain">
          {(
            [
              [
                payment.urgency === "today" ? "Payment due today" : "Timing is flexible",
                payment.urgency === "today" ? "Speed matters most" : "Setup can be optimized",
                Timer,
              ],
              [`${routeProvider} available`, "Current mock route", WalletCards],
              [
                "Retain foreign currency",
                getPaymentValue(payment.fields, "Keep foreign currency", "Yes"),
                CircleDollarSign,
              ],
              [
                "Islamic banking",
                getPaymentValue(payment.fields, "Islamic banking", "Preferred"),
                Landmark,
              ],
              ["Best Now", flexible ? "Optimal setup" : "Available route", Route],
            ] as Array<[string, string, ComponentType<{ className?: string }>]>
          ).map(([title, text, Icon], index) => (
            <div className="reason-step" key={title}>
              <div>
                <Icon />
                <span>{index + 1}</span>
              </div>
              <strong>{title}</strong>
              <small>{text}</small>
              {index < 4 && <ChevronRight className="reason-arrow" />}
            </div>
          ))}
        </div>
      </section>
      <section className="section-block sensitivity">
        <SectionHeading
          title="What would change my recommendation?"
          description="Try a change to see how the ranking responds."
        />
        <div className="toggle-row">
          <ToggleChip selected={flexible} onClick={() => setFlexible(!flexible)}>
            I can wait 2 days
          </ToggleChip>
          <ToggleChip selected={noFx} onClick={() => setNoFx(!noFx)}>
            I don't need to keep FX
          </ToggleChip>
          <ToggleChip selected={noIslamic} onClick={() => setNoIslamic(!noIslamic)}>
            Islamic banking isn't required
          </ToggleChip>
        </div>
        {(noFx || noIslamic) && (
          <p className="sensitivity-note">
            These preferences affect the reasoning, but urgency remains the deciding factor in this
            mock scenario.
          </p>
        )}
      </section>
      <div className="info-accordions">
        <Disclosure title="🇵🇰 Pakistan Context" subtitle="Why local factors matter">
          <PakistanContext />
        </Disclosure>
        <Disclosure title="Estimated Cost Breakdown" subtitle="No fake precision">
          <CostBreakdown />
        </Disclosure>
      </div>
      <section className="section-block">
        <SectionHeading
          title="Other routes worth knowing"
          description="Only the closest alternatives for this payment."
        />
        <div className="alternatives">
          <Alternative
            title="Lowest estimated cost"
            route="Direct bank transfer → freelancer account"
            consider="May reduce provider costs and create a direct banking record."
            notOne="Setup and intermediary charges are less predictable for today's payment."
          />
          <Alternative
            title="Client-friendly alternative"
            route="Client uses Wise → Pakistani personal account"
            consider="Convenient for the sender and familiar to many UK clients."
            notOne="It is less aligned with your foreign-currency and documentation priorities, and differs from holding Wise USD details."
          />
        </div>
      </section>
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
                      `Use ${best.title} for this mock payment.`,
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
        <Button size="lg" onClick={() => setInstructions(true)}>
          <Mail /> Generate Instructions for Client
        </Button>
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
              A ready-to-share mock message using placeholder details only.
            </SheetDescription>
          </SheetHeader>
          <div className="message-preview">
            <p>{simple ? simpleMessage : fullOpening}</p>
            <dl>
              <div>
                <dt>Payment method</dt>
                <dd>{routeProvider} receiving details</dd>
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

function RouteCard({
  data,
  flexible,
}: {
  kind: "best";
  data: typeof immediate;
  flexible: boolean;
}) {
  return (
    <article className="route-card primary-route">
      <div className="route-card-top">
        <span className="route-badge">BEST NOW</span>
        <StatusBadge type="estimated" help="Timing and cost may vary by account and transaction." />
      </div>
      <h2>{data.title}</h2>
      <p>{data.reason}</p>
      <div className="route-flow">
        {data.route.map((node, index) => (
          <div key={node} className="route-flow-part">
            <span>
              <Building2 />
              {node}
            </span>
            {index < data.route.length - 1 && <ArrowRight />}
          </div>
        ))}
      </div>
      <div className="route-metrics">
        <Metric label="Cost" value="Estimated" type="estimated" />
        <Metric label="Speed" value={flexible ? "Setup first" : "1–3 days"} type="estimated" />
        <Metric
          label="Keep foreign currency"
          value={flexible ? "Supported" : "Limited"}
          type="verified"
        />
        <Metric
          label="Payment records"
          value={flexible ? "Stronger setup" : "May need verification"}
          type={flexible ? "verified" : "needs"}
        />
      </div>
    </article>
  );
}
function LongTermCard({ title }: { title: string }) {
  return (
    <article className="route-card long-term">
      <div className="route-card-top">
        <span className="route-badge soft">BEST LONG-TERM</span>
      </div>
      <h2>{title}</h2>
      <p>{optimal.reason}</p>
      <ul className="benefit-list">
        <li>
          <Check />
          Keep foreign currency
        </li>
        <li>
          <Check />
          Banking preference considered
        </li>
        <li>
          <Check />
          Stronger export setup
        </li>
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
            ? "Grounded in the current mock rule set."
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
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn("toggle-chip", selected && "selected")}
      onClick={onClick}
    >
      <span>{selected && <Check />}</span>
      {children}
    </button>
  );
}
function PakistanContext() {
  const { fields } = usePaymentContext();
  const rows = [
    [
      "PSEB",
      getPaymentValue(fields, "PSEB", "Registered"),
      "Relevant to the freelancer context you provided.",
      "verified",
    ],
    [
      "Service category",
      getPaymentValue(fields, "Category", "IT / ITeS"),
      `Detected from ${getPaymentValue(fields, "Work", "web development")}.`,
      "detected",
    ],
    [
      "Payment-purpose context",
      "9186",
      "A purpose code associated with freelance computer and information services.",
      "likely",
    ],
    [
      "Foreign-currency retention",
      getPaymentValue(fields, "Keep foreign currency", "Yes"),
      "Your preference can make freelancer account / ESFCA options more relevant.",
      "verified",
    ],
    [
      "Islamic banking",
      getPaymentValue(fields, "Islamic banking", "Preferred"),
      "Based on the preference entered in this mock.",
      "verified",
    ],
    [
      "Tax",
      "Needs professional verification",
      "Confirm your personal treatment with a qualified professional.",
      "needs",
    ],
  ] as const;
  return (
    <div className="context-list">
      {rows.map(([label, value, helper, status]) => (
        <div key={label}>
          <div>
            <span>{label}</span>
            <strong className={label.includes("purpose") ? "money" : ""}>{value}</strong>
            <p>{helper}</p>
          </div>
          <StatusBadge
            type={status}
            label={
              status === "verified" && label === "Foreign-currency retention"
                ? "Verified rule"
                : undefined
            }
          />
        </div>
      ))}
      <p className="legal-note">
        Raasta provides informational guidance only. Tax and regulatory outcomes should be verified
        with qualified professionals or the relevant institution.
      </p>
    </div>
  );
}
function CostBreakdown() {
  const { fields } = usePaymentContext();
  const amount = getPaymentValue(fields, "Amount", "£2,500");
  const rows: Array<[string, string]> = [
    ["Client sends", amount],
    ["Provider fee", "Estimated"],
    ["Bank / intermediary charges", "Variable"],
    ["FX effect", "Estimated"],
    ["Estimated amount received", "A range will appear when verified data is available"],
  ];
  return (
    <div className="cost-grid">
      {rows.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong className={label === "Client sends" ? "money" : ""}>{value}</strong>
        </div>
      ))}
      <p>
        Final fees and exchange rates depend on the provider, bank, account and transaction timing.
      </p>
    </div>
  );
}
function Alternative({
  title,
  route,
  consider,
  notOne,
}: {
  title: string;
  route: string;
  consider: string;
  notOne: string;
}) {
  return (
    <article className="alternative-card">
      <span>{title}</span>
      <h3>{route}</h3>
      <div>
        <strong>Why consider it</strong>
        <p>{consider}</p>
      </div>
      <div>
        <strong>Why it wasn't #1</strong>
        <p>{notOne}</p>
      </div>
    </article>
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
