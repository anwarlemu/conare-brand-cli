import { existsSync, readFileSync } from 'node:fs';
import { join, posix } from 'node:path';
import { elements } from '../convert/color.js';
import { brand, cli, registryHost } from '../lib/brand.js';
import { normalizeName, suggest } from '../lib/names.js';
import { type Project, readProject, unsupported } from '../library/project.js';
import { type IndexEntry, type RegistryItem, readIndex, readItem } from '../library/registry.js';
import { readState } from './apply.js';

// The library by name, for people and agents: resolve a name however it is typed, show how to use an item (rules,
// props, slots, events, examples, the exact source), search, describe the app's setup, and diff local copies.

/** An item's name from what was typed: `Button`, `alert-dialog`, `AlertDialog`, `badge` (shadcn's name for tag), `Input` (a file of field). */
export async function resolveName(typed: string, index?: IndexEntry[]): Promise<{ name: string; via?: string }> {
	const items = index ?? (await readIndex());
	const n = normalizeName(typed);
	const exact = items.find((i) => i.name === typed) ?? items.find((i) => normalizeName(i.name) === n);
	if (exact) return { name: exact.name };
	const alias = Object.entries(elements().aliases).find(([a]) => normalizeName(a) === n)?.[1];
	if (alias && items.some((i) => i.name === alias)) return { name: alias, via: `${typed} is ${alias} here` };
	const owner = items.find((i) => i.files.some((f) => normalizeName(f.split('/').pop()!) === n));
	if (owner) return { name: owner.name, via: `${typed} is part of ${owner.name}` };
	const options = suggest(typed, [...items.map((i) => i.name), ...Object.keys(elements().aliases)]);
	throw new Error(`Unknown item \`${typed}\`.${options.length ? ` Did you mean ${options.map((o) => `\`${o}\``).join(', ')}?` : ''} \`${cli()} search <words>\` finds items by what they do; \`${cli()} list\` lists all ${items.length}.`);
}

export async function resolveNames(names: string[]) {
	const index = await readIndex();
	const out: { name: string; via?: string }[] = [];
	for (const n of names) out.push(await resolveName(n, index));
	return out;
}

// ---- Reading a component's API from its source. ----

/** The text between a balanced pair starting at `open` (an index of `<`, `{`, `(` or `[`). */
function balanced(text: string, open: number) {
	const pairs: Record<string, string> = { '<': '>', '{': '}', '(': ')', '[': ']' };
	const stack: string[] = [];
	for (let i = open; i < text.length; i++) {
		const c = text[i];
		if (c === "'" || c === '"' || c === '`') {
			const close = text.indexOf(c, i + 1);
			i = close < 0 ? text.length : close;
			continue;
		}
		if (pairs[c] && !(c === '<' && text[i - 1] === '=' )) stack.push(pairs[c]);
		else if (c === stack[stack.length - 1]) {
			stack.pop();
			if (!stack.length) return text.slice(open + 1, i);
		} else if (c === '>' && text[i - 1] === '=') continue;
	}
	return '';
}

/** Members of a type literal body, split at the top level. */
function members(body: string) {
	const out: string[] = [];
	let depth = 0;
	let cur = '';
	for (let i = 0; i < body.length; i++) {
		const c = body[i];
		if ('<{([' .includes(c)) depth++;
		else if ('>})]'.includes(c) && !(c === '>' && body[i - 1] === '=')) depth--;
		if (depth === 0 && (c === ',' || c === ';' || c === '\n')) {
			if (cur.trim()) out.push(cur.trim());
			cur = '';
		} else cur += c;
	}
	if (cur.trim()) out.push(cur.trim());
	return out.map((m) => m.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '').trim()).filter((m) => /^[\w$'"]+\??\s*:/.test(m));
}

export type Api = { file: string; component: string; props: { name: string; type: string; required: boolean; default?: string }[]; models: { name: string; type: string }[]; emits: string[]; slots: string[] };

export function apiOf(path: string, source: string): Api {
	const component = path.split('/').pop()!.replace(/\.vue$/, '');
	const script = source.match(/<script\b[^>]*setup[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? '';
	const api: Api = { file: path, component, props: [], models: [], emits: [], slots: [] };
	const dp = script.indexOf('defineProps<');
	if (dp >= 0) {
		let body = balanced(script, dp + 'defineProps'.length).trim();
		if (/^\w+$/.test(body)) body = script.match(new RegExp(`(?:interface\\s+${body}\\s*|type\\s+${body}\\s*=\\s*)`))?.index !== undefined ? balanced(script, script.indexOf('{', script.search(new RegExp(`(?:interface|type)\\s+${body}\\b`)))) : '';
		else if (body.startsWith('{')) body = balanced(body, 0);
		const defaults: Record<string, string> = {};
		const wd = script.indexOf('withDefaults(');
		if (wd >= 0) {
			const args = balanced(script, wd + 'withDefaults'.length);
			const obj = args.lastIndexOf('{');
			if (obj >= 0) for (const m of members(balanced(args, obj))) defaults[m.split(':')[0].trim()] = m.slice(m.indexOf(':') + 1).trim();
		}
		for (const m of members(body)) {
			const [, name, optional, type] = m.match(/^['"]?([\w$-]+)['"]?(\?)?\s*:\s*([\s\S]+)$/) ?? [];
			if (name) api.props.push({ name, type: type.replace(/\s+/g, ' '), required: !optional && !(name in defaults), default: defaults[name] });
		}
	}
	for (const m of script.matchAll(/defineModel<([^>]*(?:<[^>]*>[^>]*)?)>\(\s*(?:['"]([\w-]+)['"])?/g)) api.models.push({ name: m[2] ?? 'modelValue', type: m[1].trim() });
	const de = script.indexOf('defineEmits<');
	if (de >= 0) {
		const body = balanced(script, de + 'defineEmits'.length).trim();
		if (body.startsWith('{')) {
			const inner = balanced(body, 0);
			for (const m of members(inner)) {
				const [, name, args] = m.match(/^['"]?([\w:-]+)['"]?\s*:\s*\[([\s\S]*)\]$/) ?? [];
				if (name) api.emits.push(args?.trim() ? `${name} (${args.trim()})` : name);
			}
			for (const m of inner.matchAll(/\(\s*e\s*:\s*['"]([\w:-]+)['"]/g)) api.emits.push(m[1]);
		}
	}
	const arr = script.match(/defineEmits\(\s*\[([^\]]*)\]/);
	if (arr) for (const m of arr[1].matchAll(/['"]([\w:-]+)['"]/g)) api.emits.push(m[1]);
	// A prop typed by an alias in the same file reads as its values.
	for (const p of api.props) {
		const alias = script.match(new RegExp(`type\\s+${p.type.replace(/[^\w]/g, '')}\\s*=\\s*([^\\n]+)`))?.[1];
		if (/^\w+$/.test(p.type) && alias) p.type = `${p.type} (${alias.trim()})`;
	}
	const template = source.match(/<template>([\s\S]*)<\/template>/)?.[1] ?? '';
	for (const m of template.matchAll(/<slot\b([^>]*)>/g)) {
		const name = m[1].match(/\sname="([\w-]+)"/)?.[1] ?? 'default';
		const bound = [...m[1].matchAll(/:([\w-]+)=/g)].map((x) => x[1]).filter((x) => x !== 'name');
		const label = bound.length ? `${name} (${bound.join(', ')})` : name;
		if (!api.slots.includes(label)) api.slots.push(label);
	}
	return api;
}

/** How an app imports a component file, with or without the `@` alias. */
function importLine(project: Project | undefined, component: string, path: string) {
	const src = project && project.srcDir !== '.' ? project.srcDir : project ? '' : 'src';
	const spec = !project || project.alias ? `@/${path}` : `./${posix.join(src, path)} (relative to the importing file)`;
	return `import ${component} from '${spec}'`;
}

export type ViewResult = { name: string; title: string; group: string; description: string; use_for: string; never: string[]; notes: string; install: string; imports: string[]; nuxtNames: string[]; requires: string[]; packages: string[]; api: Api[]; examples: { name: string; label?: string; path: string; content: string }[]; files: { path: string; content: string }[]; via?: string };

export async function view(root: string, names: string[]): Promise<ViewResult[]> {
	const project = existsSync(join(root, 'package.json')) ? readProject(root) : undefined;
	const out: ViewResult[] = [];
	const seen = new Set<string>();
	for (const r of await resolveNames(names)) {
		if (seen.has(r.name)) continue;
		seen.add(r.name);
		const item = (await readItem(r.name)) as RegistryItem & { body?: string; examples: { name: string; label?: string; path: string; content: string }[] };
		const components = item.files.filter((f) => f.path.startsWith('components/') && f.path.endsWith('.vue'));
		out.push({
			name: item.name,
			title: item.title,
			group: brand().groups[item.group] ?? item.group,
			description: item.description,
			use_for: item.use_for,
			never: item.never,
			notes: item.body ?? '',
			install: `npx ${cli()} add ${item.name}`,
			imports: components.map((f) => importLine(project, f.path.split('/').pop()!.replace(/\.vue$/, ''), f.path)),
			nuxtNames: components.map((f) => f.path.replace(/^components\//, '').replace(/\.vue$/, '').split('/').map((s) => s[0].toUpperCase() + s.slice(1)).join('')),
			requires: item.requires,
			packages: item.dependencies,
			api: components.map((f) => apiOf(f.path, f.content)),
			examples: item.examples,
			files: item.files,
			via: r.via,
		});
	}
	return out;
}

export function formatView(v: ViewResult, full: boolean) {
	const lines = [`${v.title} (${v.name}, ${v.group})${v.via ? `  [${v.via}]` : ''}`, '', v.description, '', `Use for: ${v.use_for}`];
	if (v.never.length) lines.push('Never:', ...v.never.map((n) => `  - ${n}`));
	if (v.notes) lines.push('', v.notes);
	lines.push('', `Install: ${v.install}${v.requires.length ? `  (also adds ${v.requires.join(', ')})` : ''}${v.packages.length ? `; packages: ${v.packages.join(', ')}` : ''}`);
	lines.push(`Import: ${v.imports.join('\n        ')}`, `Nuxt auto-import names: ${v.nuxtNames.join(', ')}`);
	for (const a of v.api) {
		lines.push('', `<${a.component}>  ${a.file}`);
		if (a.props.length) lines.push('  Props:', ...a.props.map((p) => `    ${p.name}${p.required ? '' : '?'}: ${p.type}${p.default ? `  (default ${p.default})` : ''}`));
		if (a.models.length) lines.push(`  v-model: ${a.models.map((m) => `${m.name === 'modelValue' ? 'v-model' : `v-model:${m.name}`} (${m.type})`).join(', ')}`);
		if (a.emits.length) lines.push(`  Events: ${a.emits.join(', ')}`);
		if (a.slots.length) lines.push(`  Slots: ${a.slots.join(', ')}`);
	}
	lines.push('', `Examples (${v.examples.length}): ${v.examples.map((e) => e.name).join(', ')}`);
	const shown = full ? v.examples : v.examples.slice(0, 1);
	for (const e of shown) lines.push('', `--- example ${e.name} (${e.path})`, e.content.trimEnd());
	if (full) for (const f of v.files) lines.push('', `--- source ${f.path}`, f.content.trimEnd());
	else lines.push('', `Exact source and every example: ${cli()} view ${v.name} --source (or --json).`);
	return lines.join('\n');
}

export async function search(query: string[]) {
	const items = await readIndex();
	const words = query.join(' ').toLowerCase().split(/\s+/).filter(Boolean);
	const aliases = elements().aliases;
	const scored = items.map((i) => {
		const names = [i.name, i.title, ...Object.entries(aliases).filter(([, v]) => v === i.name).map(([a]) => a), ...i.files.map((f) => f.split('/').pop()!.replace(/\.vue$/, ''))].join(' ').toLowerCase();
		const text = `${i.description} ${i.use_for}`.toLowerCase();
		let score = 0;
		for (const w of words) {
			const n = normalizeName(w);
			if (normalizeName(i.name) === n) score += 10;
			else if (names.split(/\s+/).some((x) => normalizeName(x) === n)) score += 6;
			else if (names.includes(w)) score += 3;
			if (text.includes(w)) score += 1 + (text.match(new RegExp(`\\b${w.replace(/[^\w]/g, '')}`, 'g'))?.length ?? 0) * 0.2;
		}
		return { name: i.name, title: i.title, group: brand().groups[i.group] ?? i.group, description: i.description, score };
	});
	return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 12);
}

/** A library file as `add` writes it into this app (the `@/` imports made relative when the app has no alias). */
export function localContent(project: Project, path: string, content: string) {
	if (project.alias) return content;
	return content.replace(/(['"])(@\/[^'"]+)\1/g, (_, q: string, spec: string) => {
		let rel = posix.relative(posix.dirname(path), spec.slice(2));
		if (!rel.startsWith('.')) rel = `./${rel}`;
		return `${q}${rel}${q}`;
	});
}

const localPath = (project: Project, path: string) => (project.srcDir === '.' ? path : posix.join(project.srcDir, path));

export async function info(root: string) {
	const project = readProject(root);
	const problem = unsupported(project);
	const index = await readIndex();
	const installed: { name: string; modified: string[] }[] = [];
	for (const entry of index) {
		const present = entry.files.filter((f) => existsSync(join(root, localPath(project, f))));
		if (!present.length || present.length < entry.files.length) continue;
		const item = await readItem(entry.name);
		const modified = item.files.filter((f) => readFileSync(join(root, localPath(project, f.path)), 'utf8') !== localContent(project, f.path, f.content)).map((f) => localPath(project, f.path));
		installed.push({ name: entry.name, modified });
	}
	const css = project.css && existsSync(join(root, project.css)) ? readFileSync(join(root, project.css), 'utf8') : '';
	const theme = css.includes(`./${brand().bin}/theme.css`);
	const state = readState(root);
	const next: string[] = [];
	if (problem) next.push(problem);
	else {
		if (!theme) next.push(`npx ${cli()} init   (stylesheet, theme, fonts, agent contract)`);
		if (!state) next.push(`npx ${cli()} apply --dry-run   (see what restyling the whole app would change), then npx ${cli()} apply`);
		next.push(`npx ${cli()} add <item>   (for example: ${['button', 'field', 'dialog'].filter((n) => index.some((i) => i.name === n)).join(', ')}; npx ${cli()} search <words> finds one)`);
		next.push(`npx ${cli()} view <item>   (props, slots, examples, source)`);
		next.push(`npx ${cli()} check`);
	}
	return {
		root,
		framework: project.framework,
		srcDir: project.srcDir,
		alias: project.alias,
		packageManager: project.packageManager,
		installRoot: project.installRoot,
		tailwind: project.tailwind ?? null,
		stylesheet: project.css ?? null,
		theme,
		supported: !problem,
		problem: problem ?? null,
		library: `${brand().name} (${index.length} items, registry ${registryHost()}/r)`,
		installed,
		scope: state ? (state.whole ? 'whole app' : state.parts.map((p) => p.targets.join(', ')).join('; ')) : null,
		next,
	};
}

export function formatInfo(i: Awaited<ReturnType<typeof info>>) {
	return [
		`${i.framework === 'nuxt' ? 'Nuxt' : i.framework === 'vite-vue' ? 'Vite + Vue' : 'Not a Vue'} app at ${i.root}`,
		`  Source: ${i.srcDir}/  Alias @: ${i.alias ? 'yes' : 'no (imports are made relative)'}  Packages: ${i.packageManager}${i.installRoot !== i.root ? ` (workspace at ${i.installRoot})` : ''}  Tailwind: ${i.tailwind ?? 'not installed'}`,
		`  Stylesheet: ${i.stylesheet ?? '(none found)'}  Theme: ${i.theme ? 'installed' : 'not installed'}`,
		`  Library: ${i.library}`,
		`  Installed: ${i.installed.length ? i.installed.map((x) => `${x.name}${x.modified.length ? ' (changed locally)' : ''}`).join(', ') : 'none'}`,
		`  Applied: ${i.scope ?? 'not yet'}`,
		'',
		'Next:',
		...i.next.map((n) => `  ${n}`),
	].join('\n');
}

/** A unified diff of two texts, with three lines of context. */
export function unifiedDiff(a: string, b: string, fromName: string, toName: string) {
	const x = a.split('\n');
	const y = b.split('\n');
	const n = x.length;
	const m = y.length;
	const lcs = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
	for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) lcs[i][j] = x[i] === y[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
	const ops: { t: ' ' | '-' | '+'; line: string; i: number; j: number }[] = [];
	let i = 0;
	let j = 0;
	while (i < n || j < m) {
		if (i < n && j < m && x[i] === y[j]) ops.push({ t: ' ', line: x[i], i: i++, j: j++ });
		else if (j < m && (i === n || lcs[i][j + 1] >= lcs[i + 1][j])) ops.push({ t: '+', line: y[j], i, j: j++ });
		else ops.push({ t: '-', line: x[i], i: i++, j });
	}
	if (!ops.some((o) => o.t !== ' ')) return '';
	const out = [`--- ${fromName}`, `+++ ${toName}`];
	for (let k = 0; k < ops.length; ) {
		if (ops[k].t === ' ') {
			k++;
			continue;
		}
		const start = Math.max(0, k - 3);
		let end = k;
		while (end < ops.length) {
			if (ops[end].t !== ' ') end++;
			else {
				let run = end;
				while (run < ops.length && ops[run].t === ' ') run++;
				if (run - end > 6 || run === ops.length) break;
				end = run;
			}
		}
		const stop = Math.min(ops.length, end + 3);
		const hunk = ops.slice(start, stop);
		out.push(`@@ -${hunk[0].i + 1},${hunk.filter((o) => o.t !== '+').length} +${hunk[0].j + 1},${hunk.filter((o) => o.t !== '-').length} @@`, ...hunk.map((o) => `${o.t}${o.line}`));
		k = stop;
	}
	return out.join('\n');
}

export async function diff(root: string, names: string[]) {
	const project = readProject(root);
	const out: { name: string; files: { path: string; status: 'same' | 'changed' | 'missing'; diff: string }[] }[] = [];
	for (const r of await resolveNames(names)) {
		const item = await readItem(r.name);
		out.push({
			name: item.name,
			files: item.files.map((f) => {
				const local = localPath(project, f.path);
				const want = localContent(project, f.path, f.content);
				if (!existsSync(join(root, local))) return { path: local, status: 'missing' as const, diff: '' };
				const have = readFileSync(join(root, local), 'utf8');
				return have === want ? { path: local, status: 'same' as const, diff: '' } : { path: local, status: 'changed' as const, diff: unifiedDiff(have, want, `${local} (yours)`, `${local} (library)`) };
			}),
		});
	}
	return out;
}
