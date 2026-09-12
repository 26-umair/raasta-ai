# Raasta AI Guide

Bilkul bro — yeh frontend-only Lovable implementation prompt hai. Is stage par Supabase, Edge Functions, real AI calls, database, auth, APIs ya backend ko touch nahi karna. Pehle locked UI/UX ko polished working prototype mein convert karna hai using mock data.

# RAasta AI — Frontend-Only MVP Build

Build the complete frontend experience for **Raasta AI**, a Pakistan-specific AI payment-route advisor for freelancers.

This task is **FRONTEND ONLY**.

Do **not** connect Supabase.
Do **not** create Edge Functions.
Do **not** add authentication.
Do **not** create database tables.
Do **not** call any real AI/API/provider.
Do **not** implement live exchange rates.
Do **not** make backend assumptions.

Use local mock data and deterministic frontend interactions so the complete product experience can be reviewed before backend integration.

---

# 1. Product

## Name

**Raasta AI**

## Descriptor

**Pakistan Freelancer Payment Intelligence**

## Core Product Question

> How should I receive this payment in Pakistan?

Raasta helps a Pakistani freelancer understand the best way to receive a specific international payment based on their actual situation.

It considers:

- payment source
- client country
- amount and currency
- service category
- existing payment accounts
- urgency
- PSEB status
- desire to retain foreign currency
- documentation considerations
- Islamic banking preference
- convenience and estimated costs

The product should clearly communicate:

> **The cheapest payment route is not always the best route for a Pakistani freelancer.**

---

# 2. Design Direction — LOCKED

The final visual direction is a hybrid:

## Structure
Use the **AI Decision Workspace** structure.

## Visual styling
Use a **clean, friendly modern fintech UI**.

## Trust treatment
Use premium financial-product credibility cues.

The product should feel like:

> **Modern Pakistani fintech + visible AI reasoning + trustworthy financial intelligence**

Do not make it feel like:

- a crypto dashboard
- an accounting tool
- a generic AI chatbot
- a dark developer console
- a traditional Pakistani bank website
- a large corporate dashboard
- a marketing landing page

The product should immediately feel usable.

---

# 3. Visual System

## Main colors

Use these as the starting palette:

- App background: `#F7F8F5`
- Primary surface: `#FFFFFF`
- Soft mint surface: `#EEF7F1`
- Primary emerald: `#0E7A4B`
- Dark emerald: `#095C3A`
- Main text: `#17211C`
- Secondary text: `#66736C`
- Border: `#DDE6E0`

Use amber sparingly for estimates/warnings.

Use muted orange/red only for genuinely important verification states.

Use a restrained blue-gray for neutral informational states where needed.

### Important

No gradients.

No glassmorphism.

No glowing effects.

No oversized shadows.

No giant pill-shaped containers.

No excessive green.

Pakistan identity should be subtle and sophisticated, not literal.

---

# 4. Typography

Use a modern premium sans-serif such as:

**Inter**, **Geist**, or **Manrope**.

Use a mono font only for:

- currency values
- purpose codes
- technical IDs
- small financial figures

Examples:

`£2,500`

`9186`

`9471`

Do not use monospace for normal paragraphs.

Typography should remain highly readable and beginner-friendly.

---

# 5. Global Layout

Desktop is the primary presentation format because this will be demoed on a laptop.

Use a fixed left navigation sidebar approximately **200px wide**.

Main content should have a max width around **1180–1240px**.

Do not create unnecessary full-width empty space.

Use balanced spacing.

Card radius approximately **14–16px**.

Subtle 1px borders.

Minimal shadows.

---

# 6. Left Sidebar

Create a persistent desktop sidebar.

Top:

**Raasta AI**

Small sublabel:

`Pakistan Freelancer Payment Intelligence`

Navigation:

1. **Ask Raasta**
2. **Recommendations**
3. **PRC Check**
4. **Sources**

Use simple outline icons.

Active navigation state:

- pale mint background
- emerald icon
- emerald/dark text

Bottom of sidebar:

**Rules verified**

`12 Sep 2026`

Small supporting line:

`SBP · FBR · PSEB`

This is a mock trust state for now.

The sidebar should look compact and polished.

---

# 7. Route / Screen Architecture

Create these primary frontend routes/states:

## `/`
Ask Raasta

## `/recommendation`
Recommendation result

## `/prc-check`
PRC Check

## Sources
Can be a right-side drawer or lightweight route.

No login route.

No dashboard route.

No settings route.

No account/profile screens.

No transaction history.

---

# 8. Screen 01 — Ask Raasta

This is NOT a marketing homepage.

The user should immediately be able to use the product.

Top content:

Small eyebrow:

**AI Payment Advisor for Pakistan**

Main headline:

# How should you receive this payment in Pakistan?

Supporting copy:

> Tell Raasta about your client, payment and priorities. We'll compare the routes that actually fit your situation.

Create a large natural-language composer.

Prefill or provide a clickable demo example:

> I'm a PSEB-registered web developer in Pakistan. A UK client needs to pay me £2,500 today. They can use Wise or bank transfer. I already have Payoneer and a Meezan account, prefer Islamic banking, and I'd like to keep some foreign currency for software subscriptions.

Primary CTA:

**Find My Best Route**

Below the input, show small example prompt chips:

- `US client paying $3,000`
- `Upwork withdrawal`
- `I want to keep USD`
- `Islamic banking preferred`
- `Client only uses Wise`
- `I don't know what PSEB is`

Keep this section compact.

---

# 9. Beginner-Friendly Helper Layer

This product must work for Pakistani freelancers who do NOT already understand financial terminology.

Do not assume users know:

- PSEB
- ESFCA
- PRC/ePRC
- purpose codes
- SWIFT
- foreign-currency retention

Whenever technical terminology appears, provide short plain-English helper text.

Example:

**Keep foreign currency**

Small helper:

> Some Pakistani freelancer accounts can let eligible exporters retain part of their earnings in foreign currency.

Technical term can appear secondary:

`ESFCA`

Another example:

**PSEB**

Helper:

> Mainly relevant for eligible Pakistani IT and IT-enabled-services freelancers.

Always provide:

**I don't know**

or

**Not sure**

where appropriate.

Never punish the user for not knowing financial terminology.

---

# 10. AI Understanding State

After clicking **Find My Best Route**, do not immediately navigate away.

Transform the screen into:

## Here's what I understood

Use clean editable context chips/cards.

For the Golden Demo Scenario show:

- Client: `United Kingdom`
- Amount: `£2,500`
- Payment source: `Direct client`
- Work: `Web development`
- Category: `IT / ITeS`
- PSEB: `Registered`
- Current bank: `Meezan`
- Existing payment route: `Payoneer`
- Keep foreign currency: `Yes`
- Islamic banking: `Preferred`
- Timing: `Payment due today`

Use small edit icons.

Clearly label this as:

**Detected by Raasta**

Allow fields to be edited in a lightweight popover or inline state.

Do not open a huge form.

---

# 11. Smart Clarification

Below detected context show:

### One thing could materially change my recommendation.

Question:

> Do you need to receive this payment today, or can you wait to set up the optimal route?

Two choices:

**I need it today**

**I can wait / optimize first**

Then CTA:

**Compare My Routes**

For the frontend prototype, selection should change the mock recommendation data.

This interaction must be real on the frontend.

---

# 12. AI Loading State

After clicking Compare My Routes, show a short polished reasoning/loading sequence.

Do not use a generic spinner only.

Animate through short status messages:

**Understanding your payment**

→

**Checking routes available in Pakistan**

→

**Applying your preferences**

→

**Comparing documentation and FX options**

→

**Ranking your best routes**

Keep the entire sequence short.

Approximately 1.5–2.5 seconds total for mock mode.

---

# 13. Screen 02 — Recommendation

This is the most important screen.

The first viewport must make the recommendation immediately understandable.

Top summary:

**Payment analyzed**

`£2,500 · UK → Pakistan · Web Development`

Right side:

**Edit context**

Trust indicator:

`Verified rules · Sep 12, 2026`

---

# 14. Best Route for This Payment

Main heading:

# Best route for this payment

Large primary recommendation card.

Badge:

**BEST NOW**

For the default Golden Demo state:

## Payoneer → Meezan

Supporting sentence:

> Best fit for this payment because it's due today and you already have this setup available.

Do not imply this recommendation is a verified real-world financial recommendation yet; this is mock frontend content.

Create a simple route visualization:

`UK Client`

→

`Payoneer`

→

`Meezan Bank`

Use lightweight nodes and arrows.

No complicated flowchart.

Below show only four key user-facing items:

### Cost
**Estimated**

### Speed
**1–3 days**

### Keep foreign currency
**Limited**

### Payment records
**May need verification**

Use statuses:

- Verified
- Estimated
- Needs verification

Each state should have a tiny tooltip/helper.

---

# 15. Best Long-Term Setup

Immediately below or beside Best Now depending on available width.

Badge:

**BEST LONG-TERM**

Title:

## Meezan Freelancer Account + ESFCA

Description:

> Better for recurring IT export income because it better matches your foreign-currency goal, Islamic banking preference and documentation needs.

Show three compact benefits:

- `Keep foreign currency`
- `Islamic banking match`
- `Stronger export setup`

This card should be visually softer than Best Now, but still prominent.

---

# 16. Why Raasta Chose This

Create an AI reasoning section.

Heading:

## Why Raasta chose this

Use a horizontal reasoning chain rather than disconnected cards:

**Payment due today**

→

**Payoneer already available**

→

**You want to retain FX**

→

**Islamic banking preferred**

→

**Best Now recommendation**

Each node should include a short explanation.

This should visually communicate that the recommendation is contextual.

---

# 17. What Would Change My Recommendation?

Create an interactive section:

## What would change my recommendation?

Use toggle/chip controls:

- `I can wait 2 days`
- `I don't need to keep FX`
- `Islamic banking isn't required`

For this frontend mock:

### Interaction behavior

When the user activates:

**I can wait 2 days**

Update the recommendation UI so:

**Meezan Freelancer Account + ESFCA**

becomes the **Best Now** route.

Display a small note:

> Recommendation updated because urgency is no longer the main constraint.

The cards should visibly transition/reorder.

This interaction is important.

Do not fake it with only text.

---

# 18. Pakistan Context

Keep this collapsed by default.

Heading:

## 🇵🇰 Pakistan Context

When expanded show:

### PSEB
`Registered`

Status:
**Verified**

Plain-language note:

> Relevant to your IT export profile.

### Service category
`IT / ITeS`

Status:
**Detected**

### Payment-purpose context
`9186`

Status:
**Likely**

Helper:

> A purpose code associated with freelance computer and information services.

### Foreign-currency retention
`Relevant`

Status:
**Verified rule**

Helper:

> Your preference to keep some foreign currency makes freelancer account / ESFCA options more relevant.

### Islamic banking
`Preference matched`

Status:
**Verified product information**

### Tax
`Potential reduced treatment may be relevant`

Status:
**Needs professional verification**

Show a disclaimer:

> Raasta provides informational guidance only. Tax and regulatory outcomes should be verified with qualified professionals or the relevant institution.

---

# 19. Alternative Routes

Show maximum two alternatives.

Do not create a giant comparison table.

Example:

## Lowest estimated cost

Route placeholder.

Include:

**Why consider it**

and

**Why it wasn't #1**

Example text:

> May reduce provider costs, but is less aligned with your foreign-currency and documentation priorities.

Second:

## Client-friendly alternative

Example:

**Client uses Wise → Pakistani personal account**

Explain:

> Convenient for the sender, but this is different from a Pakistan resident holding Wise USD receiving details.

Again show:

**Why consider it**

**Why it wasn't #1**

---

# 20. Estimated Cost Breakdown

Keep collapsed by default.

Heading:

## Estimated Cost Breakdown

When expanded show:

**Client sends**
`£2,500`

**Provider fee**
`Estimated`

**Bank / intermediary charges**
`Variable`

**FX effect**
`Estimated`

**Estimated amount received**
Use a placeholder range, not fake precision.

Clearly show:

> Final fees and exchange rates depend on the provider, bank, account and transaction timing.

Do not display fake exact PKR results.

---

# 21. Beginner “What Should I Do Next?” Checklist

This is important.

Below recommendations create:

## What should I do next?

Show an easy numbered checklist:

1. **Confirm the route**
2. **Check your receiving account**
3. **Send payment instructions to your client**
4. **Save your invoice and payment proof**
5. **Check the PRC/ePRC after the payment arrives**

Make this section especially beginner-friendly.

---

# 22. Generate Client Instructions

Primary secondary-action button:

**Generate Instructions for Client**

Open a right-side drawer.

Drawer title:

## Client Payment Instructions

Mock message:

> Hi Sarah, here's the recommended way to pay this invoice. Please use the payment details provided below and include the invoice reference so the payment can be identified correctly.

Use dummy placeholders for financial details.

Never display real account information.

Buttons:

**Copy**

**Copy email version**

Optional:

**Make it simpler**

Keep this drawer polished and concise.

---

# 23. Screen 03 — PRC Check

Sidebar remains persistent.

Header:

# Check how your payment was recorded

Supporting copy:

> Upload a PRC/ePRC and Raasta will compare the document with the payment context you've provided.

Add helper:

> Not sure what a PRC is? It's a payment/remittance document issued through the banking process. Raasta can help you understand the key details.

Create large upload area:

**Drop your PRC here**

Accepted:

`PDF · JPG · PNG`

For this frontend-only version, do not perform real file analysis.

If user uploads any supported file, simulate the Golden Demo PRC result.

---

# 24. PRC Mock Analysis State

After upload show a polished loading state:

**Reading document**

→

**Extracting payment details**

→

**Checking payment classification**

→

**Comparing with your freelancer profile**

Then display split layout.

Left:

**Document Preview**

Use generic uploaded preview where possible, otherwise a placeholder preview.

Right:

## Extracted details

- Amount: `$1,500`
- Currency: `USD`
- Date: mock
- Bank: mock
- Purpose code: `9471`
- Payment description: mock

---

# 25. PRC Result

Primary beginner-friendly message:

## Something may need checking

Do not make the first line:

“MISMATCH ERROR”.

Then show:

### What you told Raasta

**Web development**

`IT / ITeS`

### What the document shows

**Purpose code: 9471**

### Context usually associated with your work

**9186**

Then:

### Potential classification mismatch

Supporting explanation:

> The payment information you provided looks like freelance IT export income, while this document appears to use a different remittance classification.

Critical safety copy:

> This does not necessarily mean your bank made an error. Payment classification can depend on how the money was routed. Verify the applicable treatment with your bank or qualified professional.

Actions:

**What should I ask my bank?**

**Check another PRC**

---

# 26. PRC Positive State

Also create a mock positive state accessible with a small toggle/dev demo button or example file.

Example:

Purpose code: `9186`

Result:

## Everything looks consistent

Supporting copy:

> The document classification appears consistent with the IT freelance work you described.

Do not say:

“100% compliant.”

---

# 27. Sources Drawer

Clicking a trust/source label should open a right-side evidence drawer.

Example structure:

## Rule Evidence

### SBP
**Foreign-currency retention framework**

Status:

`Verified`

Verified date:

`12 Sep 2026`

### FBR
**IT / ITeS tax context**

Status:

`Professional verification recommended`

### PSEB
**Freelancer registration / IT export context**

Status:

`Verified`

### Provider information
Status:

`May change`

Do not create fake external hyperlinks at this stage.

Use mock source metadata only.

Real source URLs will be added during backend/data integration.

---

# 28. Simple-First UX

The default experience should use plain English.

Prefer:

**Keep foreign currency**

instead of:

**ESFCA eligibility**

Prefer:

**Payment records**

instead of:

**export documentation compliance**

Prefer:

**Something may need checking**

instead of:

**classification mismatch detected**

Technical details can appear under:

**See technical details**

or helper tooltips.

---

# 29. Roman Urdu / Pakistani Friendliness

Do not translate the entire app into Roman Urdu.

Primary UI should remain professional simple English.

However use occasional friendly helper microcopy where useful.

Example:

> Not sure? That's okay — you can continue without this.

Do not make the app casual/slang-heavy.

---

# 30. Status Language

Use three trust states consistently:

### Verified
The underlying rule/provider fact is currently grounded.

### Estimated
The value can vary, such as fees or timing.

### Needs verification
The answer depends on user-specific financial/regulatory circumstances.

Use icons as well as labels.

Do not rely on color alone.

---

# 31. Empty / Error States

Create proper frontend states.

## Missing important information

> I need one more detail before I can compare your routes.

## Exact fee unavailable

> This fee can vary by account or transaction. I'll show it as an estimate.

## Route eligibility uncertain

> This route may be available, but your exact receiving setup needs verification.

## PRC cannot be read

> I couldn't confidently read the payment classification. Try a clearer copy or enter the purpose code manually.

Provide manual purpose-code input in this state.

---

# 32. Privacy UI

On PRC upload screen show small trust copy:

> Your document is used only for this analysis in the current prototype.

Do not claim encryption, deletion schedules or data practices that have not actually been implemented.

Do not persist uploads beyond the current frontend state.

---

# 33. Accessibility

Ensure:

- strong text contrast
- keyboard-accessible navigation
- visible focus states
- semantic buttons
- proper labels
- status indicators not dependent on color
- comfortable font sizes
- minimum touch target approximately 44px

---

# 34. Responsive Behavior

Desktop is priority.

At tablet/mobile:

- collapse sidebar into a compact navigation drawer
- stack recommendation cards vertically
- reasoning chain becomes vertical
- drawers can become bottom sheets/full-screen panels
- preserve all functionality

Do not compromise desktop layout for mobile.

---

# 35. Mock Golden Scenario Data

Use this as the default demonstration scenario:

```ts
const goldenScenario = {
  clientCountry: "United Kingdom",
  amount: 2500,
  currency: "GBP",
  paymentSource: "Direct client",
  service: "Web development",
  category: "IT / ITeS",
  psebStatus: "Registered",
  currentBank: "Meezan",
  existingRoutes: ["Payoneer"],
  keepForeignCurrency: true,
  islamicPreference: "Preferred",
  urgency: "Today",
};

Default mock result:

bestNow = {
  title: "Payoneer → Meezan",
  reason:
    "Best fit for this payment because it is due today and this setup is already available to you.",
};

bestLongTerm = {
  title: "Meezan Freelancer Account + ESFCA",
  reason:
    "Better suited to recurring IT export income, foreign-currency retention, Islamic banking preference and stronger export documentation.",
};

If urgency changes to flexible:

bestNow = bestLongTerm;

The UI should visibly re-rank.

36. Component Structure

Use clean reusable React components.

Suggested structure:

AppShell
  Sidebar
  TrustIndicator

AskRaastaPage
  PromptComposer
  ExamplePromptChips
  ContextExtractionPanel
  ClarificationCard
  AnalysisLoadingState

RecommendationPage
  PaymentSummary
  BestNowCard
  BestLongTermCard
  ReasoningChain
  RecommendationSensitivity
  PakistanContextAccordion
  AlternativeRouteCard
  CostBreakdownAccordion
  NextStepsChecklist
  ClientInstructionsDrawer
  SourceEvidenceDrawer

PrcCheckPage
  PrcUploadZone
  PrcAnalysisLoading
  DocumentPreview
  ExtractedDetails
  ContextComparison
  PrcResultCard

Keep files/components reasonably modular.

Do not over-engineer.

37. Important Product Rules

The frontend must NEVER claim:

guaranteed tax treatment

guaranteed fee

guaranteed processing time

guaranteed compliance

guaranteed Shariah ruling

that a bank definitely made a classification error

Use responsible language.

This product should guide, compare and explain.

38. Things NOT to Build

Do not add:

login/signup

user accounts

saved payment history

analytics dashboard

admin panel

notifications

transaction tracking

live bank integrations

Stripe integration

PayPal integration

real Payoneer APIs

real Wise APIs

exchange-rate API

Supabase

Edge Functions

database

real document OCR/AI

real LLM

payment processing

Those will be handled later.

39. Quality Target

The frontend should feel polished enough that during a 3-minute hackathon demo it looks like a genuine product, not a wireframe.

The judge should understand within seconds:

what Raasta does

what information the AI understood

why one payment route was selected

why today's recommendation differs from the long-term recommendation

that Pakistani-specific factors materially influence the answer

that Raasta can also check what happened after the payment arrived

Prioritize clarity over excessive information.

40. Final Requirement

Implement the full frontend now using only local/mock state.

Do not ask to connect Supabase.

Do not make backend changes.

Do not reduce the scope of the specified frontend.

Once complete, report:

routes/screens created

components created

mock interactions implemented

responsive behavior implemented

any deviations from this specification


Is prompt ke baad **Lovable se jo frontend niklega usko pehle visually + flow-wise audit karenge**. Uske baad hi hum real AI/Supabase integration start karenge.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://raasta-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/37583afb-3828-4901-adda-60789d056c56).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
