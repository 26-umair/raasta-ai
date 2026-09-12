import { useCallback, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  FileCheck2,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { copyText } from "./clipboard";
import { prcSteps } from "./data";
import { LoadingSequence, StatusBadge } from "./shared";

type Stage = "upload" | "loading" | "result" | "error";
export function PrcCheckPage() {
  const [stage, setStage] = useState<Stage>("upload");
  const [positive, setPositive] = useState(false);
  const [fileName, setFileName] = useState("sample-prc.pdf");
  const [manualCode, setManualCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const complete = useCallback(() => setStage("result"), []);
  const analyze = (file?: File) => {
    if (file) setFileName(file.name);
    setStage("loading");
  };
  if (stage === "loading")
    return (
      <div className="page-shell centered-state">
        <LoadingSequence steps={prcSteps} onComplete={complete} />
      </div>
    );
  return (
    <div className="page-shell prc-page">
      <header className="page-title">
        <p className="eyebrow">
          <FileCheck2 /> PRC Check
        </p>
        <h1>Check how your payment was recorded</h1>
        <p>
          Upload a PRC/ePRC and Raasta will compare the document with the payment context you've
          provided.
        </p>
      </header>
      {stage === "upload" && (
        <>
          <aside className="helper-banner">
            <span>What is a PRC?</span>
            <p>
              It's a payment or remittance document issued through the banking process. Raasta can
              help you understand the key details.
            </p>
          </aside>
          <section
            className="upload-zone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const file = event.dataTransfer.files[0];
              if (file) analyze(file);
            }}
          >
            <UploadCloud />
            <h2>Drop your PRC here</h2>
            <p>or choose a file from your device</p>
            <span>PDF · JPG · PNG</span>
            <input
              ref={inputRef}
              type="file"
              className="sr-only"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) analyze(file);
              }}
            />
            <Button onClick={() => inputRef.current?.click()}>Choose file</Button>
            <button type="button" className="demo-link" onClick={() => analyze()}>
              Use a demo PRC instead
            </button>
          </section>
          <div className="privacy-note">
            <ShieldMini />
            <p>
              Your document is used only for this analysis in the current prototype. It isn't
              uploaded or saved.
            </p>
          </div>
          <button type="button" className="error-demo" onClick={() => setStage("error")}>
            Preview unreadable-document state
          </button>
        </>
      )}
      {stage === "error" && (
        <section className="read-error">
          <AlertTriangle />
          <h2>I couldn't confidently read the payment classification.</h2>
          <p>Try a clearer copy or enter the purpose code manually.</p>
          <label htmlFor="purpose-code">Purpose code</label>
          <div>
            <Input
              id="purpose-code"
              inputMode="numeric"
              placeholder="e.g. 9186"
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value)}
            />
            <Button
              disabled={!manualCode.trim()}
              onClick={() => {
                setPositive(manualCode.trim() === "9186");
                setStage("result");
              }}
            >
              Check code
            </Button>
          </div>
          <Button variant="ghost" onClick={() => setStage("upload")}>
            <RefreshCw /> Try another copy
          </Button>
        </section>
      )}
      {stage === "result" && (
        <>
          <div className="demo-toggle">
            <span>Demo result</span>
            <button
              type="button"
              aria-pressed={!positive}
              className={!positive ? "active" : ""}
              onClick={() => setPositive(false)}
            >
              Needs checking
            </button>
            <button
              type="button"
              aria-pressed={positive}
              className={positive ? "active" : ""}
              onClick={() => setPositive(true)}
            >
              Looks consistent
            </button>
          </div>
          <div className="prc-result-grid">
            <DocumentPreview fileName={fileName} code={positive ? "9186" : "9471"} />
            <ExtractedDetails code={positive ? "9186" : "9471"} />
          </div>
          {positive ? (
            <PositiveResult onReset={() => setStage("upload")} />
          ) : (
            <MismatchResult onReset={() => setStage("upload")} />
          )}
        </>
      )}
    </div>
  );
}
function DocumentPreview({ fileName, code }: { fileName: string; code: string }) {
  return (
    <section className="document-section">
      <div className="document-heading">
        <div>
          <span>Document Preview</span>
          <small>{fileName}</small>
        </div>
        <StatusBadge type="detected" label="Mock preview" />
      </div>
      <div className="paper">
        <div className="paper-logo">
          <LandmarkMini /> BANK REMITTANCE ADVICE
        </div>
        <div className="paper-rule" />
        <p>PROCEEDS REALISATION CERTIFICATE</p>
        <dl>
          <div>
            <dt>Beneficiary</dt>
            <dd>FREELANCER NAME</dd>
          </div>
          <div>
            <dt>Amount received</dt>
            <dd className="money">USD 1,500.00</dd>
          </div>
          <div>
            <dt>Purpose code</dt>
            <dd className="money highlight-code">{code}</dd>
          </div>
          <div>
            <dt>Payment reference</dt>
            <dd className="money">PRC-2409-XXXX</dd>
          </div>
        </dl>
        <div className="paper-stamp">
          SAMPLE
          <br />
          PREVIEW
        </div>
      </div>
    </section>
  );
}
function ExtractedDetails({ code }: { code: string }) {
  return (
    <section className="extracted-section">
      <span className="section-label">Extracted details</span>
      <dl>
        {[
          ["Amount", "$1,500"],
          ["Currency", "USD"],
          ["Date", "08 Sep 2026"],
          ["Bank", "Example Bank"],
          ["Purpose code", code],
          ["Payment description", "Software services remittance"],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd className={label === "Amount" || label === "Purpose code" ? "money" : ""}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <p>
        <CheckCircle2 /> Details were extracted for this simulated result.
      </p>
    </section>
  );
}
function MismatchResult({ onReset }: { onReset: () => void }) {
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const questions = [
    "What purpose code was used for this payment?",
    "Why was this purpose code selected?",
    "Does the classification match freelance IT / software services?",
    "Can the PRC/ePRC classification be reviewed if needed?",
    "Is there any document you need from me, such as an invoice or contract?",
  ];
  const handleCopy = async () => {
    const success = await copyText(
      questions.map((question, index) => `${index + 1}. ${question}`).join("\n"),
    );
    setCopyError(!success);
    if (!success) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <>
      <section className="prc-outcome warning">
        <div className="outcome-title">
          <AlertTriangle />
          <div>
            <p className="eyebrow">Review suggested</p>
            <h2>Something may need checking</h2>
            <p>The payment information and document classification may not fully align.</p>
          </div>
        </div>
        <div className="comparison-row">
          <div>
            <span>What you told Raasta</span>
            <strong>Web development</strong>
            <small>IT / ITeS</small>
          </div>
          <div>
            <span>What the document shows</span>
            <strong>
              Purpose code <b className="money">9471</b>
            </strong>
            <StatusBadge type="likely" />
          </div>
          <div>
            <span>Context usually associated with your work</span>
            <strong className="money">9186</strong>
            <small>Freelance computer and information services</small>
          </div>
        </div>
        <div className="explanation">
          <h3>Potential classification mismatch</h3>
          <p>
            The payment information you provided looks like freelance IT export income, while this
            document appears to use a different remittance classification.
          </p>
          <p>
            <strong>This does not necessarily mean your bank made an error.</strong> Payment
            classification can depend on how the money was routed. Verify the applicable treatment
            with your bank or qualified professional.
          </p>
        </div>
        <div className="outcome-actions">
          <Button onClick={() => setQuestionsOpen(true)}>What should I ask my bank?</Button>
          <Button variant="outline" onClick={onReset}>
            Check another PRC
          </Button>
        </div>
      </section>
      <Sheet open={questionsOpen} onOpenChange={setQuestionsOpen}>
        <SheetContent className="instructions-drawer">
          <SheetHeader>
            <SheetTitle>Questions to Ask Your Bank</SheetTitle>
            <SheetDescription>
              Use these questions to understand how your payment was recorded.
            </SheetDescription>
          </SheetHeader>
          <ol className="bank-question-list">
            {questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
          <p className="legal-note">
            Raasta is not saying the bank made an error. These questions are meant to help you
            understand how the payment was recorded.
          </p>
          <div className="drawer-actions">
            <Button onClick={handleCopy}>
              <Copy />
              {copied ? "Copied" : "Copy questions"}
            </Button>
          </div>
          {copyError && (
            <p className="copy-error" role="status">
              Couldn't copy automatically. Please select the text manually.
            </p>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
function PositiveResult({ onReset }: { onReset: () => void }) {
  return (
    <section className="prc-outcome positive">
      <div className="outcome-title">
        <CheckCircle2 />
        <div>
          <p className="eyebrow">No obvious inconsistency found</p>
          <h2>Everything looks consistent</h2>
          <p>
            The document classification appears consistent with the IT freelance work you described.
          </p>
        </div>
      </div>
      <div className="consistency-row">
        <span>Purpose code</span>
        <strong className="money">9186</strong>
        <StatusBadge type="verified" label="Consistent" />
      </div>
      <p className="legal-note">
        This comparison is informational and does not guarantee tax, regulatory or compliance
        treatment.
      </p>
      <Button variant="outline" onClick={onReset}>
        Check another PRC
      </Button>
    </section>
  );
}
function ShieldMini() {
  return (
    <span className="mini-shield" aria-hidden="true">
      ✓
    </span>
  );
}
function LandmarkMini() {
  return <span aria-hidden="true">▦</span>;
}
