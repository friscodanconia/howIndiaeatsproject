import { useEffect, useState, useRef } from 'react';

export function useResponsiveSvg() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({
          width: Math.floor(width),
          height: Math.floor(Math.min(width * 0.85, 600)),
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return { containerRef, dimensions };
}
