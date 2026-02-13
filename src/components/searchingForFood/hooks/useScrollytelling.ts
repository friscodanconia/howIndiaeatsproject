import { useEffect, useState, useRef, useCallback } from 'react';

export function useScrollytelling(stepCount: number) {
  const [activeStep, setActiveStep] = useState(0);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  const setStepRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    stepsRef.current[index] = el;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = stepsRef.current.indexOf(entry.target as HTMLDivElement);
            if (index !== -1) setActiveStep(index);
          }
        });
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );

    stepsRef.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [stepCount]);

  return { activeStep, setStepRef };
}
