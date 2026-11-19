import { tokens } from '../lib/brand.js';

// The site's motion as numbers for frame-by-frame video: durations and curves come from the motion tokens
// (--ds-duration-*, --ds-easing-*), never invented. Entrances only (a video has nothing to leave), never ease-in.

export function bezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
	const cx = 3 * x1;
	const bx = 3 * (x2 - x1) - cx;
	const ax = 1 - cx - bx;
	const cy = 3 * y1;
	const by = 3 * (y2 - y1) - cy;
	const ay = 1 - cy - by;
	const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
	const sy = (t: number) => ((ay * t + by) * t + cy) * t;
	const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
	return (x: number) => {
		if (x <= 0) return 0;
		if (x >= 1) return 1;
		let t = x;
		for (let i = 0; i < 8; i++) {
			const e = sx(t) - x;
			const d = dx(t);
			if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break;
			t -= e / d;
		}
		t = Math.min(1, Math.max(0, t));
		return sy(t);
	};
}

const curves = new Map<string, (t: number) => number>();
/** A curve token (`standard`, `out`, `viz`, `reveal-fade`, `reveal-ink`) as a function. */
export function easing(name: string): (t: number) => number {
	let f = curves.get(name);
	if (!f) {
		const raw = tokens()[`--ds-easing-${name}`]?.light ?? '';
		const m = raw.match(/cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)/);
		if (!m) throw new Error(`Token --ds-easing-${name} is not a cubic-bezier(...).`);
		const [x1, y1, x2, y2] = m.slice(1).map(Number) as [number, number, number, number];
		if (y1 === 0 && x1 > 0.3 && x2 === 1 && y2 === 1) throw new Error(`--ds-easing-${name} is an ease-in; entrances never use one.`);
		f = bezier(x1, y1, x2, y2);
		curves.set(name, f);
	}
	return f;
}

/** A duration token (`entrance`, `reveal`, `viz-card`) in seconds. */
export function duration(name: string): number {
	const raw = tokens()[`--ds-duration-${name}`]?.light ?? '';
	const m = raw.match(/^(\d+(?:\.\d+)?)ms$/);
	if (!m) throw new Error(`Token --ds-duration-${name} is not a duration in ms.`);
	return Number(m[1]) / 1000;
}

/** Progress (0 to 1) of something that starts at `delay` and runs `dur` seconds, at time `t`, on a curve. */
export function progress(t: number, delay: number, dur: number, curve: string): number {
	if (t <= delay) return 0;
	if (t >= delay + dur) return 1;
	return easing(curve)((t - delay) / dur);
}

/** The site's settle (home.css .settle): from 12px down and transparent to in place, over the entrance step. */
export function settle(t: number, delay: number): { alpha: number; dy: number } {
	const p = progress(t, delay, duration('entrance'), 'standard');
	return { alpha: p, dy: (1 - p) * 12 };
}

/** Mixes two #rrggbb colors. */
export function mix(a: string, b: string, p: number): string {
	const n = (c: string, i: number) => Number.parseInt(c.slice(1 + i * 2, 3 + i * 2), 16);
	const ch = (i: number) => Math.round(n(a, i) + (n(b, i) - n(a, i)) * p).toString(16).padStart(2, '0');
	return `#${ch(0)}${ch(1)}${ch(2)}`;
}
