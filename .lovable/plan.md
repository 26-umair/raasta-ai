# Raasta AI Surgical Frontend Fixes

## Scope
Preserve the current visual system and all existing mock flows. Make only the requested frontend interaction fixes, with no backend, API, authentication, persistence, or real financial intelligence.

## Implementation
1. Add a lightweight in-memory payment-context provider at the shared app shell level.
2. Define deterministic mock scenarios for every Ask Raasta example chip. Selecting a chip updates both its prompt and detected context.
3. Write context edits and urgency into shared state before navigation, then use those values throughout the visible recommendation summary, route wording, evidence context, cost display, and client instructions where relevant.
4. Keep recommendations explicitly framed as mock guidance when a selected scenario has no dedicated recommendation variant.
5. Add full/simplified client instruction variants with a local toggle.
6. Add a bank-questions panel to the PRC mismatch result, including beginner-friendly questions and the required caution note.
7. Add a shared clipboard helper using `navigator.clipboard.writeText`, a safe selection-based fallback, temporary success labels, and a visible non-blocking failure message.

## Verification
- Golden scenario edits persist into the recommendation.
- US $3,000 and Upwork examples show coherent detected context and recommendation summaries.
- Client instructions copy the currently displayed full or simplified text.
- PRC bank questions open and copy correctly.
- Existing recommendation re-ranking, disclosures, sources, PRC states, and desktop/mobile behavior remain intact.
- Confirm the project builds cleanly and contains no backend integration.
