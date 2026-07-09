/**
 * Pip — the intrvue owl mascot, as drawn in design-reference/Intrvue Bright Deck.html.
 * One friendly SVG used everywhere; `size` is the width in px, `float` adds the gentle bob.
 */
import { cn } from '@/lib/utils';

export function Pip({ size = 96, float = false, className }: { size?: number; float?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 134"
      width={size}
      height={(size * 134) / 120}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(float && 'pip-float', className)}
      aria-hidden="true"
    >
      <rect x="14" y="16" width="92" height="104" rx="46" ry="46" fill="#232D45" />
      <polygon points="16,28 34,14 26,38" fill="#232D45" />
      <polygon points="104,28 86,14 94,38" fill="#232D45" />
      <path d="M30,90 C30,112 44,122 60,122 C76,122 90,112 90,90 C90,80 76,74 60,74 C44,74 30,80 30,90 Z" fill="#EDE6D8" />
      <circle cx="44" cy="62" r="18" fill="#fff" />
      <circle cx="76" cy="62" r="18" fill="#fff" />
      <circle cx="44" cy="64" r="9.5" fill="#1E2740" />
      <circle cx="76" cy="64" r="9.5" fill="#1E2740" />
      <circle cx="47" cy="61" r="2.6" fill="#fff" />
      <circle cx="79" cy="61" r="2.6" fill="#fff" />
      <polygon points="60,76 68,84 60,92 52,84" fill="#FF7A45" />
    </svg>
  );
}

/** Compact alias — the same owl at a small default size, for logos/inline use. */
export function PipMark({ size = 30, className }: { size?: number; className?: string }) {
  return <Pip size={size} className={className} />;
}
