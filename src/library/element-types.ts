import { brand } from '../lib/brand.js';
import type { Project } from './project.js';

// Types for the web components an app has added, so `<prefix-button variant="dark">` type-checks in React (TSX),
// Svelte and Astro, and `document.querySelector('prefix-button')` knows its properties. Each module's .d.ts (built
// with the registry) goes into one file in the app's source folder, each in its own namespace (two modules may name a
// type alike), with the tag map and the JSX hooks of the frameworks the app uses. Types a module's declaration names
// but does not carry (a lib type such as Align) are declared as unknown there, so the file always compiles.

const GLOBALS = new Set(['HTMLElement', 'Element', 'Node', 'Date', 'Intl', 'Record', 'Partial', 'Required', 'Readonly', 'ReadonlyArray', 'Array', 'Promise', 'Map', 'Set', 'Pick', 'Omit', 'Exclude', 'Extract', 'NonNullable', 'ReturnType', 'Function', 'Event', 'CustomEvent', 'ShadowRoot', 'DocumentFragment', 'ValidityState', 'ElementInternals', 'FormData', 'File', 'Blob', 'URL', 'DOMRect', 'Intl.DateTimeFormatOptions']);
const isGlobal = (n: string) => GLOBALS.has(n) || /^(HTML|SVG)\w*Element$|Event$/.test(n);

export type ModuleTypes = { name: string; dts: string };

/**
 * The top-level declarations of a .d.ts (its exported types, interfaces and classes, each with the doc comment over
 * it), cut at their balanced end: anything else a declaration file should not hold (code a type's text swept in) is
 * left out.
 */
export function declarations(dts: string): string[] {
	const out: string[] = [];
	// The generated class is `export declare class`; an `export class` is source code a type's text swept in.
	const starts = [...dts.matchAll(/^export\s+(type|interface|declare class)\s+\w+/gm)];
	for (const m of starts) {
		let i = m.index!;
		let depth = 0;
		let end = -1;
		for (; i < dts.length; i++) {
			const c = dts[i];
			if (c === '{' || c === '(' || c === '[') depth++;
			else if (c === '}' || c === ')' || c === ']') {
				depth--;
				if (depth === 0 && c === '}' && m[1] !== 'type') {
					end = i + 1;
					break;
				}
			} else if (c === '\n' && depth <= 0 && m[1] === 'type' && !/[|&=,(<]\s*$/.test(dts.slice(m.index!, i))) {
				end = i;
				break;
			}
		}
		if (end < 0) continue;
		const doc = dts.slice(0, m.index!).match(/(\/\*\*(?:(?!\*\/)[\s\S])*\*\/\s*)$/)?.[1] ?? '';
		out.push(`${doc}${dts.slice(m.index!, end)}`);
	}
	return out;
}

/** One module's declaration as a namespace body: its types and class, its tags, and stand-ins for names it lacks. */
function wrap(m: ModuleTypes) {
	const tags: [string, string][] = [];
	for (const t of m.dts.matchAll(/'([a-z][\w-]*-[\w-]*)'\s*:\s*(\w+)\s*;/g)) tags.push([t[1], t[2]]);
	let body = declarations(m.dts).join('\n').replace(/^export declare class/gm, 'export class').replace(/:\s*array\b/g, ': unknown[]');
	const declared = new Set([...body.matchAll(/^export\s+(?:type|interface|class)\s+(\w+)/gm)].map((x) => x[1]));
	// Names in the declarations (not in comments) that nothing declares: unknown, so the file compiles.
	const code = body.replace(/\/\*[\s\S]*?\*\//g, '').replace(/'[^'\n]*'/g, "''");
	const used = new Set([...code.matchAll(/\b([A-Z]\w*)\b/g)].map((x) => x[1]));
	const missing = [...used].filter((n) => !declared.has(n) && !isGlobal(n));
	if (missing.length) body = `${missing.map((n) => `type ${n} = unknown`).join('\n')}\n${body}`;
	return { body, tags };
}

const space = (name: string) => `${name.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase())}Element`;

/** The types file for these modules, with the JSX hooks for the app's frameworks. */
export function elementTypes(project: Pick<Project, 'pkg' | 'framework'>, modules: ModuleTypes[]): string {
	const deps: Record<string, string> = { ...project.pkg.dependencies, ...project.pkg.devDependencies };
	const parts = modules.map((m) => ({ space: space(m.name), ...wrap(m) }));
	const tags = parts.flatMap((p) => p.tags.map(([tag, cls]) => ({ tag, type: `${p.space}.${cls}` })));
	const lines = [
		`// Types for the ${brand().name} web components in this app, written by \`${brand().bin} add\` (it rewrites this file on every add).`,
		'// The element classes, the tag map for querySelector and createElement, and the JSX hooks for the frameworks the app uses.',
	];
	const react = !!deps.react || !!deps['@types/react'];
	const svelte = !!deps.svelte;
	if (react) lines.push("import type { DetailedHTMLProps, HTMLAttributes as ReactAttributes } from 'react'");
	if (svelte) lines.push("import type { HTMLAttributes as SvelteAttributes } from 'svelte/elements'");
	lines.push('');
	for (const p of parts) lines.push(`export declare namespace ${p.space} {`, ...p.body.trim().split('\n').map((l) => `  ${l}`), '}');
	lines.push(
		'',
		'/** An element\'s properties as JSX props: its own fields, each optional (methods and HTMLElement\'s members left out). */',
		'type ElementProps<E> = { [K in keyof E as K extends keyof HTMLElement ? never : E[K] extends (...args: never[]) => unknown ? never : K]?: E[K] }',
		'/** As markup attributes (Svelte, Astro): a list, an object or a date may also be written as its attribute, JSON or an',
		' * ISO date. React sets every prop as a property, so it takes the values themselves. */',
		'type ElementAttrs<E> = { [K in keyof ElementProps<E>]?: ElementProps<E>[K] | (NonNullable<ElementProps<E>[K]> extends string | number | boolean ? never : string) }',
		'',
		'declare global {',
		'  interface HTMLElementTagNameMap {',
		...tags.map((t) => `    '${t.tag}': ${t.type}`),
		'  }',
	);
	if (project.framework === 'astro') {
		lines.push('  namespace astroHTML.JSX {', '    interface IntrinsicElements {', ...tags.map((t) => `      '${t.tag}': HTMLAttributes & ElementAttrs<${t.type}>`), '    }', '  }');
	}
	lines.push('}');
	if (react) lines.push('', "declare module 'react' {", '  namespace JSX {', '    interface IntrinsicElements {', ...tags.map((t) => `      '${t.tag}': DetailedHTMLProps<ReactAttributes<${t.type}>, ${t.type}> & ElementProps<${t.type}> & { class?: string }`), '    }', '  }', '}');
	if (svelte) lines.push('', "declare module 'svelte/elements' {", '  interface SvelteHTMLElements {', ...tags.map((t) => `    '${t.tag}': SvelteAttributes<${t.type}> & ElementAttrs<${t.type}>`), '  }', '}');
	return `${lines.join('\n')}\n`;
}

/** The custom elements manifest narrowed to these modules (editors and analyzers read it next to the modules). */
export function narrowManifest(manifest: string, modules: string[]): string {
	const m = JSON.parse(manifest) as { modules?: { path: string }[] };
	const keep = new Set(modules.map((x) => `elements/${x.replace(/^elements\//, '')}`));
	return `${JSON.stringify({ ...m, modules: (m.modules ?? []).filter((x) => keep.has(x.path)) }, null, 2)}\n`;
}
