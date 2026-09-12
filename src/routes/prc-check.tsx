import { createFileRoute } from "@tanstack/react-router";
import { PrcCheckPage } from "@/components/raasta/prc-page";

export const Route = createFileRoute("/prc-check")({
  head: () => ({ meta: [
    { title: "PRC Check — Raasta AI" },
    { name: "description", content: "Understand how a freelancer payment may have been recorded on a PRC or ePRC document." },
    { property: "og:title", content: "PRC Check — Raasta AI" },
    { property: "og:description", content: "Compare a mock PRC classification with your freelance payment context." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: PrcCheckPage,
});
