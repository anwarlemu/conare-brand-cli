import { join, resolve } from 'node:path';
import { brand } from '../lib/brand.js';
import { helpRow } from '../lib/help-row.js';
import { display, num, pick, unknown, write, type OutFile } from '../assets/io.js';
import { formatsFrom, sizesFrom, stemOf, str, type Flags } from '../assets/flags.js';
import { scaleFlag } from '../assets/image.js';
import { sizeIds, sizeOf } from '../assets/layouts.js';
import { imageDoc } from '../assets/og.js';
import { readPicture } from '../assets/picture.js';
import { illustrateDoc, renderSubject, SUBJECTS } from '../illustrate/draw.js';

// `illustrate <subject>`: the brand's own illustration style (brand/illustration.md) as SVG of real vector shapes and
// PNG.

const TAKES_IMAGE = ['stack', 'hatch'];

export function illustrateCatalog() {
	const d = illustrateDoc();
	return {
		subjects: Object.entries(d.subjects).map(([id, description]) => ({ id, description, takesImage: TAKES_IMAGE.includes(id), seeded: ['stack', 'stacks', 'pixels', 'hatch', 'strip', 'scene'].includes(id) })),
		themes: Object.keys(imageDoc().themes),
		shapes: ['tall', 'wide'],
		defaults: { theme: d.defaults.theme, size: `${d.defaults.size[0]}x${d.defaults.size[1]}`, format: 'both' },
		rules: 'brand/illustration.md',
	};
}

export function illustrateHelp(): string {
	const b = brand().bin;
	const row = (c: string, w: string) => helpRow(c, w, 50);
	return [
		"The brand's illustration style as code: SVG (real vector shapes) and PNG. Rules: brand/illustration.md.",
		'',
		row(`${b} illustrate stack --image shot.png`, 'A stack of documents with your picture on the front sheet'),
		row(`${b} illustrate stacks --size 1500x500`, 'The red room with stacks at the sides, as a banner'),
		row(`${b} illustrate pixels --seed 7`, 'The red pixel grid, reshuffled'),
		row(`${b} illustrate room --theme black`, 'The perspective room on black'),
		row(`${b} illustrate --list`, 'Subjects, themes and shapes'),
		'',
		`Subjects: ${SUBJECTS().join(', ')}.`,
		`--theme ${Object.keys(imageDoc().themes).join(', ')} (stacks and scene default to red, the rest to paper).`,
		'--size WxH (64 to 4000), a share size name (og, square, story...), several, all, or custom with --width and --height. Default 1200x1200.',
		'--seed reshuffles the pixel grid and the found squares. --shape tall or wide for a stack. --transparent drops the ground.',
		`--image (PNG, JPEG, WebP) goes on the front sheet of ${TAKES_IMAGE.join(' and ')}. --format png, svg, jpg, webp, a list, both (default) or all. --scale 1, 2 or 3. --out a directory or one file.`,
		'panel and scene draw the agent window without words; --sample fills its sample content.',
	].join('\n');
}

export async function runIllustrate(cwd: string, args: string[], flags: Flags): Promise<{ json: unknown; text: string }> {
	if (flags.list === true || args[0] === 'list') {
		const cat = illustrateCatalog();
		return { json: cat, text: cat.subjects.map((s) => helpRow(s.id, s.description, 10)).join('\n') };
	}
	for (const n of ['size', 'theme', 'seed', 'shape', 'image', 'format', 'out']) if (flags[n] === true) throw new Error(`--${n} needs a value.`);
	if (args.length !== 1) throw new Error(`Name one subject: ${brand().bin} illustrate stack (one of ${SUBJECTS().join(', ')}).`);
	const subject = pick('subject', args[0]!, SUBJECTS());
	const tokens = str(flags.size) ? str(flags.size)!.split(',') : flags.width !== undefined || flags.height !== undefined ? ['custom'] : [];
	type Canvas = { name: string; w: number; h: number };
	const sizes: Canvas[] = tokens.map((x) => x.trim()).filter(Boolean).flatMap((t): Canvas[] => {
		const m = /^(\d+)[x×](\d+)$/i.exec(t) ?? (t.toLowerCase() === 'custom' ? [t, String(flags.width ?? ''), String(flags.height ?? '')] : null);
		if (m) {
			const w = num('size width', m[1], 64, 4000, { integer: true });
			const h = num('size height', m[2], 64, 4000, { integer: true });
			if (!w || !h) throw new Error('--size custom needs --width and --height.');
			return [{ name: `${w}x${h}`, w, h }];
		}
		if (t.toLowerCase() === 'all') return sizeIds().map((id) => ({ name: id, w: sizeOf(id)!.w, h: sizeOf(id)!.h }));
		const s = sizeOf(t);
		if (!s) throw unknown('size', t, ['WxH', 'custom', ...sizeIds(), 'all']);
		return [{ name: `${s.w}x${s.h}`, w: s.w, h: s.h }];
	});
	if (!sizes.length) sizes.push({ name: illustrateDoc().defaults.size.join('x'), w: illustrateDoc().defaults.size[0], h: illustrateDoc().defaults.size[1] });
	const seed = num('seed', flags.seed, 0, 1_000_000_000, { integer: true });
	const shape = str(flags.shape) ? (pick('shape', str(flags.shape)!, ['tall', 'wide'] as const)) : undefined;
	if (shape && subject !== 'stack') throw new Error('--shape goes with the stack subject.');
	if (str(flags.image) && !TAKES_IMAGE.includes(subject)) throw new Error(`${subject} holds no picture; --image goes with ${TAKES_IMAGE.join(' or ')}.`);
	const p = str(flags.image) ? await readPicture(cwd, str(flags.image)!, 1600) : null;
	const out = str(flags.out);
	const { formats, named } = formatsFrom(flags, cwd, out);
	if (named && sizes.length > 1) throw new Error('--out is a file, so pass one --size.');
	const scale = scaleFlag(flags);
	if (flags.transparent === true && formats.includes('jpg')) throw new Error('A JPEG has no transparency. Use png, webp or svg.');
	const theme = str(flags.theme) ?? (str(flags.ground) === 'ink' ? 'black' : str(flags.ground));
	const sample = flags.sample === true;
	if (sample && subject !== 'panel' && subject !== 'scene') throw new Error('--sample fills the agent window of panel and scene; the other subjects have no words.');
	const files: OutFile[] = [];
	for (const z of sizes) {
		const r = renderSubject({ subject, width: z.w, height: z.h, theme, seed, shape, picture: p ? { img: p.canvas, w: p.width, h: p.height } : null, transparent: flags.transparent === true, sample }, { png: formats.includes('png'), svg: formats.includes('svg'), jpg: formats.includes('jpg'), webp: formats.includes('webp'), scale });
		const stem = named ? stemOf(named) : join(resolve(cwd, out ?? 'imagery'), `${subject}-${z.name}${theme ? `-${r.theme}` : ''}${seed ? `-s${seed}` : ''}`);
		for (const f of formats) {
			const data = f === 'svg' ? r.svg! : f === 'png' ? r.png! : f === 'jpg' ? r.jpg! : r.webp!;
			const path = `${stem}.${f === 'jpg' && named && /\.jpeg$/i.test(named) ? 'jpeg' : f}`;
			write(path, data);
			const k = f === 'svg' ? 1 : scale;
			files.push({ path: display(cwd, path), format: f, subject, theme: r.theme, width: z.w * k, height: z.h * k });
		}
	}
	return { json: { files }, text: files.map((f) => `${f.path}  ${f.width}x${f.height}`).join('\n') };
}
