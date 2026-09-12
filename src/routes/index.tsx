import { createFileRoute } from "@tanstack/react-router";
import { AskRaastaPage } from "@/components/raasta/ask-page";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Ask Raasta — Pakistan Payment Route Advisor" },
    { name: "description", content: "Compare payment routes for Pakistani freelancers using a clear, context-aware mock advisor." },
    { property: "og:title", content: "Ask Raasta — Pakistan Payment Route Advisor" },
    { property: "og:description", content: "Compare payment routes for Pakistani freelancers using a clear, context-aware mock advisor." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: AskRaastaPage,
});
