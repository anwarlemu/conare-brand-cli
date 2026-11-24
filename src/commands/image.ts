import { sizesFor } from '../assets/layouts.js';
import { dirname, join, resolve } from 'node:path';
import { brand } from '../lib/brand.js';
import { assertDrawn } from '../design/adapter.js';
import { cardPicture } from '../image/picture.js';
import { encodeAs, renderImages, resolveRequest } from '../image/render.js';
import { catalog, TEMPLATE_FIELDS, TEMPLATES, templateById, type TemplateId } from '../image/spec.js';
import { layoutCatalog, pictureNotes, runLayouts, scaleFlag } from '../assets/image.js';
import { copyFlags, formatsFrom, overLimit, oneOf, sizeName, sizesFrom, stemOf, str, type Flags } from '../assets/flags.js';
import { LAYOUTS, sizeOf } from '../assets/og.js';
import { display, unknown, write, type OutFile } from '../assets/io.js';
import { helpRow } from '../lib/help-row.js';

// `image` renders Open Graph and social images from copy. It does not need an app: the type, colors and mark come
// from the package.

export function imageHelp(): string {
	const b = brand().bin;
	const row = (cmd: string, what: string) => helpRow(cmd, what, 46);
	return [
		`Open Graph and social images from the brand's type, colors and logo.`,
		'Headless: the same copy gives the same file. Only the copy you pass is drawn (plus the logo and the address); --sample fills sample copy.',
		'Copy is drawn whole: it shrinks and re-wraps to a readable floor, then the command fails saying what to shorten.',
		'',
		row(`${b} image --headline "..." --body "..."`, 'A statement at Open Graph size, PNG and SVG'),
		row(`${b} image --size all --headline "..."`, 'That card at every size'),
		row(`${b} image quote --headline "..." --by "Acme" --size square`, 'A square quotation'),
		row(`${b} image frame --headline "..." --image shot.png --size og,landscape`, 'A screenshot in the double rule'),
		row(`${b} image --ground ink --out out --json`, 'Off-black, with a machine-readable file list'),
		row(`${b} image --list`, 'Templates, sizes and grounds'),
		'',
		`Cards: ${TEMPLATES.map((t) => t.id).join(', ')} (statement is the default). --ground paper (the default) or ink; --theme paper or ink is the same.`,
		'--body is the line under the headline on statement, announcement and frame. Headline and quote do not draw it; a quote\'s speaker is --by (or --author).',
		'--badge is the red tag. A template that does not draw a field rejects it. --image (PNG, JPEG, WebP, GIF or SVG) goes in frame, shown whole.',
		'A headline ends in a red full stop, as the site\'s headlines do. Write the copy in sentence case.',
		'',
		'Layouts from the posts tool (every size, five themes):',
		row(`${b} image hero --headline "..." --body "..."`, 'The homepage card at Open Graph size'),
		row(`${b} image room --sample --size all`, 'The red room at every size, with its sample copy'),
		row(`${b} image card --badge New --size square,story`, 'The new-feature card for a feed and a story'),
		row(`${b} image feature --headline "..." --image shot.png`, 'Your picture in the product window'),
		row(`${b} image partner --partner Acme --theme paper`, 'A partnership lockup'),
		row(`${b} image avatar --theme red`, 'The profile picture'),
		row(`${b} image --input posts.json --out posts`, 'Several images: { "images": [ { "template": "hero", "headline": "..." } ] }'),
		row(`${b} image --input carousel.json`, 'A numbered carousel: { "carousel": { "template": "card", "slides": [ ... ] } }'),
		`Layouts: ${LAYOUTS.join(', ')}. The template goes first or in --template.`,
		`Sizes (cards and layouts): ${layoutCatalog().sizes.map((s) => `${s.id} ${s.width}x${s.height}`).join(', ')}. --size takes several (og,square), all, WxH, or custom with --width and --height.`,
		'--theme white, paper, red, black or grey (default: the layout\'s own). --badge is its words; --badge-style label, pill, solid, dot or none.',
		'--highlight red, black, white, grey or ink colors *starred words* and the final stop. --partner names a partner beside the lockup. --credit adds a small line (an @handle). --note goes at the foot.',
		'--image goes in the app and feature layouts; without one they draw a wordless stand-in from the brand\'s own parts. --seed rearranges the stacks or swaps the sides.',
		'--format png, svg, jpg, webp, a list, both (PNG and SVG, the default) or all. --scale 1, 2 or 3 for bigger pixels. --out is a directory, or one file.',
		`Older names still work: --title, --text, --subtitle, --eyebrow. To change a design after making it, see ${b} design --help.`,
	].join('\n');
}

const isLayout = (t: string | undefined): t is string => Boolean(t && (LAYOUTS as readonly string[]).includes(t));

export async function runImage(cwd: string, args: string[], flags: Flags): Promise<{ json: unknown; text: string }> {
	if (flags.list === true || args[0] === 'list') return list();
	const flagTemplate = str(flags.template)?.toLowerCase();
	const first = args[0]?.toLowerCase();
	const firstIsTemplate = Boolean(first && (isLayout(first) || templateById(first)));
	if (firstIsTemplate && flagTemplate && first !== flagTemplate) throw new Error(`\`${first}\` and --template ${flagTemplate} disagree. Pass one.`);
	const asked = flagTemplate ?? (firstIsTemplate ? first : undefined);
	const rest = firstIsTemplate ? args.slice(1) : args;
	if (asked && !isLayout(asked) && !templateById(asked)) throw unknown('template', asked, [...catalog().templates.map((t) => t.id), ...LAYOUTS]);
	const sizeArgs: string[] = [];
	const words: string[] = [];
	for (const a of rest) (a.toLowerCase() === 'all' || /^\d+\s*[x×]\s*\d+$/i.test(a) || sizeNamed(a) ? sizeArgs : words).push(a);
	if (flags.input !== undefined) {
		if (words.length) throw new Error(`Unexpected \`${words.join(' ')}\`.`);
		return runLayouts(cwd, asked, sizeArgs, flags);
	}
	if (words.length > 1 || (words.length === 1 && (str(flags.title) || str(flags.headline)))) {
		const near = words[0]!;
		throw new Error(/\s/.test(near) ? `Unexpected \`${words.join(' ')}\`. Pass the headline with --headline.` : unknown('template', near, [...catalog().templates.map((t) => t.id), ...LAYOUTS]).message);
	}
	if (words.length === 1 && !/\s/.test(words[0]!) && !asked && words[0]!.length < 14) throw unknown('template', words[0]!, [...catalog().templates.map((t) => t.id), ...LAYOUTS]);
	if (isLayout(asked)) return runLayouts(cwd, asked, sizeArgs, words[0] ? { ...flags, headline: words[0] } : flags);
	return runCards(cwd, asked, sizeArgs, words[0], flags);
}

const sizeNamed = (a: string) => {
	try {
		return !/^\d/.test(a) && Boolean(sizeOf(a));
	} catch {
		return false;
	}
};

function list() {
	const spec = catalog();
	const layouts = layoutCatalog();
	const text = [
		'Cards',
		...spec.templates.map((t) => `  ${t.id.padEnd(16)}${t.description}`),
		'',
		'Grounds (cards)',
		...spec.grounds.map((g) => `  ${g.id.padEnd(16)}${g.description}`),
		'',
		'Layouts (the posts tool)',
		...layouts.templates.map((t) => helpRow(t.id, `${t.description} Theme: ${t.theme}. Draws: ${t.slots.join(', ') || 'the mark alone'}.`, 18)),
		'',
		'Sizes',
		...layouts.sizes.map((s) => helpRow(s.id, `${String(s.width).padStart(4)}x${s.height}  ${s.label}`, 18)),
		helpRow('custom', '--size custom --width W --height H, or --size WxH', 18),
		'',
		`Layout themes: ${layouts.themes.map((t) => t.id).join(', ')}. Badge styles: ${layouts.badges.join(', ')}. Highlights: ${layouts.highlights.join(', ')}.`,
	].join('\n');
	return { json: { ...spec, layouts }, text };
}

async function runCards(cwd: string, template: string | undefined, sizeArgs: string[], word: string | undefined, flags: Flags): Promise<{ json: unknown; text: string }> {
	for (const name of ['by', 'author', 'image', 'template', 'size', 'ground', 'theme', 'out', 'format', 'width', 'height']) if (flags[name] === '' || flags[name] === true) throw new Error(`--${name} needs a value.`);
	for (const name of ['title', 'headline', 'text', 'body', 'subtitle', 'eyebrow', 'badge']) if (flags[name] === '') throw new Error(`--${name} needs a value.`);
	if (str(flags.ground) && str(flags.theme) && str(flags.ground) !== str(flags.theme)) throw new Error('Pass --theme or --ground, not both.');
	const copy = copyFlags(flags);
	const requested = resolveRequest({ template, ground: str(flags.ground) ?? str(flags.theme) });
	const title = (copy.headline ?? word ?? '').trim();
	if (flags.sample === true) throw new Error(`The cards have no sample copy; --sample goes with a layout (${LAYOUTS.join(', ')}).`);
	if (!title) throw new Error(`A title is required. ${brand().bin} image --headline "..." (--list shows templates and sizes).`);
	const by = oneOf(flags, ['by', 'author'])?.trim();
	const text = copy.body?.trim();
	const imagePath = str(flags.image);
	for (const [flag, v] of [['note', copy.note], ['page', copy.page], ['credit', copy.credit], ['partner', copy.partner], ['highlight', str(flags.highlight)], ['seed', str(flags.seed)], ['badge-style', copy.badgeStyle]] as const) if (v !== undefined) throw new Error(`${requested.template} does not draw --${flag}. It goes with a layout (${LAYOUTS.join(', ')}).`);
	refuseUnused(requested.template, { text, by, image: imagePath, eyebrow: copy.badge?.trim() });
	const all = catalog().sizes.map((s) => s.id);
	const sizes = sizesFrom([str(flags.size), ...sizeArgs].filter((x): x is string => Boolean(x)), flags, all);
	if (!sizes.length) sizes.push(sizeOf('og')!);
	for (const s of sizes) if (s.id === 'avatar') throw new Error(`${requested.template} does not draw at ${s.id}. Use image avatar for the profile picture.`);
	for (const s of sizes) if (s.id === 'zoom-background') throw new Error(`${requested.template} does not draw at ${s.id}: a video call background keeps its words to a band over the person. Use a layout (${LAYOUTS.filter((l) => sizesFor(l).includes('zoom-background')).join(', ')}).`);
	const out = str(flags.out);
	const { formats, named } = formatsFrom(flags, cwd, out);
	if (named && sizes.length > 1) throw new Error('--out is a file, so pass one --size. For several images, pass a directory.');
	const scale = scaleFlag(flags);
	const picture = imagePath ? await cardPicture(cwd, imagePath) : undefined;
	const rendered = await renderImages({ ...requested, sizes, title: title.replace(/\\n/g, '\n'), text, eyebrow: copy.badge?.trim(), by, image: picture?.image, scale });
	const dir = named ? dirname(named) : resolve(cwd, out ?? 'imagery');
	const files: OutFile[] = [];
	const notes = new Set<string>();
	for (const r of rendered) assertDrawn({ kind: 'image', template: r.template, size: { id: r.size.id, width: r.width, height: r.height }, copy: { headline: title, body: text, badge: copy.badge, by }, layers: r.layers });
	for (const r of rendered) {
		const stem = named ? stemOf(named) : join(dir, `${r.template}-${sizeName(r.size)}${r.ground === 'ink' ? '-ink' : ''}`);
		for (const n of pictureNotes(picture?.info ?? null, r.layers.find((l) => l.id === 'picture')?.box.w ?? 0, imagePath)) notes.add(n);
		if (r.size.note) notes.add(`${r.size.label}: ${r.size.note}`);
		for (const f of formats) {
			const data = f === 'svg' ? r.svg : f === 'png' ? r.png : await encodeAs(r.png, f);
			const path = `${stem}.${f === 'jpg' && named && /\.jpeg$/i.test(named) ? 'jpeg' : f}`;
			write(path, data);
			const k = f === 'svg' ? 1 : scale;
			files.push({ path: display(cwd, path), format: f, template: r.template, size: r.size.id, ground: r.ground, width: r.width * k, height: r.height * k, bytes: data.length });
			const over = f !== 'svg' ? overLimit(r.size, data.length, display(cwd, path)) : undefined;
			if (over) notes.add(over);
		}
	}
	return { json: { template: requested.template, ground: requested.ground, files, notes: [...notes] }, text: [...files.map((f) => `${f.path}  ${f.width}x${f.height}`), ...[...notes].map((n) => `note: ${n}`)].join('\n') };
}

function refuseUnused(template: TemplateId, present: { text?: string; by?: string; image?: string; eyebrow?: string }) {
	const policy = TEMPLATE_FIELDS[template];
	const label = template.charAt(0).toUpperCase() + template.slice(1);
	if (present.text && policy.refuses.includes('text')) {
		if (template === 'headline') throw new Error('Headline does not draw --text (--body). Use the statement template for a line under the title.');
		if (template === 'quote') throw new Error('Quote does not draw --text (--body). Pass the speaker with --by.');
		throw new Error(`${label} does not draw --text (--body).`);
	}
	if (present.by && policy.refuses.includes('by')) throw new Error(`${label} does not draw --by. --by is the speaker on a quote.`);
	if (present.image && policy.refuses.includes('image')) throw new Error(`${label} does not use --image. --image is for the frame template.`);
	if (present.eyebrow && policy.refuses.includes('eyebrow')) throw new Error(`${label} does not draw --eyebrow.`);
}
