import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Edit3, HelpCircle, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  analysisSteps,
  exampleScenarios,
  fieldsForScenario,
  mockScenarios,
  type MockScenarioKey,
} from "./data";
import { usePaymentContext } from "./payment-context";
import { LoadingSequence } from "./shared";

type Stage = "prompt" | "context" | "loading";

export function AskRaastaPage() {
  const navigate = useNavigate();
  const payment = usePaymentContext();
  const [prompt, setPrompt] = useState(payment.prompt);
  const [stage, setStage] = useState<Stage>("prompt");
  const [urgency, setUrgency] = useState<"today" | "flexible">(payment.urgency);
  const [scenario, setScenario] = useState<MockScenarioKey>(payment.scenario);
  const [fields, setFields] = useState(payment.fields);
  const finish = useCallback(() => {
    payment.setDraft({ prompt, fields, scenario, urgency });
    navigate({
      to: "/recommendation",
      search: { flexible: urgency === "flexible" ? "yes" : undefined },
    });
  }, [fields, navigate, payment, prompt, scenario, urgency]);
  const selectScenario = (key: MockScenarioKey) => {
    setScenario(key);
    setPrompt(mockScenarios[key].prompt);
    setFields(fieldsForScenario(key));
  };
  if (stage === "loading")
    return (
      <div className="page-shell centered-state">
        <LoadingSequence steps={analysisSteps} onComplete={finish} />
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
                <ShieldCheckIcon /> Uses mock rules for this prototype
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
          <div className="clarification-card">
            <div className="question-icon">
              <HelpCircle />
            </div>
            <div>
              <p className="eyebrow">One thing could materially change my recommendation</p>
              <h3>
                Do you need to receive this payment today, or can you wait to set up the optimal
                route?
              </h3>
              <div className="choice-row">
                <button
                  type="button"
                  className={urgency === "today" ? "selected" : ""}
                  onClick={() => setUrgency("today")}
                >
                  <Check /> I need it today
                </button>
                <button
                  type="button"
                  className={urgency === "flexible" ? "selected" : ""}
                  onClick={() => setUrgency("flexible")}
                >
                  <Check /> I can wait / optimize first
                </button>
              </div>
              <Button size="lg" onClick={() => setStage("loading")}>
                Compare My Routes <ArrowRight />
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
function ShieldCheckIcon() {
  return (
    <span className="mini-shield" aria-hidden="true">
      ✓
    </span>
  );
}
