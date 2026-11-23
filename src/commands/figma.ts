import { existsSync, readFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { brand } from '../lib/brand.js';
import { helpRow } from '../lib/help-row.js';
import { display, pick, unknown, write } from '../assets/io.js';
import { compose, imageDoc, LAYOUTS, renderDesign, sizeIds, sizeOf, type Layout } from '../assets/og.js';
import { copyFlags, seedOf } from '../assets/flags.js';
import { renderSlide, slideTypes } from '../assets/deck.js';
import { renderSubject, SUBJECTS } from '../illustrate/draw.js';
import { checkFigmaValues, dedupe } from '../figma/check.js';
import { figmaSvg, parseFigmaUrl, svgScript } from '../figma/push.js';
import { figmaTokens, figmaTokenScripts } from '../figma/tokens.js';
import { readIndex, readItem } from '../library/registry.js';

// `figma` gives the Figma MCP tools what they need; the CLI never calls Figma itself. Every action writes files and
// prints the exact tool calls, in order, that an agent makes with them.

type Flags = Record<string, string | boolean | string[] | undefined>;
export const FIGMA_ACTIONS = ['tokens', 'push', 'pull', 'check'] as const;
export const PUSH_KINDS = ['image', 'slide', 'illustration', 'asset', 'component', 'page'] as const;
export type Step = { tool: string; args?: Record<string, unknown>; note: string };

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
const useFigmaNote = 'Load the figma-use skill (skill://figma/figma-use/SKILL.md) before the first use_figma call, and figma-generate-library for variables or figma-generate-design for visible frames; pass skillNames.';
const sessionSteps = (task: string, file?: string): Step[] => [
	...(file ? [] : [{ tool: 'whoami', note: 'Only if no planKey is known: read the plans and use the one plan, or ask which.' }, { tool: 'create_new_file', args: { fileName: `${brand().name} ${task}`, editorType: 'design', planKey: '<plan key>' }, note: 'Only when there is no target file yet (pass --file <key> to skip this).' }]),
	{ tool: 'create_session', args: { fileKey: file ?? '<fileKey>', description: task }, note: 'Before any other file tool; pass the returned sessionId on every later call.' },
];

export function figmaHelp(): string {
	const b = brand().bin;
	const row = (c: string, w: string) => helpRow(c, w, 52);
	return [
		'Work in Figma through its MCP tools. The CLI never calls Figma: it writes files and prints the tool calls, in order.',
		'',
		row(`${b} figma tokens`, 'Brand tokens as Figma variables (Light and Dark) and use_figma scripts'),
		row(`${b} figma push image hero --headline "..." --size og`, 'A share image as SVG plus the import steps'),
		row(`${b} figma push slide cover --title "..."`, 'A deck slide'),
		row(`${b} figma push illustration stacks`, 'An illustration as editable vectors'),
		row(`${b} figma push asset logo.svg`, 'Any SVG, PNG, JPEG or self-contained HTML file'),
		row(`${b} figma push component button --url http://localhost:3201`, 'A library example, captured from a running docs site'),
		row(`${b} figma push page app.html`, 'A page (a saved HTML file or a URL)'),
		row(`${b} figma pull <figma url with node-id>`, 'The calls that read a frame, then figma check'),
		row(`${b} figma check variables.json design.txt`, 'Off-brand values in saved MCP output, with the nearest token'),
		'',
		`Push kinds: ${PUSH_KINDS.join(', ')}. --out a directory (default figma/). --file <key> targets an existing Figma file.`,
		'push image takes the image flags (--size, --theme, --headline, --body, --badge, --sample); push slide its slots (--title, --body...) or --sample; push illustration --size WxH, --theme, --seed.',
		'component and page captures need playwright-core and a Chromium (PLAYWRIGHT_CHROMIUM or a Playwright install); a saved HTML file needs neither.',
	].join('\n');
}

function out(cwd: string, flags: Flags) {
	return resolve(cwd, str(flags.out) ?? 'figma');
}

function result(cwd: string, title: string, files: string[], steps: Step[], extra: Record<string, unknown> = {}) {
	const shown = files.map((f) => display(cwd, f));
	return {
		json: { files: shown, ...extra, steps },
		text: [title, ...shown.map((f) => `  wrote ${f}`), 'Figma MCP steps, in order:', ...steps.map((s, i) => `  ${i + 1}. ${s.tool}${s.args ? ` ${JSON.stringify(s.args)}` : ''}\n     ${s.note}`)].join('\n'),
	};
}

function tokensAction(cwd: string, flags: Flags) {
	const dir = out(cwd, flags);
	const doc = figmaTokens();
	const scripts = figmaTokenScripts(doc);
	const files = [join(dir, 'tokens.json')];
	write(files[0]!, `${JSON.stringify(doc, null, 2)}\n`);
	scripts.forEach((s, i) => {
		const f = join(dir, `tokens-${i + 1}.js`);
		write(f, s);
		files.push(f);
	});
	const steps: Step[] = [
		...sessionSteps('apply brand tokens as variables', str(flags.file)),
		...scripts.map((_, i) => ({ tool: 'use_figma', args: { fileKey: str(flags.file) ?? '<fileKey>', sessionId: '<sessionId>', code: `<contents of ${display(cwd, files[i + 1]!)}>`, skillNames: 'figma-use,figma-generate-library' }, note: i === 0 ? `${useFigmaNote} Finds or creates "${doc.collection}" with modes ${doc.modes.join(', ')}; on a plan with one mode per collection it makes one collection per mode.` : 'Same collection; continues the variables.' })),
		{ tool: 'get_variable_defs', args: { fileKey: str(flags.file) ?? '<fileKey>', nodeId: '<a node bound to the variables>' }, note: 'Optional check once something is bound; run figma check on the saved result.' },
	];
	return result(cwd, `${doc.variables.length} variables (${doc.modes.join(', ')}) and ${doc.effects.length} effect styles; ${doc.skipped.length} tokens have no Figma type.`, files, steps, { collection: doc.collection, modes: doc.modes, variables: doc.variables.length, effectStyles: doc.effects.length, skipped: doc.skipped });
}

/** The rendered page as static HTML for html_to_figma: stylesheets and images inlined, scripts removed. */
async function snapshotHtml(url: string, width: number): Promise<string> {
	let pw: { chromium: { launch: (o: Record<string, unknown>) => Promise<{ newPage: (o: Record<string, unknown>) => Promise<{ goto: (u: string, o: Record<string, unknown>) => Promise<unknown>; evaluate: <T>(f: () => Promise<T>) => Promise<T> }>; close: () => Promise<void> }> } };
	try {
		pw = (await import('playwright-core' as string)) as typeof pw;
	} catch {
		throw new Error('Capturing a page needs playwright-core (npm i -D playwright-core) and a Chromium. Or save the page as self-contained HTML and pass the file.');
	}
	const browser = await pw.chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {}) });
	try {
		const page = await browser.newPage({ viewport: { width, height: 900 } });
		await page.goto(url, { waitUntil: 'networkidle' });
		return await page.evaluate(async () => {
			const toData = async (src: string) => {
				try {
					const blob = await (await fetch(src)).blob();
					return await new Promise<string>((ok) => {
						const r = new FileReader();
						r.onload = () => ok(String(r.result));
						r.readAsDataURL(blob);
					});
				} catch {
					return src;
				}
			};
			let css = '';
			for (const sheet of Array.from(document.styleSheets)) {
				try {
					css += Array.from(sheet.cssRules).map((r) => r.cssText).join('\n');
				} catch {}
			}
			const doc = document.documentElement.cloneNode(true) as HTMLElement;
			doc.querySelectorAll('script, link[rel="stylesheet"], link[rel="preload"], noscript').forEach((n) => n.remove());
			for (const img of Array.from(doc.querySelectorAll('img'))) if (img.src) img.src = await toData(img.src);
			const style = document.createElement('style');
			style.textContent = css.replace(/url\((['"]?)(\/[^)'"]+)\1\)/g, (_m, _q, p) => `url(${location.origin}${p})`);
			doc.querySelector('head')?.appendChild(style);
			return `<!doctype html>\n${doc.outerHTML}`;
		});
	} finally {
		await browser.close();
	}
}

function svgSteps(cwd: string, dir: string, svg: string, name: string, frame: string, file?: string): { files: string[]; steps: Step[] } {
	const clean = figmaSvg(svg);
	const upload = join(dir, `${name}.figma.svg`);
	write(upload, clean);
	const files = [upload];
	const steps: Step[] = [];
	const script = svgScript(clean, frame);
	if (script) {
		const f = join(dir, `push-${name}.js`);
		write(f, script);
		files.push(f);
		steps.push({ tool: 'use_figma', args: { fileKey: file ?? '<fileKey>', sessionId: '<sessionId>', code: `<contents of ${display(cwd, f)}>`, skillNames: 'figma-use,figma-generate-design' }, note: `${useFigmaNote} Imports the SVG as editable layers in "${frame}", placed clear of existing frames.` });
	}
	steps.push({ tool: 'upload_assets', args: { fileKey: file ?? '<fileKey>', count: 1 }, note: `${script ? 'Instead of the script, or ' : ''}${script ? 'f' : 'F'}or an SVG too big for one script: POST ${display(cwd, upload)} with Content-Type image/svg+xml to the returned URL; it arrives as editable vectors.` });
	return { files, steps };
}

async function pushAction(cwd: string, kind: string | undefined, target: string | undefined, flags: Flags) {
	if (!kind) throw new Error(`Name what to push: ${PUSH_KINDS.join(', ')}.`);
	pick('push kind', kind, PUSH_KINDS);
	const dir = out(cwd, flags);
	const file = str(flags.file);
	const steps: Step[] = [...sessionSteps(`push ${kind}${target ? ` ${target}` : ''}`, file)];
	const files: string[] = [];
	const extra: Record<string, unknown> = { kind, target: target ?? null };
	if (kind === 'image') {
		if (!target) throw new Error(`Name a layout: ${LAYOUTS.join(', ')}.`);
		const layout = pick('layout', target, LAYOUTS) as Layout;
		const size = sizeOf(str(flags.size) ?? 'og');
		if (!size) throw unknown('size', String(flags.size), sizeIds());
		const copy = copyFlags(flags);
		const d = compose({ template: layout, size, theme: str(flags.theme) ? pick('theme', str(flags.theme)!, Object.keys(imageDoc().themes)) : undefined, headline: copy.headline, body: copy.body, badge: copy.badgeStyle, badgeText: copy.badge, partner: copy.partner, note: copy.note, credit: copy.credit, seed: seedOf(flags), sample: flags.sample === true });
		const r = await renderDesign(d, null, { png: true, svg: true });
		const name = `image-${layout}-${size.id}`;
		write(join(dir, `${name}.png`), r.png!);
		files.push(join(dir, `${name}.png`));
		const s = svgSteps(cwd, dir, r.svg!, name, `Image / ${layout} ${size.id}`, file);
		files.push(...s.files);
		steps.push(...s.steps);
	} else if (kind === 'slide') {
		if (!target) throw new Error(`Name a slide type: ${slideTypes().join(', ')}.`);
		const type = pick('slide type', target, slideTypes());
		const slots: Record<string, string> = {};
		for (const k of ['title', 'headline', 'body', 'badge', 'eyebrow', 'number', 'items', 'stat', 'quote', 'attribution', 'url']) if (typeof flags[k] === 'string') slots[k] = flags[k] as string;
		const r = await renderSlide({ type, ...slots, theme: str(flags.theme), sample: flags.sample === true }, { png: true, svg: true });
		const name = `slide-${type}`;
		write(join(dir, `${name}.png`), r.png!);
		files.push(join(dir, `${name}.png`));
		const s = svgSteps(cwd, dir, r.svg!, name, `Slide / ${type}`, file);
		files.push(...s.files);
		steps.push(...s.steps);
	} else if (kind === 'illustration') {
		if (!target) throw new Error(`Name a subject: ${SUBJECTS().join(', ')}.`);
		const subject = pick('subject', target, SUBJECTS());
		const m = /^(\d+)x(\d+)$/i.exec(str(flags.size) ?? '1200x1200');
		if (!m) throw new Error('--size takes WIDTHxHEIGHT for an illustration.');
		const r = renderSubject({ subject, width: Number(m[1]), height: Number(m[2]), theme: str(flags.theme), seed: str(flags.seed) ? Number(flags.seed) : undefined }, { png: true, svg: true });
		const name = `illustration-${subject}`;
		write(join(dir, `${name}.png`), r.png!);
		files.push(join(dir, `${name}.png`));
		const s = svgSteps(cwd, dir, r.svg!, name, `Illustration / ${subject}`, file);
		files.push(...s.files);
		steps.push(...s.steps);
	} else if (kind === 'asset') {
		if (!target) throw new Error('Pass the file to push (SVG, PNG, JPEG, WebP, GIF or HTML).');
		const path = resolve(cwd, target);
		if (!existsSync(path)) throw new Error(`No such file: ${target}`);
		const ext = extname(path).toLowerCase();
		const name = basename(path, ext);
		const types: Record<string, string> = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' };
		if (ext === '.html' || ext === '.htm') {
			const o = join(dir, `${name}.html`);
			write(o, readFileSync(path));
			files.push(o);
			steps.push({ tool: 'html_to_figma', args: { fileKey: file ?? '<fileKey>', sessionId: '<sessionId>', promptId: '<new uuid>' }, note: `POST ${display(cwd, o)} (Content-Type text/html) to the returned single-use URL. The HTML must be self-contained (inline CSS, images as data URIs).` });
		} else if (ext === '.svg') {
			const s = svgSteps(cwd, dir, readFileSync(path, 'utf8'), name, `Asset / ${name}`, file);
			files.push(...s.files);
			steps.push(...s.steps);
		} else if (types[ext]) {
			steps.push({ tool: 'upload_assets', args: { fileKey: file ?? '<fileKey>', count: 1 }, note: `POST ${display(cwd, path)} with Content-Type ${types[ext]} to the returned URL; it arrives as an image fill in a new frame.` });
		} else throw unknown('file type', ext || target, [...Object.keys(types), '.html']);
	} else if (kind === 'component') {
		if (!target) throw new Error(`Name a library component: ${brand().bin} list.`);
		const index = await readIndex();
		const name = pick('component', target, index.map((i) => i.name));
		const item = await readItem(name);
		const example = str(flags.example) ? pick('example', str(flags.example)!, item.examples.map((e) => e.name)) : item.examples[0]?.name;
		if (!example) throw new Error(`${name} has no example to capture.`);
		const base = (str(flags.url) ?? brand().registryUrl).replace(/\/$/, '');
		const url = `${base}/preview/${name}/${example}`;
		const html = await snapshotHtml(url, Number(str(flags.width) ?? 1440));
		const o = join(dir, `component-${name}-${example}.html`);
		write(o, html);
		files.push(o);
		extra.preview = url;
		steps.push({ tool: 'html_to_figma', args: { fileKey: file ?? '<fileKey>', sessionId: '<sessionId>', promptId: '<new uuid>' }, note: `POST ${display(cwd, o)} (text/html) to the returned URL. Plain layers; rebuild as a component with use_figma and the variables when it must be reusable.` });
	} else {
		if (!target) throw new Error('Pass a page URL or a saved HTML file.');
		const html = /^https?:/.test(target) ? await snapshotHtml(target, Number(str(flags.width) ?? 1440)) : readFileSync(resolve(cwd, target), 'utf8');
		const o = join(dir, `page-${(/^https?:/.test(target) ? new URL(target).pathname : basename(target)).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'}.html`);
		write(o, html);
		files.push(o);
		steps.push({ tool: 'html_to_figma', args: { fileKey: file ?? '<fileKey>', sessionId: '<sessionId>', promptId: '<new uuid>' }, note: `POST ${display(cwd, o)} (text/html) to the returned URL.` });
	}
	steps.push({ tool: 'get_screenshot', args: { fileKey: file ?? '<fileKey>', nodeId: '<frameId from the last step>', sessionId: '<sessionId>' }, note: 'One screenshot to confirm the result; stop when it matches.' });
	return result(cwd, `Ready to push ${kind}${target ? ` ${target}` : ''}.`, files, steps, extra);
}

function pullAction(cwd: string, url: string | undefined, flags: Flags) {
	if (!url) throw new Error('Pass a Figma URL with a node-id (https://figma.com/design/<fileKey>/<name>?node-id=1-2).');
	const { fileKey, nodeId, kind } = parseFigmaUrl(url);
	if (kind !== 'design') throw new Error(`figma pull reads design files; this is a ${kind} URL.`);
	if (!nodeId) throw new Error('The URL has no node-id: select the frame in Figma and copy its link.');
	const dir = out(cwd, flags);
	const vars = join(dir, `variables-${nodeId.replace(':', '-')}.json`);
	const ctx = join(dir, `design-${nodeId.replace(':', '-')}.txt`);
	const steps: Step[] = [
		{ tool: 'create_session', args: { fileKey, description: `check node ${nodeId} against ${brand().name} tokens` }, note: 'First; pass the returned sessionId on the next calls.' },
		{ tool: 'get_variable_defs', args: { fileKey, nodeId, sessionId: '<sessionId>' }, note: `Save the JSON result to ${display(cwd, vars)}.` },
		{ tool: 'get_design_context', args: { fileKey, nodeId, sessionId: '<sessionId>', clientFrameworks: (brand() as { framework?: string }).framework ?? 'vue', clientLanguages: 'typescript' }, note: `Load the figma-design-to-code skill first. Save the returned code to ${display(cwd, ctx)}.` },
		{ tool: 'shell', args: { run: `npx ${brand().bin} figma check ${display(cwd, vars)} ${display(cwd, ctx)} --json` }, note: `Lists every value that is not a brand token, with the nearest token. Build with library components (${brand().bin} search) and tokens, never the raw values.` },
	];
	return result(cwd, `Figma file ${fileKey}, node ${nodeId}.`, [], steps, { fileKey, nodeId, saveTo: { variables: display(cwd, vars), designContext: display(cwd, ctx) } });
}

function checkAction(cwd: string, paths: string[]) {
	if (!paths.length) throw new Error('Pass the saved get_variable_defs JSON and/or get_design_context code.');
	const all = paths.flatMap((p) => {
		const abs = resolve(cwd, p);
		if (!existsSync(abs)) throw new Error(`No such file: ${p}`);
		return checkFigmaValues(readFileSync(abs, 'utf8')).map((f) => ({ ...f, where: `${p} ${f.where}` }));
	});
	const findings = dedupe(all);
	const off = findings.filter((f) => !f.ok);
	const doc = { ok: off.length === 0, checked: all.length, offBrand: off, onBrand: findings.filter((f) => f.ok) };
	const text = (off.length ? [`${off.length} off-brand value${off.length === 1 ? '' : 's'}:`, ...off.map((f) => `  ${f.kind.padEnd(7)} ${f.message} (${f.count}x, first at ${f.where})`)] : [`All ${all.length} values are brand tokens.`]).join('\n');
	return { json: doc, text, failed: off.length > 0 };
}

export async function runFigma(cwd: string, args: string[], flags: Flags): Promise<{ json: unknown; text: string; failed?: boolean }> {
	const [action, ...rest] = args;
	if (!action) throw new Error(`Name an action: ${FIGMA_ACTIONS.join(', ')}.`);
	const a = pick('figma action', action, FIGMA_ACTIONS);
	if (a === 'tokens') return tokensAction(cwd, flags);
	if (a === 'push') return pushAction(cwd, rest[0], rest[1], flags);
	if (a === 'pull') return pullAction(cwd, rest[0], flags);
	return checkAction(cwd, rest);
}
