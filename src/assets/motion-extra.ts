import { logoDoc } from './art.js';
import { drawLockup, lockupRatio } from './art.js';
import { color, font, rgbOf, scratch, surface, type Ctx } from './canvas.js';
import { CopyError, roleFor } from './glyphs.js';
import { imageDoc, logoFloor, smallFloor, type Size } from './layouts.js';
import { duration, mix, progress, settle } from './motion.js';
import { compose, drawDesign, drawRoom, wallOf, type Design, type Pic } from './og.js';
import { encodeFrames, type VideoFormat } from './video.js';

// Motion beyond the layouts, in the brand's own steps only (settle on the entrance step, the long ease-out of a
// window, the exit step; nothing eases in): a logo reveal (an intro or outro sting), a lower third on a transparent
// ground, a number counting up to its value, and a walkthrough of screenshots, one after another in the product window.

export const MOTIONS = ['logo-reveal', 'lower-third', 'stat', 'walkthrough'] as const;
export type MotionKind = (typeof MOTIONS)[number];

const HOLD = 1.5;

type Clip = { w: number; h: number; seconds: number; alpha?: boolean; frame: (t: number) => Promise<Buffer> };

/** The lockup settling in on a theme's ground over the room, the mark first and the wordmark 60 ms after. */
function logoReveal(size: Size, theme: string): Clip {
	const t0 = imageDoc().themes[theme]!;
	const { w, h } = size;
	const F = size.frame;
	const lh = Math.max(logoFloor(w, size.shown) * 2, Math.min(F.w * 0.42 / lockupRatio('primary'), F.h * 0.18));
	const lw = lh * lockupRatio('primary');
	const L = logoDoc();
	const k = lh / L.lockup.h;
	const x = F.x + (F.w - lw) / 2;
	const y = F.y + (F.h - lh) / 2;
	const end = 0.06 + duration('entrance') + HOLD;
	return {
		w, h, seconds: end,
		async frame(t) {
			const s = surface(w, h);
			const c = s.ctx;
			c.fillStyle = color(t0.bg);
			c.fillRect(0, 0, w, h);
			drawRoom(c, w, h, Math.sqrt((w * h) / 756000), { x: x - lh, y: y - lh, w: lw + 2 * lh, h: lh * 3 }, 4, color(t0.room));
			const mark = settle(t, 0);
			const word = settle(t, 0.06);
			c.save();
			c.globalAlpha = mark.alpha;
			c.translate(0, mark.dy * k * 4);
			drawLockup(c, x, y, lh, color(t0.ink), 'mark');
			c.restore();
			c.save();
			c.globalAlpha = word.alpha;
			c.translate(0, word.dy * k * 4);
			c.fillStyle = color(t0.ink);
			const kw = lh / L.lockup.h;
			drawLockup(c, x + L.wordmark.x * kw, y + L.wordmark.y * kw, L.wordmark.h * kw, color(t0.ink), 'wordmark');
			c.restore();
			return rgbOf(s).rgb;
		},
	};
}

/** A name and a role on a block of the theme's ground at the lower left of a transparent frame: in on the settle,
 *  held, out on the exit step. */
function lowerThird(size: Size, theme: string, name: string, role: string): Clip {
	if (!name.trim()) throw new CopyError('A lower third needs --name (and --role for the line under it).');
	const t0 = imageDoc().themes[theme]!;
	const { w, h } = size;
	const u = w / 1920;
	const nameS = 56 * u;
	const roleS = Math.max(smallFloor(w, size.shown), 30 * u);
	const nr = roleFor('display', name, 'name');
	const rr = role ? roleFor('text', role, 'role') : 'text';
	const { ctx } = scratch(4, 4);
	ctx.font = font(nr, 400, nameS);
	const nw = ctx.measureText(name).width;
	ctx.font = font(rr, 400, roleS);
	const rw = role ? ctx.measureText(role).width : 0;
	const pad = 36 * u;
	const bw = Math.max(nw, rw) + pad * 2 + 22 * u;
	const bh = pad * 2 + nameS * 1.1 + (role ? roleS * 1.5 : 0);
	if (bw > w * 0.7) throw new CopyError('The name and role do not fit a lower third. Shorten them.');
	const x = 96 * u;
	const y = h - 120 * u - bh;
	const outAt = 0.12 + duration('entrance') + HOLD + 1;
	const seconds = outAt + duration('exit') + 0.2;
	return {
		w, h, seconds, alpha: true,
		async frame(t) {
			const s = surface(w, h);
			const c = s.ctx;
			const inn = settle(t, 0);
			const words = settle(t, 0.12);
			const gone = 1 - progress(t, outAt, duration('exit'), 'out');
			c.globalAlpha = inn.alpha * gone;
			c.fillStyle = color(t0.bg);
			c.fillRect(x, y + inn.dy * u * 2, bw, bh);
			c.fillStyle = color(imageDoc().accent);
			c.fillRect(x + pad, y + pad + nameS * 0.32 + inn.dy * u * 2, 12 * u, 12 * u);
			c.globalAlpha = words.alpha * gone;
			c.fillStyle = color(t0.ink);
			c.textBaseline = 'alphabetic';
			c.font = font(nr, 400, nameS);
			c.fillText(name, x + pad + 26 * u, y + pad + nameS * 0.86 + words.dy * u * 2);
			if (role) {
				c.fillStyle = color(t0.muted);
				c.font = font(rr, 400, roleS);
				c.fillText(role, x + pad + 26 * u, y + pad + nameS * 1.1 + roleS * 1.2 + words.dy * u * 2);
			}
			const px = s.canvas.getContext('2d').getImageData(0, 0, s.canvas.width, s.canvas.height);
			return Buffer.from(px.data.buffer, px.data.byteOffset, px.data.byteLength);
		},
	};
}

/** The big-number layout with its number counting up to the value on the bar step's curve. */
function stat(base: Design, pic: Pic | null): Clip {
	const m = /(\d[\d,]*(?:\.\d+)?)/.exec(base.headlineAsked);
	if (!m) throw new CopyError('A stat video counts up the number in its headline; the headline has none ("100M+ documents").');
	const target = Number(m[1]!.replace(/,/g, ''));
	const decimals = (m[1]!.split('.')[1] ?? '').length;
	const grouped = m[1]!.includes(',');
	const fmt = (v: number) => {
		const s = v.toFixed(decimals);
		return grouped ? Number(s).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : s;
	};
	const count = duration('viz-card');
	const start = 0.18;
	const seconds = start + count + HOLD;
	return {
		w: base.w, h: base.h, seconds,
		async frame(t) {
			const v = target * progress(t, start, count, 'viz');
			const text = base.headlineAsked.replace(m[1]!, fmt(v));
			const d = compose({ template: base.template, size: base.size, theme: base.theme, headline: text, body: base.body || undefined, badgeText: base.badgeText || undefined, highlight: base.highlight, seed: base.seed });
			const s = surface(base.w, base.h);
			await drawDesign(s.ctx, d, pic);
			return rgbOf(s).rgb;
		},
	};
}

/** Screenshots one after another in the feature layout's window: each settles, holds, and gives way to the next. */
function walkthrough(base: Design, pics: Pic[]): Clip {
	if (pics.length < 2 || pics.length > 8) throw new CopyError(`A walkthrough takes 2 to 8 screenshots (--image a.png,b.png); it was given ${pics.length}.`);
	const each = 2.4;
	const cross = duration('entrance');
	const seconds = pics.length * each + 0.6;
	return {
		w: base.w, h: base.h, seconds,
		async frame(t) {
			const i = Math.min(pics.length - 1, Math.floor(t / each));
			const local = t - i * each;
			const s = surface(base.w, base.h);
			await drawDesign(s.ctx, base, pics[i]!, i === 0 ? { t: local, u: 1 } : undefined);
			if (i > 0 && local < cross) {
				/* The one before stays under the new one while it fades in. */
				const a = scratch(base.w, base.h);
				await drawDesign(a.ctx, base, pics[i - 1]!);
				const b = scratch(base.w, base.h);
				await drawDesign(b.ctx, base, pics[i]!);
				s.ctx.drawImage(a.canvas, 0, 0);
				s.ctx.globalAlpha = progress(local, 0, cross, 'standard');
				s.ctx.drawImage(b.canvas, 0, 0);
				s.ctx.globalAlpha = 1;
			}
			return rgbOf(s).rgb;
		},
	};
}

export type MotionRequest = { kind: MotionKind; size: Size; theme?: string; design?: Design; pictures?: Pic[]; name?: string; role?: string; fps: number; format: VideoFormat };

export async function renderMotion(r: MotionRequest): Promise<{ data: Buffer; seconds: number; frames: number; w: number; h: number }> {
	const theme = r.theme ?? 'red';
	const clip = r.kind === 'logo-reveal' ? logoReveal(r.size, theme) : r.kind === 'lower-third' ? lowerThird(r.size, r.theme ?? 'white', r.name ?? '', r.role ?? '') : r.kind === 'stat' ? stat(r.design!, null) : walkthrough(r.design!, r.pictures ?? []);
	const n = Math.max(1, Math.round(clip.seconds * r.fps));
	const data = await encodeFrames(clip.w, clip.h, r.fps, n, r.format, (i) => clip.frame(i / r.fps), { alpha: clip.alpha });
	return { data, seconds: Math.round(clip.seconds * 100) / 100, frames: n, w: clip.w, h: clip.h };
}

