const STRIPS = [
  '/images/food-guide/spice-strip-1.jpg',
  '/images/food-guide/spice-strip-2.jpg',
  '/images/food-guide/spice-strip-3.jpg',
];

let stripIndex = 0;

export function ChapterDivider() {
  const src = STRIPS[stripIndex % STRIPS.length];
  stripIndex++;

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
