import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkDesign, errorsOf } from '../../src/design/index.js';
import { adapter } from '../../src/design/adapter.js';
import { imageDoc } from '../../src/assets/layouts.js';
import { merchItems, renderItem } from '../../src/assets/merch.js';
import { compose, LAYOUTS, renderDesign, sizeOf, sizesFor, type Layout } from '../../src/assets/og.js';
import { renderImages } from '../../src/image/render.js';
import { SIZES, TEMPLATE_FIELDS, TEMPLATES } from '../../src/image/spec.js';
import type { DrawnLayer } from '../../src/design/types.js';

// The engines on their own, every template at every size: every word drawn whole or the copy refused with what to
// shorten, nothing drawn that was not passed, and the shared check clean on what was drawn.

const bin = join(__dirname, '..', '..', 'bin.js');
const A = adapter();
const ADVICE = /shorten|does not fit|cannot draw|needs a headline/i;
const LONG = { headline: 'Everything your agents need to search, buy and reply in one place, with every answer traced back to the passage it came from', body: 'Acme indexes the documents you bring, keeps them in sync and returns the right passage with its source.', badge: 'Product update', note: 'For teams' };
const SHORT = { headline: 'Ship it today' };

function problems(id: string, w: number, h: number, copy: Record<string, string>, layers: DrawnLayer[]) {
	const doc = { version: 1, brand: A.brand, kind: 'image', template: 'x', size: { id, width: w, height: h }, copy, images: {}, options: {}, layers: {}, history: [], future: [] } as never;
	return errorsOf(checkDesign({ doc, info: {} as never, layers, adapter: A })).map((f) => `${f.rule}: ${f.message}`);
}

describe('layouts at every size', () => {
	for (const t of LAYOUTS) {
		it(`${t}: short and long copy are whole and clean, or refused with what to shorten`, { timeout: 120_000 }, async () => {
			const bad: string[] = [];
			for (const id of sizesFor(t)) {
				for (const copy of t === 'avatar' ? [{}] : [SHORT, LONG]) {
					const c: Record<string, string> = { ...copy, ...(t === 'partner' ? { partner: 'Acme' } : {}) };
					const size = sizeOf(id)!;
					try {
						const d = compose({ template: t as Layout, size, headline: c.headline, body: c.body, badgeText: c.badge, note: c.note, partner: c.partner });
						const r = await renderDesign(d, null, { png: false, rgb: true, scale: 0.25 });
						bad.push(...problems(id, size.w, size.h, c, r.layers).map((p) => `${id}: ${p}`));
						/* What a platform covers (the brand's own sizes too, which the shared check does not know): no words, logo or window in it. */
						const meets = (a: { x: number; y: number; w: number; h: number }, b: typeof a) => a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;
						for (const l of r.layers) if ((l.kind === 'text' || l.kind === 'logo' || l.id === 'window' || l.id === 'picture') && size.avoid.some((z) => meets(l.box, z) && !((l.bleeds || l.fades) && z.w >= size.w * 0.9))) bad.push(`${id}: ${l.id} is in what the platform covers`);
						const said = r.layers.filter((l) => l.text && !l.text.own).map((l) => l.id);
						expect(said.every((s) => Object.keys(c).includes(s)), `${t} ${id} draws ${said}`).toBe(true);
					} catch (err) {
						expect((err as Error).message, `${t} ${id}`).toMatch(ADVICE);
						expect(copy, `${t} ${id}: short copy is refused`).toBe(LONG);
					}
				}
			}
			expect(bad).toEqual([]);
		});
	}
});

describe('sample copy', () => {
	it('draws at every size: where the long sample cannot fit it drops its note, line or label, never a passed word', { timeout: 300_000 }, async () => {
		const failed: string[] = [];
		for (const t of LAYOUTS) for (const id of sizesFor(t)) {
			try {
				const d = compose({ template: t as Layout, size: sizeOf(id)!, sample: true });
				await renderDesign(d, null, { png: false, rgb: true, scale: 0.25 });
			} catch (err) {
				/* A 50 px strip takes about three words of headline: the six-word sample is refused there, saying so. */
				if (id === 'ad-320x50' && /Shorten the headline/.test((err as Error).message)) continue;
				failed.push(`${t} ${id}: ${(err as Error).message}`);
			}
		}
		expect(failed).toEqual([]);
		const d = compose({ template: 'hero', size: sizeOf('ad-320x50')!, sample: true, body: 'Acme keeps every file in step with the apps your team already uses every day, reads every row and cell of every table, and returns the passage that answers with the file it came from, in any language your team writes in.' });
		await expect(renderDesign(d, null, { png: false, rgb: true, scale: 0.25 })).rejects.toThrow(ADVICE);
	});
});

describe('cards at every size', () => {
	it('draws every word or refuses, on paper and ink', { timeout: 120_000 }, async () => {
		const bad: string[] = [];
		for (const t of TEMPLATES) for (const s of SIZES) for (const ground of ['paper', 'ink'] as const) {
			const f = TEMPLATE_FIELDS[t.id].accepts;
			const copy = { headline: LONG.headline, ...(f.includes('text') ? { body: LONG.body } : {}), badge: 'Now shipping', ...(f.includes('by') ? { by: 'Acme' } : {}) };
			try {
				const [r] = await renderImages({ template: t.id, sizes: [s.id], ground, title: copy.headline, text: copy.body, eyebrow: copy.badge, by: copy.by, raster: false });
				bad.push(...problems(s.id, s.width, s.height, copy, r!.layers).map((p) => `${t.id} ${s.id} ${ground}: ${p}`));
			} catch (err) {
				expect((err as Error).message).toMatch(ADVICE);
			}
		}
		expect(bad).toEqual([]);
	});
});

describe('copy', () => {
	const og = sizeOf('og')!;
	it('draws only what was passed: no sample claims, notes or badges', async () => {
		const r = await renderDesign(compose({ template: 'hero', size: og, headline: 'Ship it today' }), null, { png: false, rgb: true });
		expect(r.layers.filter((l) => l.text).map((l) => [l.id, l.text!.drawn])).toEqual([['headline', 'Ship it today'], ['address', imageDoc().address]]);
		expect(() => compose({ template: 'hero', size: og })).toThrow(/needs a headline/);
		const s = await renderDesign(compose({ template: 'hero', size: og, sample: true }), null, { png: false, rgb: true });
		expect(s.layers.filter((l) => l.text?.sample).length).toBeGreaterThan(1);
	});

	it('keeps every letter: a long word breaks between letters, a lone star is drawn, Polish uses the product face', async () => {
		for (const headline of ['Donaudampfschifffahrtselektrizitätenhauptbetriebswerkbauunterbeamtengesellschaft', 'Five * three = *fifteen*', 'Zażółć gęślą jaźń']) {
			const r = await renderDesign(compose({ template: 'card', size: sizeOf('square')!, headline }), null, { png: false, rgb: true });
			const h = r.layers.find((l) => l.id === 'headline')!.text!;
			expect(h.drawn).toBe(h.asked);
			expect(h.asked).toBe(headline);
		}
	});

	it('refuses characters no brand face has, naming them', () => {
		expect(() => compose({ template: 'hero', size: og, headline: 'Ship it 🚀' })).not.toThrow();
		return expect(renderDesign(compose({ template: 'hero', size: og, headline: 'Ship it 🚀' }), null)).rejects.toThrow(/cannot draw "🚀"/);
	});

	it('refuses a slot a layout cannot draw, and a size it does not come in', () => {
		expect(() => compose({ template: 'room', size: og, headline: 'x', partner: 'Acme' })).toThrow(/does not draw --partner/);
		expect(() => compose({ template: 'hero', size: sizeOf('avatar')!, headline: 'x' })).toThrow(/does not draw at avatar/);
		expect(sizeOf('1600x400')).toMatchObject({ id: 'custom', w: 1600, h: 400 });
		expect(sizeOf('twitter header')?.id).toBe('x-banner');
	});
});

describe('merch', () => {
	it('keeps every part inside the safe area and apart, in every variant, with and without a headline', () => {
		const bad: string[] = [];
		for (const item of merchItems()) for (const variant of item.variants) for (const headline of [undefined, 'Search should return the passage, not the folder']) {
			const takes = item.layers.some((l) => l.type === 'text' && l.slot === 'headline');
			if (headline && !takes) continue;
			const r = renderItem(item, { variant, slots: headline ? { headline } : {}, dpi: 72, png: false, svg: true });
			const safe = (item.safe + item.bleed) * 300;
			const W = r.widthIn * 300;
			const H = r.heightIn * 300;
			const kept = r.layers.filter((l) => l.kind !== 'art');
			for (const l of kept) for (const b of l.ink ?? [l.box]) if (b.x < safe - 1 || b.y < safe - 1 || b.x + b.w > W - safe + 1 || b.y + b.h > H - safe + 1) bad.push(`${item.id} ${variant}: ${l.id} leaves the safe area`);
			for (let i = 0; i < kept.length; i++) for (let j = i + 1; j < kept.length; j++) {
				const [a, b] = [kept[i]!.box, kept[j]!.box];
				if (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y) bad.push(`${item.id} ${variant}: ${kept[i]!.id} and ${kept[j]!.id} overlap`);
			}
			if (!kept.length) bad.push(`${item.id} ${variant}: draws nothing`);
		}
		expect(bad).toEqual([]);
	});
});

describe('the command', () => {
	it('writes a numbered carousel from one file, and jpg and webp', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-carousel-'));
		writeFileSync(join(dir, 'c.json'), JSON.stringify({ carousel: { template: 'card', size: 'square', slides: [{ headline: 'One' }, { headline: 'Two' }, { headline: 'Three', template: 'room' }] } }));
		const r = spawnSync('node', [bin, 'image', '--input', 'c.json', '--format', 'png,jpg,webp', '--json', '--cwd', dir], { encoding: 'utf8' });
		expect(r.status, r.stderr).toBe(0);
		const files = JSON.parse(r.stdout).files as { path: string; format: string }[];
		expect(files.map((f) => f.path)).toContain('imagery/carousel-03-square.webp');
		expect(readFileSync(join(dir, 'imagery/carousel-01-square.jpg')).subarray(0, 2)).toEqual(Buffer.from([0xff, 0xd8]));
		const refused = spawnSync('node', [bin, 'image', 'hero', '--headline', Array(400).fill('word').join(' '), '--size', 'linkedin-page', '--cwd', dir], { encoding: 'utf8' });
		expect(refused.status).toBe(1);
		expect(refused.stderr).toMatch(/Shorten the headline to about \d+ words/);
	});
});

describe('the logo', () => {
	it('keeps its clear space from every word at every anchor, in every layout and size it can be anchored in', { timeout: 300_000 }, async () => {
		const bad: string[] = [];
		let drawn = 0;
		for (const t of LAYOUTS) {
			if (t === 'avatar') continue;
			const anchors = A.templates().find((x) => x.id === t)!.layers.find((l) => l.id === 'logo')?.can.anchors ?? [];
			for (const id of ['og', 'square', 'story', 'x-banner', 'linkedin-banner']) {
				if (!sizesFor(t).includes(id)) continue;
				for (const anchor of anchors) {
					const size = sizeOf(id)!;
					const copy = { headline: 'Every answer comes back with its source', body: 'Search across the documents you connect.', badge: 'New', note: 'For teams', ...(t === 'partner' ? { partner: 'Acme' } : {}) };
					try {
						const d = compose({ template: t, size, headline: copy.headline, body: copy.body, badgeText: copy.badge, note: copy.note, partner: (copy as { partner?: string }).partner, layers: { logo: { anchor } } });
						const r = await renderDesign(d, null, { png: false, rgb: true, scale: 0.25 });
						const logo = r.layers.find((l) => l.kind === 'logo')!;
						const c = logo.logo!.clear;
						const zone = { x: logo.box.x - c, y: logo.box.y - c, w: logo.box.w + 2 * c, h: logo.box.h + 2 * c };
						for (const l of r.layers.filter((x) => x.text && x.id !== 'partner')) {
							for (const b of l.ink ?? [l.box]) if (b.x < zone.x + zone.w && b.x + b.w > zone.x && b.y < zone.y + zone.h && b.y + b.h > zone.y) bad.push(`${t} ${id} logo ${anchor}: the ${l.id} is inside the logo's clear space`);
						}
						drawn++;
					} catch (err) {
						expect((err as Error).message, `${t} ${id} ${anchor}`).toMatch(ADVICE);
					}
				}
			}
		}
		expect(bad).toEqual([]);
		expect(drawn).toBeGreaterThan(100);
	});
});

describe('page compose', () => {
	it('writes the outline in Vue, React, web components and plain HTML with only its words', async () => {
		const { writePage, PAGE_FLAVORS } = await import('../../src/assets/page.js');
		const { validateOutline } = await import('../../src/design/index.js');
		const outline = validateOutline(A, { title: 'Acme', sections: [
			{ type: 'header', copy: { action: 'Sign in' }, items: [{ label: 'Pricing', href: '#pricing' }] },
			{ type: 'hero', copy: { title: 'Every answer with its source', body: 'Search what you connect.', action: 'Start building' } },
			{ type: 'bento', copy: { title: 'What it does' }, items: [{ title: 'Search', body: 'Find it.', size: 'large' }, { title: 'Sync', body: 'Keep in step.' }] },
			{ type: 'comparison', copy: { title: 'Plans', plans: 'Free | Pro' }, items: [{ feature: 'Sources', values: 'yes | no' }] },
			{ type: 'cta', copy: { title: 'Start today', action: 'Get started' } },
			{ type: 'footer', copy: { legal: '© 2026 Acme, Inc.' }, items: [{ label: 'Blog', column: 'Company' }] },
		] });
		expect(PAGE_FLAVORS).toEqual(['vue', 'react', 'elements', 'html']);
		for (const f of PAGE_FLAVORS) {
			const files = await writePage(outline, f);
			const text = Object.values(files).join('\n');
			for (const w of ['Every answer with its source', 'Start building', 'What it does', 'Keep in step.', 'Get started', '© 2026 Acme, Inc.']) expect(text, `${f}: ${w}`).toContain(w);
			expect(text, f).not.toMatch(/Lorem|SOC 2|100M/);
		}
		expect(() => validateOutline(A, { sections: [{ type: 'hero', copy: {} }] })).toThrow();
	});
});

/* Ink beyond the ground: the most common color is the ground; a picture needs 0.2% of its pixels off it (faint hairline art included). */
async function inkShare(png: Uint8Array): Promise<number> {
	const { createCanvas, loadImage } = await import('@napi-rs/canvas');
	const im = await loadImage(Buffer.from(png));
	const c = createCanvas(im.width, im.height);
	c.getContext('2d').drawImage(im, 0, 0);
	const p = { width: im.width, height: im.height, data: c.getContext('2d').getImageData(0, 0, im.width, im.height).data };
	const n = p.width * p.height;
	const ch = 4;
	const count = new Map<number, number>();
	const step = Math.max(1, Math.floor(n / 200_000));
	for (let i = 0; i < n; i += step) {
		const k = (p.data[i * ch]! << 16) | (p.data[i * ch + 1]! << 8) | p.data[i * ch + 2]!;
		count.set(k, (count.get(k) ?? 0) + 1);
	}
	const ground = [...count].sort((a, b) => b[1] - a[1])[0]![0];
	const [r, g, b] = [ground >> 16, (ground >> 8) & 255, ground & 255];
	/* A transparent ground (merch on a garment): anything opaque is ink. */
	const clear = (() => { let t = 0; for (let i = 0; i < n; i += step * 7) if (p.data[i * ch + 3]! < 24) t++; return t > n / step / 7 / 2; })();
	let off = 0;
	let seen = 0;
	for (let i = 0; i < n; i += step) {
		seen++;
		const a = ch === 4 ? p.data[i * ch + 3]! : 255;
		if (clear ? a > 24 : a > 24 && Math.max(Math.abs(p.data[i * ch]! - r), Math.abs(p.data[i * ch + 1]! - g), Math.abs(p.data[i * ch + 2]! - b)) > 12) off++;
	}
	return off / seen;
}

describe('nothing blank', () => {
	it('every picture in the docs gallery has ink beyond its ground', async () => {
		const { readdirSync } = await import('node:fs');
		const dir = join(__dirname, '..', '..', 'apps', 'www', 'public', 'gallery');
		const blank: string[] = [];
		for (const f of readdirSync(dir).filter((x) => x.endsWith('.png'))) if ((await inkShare(readFileSync(join(dir, f)))) < 0.002) blank.push(f);
		expect(blank).toEqual([]);
	});

	it('every template draws ink at its first size, and an empty compose writes no picture', { timeout: 300_000 }, async () => {
		const { create } = await import('../../src/design/index.js');
		const blank: string[] = [];
		for (const t of A.templates().filter((x) => x.kind === 'image' || x.kind === 'slide' || x.kind === 'merch' || x.kind === 'illustration')) {
			const copy = Object.fromEntries(t.copy.filter((c) => c.required).map((c) => [c.id, c.id === 'items' || c.id === 'people' || c.id === 'data' ? 'One 1 | Two 2' : c.id === 'left' || c.id === 'right' ? 'Before' : 'Ship it today']));
			let doc;
			try {
				doc = create(A, t.id, t.sizes[0]!, Object.entries(copy).map(([slot, value]) => ({ op: 'copy', slot, value }))).doc;
				if (t.images.some((i) => i.required)) continue;
				const r = await A.render(doc, tmpdir(), { formats: ['png'], scale: 1 });
				if (r.files.png && (await inkShare(r.files.png)) < 0.002) blank.push(t.id);
			} catch (err) {
				expect((err as Error).message, t.id).toMatch(/shorten|too long|does not fit|needs|takes|cannot/i);
			}
		}
		expect(blank).toEqual([]);
		const empty = create(A, 'compose', 'og', []).doc;
		const r = await A.render(empty, tmpdir(), { formats: ['png'], scale: 1 });
		expect(r.files.png).toBeUndefined();
		expect(r.notes?.[0]).toMatch(/Add a block/);
	});
});
