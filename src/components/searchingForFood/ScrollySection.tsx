import { ReactNode } from 'react';
import { useScrollytelling } from './hooks/useScrollytelling';

interface Step {
  content: ReactNode;
}

interface ScrollySectionProps {
  id: string;
  steps: Step[];
  visualization: (activeStep: number) => ReactNode;
}

export function ScrollySection({ id, steps, visualization }: ScrollySectionProps) {
  const { activeStep, setStepRef } = useScrollytelling(steps.length);

  return (
    <section id={id} className="scrolly-grid">
      {/* Text column */}
      <div className="scrolly-text-col">
        {steps.map((step, i) => (
          <div
            key={i}
            ref={setStepRef(i)}
            className={`scrolly-step ${i === activeStep ? 'active' : ''}`}
          >
            <div className="scrolly-step-content">
              {step.content}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky visualization column */}
      <div className="scrolly-sticky">
        <div className="viz-wrapper">
          {visualization(activeStep)}
        </div>
      </div>
    </section>
  );
}
