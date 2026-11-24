import type { DrawnLayer, Rect } from '../design/types.js';
import { color, contrast, font, type Ctx } from './canvas.js';
import { CopyError, roleFor, type FaceRole } from './glyphs.js';
import { imageDoc, largeType } from './layouts.js';
import { colorsOf, type Design, type Pic, type Plan } from './og.js';
import { setLines } from './words.js';

// What the newer slides draw under their title, from the brand's parts only: numbered points (agenda), a line of dated
// marks (timeline), two columns (comparison), bars from data (chart; the brand has no chart style, so bars are its
// hairline and accent colors and its mono labels), people as name and role (team, no photos), a grid of pictures shown
// whole. Every word is set whole or the slide is refused, and each part is reported as drawn.

export type Extra = 'agenda' | 'timeline' | 'comparison' | 'chart' | 'team' | 'grid';
export const EXTRAS: Extra[] = ['agenda', 'timeline', 'comparison', 'chart', 'team', 'grid'];

const FLOOR = 24;
const right = (r: Rect) => r.x + r.w;
const bottom = (r: Rect) => r.y + r.h;

type Out = DrawnLayer[];

function textAt(ctx: Ctx, out: Out, id: string, role: FaceRole, weight: number, size: number, text: string, x: number, top: number, maxW: number, fill: string, ground: string, opts: { lead?: number; align?: 'left' | 'center' } = {}): Rect {
	const r = roleFor(role, text, id);
	/* Small words in the accent take the deeper red, which reads 4.5 to 1 (as the share images do). */
	if (size < largeType(1920, 640) && contrast(fill, ground) < 4.5 && contrast(color(imageDoc().accentSmall), ground) >= 4.5) fill = color(imageDoc().accentSmall);
	for (let s = size; ; s = Math.max(FLOOR, s * 0.94)) {
		ctx.font = font(r, weight, s);
		ctx.letterSpacing = role === 'mono' ? `${0.04 * s}px` : role === 'display' ? `${-0.02 * s}px` : '0px';
		const lines = setLines(ctx, text, maxW, { breakLong: s <= FLOOR, balance: false });
		const lead = (opts.lead ?? 1.25) * s;
		if (lines.every((l) => l.w <= maxW + 0.5) && (lines.length <= 3 || s <= FLOOR)) {
			const ink: Rect[] = [];
			ctx.fillStyle = fill;
			ctx.textBaseline = 'alphabetic';
			ctx.textAlign = 'left';
			lines.forEach((l, i) => {
				const lx = opts.align === 'center' ? x + (maxW - l.w) / 2 : x;
				const base = top + s * 0.9 + i * lead;
				const m = ctx.measureText(l.text);
				ctx.fillText(l.text, lx, base);
				ink.push({ x: lx, y: base - m.actualBoundingBoxAscent, w: l.w, h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent });
			});
			ctx.letterSpacing = '0px';
			const box = { x: Math.min(...ink.map((k) => k.x)), y: top, w: Math.max(...ink.map((k) => k.w)), h: lines.length * lead };
			const drawn = lines.map((l) => l.text).join(' ');
			out.push({ id, kind: 'text', box, ink, can: {}, text: { asked: text, drawn: drawn.replace(/\s+/g, '') === text.replace(/\s+/g, '') ? text : drawn, size: s, color: fill, ground: [ground], own: true } });
			return box;
		}
		if (s <= FLOOR) throw new CopyError(`"${text.slice(0, 40)}" does not fit the slide. Shorten it.`);
	}
}

const list = (s: string | undefined) => (s ?? '').split('|').map((x) => x.trim()).filter(Boolean);

/** Draws a slide's part under its title, in the area the plan leaves. */
export async function drawExtra(ctx: Ctx, kind: Extra, d: Design, plan: Plan, slots: Record<string, string>, pictures: Pic[]): Promise<Out> {
	const C = colorsOf(d);
	const out: Out = [];
	const top = plan.words.y + plan.words.h + 56;
	const foot = plan.foot ? (plan.foot.rule?.y ?? plan.foot.y - plan.foot.fs) - 40 : bottom(plan.content);
	const A: Rect = { x: plan.content.x, y: top, w: plan.content.w, h: foot - top };
	if (A.h < 120) throw new CopyError(`The ${kind} does not fit under the title. Shorten the title.`);
	const accent = C.hi;
	const line = C.line;
	const mark = (x: number, y: number, s: number, fill = accent) => {
		ctx.fillStyle = fill;
		ctx.fillRect(x, y, s, s);
	};
	if (kind === 'agenda') {
		const items = list(slots.items);
		if (!items.length) throw new CopyError('An agenda slide needs "items" (points separated by |).');
		if (items.length > 8) throw new CopyError(`An agenda holds up to 8 points; it was given ${items.length}. Split it.`);
		const cols = items.length > 4 ? 2 : 1;
		const rows = Math.ceil(items.length / cols);
		const rowH = Math.min(150, A.h / rows);
		const colW = (A.w - (cols - 1) * 80) / cols;
		items.forEach((it, i) => {
			const c = Math.floor(i / rows);
			const r = i % rows;
			const x = A.x + c * (colW + 80);
			const y = A.y + r * rowH;
			textAt(ctx, out, `number-${i + 1}`, 'mono', 400, 30, String(i + 1).padStart(2, '0'), x, y + 8, 80, accent, C.bg);
			textAt(ctx, out, `item-${i + 1}`, 'display', 400, 52, it, x + 100, y, colW - 100, C.ink, C.bg);
			if (r < rows - 1) {
				ctx.fillStyle = line;
				ctx.fillRect(x, y + rowH - 18, colW, 1.5);
			}
		});
	} else if (kind === 'timeline') {
		const items = list(slots.items).map((x) => {
			const m = /^([^:]+):\s*(.+)$/.exec(x);
			if (!m) throw new CopyError(`Each timeline point is "when: what", like "2021: Founded"; "${x}" is not.`);
			return { when: m[1]!.trim(), what: m[2]!.trim() };
		});
		if (items.length < 2 || items.length > 6) throw new CopyError(`A timeline takes 2 to 6 points; it was given ${items.length}.`);
		const y = A.y + Math.min(A.h * 0.35, 150);
		ctx.fillStyle = line;
		ctx.fillRect(A.x, y, A.w, 2);
		out.push({ id: 'line', kind: 'art', box: { x: A.x, y, w: A.w, h: 2 }, can: {} });
		const step = A.w / items.length;
		items.forEach((it, i) => {
			const x = A.x + i * step;
			mark(x, y - 9, 20);
			textAt(ctx, out, `when-${i + 1}`, 'mono', 400, 30, it.when, x, y - 74, step - 40, accent, C.bg);
			textAt(ctx, out, `what-${i + 1}`, 'text', 400, 34, it.what, x, y + 44, step - 40, C.ink, C.bg, { lead: 1.4 });
		});
	} else if (kind === 'comparison') {
		const sides = [
			{ head: slots.left ?? '', items: list(slots.leftItems), fill: C.muted },
			{ head: slots.right ?? '', items: list(slots.rightItems), fill: accent },
		];
		if (!sides[0]!.head || !sides[1]!.head) throw new CopyError('A comparison slide needs "left" and "right" (each column\'s heading).');
		const colW = (A.w - 120) / 2;
		ctx.fillStyle = line;
		ctx.fillRect(A.x + colW + 59, A.y, 2, A.h);
		out.push({ id: 'divider', kind: 'art', box: { x: A.x + colW + 59, y: A.y, w: 2, h: A.h }, can: {} });
		sides.forEach((sd, k) => {
			const x = A.x + k * (colW + 120);
			const h = textAt(ctx, out, k ? 'right' : 'left', 'display', 400, 56, sd.head, x, A.y, colW, C.ink, C.bg);
			let y = bottom(h) + 36;
			if (sd.items.length > 6) throw new CopyError(`A comparison column holds up to 6 points; it was given ${sd.items.length}.`);
			sd.items.forEach((it, i) => {
				mark(x, y + 14, 14, sd.fill);
				const b = textAt(ctx, out, `${k ? 'right' : 'left'}-${i + 1}`, 'text', 400, 34, it, x + 40, y, colW - 40, C.ink, C.bg, { lead: 1.35 });
				y = bottom(b) + 18;
				if (y > bottom(A) + 2) throw new CopyError('The comparison does not fit the slide. Shorten its points.');
			});
		});
	} else if (kind === 'chart') {
		const data = list(slots.data).map((x) => {
			const m = /^(.+?)\s+(-?[\d.,]+)\s*([%a-zA-Z]*)$/.exec(x);
			if (!m) throw new CopyError(`Each chart value is "label number", like "Q1 12"; "${x}" is not.`);
			return { label: m[1]!.trim(), value: Number(m[2]!.replace(/,/g, '')), shown: `${m[2]}${m[3] ?? ''}` };
		});
		if (data.length < 2 || data.length > 12) throw new CopyError(`A chart takes 2 to 12 values; it was given ${data.length}.`);
		if (data.some((p) => p.value < 0)) throw new CopyError('A bar chart here shows values from zero up; pass values of zero or more.');
		const max = Math.max(...data.map((p) => p.value)) || 1;
		const base = bottom(A) - 56;
		const plotTop = A.y + 60;
		const slot = A.w / data.length;
		const bw = Math.min(140, slot * 0.6);
		const hiAt = data.findIndex((p) => p.value === max);
		data.forEach((p, i) => {
			const h = ((base - plotTop) * p.value) / max;
			const x = A.x + i * slot + (slot - bw) / 2;
			ctx.fillStyle = i === hiAt ? accent : color(imageDoc().themes[d.theme]!.dark ? 'neutral-300' : 'neutral-600');
			ctx.fillRect(x, base - h, bw, h);
			out.push({ id: `bar-${i + 1}`, kind: 'art', box: { x, y: base - h, w: bw, h }, can: {} });
			textAt(ctx, out, `value-${i + 1}`, 'mono', 400, 28, p.shown, x - 20, base - h - 48, bw + 40, i === hiAt ? accent : C.ink, C.bg, { align: 'center' });
			textAt(ctx, out, `label-${i + 1}`, 'mono', 400, 26, p.label, A.x + i * slot, base + 16, slot, C.muted, C.bg, { align: 'center' });
		});
		ctx.fillStyle = line;
		ctx.fillRect(A.x, base, A.w, 2);
		out.push({ id: 'axis', kind: 'art', box: { x: A.x, y: base, w: A.w, h: 2 }, can: {} });
	} else if (kind === 'team') {
		const people = list(slots.people).map((x) => {
			const [name, ...rest] = x.split(',');
			return { name: name!.trim(), role: rest.join(',').trim() };
		});
		if (!people.length || people.length > 8) throw new CopyError(`A team slide takes 1 to 8 people ("Name, role | Name, role"); it was given ${people.length}.`);
		const cols = Math.min(4, people.length);
		const rows = Math.ceil(people.length / cols);
		const cw = (A.w - (cols - 1) * 40) / cols;
		const ch = Math.min(260, (A.h - (rows - 1) * 40) / rows);
		people.forEach((p, i) => {
			const x = A.x + (i % cols) * (cw + 40);
			const y = A.y + Math.floor(i / cols) * (ch + 40);
			ctx.strokeStyle = line;
			ctx.lineWidth = 2;
			ctx.strokeRect(x + 1, y + 1, cw - 2, ch - 2);
			out.push({ id: `card-${i + 1}`, kind: 'panel', box: { x, y, w: cw, h: ch }, can: {} });
			mark(x + 32, y + 32, 16);
			const n = textAt(ctx, out, `name-${i + 1}`, 'display', 400, 44, p.name, x + 32, y + ch - 140, cw - 64, C.ink, C.bg);
			if (p.role) textAt(ctx, out, `role-${i + 1}`, 'text', 400, 28, p.role, x + 32, bottom(n) + 8, cw - 64, C.muted, C.bg);
			for (const l of out.slice(-2)) if (l.kind === 'text') l.over = [`card-${i + 1}`];
		});
	} else if (kind === 'grid') {
		if (!pictures.length || pictures.length > 4) throw new CopyError(`A grid slide takes 1 to 4 pictures ("images": [...] in the deck file); it was given ${pictures.length}.`);
		const cols = pictures.length === 1 ? 1 : 2;
		const rows = Math.ceil(pictures.length / cols);
		const cw = (A.w - (cols - 1) * 32) / cols;
		const ch = (A.h - (rows - 1) * 32) / rows;
		pictures.forEach((p, i) => {
			const cx = A.x + (i % cols) * (cw + 32);
			const cy = A.y + Math.floor(i / cols) * (ch + 32);
			const k = Math.min(cw / p.w, ch / p.h);
			const w = p.w * k;
			const h = p.h * k;
			const x = cx + (cw - w) / 2;
			const y = cy + (ch - h) / 2;
			ctx.drawImage(p.img, x, y, w, h);
			ctx.strokeStyle = line;
			ctx.lineWidth = 2;
			ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
			out.push({ id: `picture-${i + 1}`, kind: 'key', box: { x, y, w, h }, can: {} });
		});
	}
	for (const l of out) if (l.kind === 'text' && (right(l.box) > right(A) + 2 || bottom(l.box) > bottom(A) + 60)) throw new CopyError(`The ${kind} does not fit the slide. Shorten it.`);
	return out;
}
