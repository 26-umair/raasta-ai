import { useEffect, useState, type ReactNode } from "react";
import { Check, CircleAlert, Clock3, Info, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type StatusType = "verified" | "estimated" | "needs" | "detected" | "likely";

const statusConfig = {
  verified: { label: "Verified", Icon: ShieldCheck, className: "status-verified" },
  estimated: { label: "Estimated", Icon: Clock3, className: "status-estimated" },
  needs: { label: "Needs verification", Icon: CircleAlert, className: "status-needs" },
  detected: { label: "Detected", Icon: Check, className: "status-info" },
  likely: { label: "Likely", Icon: Info, className: "status-estimated" },
};

export function StatusBadge({ type, label, help }: { type: StatusType; label?: string | undefined; help?: string | undefined }) {
  const item = statusConfig[type];
  const badge = <span className={cn("status-badge", item.className)}><item.Icon />{label ?? item.label}</span>;
  if (!help) return badge;
  return <TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`${label ?? item.label}: ${help}`}>{badge}</button></TooltipTrigger><TooltipContent className="max-w-64">{help}</TooltipContent></Tooltip></TooltipProvider>;
}

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="section-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>;
}

export function LoadingSequence({ steps, onComplete }: { steps: string[]; onComplete: () => void }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (active >= steps.length - 1) { const done = window.setTimeout(onComplete, 350); return () => window.clearTimeout(done); }
    const timer = window.setTimeout(() => setActive((value) => value + 1), 350);
    return () => window.clearTimeout(timer);
  }, [active, onComplete, steps.length]);
  return <div className="loading-sequence" aria-live="polite"><div className="analysis-mark"><span /><span /><span /></div><div><p className="eyebrow">Raasta is reasoning</p><h2>{steps[active]}</h2><div className="loading-progress"><span style={{ width: `${((active + 1) / steps.length) * 100}%` }} /></div><p className="muted">Step {active + 1} of {steps.length}</p></div></div>;
}
