# Raasta AI Frontend Prototype

## Build
- Create a responsive app shell with compact desktop sidebar, mobile navigation, trust state, and source evidence drawer.
- Build `/` as the Ask Raasta workflow: prompt examples, mock context extraction, editable fields, urgency clarification, and timed reasoning sequence.
- Build `/recommendation` with the best-now and long-term routes, live re-ranking, reasoning chain, Pakistan context, alternatives, estimated costs, next steps, and client-instructions drawer.
- Build `/prc-check` with local file selection, simulated analysis, document preview, mismatch and positive outcomes, retry/manual-code error state, and privacy copy.
- Use only local React state and deterministic mock data. No backend, authentication, storage, external calls, or persistent uploads.

## Design System
- Apply the locked warm off-white, white, mint, emerald, amber, and blue-gray palette through semantic tokens.
- Use Manrope for readable interface text and a mono face only for financial values and codes.
- Keep bordered 14–16px surfaces, restrained shadows, visible focus states, and accessible status labels with icons.
- Add subtle transitions for analysis, drawers, accordions, and recommendation reordering without gradients or decorative effects.

## Structure
- Add reusable shell, trust/status, drawer, accordion, loading, and route-specific feature components.
- Keep source content shared between screens and make every referenced navigation destination functional.
- Add unique page metadata for every content route.

## Verification
- Check the main Ask → clarification → loading → recommendation flow.
- Check recommendation re-ranking, accordions, source/client drawers, and copy actions.
- Check PRC upload, mismatch/positive toggles, and manual-code fallback.
- Verify desktop and mobile layouts, keyboard usability, runtime health, and final build status.
