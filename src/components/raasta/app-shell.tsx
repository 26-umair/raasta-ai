import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, FileCheck2, Menu, MessageSquareText, Route as RouteIcon, ShieldCheck } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./shared";

const nav = [
  { to: "/" as const, label: "Ask Raasta", Icon: MessageSquareText },
  { to: "/recommendation" as const, label: "Recommendations", Icon: RouteIcon },
  { to: "/prc-check" as const, label: "PRC Check", Icon: FileCheck2 },
];

function Brand() { return <div className="brand"><div className="brand-mark" aria-hidden="true"><span>R</span></div><div><strong>Raasta AI</strong><small>Pakistan Freelancer<br />Payment Intelligence</small></div></div>; }

function SourceEvidence({ onClose }: { onClose?: () => void }) {
  return <div className="drawer-stack"><div className="drawer-intro"><ShieldCheck /><p>Evidence labels are mock metadata for this frontend prototype. Live links will be added later.</p></div>{[
    ["SBP", "Foreign-currency retention framework", "Verified", "12 Sep 2026"],
    ["FBR", "IT / ITeS tax context", "Professional verification recommended", "12 Sep 2026"],
    ["PSEB", "Freelancer registration / IT export context", "Verified", "12 Sep 2026"],
    ["Provider information", "Account features and availability", "May change", "12 Sep 2026"],
  ].map(([name, topic, status, date]) => <article className="evidence-item" key={name}><div><span className="evidence-source">{name}</span><StatusBadge type={status === "Verified" ? "verified" : status === "May change" ? "estimated" : "needs"} label={status} /></div><h3>{topic}</h3><p>Reviewed {date}</p></article>)}{onClose && <Button variant="outline" onClick={onClose}>Done</Button>}</div>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const navigation = <><Brand /><nav aria-label="Primary navigation" className="side-nav">{nav.map(({ to, label, Icon }) => <Link key={to} to={to} onClick={() => setMenuOpen(false)} className={cn("side-link", path === to && "active")}><Icon />{label}</Link>)}<button className="side-link" type="button" onClick={() => { setSourcesOpen(true); setMenuOpen(false); }}><BookOpen />Sources</button></nav><button className="verified-box" type="button" onClick={() => setSourcesOpen(true)}><span><ShieldCheck />Rules verified</span><strong>12 Sep 2026</strong><small>SBP · FBR · PSEB</small></button></>;
  return <div className="app-shell"><aside className="desktop-sidebar">{navigation}</aside><header className="mobile-header"><Brand /><Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu /></Button></header><main className="app-main">{children}</main><Sheet open={menuOpen} onOpenChange={setMenuOpen}><SheetContent side="left" className="mobile-nav-sheet">{navigation}</SheetContent></Sheet><Sheet open={sourcesOpen} onOpenChange={setSourcesOpen}><SheetContent className="evidence-drawer"><SheetHeader><SheetTitle>Rule Evidence</SheetTitle><SheetDescription>What currently supports Raasta's Pakistan-specific context.</SheetDescription></SheetHeader><SourceEvidence onClose={() => setSourcesOpen(false)} /></SheetContent></Sheet></div>;
}
