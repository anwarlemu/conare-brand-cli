import { brand } from '../lib/brand.js';
import { logos, principleSurfaces, tokenRecords, BRAND_SECTIONS, SURFACE_IDS } from '../brand/system.js';
import { componentCatalog } from '../component/emit.js';
import { catalog } from '../image/spec.js';
import { videoCatalog } from '../video/spec.js';
import { layoutCatalog } from '../assets/image.js';
import { layoutVideoSizes } from '../assets/layout-video.js';
import { deckCatalog } from '../assets/deck.js';
import { merchCatalog } from '../assets/merch.js';
import { logoDoc } from '../assets/art.js';
import { illustrateCatalog } from './illustrate.js';
import { FIGMA_ACTIONS, PUSH_KINDS } from './figma.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { packageRoot } from '../lib/brand.js';

// The one document an agent reads first. It names every command, template, size, component, token and rule.
// Commands reject anything that is not in here.

const COMMANDS = [
	{ name: 'manifest', summary: 'This document. `describe` is the same command.', flags: ['help'] },
	{ name: 'describe', summary: 'Alias of manifest.', flags: ['help'] },
	{ name: 'brand', summary: 'Tokens (color, type, spacing, radii, motion), fonts, logos and voice.', flags: ['section', 'token', 'help'] },
	{ name: 'principles', summary: 'Product and website rules, with do and do-not lists. Voice is included.', flags: ['surface', 'help'] },
	{ name: 'component', summary: 'list, inspect and emit Vue for a real component, including props and states.', flags: ['group', 'part', 'state', 'prop', 'source', 'help'] },
	{ name: 'image', summary: 'Share images and social posts (PNG and SVG): five card templates and the twelve posts-tool layouts at every social size.', flags: ['title', 'text', 'subtitle', 'eyebrow', 'by', 'author', 'image', 'template', 'size', 'ground', 'theme', 'badge', 'highlight', 'partner', 'credit', 'input', 'out', 'format', 'list', 'help'] },
	{ name: 'deck', summary: 'Slides at 1920x1080 on the share layouts: a PNG per slide and one PDF, from a JSON file or one slide from flags.', flags: ['input', 'title', 'body', 'eyebrow', 'number', 'items', 'stat', 'quote', 'attribution', 'url', 'image', 'theme', 'format', 'out', 'list', 'help'] },
	{ name: 'video', summary: 'Motion: a layout coming in the way the site moves (H.264 MP4 or VP9 WebM through ffmpeg, or a still PNG), and the Motion JPEG clips.', flags: ['title', 'text', 'subtitle', 'eyebrow', 'template', 'size', 'ground', 'theme', 'badge', 'highlight', 'partner', 'credit', 'image', 'format', 'fps', 'at', 'still', 'out', 'list', 'help'] },
	{ name: 'merch', summary: 'Print files at real size with bleed and safe area (tee, hoodie, cap, tote, mug, sticker with cut line, poster).', flags: ['variant', 'headline', 'url', 'dpi', 'format', 'guides', 'out', 'list', 'help'] },
	{ name: 'illustrate', summary: "The brand's illustration style as SVG (vector shapes) and PNG: stacks of documents, the pixel grid, the room and more.", flags: ['size', 'theme', 'seed', 'shape', 'image', 'transparent', 'format', 'out', 'list', 'help'] },
	{ name: 'figma', summary: 'Files and ordered Figma MCP calls: tokens (variables), push (image, slide, illustration, asset, component, page), pull, check.', flags: ['out', 'file', 'size', 'theme', 'title', 'text', 'eyebrow', 'seed', 'example', 'url', 'width', 'help'] },
	{ name: 'list', summary: 'Every library item. In JSON, group is the label and groupId is the id (ui, product, site, visuals).', flags: [] },
	{ name: 'view', summary: 'How to use an item: rules, props, slots, events, examples. show is the same command.', flags: ['source', 'full'] },
	{ name: 'add', summary: 'Copy items and what they need into an app.', flags: ['dry-run', 'overwrite', 'install'] },
	{ name: 'search', summary: 'Find items by what they do.', flags: [] },
	{ name: 'diff', summary: 'Compare an installed item with the library.', flags: [] },
	{ name: 'apply', summary: 'Restyle an app onto the tokens and the library look, without changing copy or behavior.', flags: ['components', 'pages', 'with-shared', 'dry-run', 'redo'] },
	{ name: 'init', summary: 'Install the stylesheet, theme, fonts and the agent contract.', flags: ['dry-run'] },
	{ name: 'info', summary: 'The app setup, installed items and what to run next.', flags: [] },
	{ name: 'check', summary: 'Report values that are off the tokens.', flags: ['fix', 'all'] },
	{ name: 'tokens', summary: 'Find tokens by name or value. No match is an error. For one exact token, use brand --token.', flags: [] },
] as const;

export function manifestHelp(): string {
	return [`${brand().bin} manifest lists every command, template, size, component, token and rule.`, 'Pass --json. If a name is not in that document, the command exits 1. Do not invent a substitute.'].join('\n');
}

export async function manifest(): Promise<Record<string, unknown>> {
	const components = await componentCatalog();
	const principles = principleSurfaces();
	const image = catalog();
	const video = videoCatalog();
	const logo = logos();
	const rules = (['product', 'website'] as const).flatMap((id) => {
		const surface = principles[id];
		return [...surface.do, ...surface.dont, ...surface.rules].map((rule) => ({ surface: id, id: rule.id, text: rule.text, source: rule.source ?? surface.source }));
	});
	return {
		schemaVersion: 1,
		name: brand().name,
		bin: brand().bin,
		entry: 'manifest',
		alias: 'describe',
		validation: 'Every command checks its inputs against this document. An unknown command, flag, template, size, ground, format, section, surface, group, component, part, state, prop, prop value or token exits 1 and names what is allowed. The CLI does not substitute a nearby value.',
		commands: COMMANDS,
		commonFlags: ['cwd', 'json', 'help'],
		brand: {
			sections: [...BRAND_SECTIONS],
			aliases: { colour: 'color' },
			tokens: tokenRecords().map((token) => ({ name: token.name, section: token.section, group: token.group })),
		},
		fonts: 'brand --section fonts',
		logos: 'brand --section logos',
		voice: 'brand --section voice',
		principles: { surfaces: [...SURFACE_IDS], also: 'all', rules },
		groups: Object.entries(brand().groups).map(([id, label]) => ({ id, label })),
		components: components.map((item) => ({ name: item.name, group: item.group, part: item.part, parts: item.parts, states: item.states, examples: item.examples, description: item.description, use_for: item.use_for, never: item.never })),
		image: { ...image, layouts: layoutCatalog() },
		deck: deckCatalog(),
		video: { ...video, layouts: { templates: layoutCatalog().templates.map((t) => t.id), sizes: layoutVideoSizes(), formats: ['mp4', 'webm'], still: ['--still', '--at <seconds>'], fps: { default: 30, min: 12, max: 60 }, motion: 'Tokens only: settle (entrance, standard), headline reveal (enter, reveal-fade; reveal, reveal-ink), window (viz-card, viz). Never ease-in.', needs: 'ffmpeg on PATH' } },
		merch: merchCatalog(),
		illustrate: { ...illustrateCatalog(), rules: illustrationRules() },
		figma: { actions: [...FIGMA_ACTIONS], push: [...PUSH_KINDS], note: 'The CLI never calls Figma; it writes files and prints the MCP calls in order.' },
		logo: { lockups: Object.keys(logoDoc().lockups).map((id) => ({ id, description: logoDoc().lockups[id] })), colors: logoDoc().colors, clearSpace: null, minimumSize: null, note: 'brand/logo defines no clear space or minimum size; none is invented.' },
		gaps: [...logo.missing, principles.website.gap].filter((gap): gap is string => Boolean(gap)),
	};
}

function illustrationRules(): { id: number; text: string }[] {
	const md = readFileSync(join(packageRoot, 'brand', 'illustration.md'), 'utf8');
	const block = md.slice(md.indexOf('## Rules'), md.indexOf('## Subjects'));
	return [...block.matchAll(/^(\d+)\. ([\s\S]*?)(?=^\d+\. |(?![\s\S]))/gm)].map((m) => ({ id: Number(m[1]), text: m[2]!.replace(/\s+/g, ' ').trim() }));
}

export function formatManifest(doc: Record<string, unknown>): string {
	const commands = doc.commands as { name: string; summary: string }[];
	const image = doc.image as { templates: { id: string }[]; sizes: { id: string; width: number; height: number }[] };
	const video = doc.video as { templates: { id: string }[]; sizes: { id: string; width: number; height: number }[]; fps: number; frames: number; codec: string };
	const components = doc.components as { name: string; group: string }[];
	const rules = (doc.principles as { rules: { surface: string; id: string }[] }).rules;
	const gaps = doc.gaps as string[];
	const brandInfo = doc.brand as { sections: string[]; tokens: unknown[] };
	return [
		`${doc.name} (${doc.bin}). Start here: ${doc.bin} manifest --json`,
		'',
		'Commands',
		...commands.map((command) => `  ${command.name.padEnd(14)} ${command.summary}`),
		'',
		`Brand sections: ${brandInfo.sections.join(', ')} (${brandInfo.tokens.length} tokens in --json)`,
		`Principles: ${rules.map((rule) => `${rule.surface}:${rule.id}`).join(', ')}`,
		'',
		`Image templates: ${image.templates.map((template) => template.id).join(', ')}`,
		`Image sizes: ${image.sizes.map((size) => `${size.id} ${size.width}x${size.height}`).join(', ')}`,
		`Video templates: ${video.templates.map((template) => template.id).join(', ')}`,
		`Video sizes: ${video.sizes.map((size) => `${size.id} ${size.width}x${size.height}`).join(', ')}`,
		`Video: ${video.frames} frames at ${video.fps} fps, ${video.codec}.`,
		`Layouts (image and video): ${(doc.image as { layouts: { templates: { id: string }[] } }).layouts.templates.map((t) => t.id).join(', ')}`,
		`Layout sizes: ${(doc.image as { layouts: { sizes: { id: string; width: number; height: number }[] } }).layouts.sizes.map((s) => `${s.id} ${s.width}x${s.height}`).join(', ')}`,
		`Deck slides: ${(doc.deck as { slides: { id: string }[] }).slides.map((s) => s.id).join(', ')}`,
		`Merch: ${(doc.merch as { items: { id: string }[] }).items.map((i) => i.id).join(', ')}`,
		`Illustrate: ${(doc.illustrate as { subjects: { id: string }[] }).subjects.map((s) => s.id).join(', ')}`,
		`Figma: ${(doc.figma as { actions: string[] }).actions.join(', ')} (push: ${(doc.figma as { push: string[] }).push.join(', ')})`,
		'',
		`Components (${components.length})`,
		...components.map((item) => `  ${item.name.padEnd(22)} ${item.group}`),
		'',
		'Gaps',
		...gaps.map((gap) => `  ${gap}`),
	].join('\n');
}
