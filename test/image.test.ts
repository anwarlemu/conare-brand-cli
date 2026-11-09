import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runImage } from '../src/commands/image.js';
import { pngSize, renderImages, resolveRequest } from '../src/image/render.js';
import { SIZES, TEMPLATES, theme } from '../src/image/spec.js';

const bin = join(__dirname, '..', 'bin.js');
const root = join(__dirname, '..');

const copy: Record<string, { title: string; text?: string; eyebrow?: string; by?: string }> = {
	headline: { title: 'Context that stays current' },
	statement: { title: 'The right context, on every call', text: 'Store it, keep it current, and hand it to the model.', eyebrow: 'Context' },
	quote: { title: 'Search should return the passage, not the folder.', by: 'Acme platform' },
	announcement: { title: 'Sources sync themselves', text: 'Connect a source once.', eyebrow: 'Now shipping' },
	frame: { title: 'See what came back', text: 'Every result shows its source.' },
};

const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

describe('image', () => {
	it('names every template and the four sizes', () => {
		expect(TEMPLATES.map((t) => t.id)).toEqual(['headline', 'statement', 'quote', 'announcement', 'frame']);
		expect(SIZES.map((s) => [s.id, s.width, s.height])).toEqual([
			['og', 1200, 630],
			['square', 1080, 1080],
			['portrait', 1080, 1350],
			['landscape', 1200, 675],
		]);
		expect(resolveRequest({ size: 'all' }).sizes).toEqual(['og', 'square', 'portrait', 'landscape']);
		expect(resolveRequest({ size: '1200x630,1080×1080' }).sizes).toEqual(['og', 'square']);
	});

	it('renders every template at every size with the right dimensions', async () => {
		const mark = readFileSync(join(root, 'brand/logo/svg/mark.svg'), 'utf8');
		const pathStart = /d="([^"]{12})/.exec(mark)?.[1];
		for (const template of TEMPLATES) {
			for (const size of SIZES) {
				const [image] = await renderImages({ template: template.id, sizes: [size.id], ground: 'paper', format: 'both', ...copy[template.id] });
				expect(pngSize(image.png), `${template.id} ${size.id}`).toEqual({ width: size.width, height: size.height });
				expect(image.svg).toContain(`width="${size.width}"`);
				expect(image.svg).toContain(`height="${size.height}"`);
				expect(image.svg).toContain(theme('paper').bg);
				expect(image.svg).toContain('font/woff2');
				expect(image.svg).toContain(pathStart);
			}
		}
	});

	it('renders the off-black ground and stays byte-for-byte stable', async () => {
		const once = await renderImages({ template: 'statement', sizes: ['og'], ground: 'ink', format: 'png', title: 'Keep the source', text: 'Connect it once.' });
		const twice = await renderImages({ template: 'statement', sizes: ['og'], ground: 'ink', format: 'png', title: 'Keep the source', text: 'Connect it once.' });
		expect(once[0].svg).toContain(theme('ink').bg);
		expect(once[0].svg).toContain(theme('ink').fg);
		expect(Buffer.compare(once[0].png, twice[0].png)).toBe(0);
		expect(once[0].svg).toBe(twice[0].svg);
	});

	it('paints the headline stop in the accent and accepts a screenshot', async () => {
		const [card] = await renderImages({ template: 'headline', sizes: ['og'], ground: 'paper', format: 'svg', title: 'Context that stays current' });
		expect(card.svg).toContain(`<tspan fill="${theme('paper').accentText}">.</tspan>`);
		const plain = await renderImages({ template: 'frame', sizes: ['landscape'], ground: 'paper', format: 'png', title: 'What came back' });
		const shot = await renderImages({ template: 'frame', sizes: ['landscape'], ground: 'paper', format: 'png', title: 'What came back', image: { mime: 'image/png', data: tinyPng } });
		expect(pngSize(shot[0].png)).toEqual({ width: 1200, height: 675 });
		expect(Buffer.compare(plain[0].png, shot[0].png)).not.toBe(0);
	});

	it('refuses a missing title, an unknown template and a file that is not a PNG or JPEG', async () => {
		expect(() => resolveRequest({ template: 'poster' })).toThrow(/Unknown template/);
		expect(() => resolveRequest({ size: 'story' })).toThrow(/Unknown size/);
		await expect(runImage(root, [], {})).rejects.toThrow(/title is required/);
		const dir = mkdtempSync(join(tmpdir(), 'ds-image-'));
		await expect(runImage(dir, [], { title: 'Hello', image: 'missing.png' })).rejects.toThrow(/No image at/);
		writeFileSync(join(dir, 'notes.txt'), 'not an image');
		await expect(runImage(dir, [], { title: 'Hello', image: 'notes.txt' })).rejects.toThrow(/PNG or JPEG/);
		rmSync(dir, { recursive: true, force: true });
	});

	it('writes PNG and SVG and lists them as JSON from the command', async () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-image-'));
		const out = await runImage(dir, ['square'], { title: 'Context that stays current', text: 'Kept in sync.', json: true });
		const files = (out.json as { files: { path: string; width: number; height: number; format: string }[] }).files;
		expect(files.map((f) => f.format).sort()).toEqual(['png', 'svg']);
		expect(files.every((f) => f.width === 1080 && f.height === 1080)).toBe(true);
		for (const file of files) expect(readFileSync(join(dir, file.path)).length).toBeGreaterThan(500);
		const list = await runImage(dir, ['list'], {});
		expect((list.json as { templates: { id: string }[] }).templates.map((t) => t.id)).toContain('frame');
		rmSync(dir, { recursive: true, force: true });
	});

	it('prints image help and renders from the CLI', () => {
		const help = execFileSync('node', [bin, 'image', '--help'], { encoding: 'utf8' });
		expect(help).toContain('statement');
		expect(help).toContain('1200x630');
		expect(help).toContain('--json');
		const dir = mkdtempSync(join(tmpdir(), 'ds-image-'));
		const raw = execFileSync('node', [bin, 'image', '--cwd', dir, '--title', 'Context that stays current', '--size', 'og', '--format', 'png', '--json'], { encoding: 'utf8' });
		const parsed = JSON.parse(raw);
		expect(parsed.files[0]).toMatchObject({ format: 'png', size: 'og', width: 1200, height: 630 });
		expect(pngSize(readFileSync(join(dir, parsed.files[0].path)))).toEqual({ width: 1200, height: 630 });
		rmSync(dir, { recursive: true, force: true });
	});
});
