import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { brand } from '../lib/brand.js';
import { helpRow } from '../lib/help-row.js';
import { deckCatalog, deckDoc, renderSlide, slideTypes, type Slide } from '../assets/deck.js';
import { display, pick, write, type OutFile } from '../assets/io.js';
import { imagesToPdf } from '../assets/pdf.js';
import { readPicture } from '../assets/picture.js';

// `deck`: slides at 1920 by 1080 from a JSON file or one slide from flags: a PNG per slide and one PDF.

type Flags = Record<string, string | boolean | string[] | undefined>;
export const DECK_SLOTS = ['title', 'body', 'eyebrow', 'number', 'items', 'stat', 'quote', 'attribution', 'url'];

export function deckHelp(): string {
	const b = brand().bin;
	const row = (c: string, w: string) => helpRow(c, w, 52);
	const cat = deckCatalog();
	return [
		'Slides at 1920x1080, each on one of the share-image layouts: a PNG per slide and one PDF (16:9 pages).',
		'',
		row(`${b} deck --input deck.json --out deck`, 'Every slide in the file, then deck/deck.pdf'),
		row(`${b} deck cover --title "..." --body "..."`, 'One slide from flags'),
		row(`${b} deck bullets --items "One | Two | Three"`, 'Points separated by |'),
		row(`${b} deck image --image shot.png --title "..."`, 'Your picture in the product window'),
		row(`${b} deck --list`, 'Slide types, their layouts and slots'),
		'',
		`Slides: ${cat.slides.map((s) => `${s.id} (${Object.keys(s.slots).join(', ')})`).join('; ')}.`,
		`--theme ${cat.themes.join(', ')} (default: the slide's layout's). --format both (PNG and PDF), png, pdf or svg.`,
		'deck.json: { "slides": [ { "type": "cover", "title": "...", "theme": "paper" }, ... ] }; "image" is a path relative to the file.',
		'A slot left out takes the slide\'s opening copy; pass "" to leave it empty.',
	].join('\n');
}

export async function runDeck(cwd: string, args: string[], flags: Flags): Promise<{ json: unknown; text: string }> {
	if (flags.list === true || args[0] === 'list') {
		const cat = deckCatalog();
		return { json: cat, text: cat.slides.map((s) => helpRow(s.id, `${s.description} Layout ${s.layout}, theme ${s.theme}. Slots: ${Object.keys(s.slots).join(', ')}.`, 12)).join('\n') };
	}
	const format = pick('format', typeof flags.format === 'string' ? flags.format : 'both', ['both', 'png', 'pdf', 'svg'] as const);
	const type = args[0];
	if (args.length > 1) throw new Error(`Unexpected \`${args.slice(1).join(' ')}\`. Pass one slide type or --input.`);
	if (type && flags.input) throw new Error('Pass --input or one slide type, not both.');
	let slides: Slide[];
	let base = cwd;
	if (typeof flags.input === 'string') {
		const path = isAbsolute(flags.input) ? flags.input : resolve(cwd, flags.input);
		let parsed: { slides?: unknown };
		try {
			parsed = JSON.parse(readFileSync(path, 'utf8'));
		} catch (err) {
			throw new Error(`Could not read ${flags.input} as JSON (${(err as Error).message}).`);
		}
		if (!Array.isArray(parsed.slides) || !parsed.slides.length) throw new Error(`${flags.input} needs a "slides" list.`);
		slides = parsed.slides as Slide[];
		base = dirname(path);
		for (const f of [...DECK_SLOTS, 'image', 'theme']) if (flags[f] !== undefined) throw new Error(`--${f} goes with one slide; with --input, put it in the file.`);
	} else {
		if (!type) throw new Error(`Pass --input deck.json or a slide type: ${brand().bin} deck cover (one of ${slideTypes().join(', ')}).`);
		const one: Slide = { type };
		for (const k of DECK_SLOTS) if (typeof flags[k] === 'string') one[k] = (flags[k] as string).replace(/\\n/g, '\n');
		if (typeof flags.theme === 'string') one.theme = flags.theme;
		if (typeof flags.image === 'string') one.image = flags.image;
		slides = [one];
	}
	const dir = resolve(cwd, typeof flags.out === 'string' ? flags.out : 'deck');
	const files: OutFile[] = [];
	const pages: { rgb: Buffer; width: number; height: number }[] = [];
	for (const [i, s] of slides.entries()) {
		if (!s || typeof s.type !== 'string') throw new Error(`Slide ${i + 1} needs a "type" (${slideTypes().join(', ')}).`);
		const id = pick('slide type', s.type, slideTypes());
		const { image, ...rest } = s as Slide & { image?: unknown };
		if (image !== undefined && !('image' in deckDoc().slides[id].slots)) throw new Error(`Slide ${i + 1} (${id}) has no picture; "image" goes on an image slide.`);
		const pic = typeof image === 'string' && image.trim() ? await readPicture(base, image, 1600) : null;
		let r;
		try {
			r = await renderSlide({ ...rest, type: id, picture: pic ? { img: pic.canvas, w: pic.width, h: pic.height } : null }, { png: format !== 'svg', svg: format === 'svg' });
		} catch (err) {
			throw new Error(`Slide ${i + 1} (${id}): ${(err as Error).message}`);
		}
		const name = join(dir, `slide-${String(i + 1).padStart(2, '0')}-${id}`);
		if (r.svg) {
			write(`${name}.svg`, r.svg);
			files.push({ path: display(cwd, `${name}.svg`), format: 'svg', slide: id, width: r.width, height: r.height });
		}
		if (r.png && format !== 'pdf') {
			write(`${name}.png`, r.png);
			files.push({ path: display(cwd, `${name}.png`), format: 'png', slide: id, width: r.width, height: r.height });
		}
		if (r.rgb) pages.push({ rgb: r.rgb, width: r.width, height: r.height });
	}
	if (format === 'both' || format === 'pdf') {
		const pdf = join(dir, 'deck.pdf');
		write(pdf, imagesToPdf(pages, 960));
		files.push({ path: display(cwd, pdf), format: 'pdf', pages: pages.length, width: 1920, height: 1080 });
	}
	return { json: { files }, text: files.map((f) => `${f.path}  ${f.format === 'pdf' ? `${f.pages} page${f.pages === 1 ? '' : 's'}` : `${f.width}x${f.height}`}`).join('\n') };
}
