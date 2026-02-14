import { useRef } from 'react';

const STRIPS = [
  '/images/food-guide/spice-strip-1.jpg',
  '/images/food-guide/spice-strip-2.jpg',
  '/images/food-guide/spice-strip-3.jpg',
];

let nextIndex = 0;

export function ChapterDivider() {
  const indexRef = useRef(nextIndex++);
  const src = STRIPS[indexRef.current % STRIPS.length];

  return (
    <div className="chapter-divider">
      <img
        src={src}
        alt=""
        className="chapter-divider-strip"
        loading="lazy"
      />
    </div>
  );
}
