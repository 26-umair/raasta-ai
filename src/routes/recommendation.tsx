import { createFileRoute } from "@tanstack/react-router";
import { RecommendationPage } from "@/components/raasta/recommendation-page";

export const Route = createFileRoute("/recommendation")({
  validateSearch: (search: Record<string, unknown>) => ({ flexible: search.flexible === "yes" ? "yes" : undefined }),
  head: () => ({ meta: [
    { title: "Payment Recommendation — Raasta AI" },
    { name: "description", content: "Review the best current and long-term payment routes for a Pakistan-based freelancer." },
    { property: "og:title", content: "Payment Recommendation — Raasta AI" },
    { property: "og:description", content: "Review contextual payment-route reasoning for a Pakistan-based freelancer." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: RecommendationRoute,
});
function RecommendationRoute() { const search = Route.useSearch(); return <RecommendationPage startsFlexible={search.flexible === "yes"} />; }
