import { createCanvas } from '@napi-rs/canvas';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { compose, imageDoc, LAYOUTS, renderDesign, sizesFor, sizeOf } from '../src/assets/og.js';
import { renderSlide, slideTypes } from '../src/assets/deck.js';
import { merchItems, PX_PER_IN, renderItem } from '../src/assets/merch.js';
import { renderSubject, SUBJECTS, pixelCells } from '../src/illustrate/draw.js';
import { checkFigmaValues } from '../src/figma/check.js';
import { figmaTokens, figmaTokenScripts } from '../src/figma/tokens.js';
import { hasFfmpeg } from '../src/assets/video.js';
import { pngSize } from '../src/image/render.js';

const bin = join(__dirname, '..', 'bin.js');
const sha = (b: Buffer | string) => createHash('sha256').update(b).digest('hex');
const dir = mkdtempSync(join(tmpdir(), 'ds-assets-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

function cli(args: string[]) {
	const r = spawnSync('node', [bin, ...args, '--cwd', dir], { encoding: 'utf8' });
	return { code: r.status, out: r.stdout, err: r.stderr };
}

describe('image layouts', () => {
	it('draws every layout at the link preview size, the same bytes twice', async () => {
		for (const t of LAYOUTS) {
			const size = sizeOf(t === 'avatar' ? 'avatar' : 'og')!;
			const a = await renderDesign(compose({ template: t, size, sample: true }), null, { png: true });
			const b = await renderDesign(compose({ template: t, size, sample: true }), null, { png: true });
			expect(pngSize(a.png!), t).toEqual({ width: size.w, height: size.h });
			expect(sha(a.png!), t).toBe(sha(b.png!));
		}
	});

	it('offers the social set and draws one layout at every size', async () => {
		const want: [string, number, number][] = [['og', 1200, 630], ['square', 1080, 1080], ['portrait', 1080, 1350], ['story', 1080, 1920], ['landscape', 1200, 675], ['x-banner', 1500, 500], ['linkedin-banner', 1584, 396]];
		for (const [id, w, h] of want) expect(sizeOf(id), id).toMatchObject({ w, h });
		for (const id of sizesFor('hero')) {
			const s = sizeOf(id)!;
			const r = await renderDesign(compose({ template: 'hero', size: s, headline: 'Ship it today' }), null, { png: true });
			expect(pngSize(r.png!)).toEqual({ width: s.w, height: s.h });
		}
	});

	it('takes only token colors', () => {
		const tokens = readFileSync(join(__dirname, '..', 'brand', 'tokens.css'), 'utf8');
		const doc = JSON.stringify({ themes: imageDoc().themes, tones: imageDoc().tones, panel: imageDoc().panel.colors });
		expect(doc).not.toMatch(/#[0-9a-f]{3,8}\b/i);
		for (const m of doc.matchAll(/"([a-z]+(?:-[a-z0-9]+)*)(?:\/[\d.]+)?"/g)) if (/^(off|home|neutral|red)-/.test(m[1]!)) expect(tokens, m[1]).toContain(`--ds-color-${m[1]}:`);
	});

	it('writes PNG and SVG from the CLI, refuses unknown names with a suggestion', () => {
		const ok = cli(['image', '--template', 'room', '--size', 'story', '--title', 'Hello *agents*', '--out', 'img', '--json']);
		expect(ok.code).toBe(0);
		const files = JSON.parse(ok.out).files as { path: string; format: string; width: number }[];
		expect(files.map((f) => f.format)).toEqual(['png', 'svg']);
		expect(readFileSync(join(dir, files[1]!.path), 'utf8')).toMatch(/<svg[^>]+width="1080"/);
		const bad = cli(['image', '--template', 'heor']);
		expect(bad.code).toBe(1);
		expect(bad.err).toMatch(/Did you mean `hero`/);
		const size = cli(['image', '--template', 'hero', '--title', 'x', '--size', 'storyy']);
		expect(size.code).toBe(1);
		expect(size.err).toMatch(/Did you mean `story`/);
		expect(cli(['image', '--template', 'room', '--title', 'x', '--image', 'x.png']).err).toMatch(/feature layout/);
	});

	it('renders several images from a JSON file', () => {
		writeFileSync(join(dir, 'posts.json'), JSON.stringify({ images: [{ template: 'card', size: ['square', 'og'], title: 'One' }, { template: 'brief', title: 'Two', eyebrow: 'News' }] }));
		const r = cli(['image', '--input', 'posts.json', '--out', 'posts', '--format', 'png', '--json']);
		expect(r.code).toBe(0);
		expect(JSON.parse(r.out).files).toHaveLength(3);
		writeFileSync(join(dir, 'bad.json'), JSON.stringify({ images: [{ template: 'card', titel: 'x' }] }));
		expect(cli(['image', '--input', 'bad.json']).err).toMatch(/Did you mean `title`/);
	});
});

describe('deck', () => {
	it('draws every slide type at 1920x1080 and writes a PDF', async () => {
		/* The slides whose data is always the person's have no sample copy: they are given Acme's. */
		const own: Record<string, Record<string, unknown>> = { agenda: { items: ['One', 'Two'] }, chart: { data: 'Mon 120 | Tue 180' }, timeline: { items: ['May: One', 'June: Two'] }, comparison: { left: 'Before', right: 'After' }, grid: { title: 'Pictures', pictures: [(() => { const c = createCanvas(40, 30); return { img: c, w: 40, h: 30 }; })()] }, team: { people: ['Acme admin, Head of search'] }, qa: { title: 'Questions?' } };
		for (const type of slideTypes()) {
			const r = await renderSlide(own[type] ? { type, ...own[type] } : { type, sample: true }, { png: true });
			expect(pngSize(r.png!), type).toEqual({ width: 1920, height: 1080 });
		}
		writeFileSync(join(dir, 'deck.json'), JSON.stringify({ slides: [{ type: 'cover', title: 'One' }, { type: 'bullets', items: ['A', 'B'] }, { type: 'end' }] }));
		const r = cli(['deck', '--input', 'deck.json', '--out', 'deck', '--json']);
		expect(r.code).toBe(0);
		const pdf = readFileSync(join(dir, 'deck', 'deck.pdf'));
		expect(pdf.toString('latin1', 0, 8)).toBe('%PDF-1.4');
		expect(pdf.toString('latin1')).toContain('/Count 3');
		expect(cli(['deck', 'covr']).err).toMatch(/Did you mean `cover`/);
		expect(cli(['deck', 'cover', '--title', 'x', '--stat', '9']).err).toMatch(/does not take "stat"/);
	});
});

describe('video', () => {
	it('writes a still frame, and with ffmpeg the same MP4 bytes twice', async () => {
		const s = cli(['video', '--template', 'card', '--title', 'Hi', '--size', 'linkedin-page', '--at', '0.4', '--out', 'v/still.png', '--json']);
		expect(s.code).toBe(0);
		expect(pngSize(readFileSync(join(dir, 'v', 'still.png')))).toEqual({ width: 1512, height: 256 });
		if (!hasFfmpeg()) return;
		const a = cli(['video', '--template', 'card', '--title', 'Hi', '--size', 'linkedin-page', '--out', 'v/a.mp4']);
		const b = cli(['video', '--template', 'card', '--title', 'Hi', '--size', 'linkedin-page', '--out', 'v/b.mp4']);
		expect(a.code).toBe(0);
		expect(b.code).toBe(0);
		expect(sha(readFileSync(join(dir, 'v', 'a.mp4')))).toBe(sha(readFileSync(join(dir, 'v', 'b.mp4'))));
		const probe = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height', '-of', 'csv=p=0', join(dir, 'v', 'a.mp4')], { encoding: 'utf8' });
		expect(probe.trim()).toBe('h264,1512,256');
		expect(cli(['video', 'hero', '--sample', '--format', 'avi']).err).toMatch(/Unknown format/);
	});
});

describe('merch', () => {
	it('writes every item at real size with bleed, and the sticker cut line in the SVG', () => {
		for (const item of merchItems()) {
			const r = renderItem(item, { dpi: 72, png: true });
			expect(r.widthIn, item.id).toBe(item.size[0] + 2 * item.bleed);
			expect(pngSize(r.png!)).toEqual({ width: Math.round(r.widthIn * 72), height: Math.round(r.heightIn * 72) });
		}
		const sticker = renderItem(merchItems().find((i) => i.id === 'sticker')!, { png: false, svg: true });
		expect(sticker.svg).toMatch(/width="3.25in" height="2in"/);
		expect(sticker.svg).toContain('id="CutContour"');
		expect(PX_PER_IN).toBe(300);
		expect(cli(['merch', 'tee-front', '--variant', 'ink']).err).toMatch(/Unknown variant/);
		expect(cli(['merch', 'mug-wrap', '--headline', 'x']).err).toMatch(/does not draw --headline/);
	});
});

describe('illustrate', () => {
	it('draws every subject as vector SVG and PNG, the same twice', () => {
		for (const subject of SUBJECTS()) {
			const a = renderSubject({ subject, width: 400, height: 300, seed: 5 }, { png: true, svg: true });
			const b = renderSubject({ subject, width: 400, height: 300, seed: 5 }, { png: true, svg: true });
			expect(pngSize(a.png!), subject).toEqual({ width: 400, height: 300 });
			expect(a.svg, subject).toMatch(/<(path|rect)\b/);
			expect(sha(a.png!)).toBe(sha(b.png!));
			expect(a.svg).toBe(b.svg);
		}
	});

	it("keeps the pixel grid's cells when a seed reshuffles them", () => {
		const count = (c: boolean[][]) => c.flat().filter(Boolean).length;
		expect(count(pixelCells(9))).toBe(count(pixelCells()));
		expect(JSON.stringify(pixelCells(9))).not.toBe(JSON.stringify(pixelCells()));
		expect(cli(['illustrate', 'stackz']).err).toMatch(/Did you mean `stack`/);
	});
});

describe('figma', () => {
	it('turns the tokens into variables in two modes and scripts under the limit', () => {
		const doc = figmaTokens();
		expect(doc.modes).toEqual(['Light', 'Dark']);
		expect(doc.variables.find((v) => v.css === '--ds-color-fg')?.values).toHaveLength(2);
		for (const s of figmaTokenScripts(doc)) expect(s.length).toBeLessThanOrEqual(45000);
	});

	it('flags off-brand values with the nearest token', () => {
		const f = checkFigmaValues(JSON.stringify({ a: '#EA3325', b: '#123456' }));
		expect(f.find((x) => x.value === '#EA3325')?.ok).toBe(true);
		expect(f.find((x) => x.value === '#123456')).toMatchObject({ ok: false });
		writeFileSync(join(dir, 'ctx.txt'), '<div className="bg-[#123456] text-[13px]" />');
		const r = cli(['figma', 'check', 'ctx.txt']);
		expect(r.code).toBe(1);
		expect(r.out).toMatch(/nearest/);
		const push = cli(['figma', 'push', 'illustration', 'pixels', '--out', 'fig', '--json']);
		expect(push.code).toBe(0);
		expect(JSON.parse(push.out).steps.map((s: { tool: string }) => s.tool)).toContain('create_session');
	});
});

describe('manifest and help', () => {
	it('lists every asset command, layout, size, slide, item, subject and lockup', () => {
		const doc = JSON.parse(cli(['manifest', '--json']).out);
		for (const c of ['image', 'deck', 'video', 'merch', 'illustrate', 'figma']) expect(doc.commands.map((x: { name: string }) => x.name)).toContain(c);
		expect(doc.image.layouts.templates).toHaveLength(LAYOUTS.length);
		expect(doc.deck.slides.map((s: { id: string }) => s.id)).toEqual(slideTypes());
		expect(doc.merch.items).toHaveLength(merchItems().length);
		expect(doc.illustrate.subjects.map((s: { id: string }) => s.id)).toEqual(SUBJECTS());
		expect(doc.illustrate.rules.length).toBeGreaterThanOrEqual(10);
		expect(doc.logo.lockups.map((l: { id: string }) => l.id)).toContain('primary');
		// brand/logo defines no clear space or minimum size, so none is claimed.
		expect(doc.logo.clearSpace).toBeNull();
		const unknown = cli(['illustrat']);
		expect(unknown.code).toBe(1);
		expect(unknown.err).toMatch(/Did you mean `illustrate`/);
	});

	it('keeps help rows from running into their descriptions', () => {
		const name = JSON.parse(readFileSync(join(__dirname, '..', 'brand', 'brand.json'), 'utf8')).bin as string;
		for (const c of ['', 'image', 'deck', 'video', 'merch', 'illustrate', 'figma']) {
			const lines = execFileSync('node', [bin, ...(c ? [c] : []), '--help'], { encoding: 'utf8' }).split('\n');
			lines.forEach((line, i) => {
				if (!line.startsWith(`  ${name} `)) return;
				// A command glued to its description reads like `--size squareA square quotation`.
				expect(line, `${c || 'help'}: ${line}`).not.toMatch(/[a-z0-9\]][A-Z][a-z]+ /);
				const gap = /\S {2,}\S/.test(line);
				const wrapped = /^ {20,}\S/.test(lines[i + 1] ?? '');
				const bare = !/ [A-Z][a-z]/.test(line.slice(name.length + 3));
				expect(gap || wrapped || bare, `${c || 'help'}: ${line}`).toBe(true);
			});
		}
	});
});
