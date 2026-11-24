import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { packageRoot } from '../lib/brand.js';
import { imageDoc, PRINT_SIZES, sizeIds, sizeOf, type Size } from '../assets/layouts.js';

// Sizes, templates and colors for the image command. Colors resolve from brand/tokens.css, the same file the
// stylesheet is built from, so a render does not need build/.

/** The share sizes a card draws at: the same ids as the layouts (brand/assets/image.json), the profile picture aside, and
 * the video call background (its words keep to a band over the person, which the layouts fill and a card does not). */
export const SIZES = sizeIds().filter((id) => id !== 'avatar' && id !== 'meeting' && !PRINT_SIZES.includes(id)).map((id) => {
	const z = sizeOf(id)!;
	return { id, width: z.w, height: z.h, description: `${z.label}, ${z.w} by ${z.h}.` };
});

export const TEMPLATES = [
	{ id: 'headline', description: 'A headline on its own.' },
	{ id: 'statement', description: 'A headline and a line of subtext. The default.' },
	{ id: 'quote', description: 'A quotation, and with --by the name under it.' },
	{ id: 'announcement', description: 'A tag, a headline and one line under a short rule.' },
	{ id: 'frame', description: 'A headline, subtext and your picture whole in the double rule. Without --image, a quiet wordless stand-in.' },
] as const;

export const GROUNDS = [
	{ id: 'paper', description: 'Off-white. The default.' },
	{ id: 'ink', description: 'Off-black.' },
] as const;

/** Fields a template draws. Anything else is an error, not a value that is silently dropped. */
export const TEMPLATE_FIELDS: Record<(typeof TEMPLATES)[number]['id'], { accepts: string[]; refuses: string[] }> = {
	headline: { accepts: ['eyebrow'], refuses: ['text', 'by', 'image'] },
	statement: { accepts: ['text', 'eyebrow'], refuses: ['by', 'image'] },
	quote: { accepts: ['by', 'eyebrow'], refuses: ['text', 'image'] },
	announcement: { accepts: ['text', 'eyebrow'], refuses: ['by', 'image'] },
	frame: { accepts: ['text', 'eyebrow', 'image'], refuses: ['by'] },
};

export type SizeId = string;
export type TemplateId = (typeof TEMPLATES)[number]['id'];
export type GroundId = (typeof GROUNDS)[number]['id'];
export type SizeSpec = Size;

export type Theme = {
	bg: string;
	bgSubtle: string;
	fg: string;
	fgSoft: string;
	fgMuted: string;
	edge: string;
	edgeStrong: string;
	accent: string;
	accentSmall: string;
	accentText: string;
	edgeAccent: string;
	onAccent: string;
	trackingDisplay: number;
	trackingTag: number;
};

export function sizeById(id: string): SizeSpec | undefined {
	const s = sizeOf(id);
	return s && s.id !== 'avatar' && s.id !== 'meeting' && !PRINT_SIZES.includes(s.id) ? s : undefined;
}

export function templateById(id: string): TemplateId | undefined {
	const hit = TEMPLATES.find((t) => t.id === id.trim().toLowerCase());
	return hit?.id;
}

export function groundById(id: string): GroundId | undefined {
	const norm = id.trim().toLowerCase();
	const hit = GROUNDS.find((g) => g.id === (norm === 'white' ? 'paper' : norm === 'black' ? 'ink' : norm));
	return hit?.id;
}

export function catalog() {
	return {
		templates: TEMPLATES.map((t) => ({ ...t, accepts: [...TEMPLATE_FIELDS[t.id].accepts], refuses: [...TEMPLATE_FIELDS[t.id].refuses] })),
		sizes: [...SIZES],
		grounds: [...GROUNDS],
		formats: ['png', 'svg', 'jpg', 'webp', 'both', 'all'],
		defaults: { template: 'statement', size: 'og', ground: 'paper', format: 'both' },
	};
}

let themes: { paper: Theme; ink: Theme } | undefined;

/** Paper is the light theme, ink the dark one. Both come from the token file. */
export function theme(ground: GroundId): Theme {
	if (!themes) themes = loadThemes();
	return themes[ground];
}

/** The light theme, for a product stand-in drawn on either ground. */
export function paperTheme(): Theme {
	return theme('paper');
}

function loadThemes(): { paper: Theme; ink: Theme } {
	const css = readFileSync(join(packageRoot, 'brand', 'tokens.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
	const light = block(css, ':root');
	const dark = { ...light, ...block(css, '[data-theme="dark"]') };
	return { paper: toTheme(light), ink: toTheme(dark) };
}

function block(css: string, selector: string): Record<string, string> {
	const at = css.indexOf(selector);
	if (at < 0) return {};
	const open = css.indexOf('{', at);
	const close = css.indexOf('}', open);
	const body = css.slice(open + 1, close);
	const raw: Record<string, string> = {};
	for (const m of body.matchAll(/(--ds-[\w-]+)\s*:\s*([^;]+);/g)) raw[m[1]] = m[2].trim();
	return raw;
}

function resolve(raw: Record<string, string>, name: string, depth = 0): string {
	const v = raw[name];
	if (!v || depth > 12) return v ?? '';
	return v.replace(/var\((--ds-[\w-]+)\)/g, (_, n: string) => resolve(raw, n, depth + 1));
}

function hex(raw: Record<string, string>, name: string): string {
	const v = resolve(raw, name).trim();
	if (!/^#[0-9a-fA-F]{6}$/.test(v)) throw new Error(`Token ${name} did not resolve to a color (${v || 'missing'}).`);
	return v.toUpperCase();
}

function em(raw: Record<string, string>, name: string, fallback: number): number {
	const v = resolve(raw, name);
	const m = v.match(/^(-?\d*\.?\d+)em$/);
	return m ? Number(m[1]) : fallback;
}

function toTheme(raw: Record<string, string>): Theme {
	return {
		bg: hex(raw, '--ds-color-surface'),
		bgSubtle: hex(raw, '--ds-color-surface-subtle'),
		fg: hex(raw, '--ds-color-fg'),
		fgSoft: hex(raw, '--ds-color-fg-soft'),
		fgMuted: hex(raw, '--ds-color-fg-muted'),
		edge: hex(raw, '--ds-color-edge'),
		edgeStrong: hex(raw, '--ds-color-edge-strong'),
		accent: hex(raw, '--ds-color-surface-accent'),
		accentSmall: hex(raw, `--ds-color-${imageDoc().accentSmall}`),
		accentText: hex(raw, '--ds-color-fg-accent-display'),
		edgeAccent: hex(raw, '--ds-color-edge-accent'),
		onAccent: hex(raw, '--ds-color-fg-on-accent'),
		trackingDisplay: em(raw, '--ds-tracking-display', -0.02),
		trackingTag: em(raw, '--ds-tracking-tag', 0.06),
	};
}
