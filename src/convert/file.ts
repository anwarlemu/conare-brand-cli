import { parse as parseSfc } from '@vue/compiler-sfc';
import { type Change, type ClassContext, convertClassList, groupOf, parseClass } from './classes.js';
import { type Use, classify, parseColor, roleFor, roleHex } from './color.js';
import { convertCss } from './css.js';
import { type Hit, hasColor, kindOfElement, kinds, paintsDark, restyle } from './kinds.js';

// One file restyled: Vue single-file components (template classes and styles, bound class literals, <style> blocks,
// script class strings), HTML, stylesheets and scripts. Only style values change; a structure check compares the file
// before and after with every style value blanked and refuses any other difference (copy, elements, attributes, code).

export type FileOptions = {
	/** Convert every style value (whole app, page scope); false converts only the named kinds. */
	general: boolean;
	/** The kinds whose elements and components take the library's look ('all' for every kind). */
	kinds: Set<string> | 'all';
	/** This file is an app component of this kind (its root and its class strings take the look). */
	componentKind?: string;
	merge?: boolean;
};
export type FileResult = { text: string; changes: Change[] };

type Edit = { start: number; end: number; text: string };
type Literal = { start: number; end: number; value: string; quote: string };

const allowed = (opts: FileOptions, kind?: string) => !!kind && (opts.kinds === 'all' || opts.kinds.has(kind));

const CLASS_LIST = /^\s*(?:[!-]?[\w:[\]()./%#,&>*=@'-]+)(?:\s+[!-]?[\w:[\]()./%#,&>*=@'-]+)*\s*$/;
const looksLikeClasses = (value: string, single = false) => {
	if (!CLASS_LIST.test(value) || !value.trim()) return false;
	const tokens = value.trim().split(/\s+/);
	if (!single && tokens.length < 2) return false;
	return tokens.some((t) => groupOf(t) !== 'other') && tokens.every((t) => /^[!-]?[a-z[@]/.test(parseClass(t).utility.replace(/^!/, '')) || /^[a-z-]+:/.test(t));
};
const hasLook = (value: string) => value.trim().split(/\s+/).some((t) => groupOf(t) !== 'other');

/** String literals in code, with offsets: comments skipped, template literals with ${} left alone. */
export function literals(code: string, base = 0): Literal[] {
	const out: Literal[] = [];
	for (let i = 0; i < code.length; i++) {
		const c = code[i];
		if (c === '/' && code[i + 1] === '/') {
			const nl = code.indexOf('\n', i);
			i = nl < 0 ? code.length : nl;
			continue;
		}
		if (c === '/' && code[i + 1] === '*') {
			const close = code.indexOf('*/', i + 2);
			i = close < 0 ? code.length : close + 1;
			continue;
		}
		if (c === "'" || c === '"' || c === '`') {
			let j = i + 1;
			let dynamic = false;
			while (j < code.length && code[j] !== c) {
				if (code[j] === '\\') j++;
				else if (c === '`' && code[j] === '$' && code[j + 1] === '{') dynamic = true;
				else if (c !== '`' && code[j] === '\n') break;
				j++;
			}
			if (!dynamic && code[j] === c) out.push({ start: base + i + 1, end: base + j, value: code.slice(i + 1, j), quote: c });
			i = j;
		}
	}
	return out;
}

/** The object key or prop name right before a literal (`destructive: '...'`, `color: '#fff'`). */
const keyBefore = (text: string, at: number) => text.slice(Math.max(0, at - 80), at - 1).match(/(?:^|[\s{,(])['"]?([\w$-]+)['"]?\s*:\s*$/)?.[1];
// A module specifier (import ... from '...', export ... from '...', import('...')), not a value.
const inImport = (text: string, at: number) => /(^|\n)\s*import\b[^;\n=]*$|\bfrom\s*$|\bimport\s*\(\s*$|\brequire\s*\(\s*$/.test(text.slice(Math.max(0, at - 300), at - 1));

function colorLiteral(value: string, key: string | undefined): string | undefined {
	const rgba = parseColor(value);
	if (!rgba || rgba[3] < 0.995) return undefined;
	const use: Use = key && /(^|-)(color|text|fg|foreground|fill|stroke|ink|label|font)/i.test(key) ? 'text' : key && /(border|line|grid|edge|rule|outline)/i.test(key) ? 'border' : 'bg';
	const hex = roleHex(roleFor(classify(rgba), use));
	if (!hex || hex.toLowerCase() === value.trim().toLowerCase()) return undefined;
	return /^#[0-9a-f]+$/.test(value.trim()) ? hex.toLowerCase() : hex;
}

/** Class and color strings in a script: converted, and in an app component of a kind, given that kind's look. */
function convertScript(code: string, base: number, full: string, opts: FileOptions, edits: Edit[], changes: Change[]) {
	for (const lit of literals(code, base)) {
		if (inImport(full, lit.start)) continue;
		const key = keyBefore(full, lit.start);
		let next = lit.value;
		// One class is a class list too where an object key names a variant or size (icon: 'size-8').
		const keyed = !!opts.componentKind && !!key && /^(xs|sm|md|lg|xl|2xl|small|medium|large|default|icon(-\w+)?)$/i.test(key);
		if (looksLikeClasses(lit.value) || (keyed && looksLikeClasses(lit.value, true))) {
			const ctx: ClassContext = { merge: opts.merge, changes };
			if (opts.general) next = convertClassList(next, ctx);
			if (opts.componentKind && allowed(opts, opts.componentKind) && hasLook(lit.value) && !(opts.componentKind === 'button' && key === 'link')) {
				const tokens = lit.value.split(/\s+/).filter(Boolean);
				// A size string (sm: 'px-3 py-1.5 text-sm') takes only the size part of the look.
				const sizeOnly = (!!key && /^(xs|sm|md|lg|xl|2xl|small|medium|large|icon(-\w+)?)$/i.test(key)) || tokens.every((t) => ['padding', 'height', 'type', 'radius', 'other'].includes(groupOf(t)));
				const variantKey = !!key && Object.values(kinds()[opts.componentKind]?.keys ?? {}).some((keys) => keys.includes(key.toLowerCase()));
				next = restyle(next, { kind: opts.componentKind }, { merge: opts.merge, key, variant: hasColor(tokens) ? 'variant' : sizeOnly ? 'size' : variantKey ? 'variant' : 'base', tokensForVariant: tokens, changes });
			}
		} else if (opts.general && /^\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\))\s*$/.test(lit.value)) {
			const c = colorLiteral(lit.value, key);
			if (c) {
				changes.push({ from: lit.value, to: c });
				next = c;
			}
		}
		if (next !== lit.value) edits.push({ start: lit.start, end: lit.end, text: next });
	}
}

type Node = { type: number; tag?: string; props?: any[]; children?: Node[]; loc: { start: { offset: number }; end: { offset: number } }; content?: any };

/** A Vue single-file component restyled. */
export function convertVue(text: string, opts: FileOptions): FileResult {
	const changes: Change[] = [];
	const edits: Edit[] = [];
	const { descriptor } = parseSfc(text, { sourceMap: false, ignoreEmpty: false });
	const template = descriptor.template;
	if (template?.ast && (!template.lang || template.lang === 'html')) {
		const roots = (template.ast.children as Node[]).filter((n) => n.type === 1);
		const visit = (node: Node, isRoot: boolean, onDark: boolean) => {
			if (node.type !== 1) return;
			const dark = convertElement(text, node, isRoot, opts, edits, changes, onDark);
			for (const child of node.children ?? []) visit(child, false, dark ?? onDark);
		};
		for (const n of template.ast.children as Node[]) visit(n, roots.includes(n), false);
	}
	for (const block of [descriptor.script, descriptor.scriptSetup]) if (block) convertScript(block.content, block.loc.start.offset, text, opts, edits, changes);
	if (opts.general) {
		for (const style of descriptor.styles) {
			if (style.lang && !/^(css|postcss|pcss|scss|less)$/.test(style.lang)) continue;
			const next = convertCss(style.content, { changes, merge: opts.merge });
			if (next !== style.content) edits.push({ start: style.loc.start.offset, end: style.loc.end.offset, text: next });
		}
	}
	const out = applyEdits(text, edits);
	if (out !== text) guard(text, out, 'vue');
	return { text: out, changes };
}

function convertElement(text: string, node: Node, isRoot: boolean, opts: FileOptions, edits: Edit[], changes: Change[], onDark = false): boolean | undefined {
	const tag = node.tag ?? '';
	const attrs: Record<string, string | true> = {};
	let staticClass: { start: number; end: number; value: string } | undefined;
	const bindings: { start: number; end: number; code: string; name: string }[] = [];
	let staticStyle: { start: number; end: number; value: string } | undefined;
	const styleBindings: { start: number; end: number; code: string }[] = [];
	const extraClasses: { start: number; end: number; value: string }[] = [];
	for (const p of node.props ?? []) {
		if (p.type === 6) {
			attrs[p.name] = p.value?.content ?? true;
			if (!p.value) continue;
			const start = p.value.loc.start.offset + 1;
			const end = p.value.loc.end.offset - 1;
			if (p.name === 'class') staticClass = { start, end, value: text.slice(start, end) };
			else if (p.name === 'style') staticStyle = { start, end, value: text.slice(start, end) };
			else if (/(^|-)class$/i.test(p.name) || /Class$/.test(p.name)) extraClasses.push({ start, end, value: text.slice(start, end) });
		} else if (p.type === 7 && p.name === 'bind' && p.arg?.content && p.exp) {
			const arg = p.arg.content as string;
			const start = p.exp.loc.start.offset;
			const end = p.exp.loc.end.offset;
			if (arg === 'class' || /(^|-)class$/i.test(arg) || /Class$/.test(arg)) bindings.push({ start, end, code: text.slice(start, end), name: arg });
			else if (arg === 'style') styleBindings.push({ start, end, code: text.slice(start, end) });
			else attrs[arg] = '';
		}
	}
	const staticTokens = staticClass?.value.split(/\s+/).filter(Boolean) ?? [];
	const classBinding = bindings.filter((b) => b.name === 'class');
	const dynLiterals = classBinding.flatMap((b) => literals(b.code, b.start));
	const dynTokens = dynLiterals.flatMap((l) => l.value.split(/\s+/).filter(Boolean));
	let hit: Hit | undefined = kindOfElement(tag, attrs, [...staticTokens, ...dynTokens]);
	if (isRoot && opts.componentKind && (!hit || hit.kind !== opts.componentKind) && /^[a-z]/.test(tag)) hit = { kind: opts.componentKind };
	const restyled = hit && allowed(opts, hit.kind) ? hit : undefined;
	const ctx: ClassContext = { tag, merge: opts.merge, changes };

	// Bound class strings first: a string with colors takes the variant's look, one without takes the base.
	for (const b of bindings) {
		for (const lit of literals(b.code, b.start)) {
			if (!hasLook(lit.value) || !looksLikeClasses(lit.value, true)) continue;
			let next = opts.general ? convertClassList(lit.value, ctx) : lit.value;
			// Only a kind with variants splits its look across strings (base here, colors there); for the others a bound
			// string is a state the app toggles, and it keeps its own (converted) classes.
			// A component's root built with cn('...') has its whole look in that one string: it takes the base.
			const rootLook = isRoot && opts.componentKind === restyled?.kind && !staticClass;
			if (restyled && b.name === 'class' && !restyled.part && (rootLook || (kinds()[restyled.kind]?.variants && (hasColor(lit.value.split(/\s+/)) || !staticClass)))) {
				const colored = hasColor(lit.value.split(/\s+/));
				next = restyle(next, restyled, { tag, changes, onDark, merge: opts.merge, variant: colored ? 'variant' : 'base', tokensForVariant: lit.value.split(/\s+/).filter(Boolean) });
			}
			if (next !== lit.value) edits.push({ start: lit.start, end: lit.end, text: next });
		}
	}
	const dynColored = dynTokens.some((t) => ['bg', 'text-color', 'border-color'].includes(groupOf(t)));
	if (staticClass) {
		let next = opts.general ? convertClassList(staticClass.value, ctx) : staticClass.value;
		if (restyled) next = restyle(next, restyled, { tag, changes, onDark, merge: opts.merge, variant: hasColor(staticTokens) || !dynColored ? 'both' : 'base', tokensForVariant: staticTokens });
		if (next !== staticClass.value) edits.push({ start: staticClass.start, end: staticClass.end, text: next });
	} else if (restyled && /^[a-z]/.test(tag) && !tag.includes('-') && !classBinding.length) {
		// A bare element of a named kind gets the look as a class attribute; nothing else about it changes.
		const look = restyle('', restyled, { tag, changes, onDark, merge: opts.merge, variant: dynColored ? 'base' : 'both', tokensForVariant: [] });
		if (look.trim()) {
			const at = node.loc.start.offset + 1 + tag.length;
			edits.push({ start: at, end: at, text: ` class="${look.trim()}"` });
		}
	}
	const dark = paintsDark(staticTokens);
	if (!opts.general) return dark;
	for (const x of extraClasses) {
		if (!looksLikeClasses(x.value, true)) continue;
		const next = convertClassList(x.value, ctx);
		if (next !== x.value) edits.push({ start: x.start, end: x.end, text: next });
	}
	if (staticStyle) {
		const next = convertCss(staticStyle.value, { changes, selector: tag }, true);
		if (next !== staticStyle.value) edits.push({ start: staticStyle.start, end: staticStyle.end, text: next });
	}
	for (const s of styleBindings) {
		for (const lit of literals(s.code, s.start)) {
			if (!/^\s*(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()/.test(lit.value)) continue;
			const key = keyBefore(text, lit.start);
			const rgba = parseColor(lit.value);
			if (!rgba) continue;
			const use: Use = key && /background|bg/i.test(key) ? 'bg' : key && /border|outline/i.test(key) ? 'border' : 'text';
			const role = roleFor(classify(rgba), use);
			const to = `var(--ds-color-${role})`;
			changes.push({ from: lit.value, to });
			edits.push({ start: lit.start, end: lit.end, text: to });
		}
	}
	return dark;
}

/** A plain HTML page: class and style attributes and <style> blocks. */
export function convertHtml(text: string, opts: FileOptions): FileResult {
	const changes: Change[] = [];
	if (!opts.general) return { text, changes };
	let out = text.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (_, open: string, css: string, close: string) => `${open}${convertCss(css, { changes, merge: opts.merge })}${close}`);
	out = out.replace(/(<([a-zA-Z][\w-]*)\b[^>]*?\sclass\s*=\s*)(["'])([^"']*)\3/g, (_all, head: string, tag: string, q: string, cls: string) => `${head}${q}${convertClassList(cls, { tag, merge: opts.merge, changes })}${q}`);
	out = out.replace(/(\sstyle\s*=\s*)(["'])([^"']*)\2/g, (_, head: string, q: string, css: string) => `${head}${q}${convertCss(css, { changes }, true)}${q}`);
	if (out !== text) guard(text, out, 'html');
	return { text: out, changes };
}

export function convertStylesheet(text: string, opts: FileOptions): FileResult {
	const changes: Change[] = [];
	if (!opts.general) return { text, changes };
	const out = convertCss(text, { changes, merge: opts.merge });
	if (out !== text) guard(text, out, 'css');
	return { text: out, changes };
}

export function convertCode(text: string, opts: FileOptions): FileResult {
	const changes: Change[] = [];
	const edits: Edit[] = [];
	convertScript(text, 0, text, opts, edits, changes);
	const out = applyEdits(text, edits);
	if (out !== text) guard(text, out, 'code');
	return { text: out, changes };
}

function applyEdits(text: string, edits: Edit[]) {
	let out = text;
	let last = Number.POSITIVE_INFINITY;
	for (const e of [...edits].sort((a, b) => b.start - a.start || b.end - a.end)) {
		if (e.end > last) continue;
		out = out.slice(0, e.start) + e.text + out.slice(e.end);
		last = e.start;
	}
	return out;
}

// ---- The structure check: everything but style values must be byte-identical. ----

const blankLiterals = (code: string) => {
	let out = '';
	let last = 0;
	for (const l of literals(code)) {
		out += code.slice(last, l.start);
		last = l.end;
	}
	return out + code.slice(last);
};

function templateSignature(nodes: Node[], text: string): string {
	return nodes
		.map((n) => {
			if (n.type === 1) {
				const props = (n.props ?? [])
					.filter((p: any) => !(p.type === 6 && (p.name === 'class' || p.name === 'style' || /(^|-)class$/i.test(p.name) || /Class$/.test(p.name))))
					.map((p: any) => (p.type === 6 ? `${p.name}=${p.value?.content ?? ''}` : `${p.rawName ?? p.name}=${blankLiterals(p.exp ? text.slice(p.exp.loc.start.offset, p.exp.loc.end.offset) : '')}`))
					.join(' ');
				return `<${n.tag} ${props}>${templateSignature(n.children ?? [], text)}</${n.tag}>`;
			}
			if (n.type === 2 || n.type === 3) return `${n.type}:${typeof n.content === 'string' ? n.content : ''}`;
			if (n.type === 5) return `{{${blankLiterals(n.content?.loc ? text.slice(n.content.loc.start.offset, n.content.loc.end.offset) : '')}}}`;
			return '';
		})
		.join('');
}

export function signature(text: string, kind: 'vue' | 'html' | 'css' | 'code'): string {
	if (kind === 'code') return blankLiterals(text);
	if (kind === 'css') return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/[^{};]*;/g, '').replace(/[^{}]*}/g, '}').replace(/\s+/g, ' ').trim();
	if (kind === 'html') return text.replace(/(<style\b[^>]*>)[\s\S]*?(<\/style>)/gi, '$1$2').replace(/\s(class|style)\s*=\s*(["'])[^"']*\2/g, '');
	const { descriptor } = parseSfc(text, { sourceMap: false, ignoreEmpty: false });
	const t = descriptor.template?.ast ? templateSignature(descriptor.template.ast.children as Node[], text) : '';
	const scripts = [descriptor.script, descriptor.scriptSetup].map((b) => (b ? blankLiterals(b.content) : '')).join('\n');
	const styles = descriptor.styles.map((s) => `${s.attrs.scoped ? 'scoped' : ''}${s.lang ?? ''}${signature(s.content, 'css')}`).join('\n');
	return `${t}\n${scripts}\n${styles}`;
}

export class StructureChanged extends Error {}

function guard(before: string, after: string, kind: 'vue' | 'html' | 'css' | 'code') {
	if (signature(before, kind) !== signature(after, kind)) throw new StructureChanged('the restyle would change more than style values');
}
