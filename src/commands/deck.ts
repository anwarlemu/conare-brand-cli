import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { assertDrawn } from '../design/adapter.js';
import { brand } from '../lib/brand.js';
import { helpRow } from '../lib/help-row.js';
import { deckCatalog, deckDoc, renderSlide, slideTypes, type Slide } from '../assets/deck.js';
import { seedOf, type Flags } from '../assets/flags.js';
import { pictureNotes, scaleFlag } from '../assets/image.js';
import { display, pick, write, type OutFile } from '../assets/io.js';
import { imagesToPdf } from '../assets/pdf.js';
import { readPicture } from '../assets/picture.js';

// `deck`: slides at 1920 by 1080 from a JSON file or one slide from flags: a PNG per slide and one PDF.

export const DECK_SLOTS = ['title', 'headline', 'body', 'badge', 'eyebrow', 'number', 'items', 'stat', 'quote', 'attribution', 'url'];

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
		`Slides: ${cat.slides.map((s) => `${s.id} (${s.slots.map((x) => (s.required.includes(x) ? `${x}, needed` : x)).join('; ')})`).join('. ')}.`,
		`--theme ${cat.themes.join(', ')} (default: the slide's layout's). --format both (PNG and PDF), or a list of png, jpg, webp, svg, pdf. --scale 1, 2 or 3.`,
		'deck.json: { "theme": "paper", "slides": [ { "type": "cover", "title": "..." }, ... ] }; "theme" may go on a slide too, and "image" is a path relative to the file.',
		'Only the copy passed is drawn: a slot left out is left out, and --sample (or "sample": true on a slide) fills its sample copy. --headline and --badge work for the title and its label.',
	].join('\n');
}

function formatList(v: unknown): string[] {
	if (v === true) throw new Error('--format needs a value.');
	const list = (typeof v === 'string' ? v : 'both').split(',').map((f) => pick('format', f.trim().replace('jpeg', 'jpg'), ['both', 'png', 'jpg', 'webp', 'svg', 'pdf', 'all'] as const));
	return [...new Set(list.flatMap((f) => (f === 'both' ? ['png', 'pdf'] : f === 'all' ? ['png', 'jpg', 'webp', 'svg', 'pdf'] : [f])))];
}

export async function runDeck(cwd: string, args: string[], flags: Flags): Promise<{ json: unknown; text: string }> {
	if (flags.list === true || args[0] === 'list') {
		const cat = deckCatalog();
		return { json: cat, text: cat.slides.map((s) => helpRow(s.id, `${s.description} Layout ${s.layout}, theme ${s.theme}. Slots: ${s.slots.join(', ')}.`, 12)).join('\n') };
	}
	const format = formatList(flags.format);
	const type = args[0];
	if (args.length > 1) throw new Error(`Unexpected \`${args.slice(1).join(' ')}\`. Pass one slide type or --input.`);
	if (type && flags.input) throw new Error('Pass --input or one slide type, not both.');
	let slides: Slide[];
	let base = cwd;
	if (typeof flags.input === 'string') {
		const path = isAbsolute(flags.input) ? flags.input : resolve(cwd, flags.input);
		let parsed: { slides?: unknown; theme?: unknown };
		try {
			parsed = JSON.parse(readFileSync(path, 'utf8'));
		} catch (err) {
			throw new Error(`Could not read ${flags.input} as JSON (${(err as Error).message}).`);
		}
		if (!Array.isArray(parsed.slides) || !parsed.slides.length) throw new Error(`${flags.input} needs a "slides" list.`);
		const theme = parsed.theme;
		if (theme !== undefined && typeof theme !== 'string') throw new Error(`${flags.input}: "theme" takes a theme name.`);
		for (const k of Object.keys(parsed)) if (!['slides', 'theme'].includes(k)) throw new Error(`${flags.input} takes "slides" and "theme", not "${k}".`);
		slides = (parsed.slides as Slide[]).map((x) => (x && typeof x === 'object' ? { ...(theme ? { theme: theme as string } : {}), ...x } : x));
		base = dirname(path);
		for (const f of [...DECK_SLOTS, 'image', 'theme']) if (flags[f] !== undefined) throw new Error(`--${f} goes with one slide; with --input, put it in the file.`);
	} else {
		if (!type) throw new Error(`Pass --input deck.json or a slide type: ${brand().bin} deck cover (one of ${slideTypes().join(', ')}).`);
		const one: Slide = { type };
		for (const k of DECK_SLOTS) if (typeof flags[k] === 'string') one[k] = (flags[k] as string).replace(/\\n/g, '\n');
		if (typeof flags.theme === 'string') one.theme = flags.theme;
		if (flags.sample === true) one.sample = true;
		if (flags.seed !== undefined) one.seed = seedOf(flags);
		if (typeof flags.image === 'string') one.image = flags.image;
		slides = [one];
	}
	const out = typeof flags.out === 'string' ? flags.out : 'deck';
	const pdfOut = /\.pdf$/i.test(out) ? resolve(cwd, out) : undefined;
	if (!pdfOut && /\.(png|svg|jpe?g|webp|pptx?|key)$/i.test(out)) throw new Error(`--out takes a folder, or one .pdf file; ${out} is neither.`);
	const formats = pdfOut && typeof flags.format !== 'string' ? ['pdf'] : format;
	const dir = pdfOut ? dirname(pdfOut) : resolve(cwd, out);
	const scale = scaleFlag(flags);
	const notes = new Set<string>();
	const writes: { path: string; data: Buffer | string }[] = [];
	const files: OutFile[] = [];
	const pages: { rgb: Buffer; width: number; height: number }[] = [];
	for (const [i, s] of slides.entries()) {
		if (!s || typeof s.type !== 'string') throw new Error(`Slide ${i + 1} needs a "type" (${slideTypes().join(', ')}).`);
		const id = pick('slide type', s.type, slideTypes());
		const { image, ...rest } = s as Slide & { image?: unknown };
		if (image !== undefined && !deckDoc().slides[id].slots.includes('image')) throw new Error(`Slide ${i + 1} (${id}) has no picture; "image" goes on an image slide.`);
		const pic = typeof image === 'string' && image.trim() ? await readPicture(base, image, 2000) : null;
		let r;
		try {
			r = await renderSlide({ ...rest, type: id, picture: pic ? { img: pic.canvas, w: pic.width, h: pic.height } : null }, { png: true, svg: formats.includes('svg'), jpg: formats.includes('jpg'), webp: formats.includes('webp'), scale });
		} catch (err) {
			throw new Error(`Slide ${i + 1} (${id}): ${(err as Error).message}`);
		}
		assertDrawn({ kind: 'slide', template: `slide ${i + 1} (${id})`, size: { id: 'slide', width: r.width, height: r.height }, copy: {}, layers: r.layers.map((l) => (l.text ? { ...l, text: { ...l.text, own: true } } : l)) });
		const name = join(dir, `slide-${String(i + 1).padStart(2, '0')}-${id}`);
		for (const n of pictureNotes(pic, r.layers.find((l) => l.id === 'picture')?.box.w ?? 0, typeof image === 'string' ? image : undefined)) notes.add(n);
		for (const f of ['svg', 'png', 'jpg', 'webp'] as const) {
			if (!formats.includes(f)) continue;
			const data = r[f]!;
			const k = f === 'svg' ? 1 : scale;
			writes.push({ path: `${name}.${f}`, data });
			files.push({ path: display(cwd, `${name}.${f}`), format: f, slide: id, width: r.width * k, height: r.height * k });
		}
		if (r.rgb) pages.push({ rgb: r.rgb, width: r.width * scale, height: r.height * scale });
	}
	if (formats.includes('pdf')) {
		const pdf = pdfOut ?? join(dir, 'deck.pdf');
		writes.push({ path: pdf, data: imagesToPdf(pages, 960) });
		files.push({ path: display(cwd, pdf), format: 'pdf', pages: pages.length, width: 1920, height: 1080 });
	}
	for (const w of writes) write(w.path, w.data);
	return { json: { files, notes: [...notes] }, text: [...files.map((f) => `${f.path}  ${f.format === 'pdf' ? `${f.pages} page${f.pages === 1 ? '' : 's'}` : `${f.width}x${f.height}`}`), ...[...notes].map((n) => `note: ${n}`)].join('\n') };
}
