import { color, font, type Ctx } from './canvas.js';
import { imageDoc } from './layouts.js';

// The dark agent window, on a 1040 by 640 grid. It is drawn without words (every line of copy is a bar where it would
// sit) unless the sample content is asked for: words nobody passed are never drawn.

export const PANEL_W = 1040;
export const PANEL_H = 640;

type Colors = Record<string, string>;
const colors = (): Colors => Object.fromEntries(Object.entries(imageDoc().panel.colors).map(([k, v]) => [k, color(v)]));

/** The window: its sample words when `sample`, else bars. */
export function drawPanel(ctx: Ctx, sample = false) {
	if (sample) drawPanelWords(ctx, imageDoc().panel.content);
	else drawPanelBars(ctx);
}

function drawPanelBars(ctx: Ctx) {
	const C = colors();
	const W = PANEL_W;
	const H = PANEL_H;
	const padX = 34;
	const inner = W - padX * 2;
	const bar = (x: number, mid: number, w: number, h: number, fill: string) => {
		ctx.fillStyle = fill;
		ctx.fillRect(x, mid - h / 2, w, h);
	};
	const chip = (x: number, y: number, w: number, h: number, fill: string | null, stroke: string | null) => {
		ctx.beginPath();
		ctx.roundRect(x, y, w, h, 3);
		if (fill) {
			ctx.fillStyle = fill;
			ctx.fill();
		}
		if (stroke) {
			ctx.strokeStyle = stroke;
			ctx.lineWidth = 1.4;
			ctx.stroke();
		}
	};
	ctx.save();
	ctx.fillStyle = C.bg!;
	ctx.fillRect(0, 0, W, H);
	const tb = 64;
	ctx.strokeStyle = C.ink!;
	ctx.lineWidth = 2;
	ctx.strokeRect(padX, tb / 2 - 8, 18, 16);
	ctx.fillStyle = C.ink!;
	ctx.fillRect(padX, tb / 2 - 8, 18, 4);
	bar(padX + 32, tb / 2, 118, 12, C.ink!);
	chip(padX + 168, tb / 2 - 15, 104, 30, C.chip!, null);
	bar(padX + 180, tb / 2, 80, 7, C.faint!);
	ctx.fillStyle = C.line!;
	ctx.fillRect(0, tb, W, 1.5);
	let y = tb + 30;
	let x = padX;
	for (const [a, b] of [[62, 46], [48, 112], [46, 34]] as const) {
		const w = a + b + 34;
		chip(x, y, w, 40, null, C.chipEdge!);
		bar(x + 12, y + 20, a, 8, C.faint!);
		bar(x + 20 + a, y + 20, b, 8, C.ink!);
		x += w + 10;
	}
	y += 62;
	ctx.fillStyle = C.accent!;
	ctx.fillRect(padX, y + 7, 10, 10);
	bar(padX + 22, y + 12, 292, 11, C.ink!);
	y += 44;
	x = padX;
	for (const [w, on] of [[96, true], [56, true], [64, true], [52, false], [70, false]] as const) {
		chip(x, y - 4, w + (on ? 44 : 26), 36, C.chip!, null);
		bar(x + 13, y + 14, w, 8, on ? C.ink! : C.faint!);
		if (on) {
			ctx.fillStyle = C.accent!;
			ctx.fillRect(x + w + 23, y + 10, 8, 8);
		}
		x += w + (on ? 44 : 26) + 8;
	}
	y += 50;
	y = strip(ctx, C, padX, y, inner, 1);
	bar(padX, y + 10, 30, 9, C.accent!);
	bar(padX + 38, y + 10, 190, 9, C.faint!);
	y += 34;
	bar(padX, y + 8, 520, 7, C.chipEdge!);
	y += 28;
	ctx.fillStyle = C.line!;
	ctx.fillRect(padX, y + 6, inner, 1.5);
	y += 24;
	bar(padX, y + 12, 128, 8, C.faint!);
	y += 38;
	const statsH = 70;
	const rows = [[120, 410, 92], [168, 300, 64], [86, 250, 52]] as const;
	const rh = Math.max(40, Math.min(60, (H - statsH - y) / rows.length));
	rows.forEach(([a, b, c], i) => {
		const mid = y + rh / 2;
		bar(padX, mid, a, 11, C.ink!);
		bar(padX + a + 18, mid, b, 8, C.faint!);
		chip(W - padX - c - 26, mid - 18, c + 26, 36, C.chip!, null);
		bar(W - padX - c - 13, mid, c, 8, C.ink!);
		if (i < rows.length - 1) {
			ctx.fillStyle = C.line!;
			ctx.fillRect(padX - 10, y + rh, inner + 20, 1.2);
		}
		y += rh;
	});
	ctx.fillStyle = C.line!;
	ctx.fillRect(0, H - statsH, W, 1.5);
	x = padX;
	for (const w of [104, 44, 88]) {
		chip(x, H - statsH / 2 - 16, w + 18, 32, C.chip!, null);
		bar(x + 9, H - statsH / 2, w, 7, C.faint!);
		x += w + 26;
	}
	ctx.restore();
}

/* Documents searched: a strip of small squares, a few found in red. Returns the y under it. */
function strip(ctx: Ctx, C: Colors, x0: number, y: number, inner: number, seed: number): number {
	const s = 4.6;
	const g = 2.6;
	const rows = 5;
	const cols = Math.floor(inner / (s + g));
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const n = (Math.imul(seed ^ (r * 131 + c * 7919), 2654435761) >>> 0) % 1000;
			ctx.fillStyle = n < 6 ? C.accent! : C.chipEdge!;
			ctx.fillRect(x0 + c * (s + g), y + r * (s + g), s, s);
		}
	}
	return y + rows * (s + g) + 18;
}

const split = (s: string, by: RegExp) => s.split(by).map((x) => x.trim()).filter(Boolean);
function parts(s: string, n: number) {
	return split(s, /\n/).map((l) => {
		const p = l.split('|').map((x) => x.trim());
		while (p.length < n) p.push('');
		return p.slice(0, n);
	});
}
function hash(s: string) {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
	return h >>> 0;
}

/* The dark agent panel (app.ts) with its sample words. */
function drawPanelWords(ctx: Ctx, a: Record<string, string>) {
	const C = colors();
	const W = PANEL_W;
	const H = PANEL_H;
	const padX = 34;
	const f = (size: number, weight = 400) => font('ui', weight, size);
	ctx.save();
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'left';
	ctx.letterSpacing = '0px';
	const fit = (s: string, max: number) => {
		if (ctx.measureText(s).width <= max) return s;
		let t = s;
		while (t.length > 1 && ctx.measureText(`${t}…`).width > max) t = t.slice(0, -1);
		return `${t.trimEnd()}…`;
	};
	const chipAt = (x: number, y: number, h: number, w: number, fill: string, stroke?: string) => {
		ctx.beginPath();
		ctx.roundRect(x, y, w, h, 3);
		if (fill !== 'transparent') {
			ctx.fillStyle = fill;
			ctx.fill();
		}
		if (stroke) {
			ctx.strokeStyle = stroke;
			ctx.lineWidth = 1.4;
			ctx.stroke();
		}
	};
	ctx.fillStyle = C.bg!;
	ctx.fillRect(0, 0, W, H);
	const tb = 64;
	ctx.strokeStyle = C.ink!;
	ctx.lineWidth = 2;
	ctx.strokeRect(padX, tb / 2 - 8, 18, 16);
	ctx.fillStyle = C.ink!;
	ctx.fillRect(padX, tb / 2 - 8, 18, 4);
	ctx.font = f(22, 500);
	const title = fit(a.title!, 460);
	ctx.fillText(title, padX + 32, tb / 2);
	const tx = padX + 32 + ctx.measureText(title).width + 14;
	if (a.tag!.trim()) {
		ctx.font = f(15);
		const tw = ctx.measureText(a.tag!).width;
		chipAt(tx, tb / 2 - 15, 30, tw + 20, C.chip!);
		ctx.fillStyle = C.muted!;
		ctx.fillText(a.tag!, tx + 10, tb / 2);
	}
	ctx.strokeStyle = C.muted!;
	ctx.lineWidth = 2;
	ctx.lineCap = 'round';
	const gx = W - padX - 10;
	ctx.beginPath();
	ctx.moveTo(gx - 7, tb / 2 - 7);
	ctx.lineTo(gx + 7, tb / 2 + 7);
	ctx.moveTo(gx + 7, tb / 2 - 7);
	ctx.lineTo(gx - 7, tb / 2 + 7);
	ctx.moveTo(gx - 52, tb / 2 + 5);
	ctx.lineTo(gx - 40, tb / 2 + 5);
	ctx.moveTo(gx - 24, tb / 2 + 1);
	ctx.lineTo(gx - 24, tb / 2 + 6);
	ctx.lineTo(gx - 19, tb / 2 + 6);
	ctx.moveTo(gx - 17, tb / 2 - 6);
	ctx.lineTo(gx - 12, tb / 2 - 6);
	ctx.lineTo(gx - 12, tb / 2 - 1);
	ctx.stroke();
	ctx.fillStyle = C.line!;
	ctx.fillRect(0, tb, W, 1.5);
	let y = tb + 30;
	const inner = W - padX * 2;
	{
		let x = padX;
		for (const [key, val] of parts(a.fields!, 2)) {
			ctx.font = f(17);
			const kw = ctx.measureText(key!).width;
			const vw = ctx.measureText(val!).width;
			const w = kw + vw + (val ? 30 : 22);
			if (x + w > W - padX) break;
			chipAt(x, y, 40, w, 'transparent', C.chipEdge);
			ctx.fillStyle = C.muted!;
			ctx.fillText(key!, x + 11, y + 20);
			ctx.fillStyle = C.ink!;
			ctx.fillText(val!, x + 11 + kw + 8, y + 20);
			x += w + 10;
		}
		y += 62;
	}
	if (a.task!.trim()) {
		ctx.fillStyle = C.accent!;
		ctx.fillRect(padX, y + 7, 10, 10);
		ctx.fillStyle = C.ink!;
		ctx.font = f(21);
		ctx.fillText(fit(a.task!, inner - 24), padX + 22, y + 12);
		y += 44;
	}
	{
		ctx.strokeStyle = C.muted!;
		ctx.lineWidth = 1.6;
		for (let i = 0; i < 4; i++) {
			ctx.beginPath();
			ctx.moveTo(padX, y + 22 - i * 4);
			ctx.quadraticCurveTo(padX + 8 + i * 2, y + 18 - i * 4, padX + 14 + i, y + 4);
			ctx.stroke();
		}
		ctx.fillStyle = C.muted!;
		ctx.font = f(18);
		ctx.fillText('Found in', padX + 30, y + 14);
		let x = padX + 30 + ctx.measureText('Found in').width + 18;
		for (const raw of split(a.sources!, /,/)) {
			const on = raw.endsWith('*');
			const name = raw.replace(/\*$/, '').trim();
			ctx.font = f(17);
			const w = ctx.measureText(name).width + (on ? 44 : 26);
			if (x + w > W - padX) break;
			chipAt(x, y - 4, 36, w, C.chip!);
			ctx.fillStyle = on ? C.ink! : name.startsWith('+') ? C.faint! : C.muted!;
			ctx.fillText(name, x + 13, y + 14);
			if (on) {
				ctx.fillStyle = C.accent!;
				ctx.fillRect(x + w - 21, y + 10, 8, 8);
			}
			x += w + 8;
		}
		y += 50;
	}
	y = strip(ctx, C, padX, y, inner, hash(a.found! + a.task!));
	if (a.found!.trim()) {
		ctx.font = f(17);
		const m = a.found!.match(/^(\S+)(.*)$/);
		const first = m?.[1] ?? a.found!;
		ctx.fillStyle = C.accent!;
		ctx.fillText(first, padX, y + 10);
		ctx.fillStyle = C.muted!;
		ctx.fillText(m?.[2] ?? '', padX + ctx.measureText(first).width, y + 10);
		y += 30;
	}
	if (a.kinds!.trim()) {
		ctx.font = f(15);
		ctx.fillStyle = C.muted!;
		ctx.fillText(fit(a.kinds!, inner), padX, y + 8);
		y += 30;
	}
	const statsH = 70;
	ctx.fillStyle = C.line!;
	ctx.fillRect(padX, y + 6, inner, 1.5);
	y += 24;
	if (a.section!.trim()) {
		ctx.font = f(17);
		ctx.fillStyle = C.muted!;
		ctx.fillText(a.section!, padX, y + 12);
		y += 38;
	}
	const list = parts(a.rows!, 3);
	const room = H - statsH - y;
	const rh = Math.max(40, Math.min(60, room / Math.max(1, list.length)));
	list.forEach(([name, what, src], i) => {
		if (y + rh > H - statsH + 4) return;
		const mid = y + rh / 2;
		ctx.font = f(15);
		const sw = src ? ctx.measureText(src).width + 26 : 0;
		if (src) {
			chipAt(W - padX - sw, mid - 18, 36, sw, C.chip!);
			ctx.fillStyle = C.ink!;
			ctx.fillText(src, W - padX - sw + 13, mid);
		}
		ctx.font = f(21);
		ctx.fillStyle = C.ink!;
		const nt = fit(name!, inner * 0.4);
		ctx.fillText(nt, padX, mid);
		const nw = ctx.measureText(nt).width;
		ctx.font = f(16);
		ctx.fillStyle = C.soft!;
		ctx.fillText(fit(what!, inner - nw - sw - 40), padX + nw + 16, mid);
		if (i < list.length - 1) {
			ctx.fillStyle = C.line!;
			ctx.fillRect(padX - 10, y + rh, inner + 20, 1.2);
		}
		y += rh;
	});
	ctx.fillStyle = C.line!;
	ctx.fillRect(0, H - statsH, W, 1.5);
	let sx = padX;
	ctx.font = f(15);
	for (const s of split(a.stats!, /\n|\|/)) {
		const w = ctx.measureText(s).width + 18;
		if (sx + w > W - padX) break;
		chipAt(sx, H - statsH / 2 - 16, 32, w, C.chip!);
		ctx.fillStyle = C.muted!;
		ctx.fillText(s, sx + 9, H - statsH / 2);
		sx += w + 8;
	}
	ctx.restore();
}
