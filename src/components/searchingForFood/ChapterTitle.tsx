interface ChapterTitleProps {
  partNumber: number;
  title: string;
  id: string;
}

export function ChapterTitle({ partNumber, title, id }: ChapterTitleProps) {
  return (
    <div className="chapter-title" id={id}>
      <p className="chapter-label">Part {numberToWord(partNumber)}</p>
      <h2>{title}</h2>
    </div>
  );
}

function numberToWord(n: number): string {
  const words = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];
  return words[n] || String(n);
}
