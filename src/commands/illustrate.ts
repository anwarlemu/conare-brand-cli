import { dirname, join, resolve } from 'node:path';
import { brand } from '../lib/brand.js';
import { helpRow } from '../lib/help-row.js';
import { display, num, pick, unknown, write, type OutFile } from '../assets/io.js';
import { imageDoc, sizeOf } from '../assets/og.js';
import { readPicture } from '../assets/picture.js';
import { illustrateDoc, renderSubject, SUBJECTS } from '../illustrate/draw.js';

// `illustrate <subject>`: the brand's own illustration style (brand/illustration.md) as SVG of real vector shapes and
// PNG.

type Flags = Record<string, string | boolean | string[] | undefined>;
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
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
		'--size WxH (64 to 4000) or a share size name (og, square, story...). Default 1200x1200.',
		'--seed reshuffles the pixel grid and the found squares. --shape tall or wide for a stack. --transparent drops the ground.',
		`--image (PNG, JPEG, WebP) goes on the front sheet of ${TAKES_IMAGE.join(' and ')}. --format both (default), png or svg. --out a directory or one file.`,
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
	let width = illustrateDoc().defaults.size[0];
	let height = illustrateDoc().defaults.size[1];
	if (str(flags.size)) {
		const t = str(flags.size)!.toLowerCase().replace('×', 'x');
		const m = t.match(/^(\d+)x(\d+)$/);
		if (m) {
			width = num('size width', m[1], 64, 4000, { integer: true })!;
			height = num('size height', m[2], 64, 4000, { integer: true })!;
		} else {
			const s = sizeOf(t);
			if (!s) throw unknown('size', t, ['WxH', ...Object.keys(imageDoc().sizes)]);
			width = s.w;
			height = s.h;
		}
	}
	const seed = num('seed', flags.seed, 1, 1_000_000_000, { integer: true });
	const shape = str(flags.shape) ? (pick('shape', str(flags.shape)!, ['tall', 'wide'] as const)) : undefined;
	if (shape && subject !== 'stack') throw new Error('--shape goes with the stack subject.');
	if (str(flags.image) && !TAKES_IMAGE.includes(subject)) throw new Error(`${subject} holds no picture; --image goes with ${TAKES_IMAGE.join(' or ')}.`);
	const p = str(flags.image) ? await readPicture(cwd, str(flags.image)!, 1600) : null;
	const out = str(flags.out);
	const named = out && /\.(png|svg)$/i.test(out) ? resolve(cwd, out) : undefined;
	const format = named ? (named.toLowerCase().endsWith('.svg') ? 'svg' : 'png') : pick('format', str(flags.format) ?? 'both', ['both', 'png', 'svg'] as const);
	const r = renderSubject({ subject, width, height, theme: str(flags.theme), seed, shape, picture: p ? { img: p.canvas, w: p.width, h: p.height } : null, transparent: flags.transparent === true }, { png: format !== 'svg', svg: format !== 'png' });
	const stem = named ? named.replace(/\.(png|svg)$/i, '') : join(resolve(cwd, out ?? 'imagery'), `${subject}-${width}x${height}${str(flags.theme) ? `-${r.theme}` : ''}${seed ? `-s${seed}` : ''}`);
	void dirname;
	const files: OutFile[] = [];
	if (r.png) {
		write(`${stem}.png`, r.png);
		files.push({ path: display(cwd, `${stem}.png`), format: 'png', subject, theme: r.theme, width, height });
	}
	if (r.svg) {
		write(`${stem}.svg`, r.svg);
		files.push({ path: display(cwd, `${stem}.svg`), format: 'svg', subject, theme: r.theme, width, height });
	}
	return { json: { files }, text: files.map((f) => `${f.path}  ${f.width}x${f.height}`).join('\n') };
}
