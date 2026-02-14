import { useEffect, useState, useRef, useCallback } from 'react';

export function useScrollytelling(stepCount: number) {
  const [activeStep, setActiveStep] = useState(0);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  const debounceRef = useRef<number>(0);

  const setStepRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    stepsRef.current[index] = el;
  }, []);

  useEffect(() => {
    // On mobile, the sticky viz takes the top ~48vh, so we use an asymmetric
    // rootMargin that places the trigger zone in the lower part of the viewport
    // where text cards actually appear. Desktop uses a centered 20% zone.
    const isMobile = window.innerWidth < 768;
    const rootMargin = isMobile
      ? '-45% 0px -20% 0px'   // trigger zone: 45-80% from top (where text is)
      : '-40% 0px -40% 0px';  // trigger zone: 40-60% from top (centered)

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
