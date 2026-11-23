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
		const refused = spawnSync('node', [bin, 'image', 'hero', '--headline', Array(80).fill('word').join(' '), '--size', 'linkedin-page', '--cwd', dir], { encoding: 'utf8' });
		expect(refused.status).toBe(1);
		expect(refused.stderr).toMatch(/Shorten the headline to about \d+ words/);
	});
});
