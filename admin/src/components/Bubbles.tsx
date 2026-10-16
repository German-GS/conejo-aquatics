import { useMemo } from "react";

type Bubble = {
  left: string;
  size: number;
  duration: number;
  delay: number;
};

export function Bubbles({ count = 18 }: { count?: number }) {
  const bubbles = useMemo<Bubble[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(i * 97) % 100}%`,
        size: 6 + ((i * 37) % 20),
        duration: 8 + ((i * 13) % 10),
        delay: (i * 0.7) % 8,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="bubble"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
