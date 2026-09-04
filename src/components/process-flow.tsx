import type { CSSProperties } from "react";

type Step = { title: string; body?: string; number?: string };

export default function ProcessFlow({ steps, className = "" }: { steps: Step[]; className?: string }) {
  return (
    <div className={`process-flow ${className}`} style={{ "--flow-columns": steps.length } as CSSProperties}>
      {steps.map((step, index) => (
        <article key={step.title} className="process-flow__step" style={{ "--flow-index": index + 1 } as CSSProperties}>
          <span className="process-flow__number">{step.number ?? String(index + 1).padStart(2, "0")}</span>
          <h3 className="process-flow__title">{step.title}</h3>
          {step.body ? <p className="process-flow__body">{step.body}</p> : null}
        </article>
      ))}
    </div>
  );
}
