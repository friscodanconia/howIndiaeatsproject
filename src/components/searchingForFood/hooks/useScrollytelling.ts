import { useEffect, useState, useRef, useCallback } from 'react';

export function useScrollytelling(stepCount: number) {
  const [activeStep, setActiveStep] = useState(0);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  const debounceRef = useRef<number>(0);

  const setStepRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    stepsRef.current[index] = el;
  }, []);

  useEffect(() => {
    // On mobile (no sticky), use a centered trigger zone.
    // On desktop, sticky viz takes half the screen so use centered zone too.
    const rootMargin = '-35% 0px -35% 0px';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = stepsRef.current.indexOf(entry.target as HTMLDivElement);
            if (index !== -1) {
              // Debounce step transitions by 200ms
              clearTimeout(debounceRef.current);
              debounceRef.current = window.setTimeout(() => {
                setActiveStep(index);
              }, 200);
            }
          }
        });
      },
      { rootMargin, threshold: 0 }
    );

    stepsRef.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
      clearTimeout(debounceRef.current);
    };
  }, [stepCount]);

  return { activeStep, setStepRef };
}
