/**
 * Pip — the intrvue owl mascot. Built from the design mock (design-reference/Explorations.html).
 * `Pip` is the full character (belly + big eyes) for hero/coach moments; `PipMark` is the compact
 * head used as the logo glyph. Both scale from a single `size` (height in px).
 */

const INK = 'hsl(var(--ink))';
const CORAL = 'hsl(var(--primary))';
const TAN = '#E8DFD0';
const CREAM = 'hsl(var(--cream))';

/** Full owl. Base geometry is 120×132; everything scales by size/132. */
export function Pip({ size = 120, className }: { size?: number; className?: string }) {
  const f = size / 132;
  const px = (n: number) => `${n * f}px`;
  const abs = { position: 'absolute' as const };
  return (
    <div className={className} style={{ position: 'relative', width: px(120), height: px(132), flex: '0 0 auto' }} aria-hidden="true">
      {/* body */}
      <div style={{ ...abs, inset: 0, background: INK, borderRadius: '46% 46% 48% 48%' }} />
      {/* ear tufts */}
      <div style={{ ...abs, top: px(-8), left: px(14), width: px(22), height: px(22), background: INK, transform: 'rotate(45deg)' }} />
      <div style={{ ...abs, top: px(-8), right: px(14), width: px(22), height: px(22), background: INK, transform: 'rotate(45deg)' }} />
      {/* belly */}
      <div style={{ ...abs, bottom: 0, left: px(24), width: px(72), height: px(58), background: TAN, borderRadius: '50% 50% 46% 46%' }} />
      {/* eyes */}
      <div style={{ ...abs, top: px(30), left: px(22), width: px(32), height: px(32), background: '#fff', borderRadius: '50%', boxShadow: `${INK} 0 0 0 ${px(3)} inset` }} />
      <div style={{ ...abs, top: px(30), right: px(22), width: px(32), height: px(32), background: '#fff', borderRadius: '50%', boxShadow: `${INK} 0 0 0 ${px(3)} inset` }} />
      {/* pupils */}
      <div style={{ ...abs, top: px(40), left: px(34), width: px(9), height: px(9), background: INK, borderRadius: '50%' }} />
      <div style={{ ...abs, top: px(40), right: px(34), width: px(9), height: px(9), background: INK, borderRadius: '50%' }} />
      {/* beak */}
      <div style={{ ...abs, top: px(62), left: px(52), width: px(16), height: px(16), background: CORAL, transform: 'rotate(45deg)', borderRadius: px(3) }} />
    </div>
  );
}

/** Compact head — the logo glyph. Base geometry 30×33; scales by size/33. */
export function PipMark({ size = 33, className }: { size?: number; className?: string }) {
  const f = size / 33;
  const px = (n: number) => `${n * f}px`;
  const abs = { position: 'absolute' as const };
  return (
    <div className={className} style={{ position: 'relative', width: px(30), height: px(33), flex: '0 0 auto' }} aria-hidden="true">
      <div style={{ ...abs, inset: 0, background: INK, borderRadius: '46% 46% 48% 48%' }} />
      <div style={{ ...abs, top: px(-3), left: px(3), width: px(8), height: px(8), background: INK, transform: 'rotate(45deg)' }} />
      <div style={{ ...abs, top: px(-3), right: px(3), width: px(8), height: px(8), background: INK, transform: 'rotate(45deg)' }} />
      <div style={{ ...abs, top: px(8), left: px(5), width: px(9), height: px(9), background: CREAM, borderRadius: '50%' }} />
      <div style={{ ...abs, top: px(8), right: px(5), width: px(9), height: px(9), background: CREAM, borderRadius: '50%' }} />
      <div style={{ ...abs, top: px(10), left: px(8), width: px(3), height: px(3), background: INK, borderRadius: '50%' }} />
      <div style={{ ...abs, top: px(10), right: px(8), width: px(3), height: px(3), background: INK, borderRadius: '50%' }} />
      <div style={{ ...abs, top: px(17), left: px(13), width: px(5), height: px(5), background: CORAL, transform: 'rotate(45deg)' }} />
    </div>
  );
}
