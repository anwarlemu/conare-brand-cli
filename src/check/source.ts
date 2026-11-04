import { extname } from 'node:path';

// A file as the check reads it: its styles (a stylesheet, or the <style> blocks and style
// attributes of a template with everything else blanked, so offsets still point into the real
// file), its class tokens and the string literals of its scripts. No parser: Vue, HTML and CSS
// are read with patterns, which is enough for values.

export type ClassToken = { value: string; offset: number };
export type StringLiteral = { value: string; offset: number };
export type SourceFile = {
	path: string;
	text: string;
	styles: string;
	classTokens: ClassToken[];
	strings: StringLiteral[];
	lineStarts: number[];
	overrides: Map<number, string>;
};

export const STYLES = /\.(css|pcss|scss)$/i;
export const MARKUP = /\.(vue|html?)$/i;
export const SCRIPT = /\.(ts|js|mjs|tsx|jsx)$/i;

export function lineOf(file: SourceFile, offset: number) {
	let lo = 0;
	let hi = file.lineStarts.length - 1;
	while (lo < hi) {
		const mid = (lo + hi + 1) >> 1;
		if (file.lineStarts[mid] <= offset) lo = mid;
		else hi = mid - 1;
	}
	return { line: lo + 1, column: offset - file.lineStarts[lo] + 1 };
}

const split = (value: string, offset: number): ClassToken[] => [...value.matchAll(/\S+/g)].map((m) => ({ value: m[0], offset: offset + (m.index ?? 0) }));

/** String literals in a script or a template expression ('...', "...", `...` without ${}). */
function literals(text: string, base: number): StringLiteral[] {
	const out: StringLiteral[] = [];
	for (const m of text.matchAll(/(['"`])((?:\\.|(?!\1)[^\\\n])*)\1/g)) if (!m[2].includes('${')) out.push({ value: m[2], offset: base + (m.index ?? 0) + 1 });
	return out;
}

export function loadSource(path: string, text: string): SourceFile {
	const lineStarts = [0];
	for (let i = 0; i < text.length; i++) if (text[i] === '\n') lineStarts.push(i + 1);
	const overrides = new Map<number, string>();
	text.split('\n').forEach((line, i) => {
		const m = line.match(/ds-override:\s*(.*?)\s*(\*\/|-->)?\s*$/);
		if (m) overrides.set(i + 1, m[1] || '(no reason given)');
	});
	const file: SourceFile = { path, text, styles: '', classTokens: [], strings: [], lineStarts, overrides };
	const ext = extname(path).toLowerCase();
	if (STYLES.test(ext)) {
		file.styles = text;
		return file;
	}
	if (SCRIPT.test(ext)) {
		file.strings = literals(text, 0);
		return file;
	}
	// Markup: keep the style blocks and style attributes, read the class attributes.
	const keep = new Uint8Array(text.length);
	const semicolons = new Set<number>();
	for (const m of text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) keep.fill(1, (m.index ?? 0) + m[0].indexOf('>') + 1, (m.index ?? 0) + m[0].length - 8);
	for (const m of text.matchAll(/\sstyle\s*=\s*(["'])([^"']*)\1/gi)) {
		const start = (m.index ?? 0) + m[0].length - m[2].length - 1;
		keep.fill(1, start, start + m[2].length);
		semicolons.add(start + m[2].length);
	}
	for (const m of text.matchAll(/\sclass\s*=\s*(["'])([^"']*)\1/gi)) file.classTokens.push(...split(m[2], (m.index ?? 0) + m[0].length - m[2].length - 1));
	// Bound classes (:class="...") hold literals that are class lists.
	for (const m of text.matchAll(/\s(?::class|v-bind:class)\s*=\s*"([^"]*)"/gi)) {
		const base = (m.index ?? 0) + m[0].length - m[1].length - 1;
		for (const s of literals(m[1], base)) file.classTokens.push(...split(s.value, s.offset));
	}
	const script = text.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
	if (script) file.strings = literals(script[1], (script.index ?? 0) + script[0].indexOf('>') + 1);
	let styles = '';
	for (let i = 0; i < text.length; i++) styles += semicolons.has(i) ? ';' : keep[i] || text[i] === '\n' ? text[i] : ' ';
	file.styles = styles;
	return file;
}
