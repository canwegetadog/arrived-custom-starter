// Decorative line-art background — stacked sine-like strokes, evoking an
// audio waveform. Purely generative (no image asset needed). Color follows
// currentColor so callers tint it per-section with a text-* utility.
const ROWS = 14;
const WIDTH = 800;
const HEIGHT = 500;

function rowPath(index: number) {
  const y = (index / (ROWS - 1)) * HEIGHT;
  const amp = 18 + (index % 4) * 6;
  const phase = index * 37;
  const points: string[] = [];
  const step = WIDTH / 10;

  for (let x = 0; x <= WIDTH; x += step) {
    const wave = Math.sin((x + phase) / 70) * amp;
    points.push(`${x},${(y + wave).toFixed(1)}`);
  }

  return `M${points.join(" L")}`;
}

type WaveLinesProps = {
  className?: string;
};

export function WaveLines({ className }: WaveLinesProps) {
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
    >
      {Array.from({ length: ROWS }, (_, i) => (
        <path
          key={i}
          d={rowPath(i)}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}
