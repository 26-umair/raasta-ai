import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Edit3, HelpCircle, ShieldCheck, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  extractPayment,
  type AnalyzePaymentResult,
} from "@/integrations/external-supabase/analyze-payment";
import { analysisSteps, exampleScenarios, mockScenarios, type MockScenarioKey } from "./data";
import { buildAnalysisContext, fieldsFromContext } from "./map-context";
import { usePaymentContext } from "./payment-context";
import { LoadingSequence } from "./shared";

type Stage = "prompt" | "context" | "loading" | "clarify";

export function AskRaastaPage() {
  const navigate = useNavigate();
  const payment = usePaymentContext();
  const [prompt, setPrompt] = useState(payment.prompt);
  const [stage, setStage] = useState<Stage>("prompt");
  const [urgency, setUrgency] = useState<"today" | "flexible">(payment.urgency);
  const [scenario, setScenario] = useState<MockScenarioKey>(payment.scenario);
  const [fields, setFields] = useState(payment.fields);
  const [clarification, setClarification] = useState<AnalyzePaymentResult["clarification"]>();
  const [issues, setIssues] = useState<AnalyzePaymentResult["validation"]["issues"]>([]);
  const [extractionError, setExtractionError] = useState<string>();

  const goToResult = useCallback(() => {
    navigate({ to: "/recommendation", search: { flexible: undefined } });
  }, [navigate]);

  const handleResult = useCallback(
    (result: AnalyzePaymentResult | undefined) => {
      if (!result) {
        setStage("context");
        return;
      }
      if (!result.validation.valid) {
        setIssues(result.validation.issues);
        setStage("context");
        return;
      }
      setIssues([]);
      if (result.clarification.needed) {
        setClarification(result.clarification);
        setStage("clarify");
        return;
      }
      goToResult();
    },
    [goToResult],
  );

  /**
   * Submit the natural-language prompt: the backend extracts the context.
   * The returned normalizedContext is the source of truth — the cards are
   * rendered from it, never from hardcoded demo data or previous state.
   */
  const startExtraction = useCallback(async () => {
    setExtractionError(undefined);
    setStage("loading");
    try {
      const { normalizedContext } = await extractPayment(prompt);
      const extractedFields = fieldsFromContext(normalizedContext);
      const extractedUrgency = normalizedContext.urgency === "today" ? "today" : "flexible";
      setFields(extractedFields);
      setUrgency(extractedUrgency);
      setIssues([]);
      payment.setDraft({
        prompt,
        fields: extractedFields,
        scenario,
        urgency: extractedUrgency,
      });
      payment.storeExtraction(normalizedContext);
      setStage("context");
    } catch (error) {
      setExtractionError(
        error instanceof Error
          ? error.message
          : "Raasta couldn't understand this payment right now. Your text is still here — try again.",
      );
      setStage("prompt");
    }
  }, [payment, prompt, scenario]);

  const startAnalysis = useCallback(async () => {
    payment.setDraft({ prompt, fields, scenario, urgency });
    // Compare uses the backend's stored normalizedContext as the source of
    // truth; timing changes patch only timingRequirement/urgency on it.
    const base = payment.analysis.request ?? buildAnalysisContext(fields, prompt);
    const context = {
      ...base,
      rawText: prompt,
      urgency: (urgency === "today" ? "today" : "not_urgent") as "today" | "not_urgent",
      // Normalized enum only — never the display label.
      timingRequirement: (urgency === "today" ? "unknown" : "flexible") as "unknown" | "flexible",
    };
    setStage("loading");
    handleResult(await payment.runAnalysis(context));
  }, [fields, handleResult, payment, prompt, scenario, urgency]);

  // Keep the visible Timing card in sync with the chosen urgency.
  const selectUrgency = useCallback((next: "today" | "flexible") => {
    setUrgency(next);
    setFields((current) => {
      const label = next === "today" ? "Payment due today" : "Timing is flexible";
      if (current.some((field) => field.label === "Timing")) {
        return current.map((field) =>
          field.label === "Timing" ? { ...field, value: label } : field,
        );
      }
      return [...current, { label: "Timing", value: label }];
    });
  }, []);

  const answerClarification = useCallback(
    async (patch: Record<string, unknown>) => {
      setStage("loading");
      handleResult(await payment.patchAnalysis(patch));
    },
    [handleResult, payment],
  );

  // Example chips only prefill the prompt text — extraction fills the cards.
  const selectScenario = (key: MockScenarioKey) => {
    setScenario(key);
    setPrompt(mockScenarios[key].prompt);
    setExtractionError(undefined);
  };

  if (stage === "loading")
    return (
      <div className="page-shell centered-state">
        <LoadingSequence steps={analysisSteps} onComplete={() => {}} />
      </div>
    );

  if (stage === "clarify" && clarification)
    return (
      <div className="page-shell ask-page">
        <section className="context-panel">
          <div className="clarification-card">
            <div className="question-icon">
              <HelpCircle />
            </div>
            <div>
              <p className="eyebrow">One thing could materially change my recommendation</p>
              <h3>{clarification.question}</h3>
              {clarification.reason && <p className="helper-text">{clarification.reason}</p>}
              <div className="choice-row">
                {clarification.answerOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => void answerClarification(option.patch)}
                  >
                    <Check /> {option.label}
                  </button>
                ))}
              </div>
              <Button variant="ghost" onClick={() => setStage("context")}>
                <Edit3 /> Edit details
              </Button>
            </div>
          </div>
        </section>
      </div>
    );

  return (
    <div className="page-shell ask-page">
      <header className="ask-heading">
        <p className="eyebrow">
          <Wand2 /> AI Payment Advisor for Pakistan
        </p>
        <h1>How should you receive this payment in Pakistan?</h1>
        <p>
          Tell Raasta about your client, payment and priorities. We'll compare the routes that
          actually fit your situation.
        </p>
      </header>
      {stage === "prompt" ? (
        <section className="prompt-section" aria-label="Describe your payment">
          <div className="prompt-box">
            <Textarea
              aria-label="Payment situation"
              value={prompt}
              onChange={(event) => {
                setPrompt(event.target.value);
                setScenario("golden");
              }}
              rows={7}
            />
            <div className="prompt-footer">
              <span>
                <ShieldCheck className="mini-shield" /> Compared by Raasta's Pakistan route engine
              </span>
              <Button size="lg" onClick={() => setStage("context")} disabled={!prompt.trim()}>
                Find My Best Route <ArrowRight />
              </Button>
            </div>
          </div>
          <div className="example-row" aria-label="Example prompts">
            {exampleScenarios.map((example) => (
              <button type="button" key={example.key} onClick={() => selectScenario(example.key)}>
                {example.label}
              </button>
            ))}
          </div>
          <aside className="principle-note">
            <span>Good to know</span>
            <p>
              The cheapest route is not always the best route. Timing, payment records and how you
              use your earnings can matter too.
            </p>
          </aside>
        </section>
      ) : (
        <section className="context-panel">
          <div className="context-title">
            <div>
              <p className="eyebrow">
                <Check /> Detected by Raasta
              </p>
              <h2>Here's what I understood</h2>
              <p>Check the details before I compare your options.</p>
            </div>
            <Button variant="ghost" onClick={() => setStage("prompt")}>
              <Edit3 /> Edit prompt
            </Button>
          </div>
          <div className="context-grid">
            {fields.map((field, index) => (
              <Popover key={field.label}>
                <PopoverTrigger asChild>
                  <button type="button" className="context-field">
                    <span>{field.label}</span>
                    <strong>{field.value}</strong>
                    <Edit3 />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72">
                  <label className="edit-label" htmlFor={`field-${index}`}>
                    Edit {field.label}
                  </label>
                  <Input
                    id={`field-${index}`}
                    value={field.value}
                    onChange={(event) =>
                      setFields((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, value: event.target.value } : item,
                        ),
                      )
                    }
                  />
                  <p className="helper-text">
                    Not sure? That's okay — keep the detected value for now.
                  </p>
                </PopoverContent>
              </Popover>
            ))}
          </div>
          {payment.analysis.error && (
            <div className="analysis-error" role="status">
              <p>{payment.analysis.error}</p>
              <Button onClick={() => void startAnalysis()}>Retry</Button>
            </div>
          )}
          {issues.length > 0 && (
            <div className="analysis-error" role="status">
              <p>Raasta needs a little more before it can compare routes:</p>
              <ul className="bank-question-list">
                {issues.map((issue) => (
                  <li key={`${issue.field}-${issue.message}`}>{issue.message}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="context-actions">
            <div className="choice-row">
              <button
                type="button"
                className={urgency === "today" ? "selected" : ""}
                onClick={() => selectUrgency("today")}
              >
                <Check /> This payment is due today
              </button>
              <button
                type="button"
                className={urgency === "flexible" ? "selected" : ""}
                onClick={() => selectUrgency("flexible")}
              >
                <Check /> Timing is flexible
              </button>
            </div>
            <Button size="lg" onClick={() => void startAnalysis()}>
              Compare My Routes <ArrowRight />
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
