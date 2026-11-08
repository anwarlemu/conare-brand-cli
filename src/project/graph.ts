import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, posix, relative } from 'node:path';
import type { Project } from '../library/project.js';

// The app as apply sees it: its source files, what each imports (static imports and Nuxt's auto-imported components),
// its pages with their routes (Nuxt pages/, or a Vue Router routes array when it can be read statically), and the
// shell (app.vue, App.vue, layouts) every page renders inside.

export type Page = { route: string; file: string };
export type Graph = { files: string[]; imports: Map<string, Set<string>>; pages: Page[]; shell: string[]; components: Map<string, string>; routerNote?: string };

const SKIP = /(^|\/)(node_modules|\.git|\.nuxt|\.output|\.data|\.vercel|dist|build|coverage|public|\.ds|\.turbo|\.cache)(\/|$)/;
export const SOURCE = /\.(vue|ts|js|mjs|tsx|jsx|css|pcss|scss|html)$/;

function walk(root: string, dir: string, out: string[]) {
	if (!existsSync(join(root, dir))) return;
	for (const name of readdirSync(join(root, dir))) {
		const rel = dir === '.' ? name : posix.join(dir, name);
		if (SKIP.test(rel)) continue;
		const st = statSync(join(root, rel));
		if (st.isDirectory()) walk(root, rel, out);
		else if (SOURCE.test(name) && !/\.d\.ts$|\.(config|test|spec)\.|^(vite|vitest|nuxt|tailwind|postcss|eslint|prettier)\b/.test(name)) out.push(rel);
	}
}

/** The app's own source files: its source folder, plus index.html and root-level Nuxt folders. */
export function sourceFiles(project: Project): string[] {
	const out: string[] = [];
	if (project.srcDir === '.') {
		for (const name of readdirSync(project.root)) {
			if (SKIP.test(name) || name === 'server') continue;
			const st = statSync(join(project.root, name));
			if (st.isDirectory()) walk(project.root, name, out);
			else if (SOURCE.test(name) && !/\.d\.ts$|\.(config|test|spec)\.|^(vite|vitest|nuxt|tailwind|postcss|eslint|prettier)\b/.test(name)) out.push(name);
		}
	} else {
		walk(project.root, project.srcDir, out);
		if (existsSync(join(project.root, 'index.html'))) out.push('index.html');
	}
	return out.sort();
}

const pascal = (s: string) => s.replace(/(^|[-_.\s]+)(\w)/g, (_, __, c: string) => c.toUpperCase());

/** Nuxt's component names: components/base/Button.vue is BaseButton, components/BaseButton.vue stays BaseButton. */
function nuxtName(rel: string, componentsDir: string) {
	const parts = relative(componentsDir, rel).replace(/\.vue$/, '').split('/').map(pascal);
	const file = parts.pop()!;
	const prefix: string[] = [];
	for (const p of parts) if (!prefix.length || !prefix.join('').endsWith(p)) prefix.push(p);
	const joined = prefix.join('');
	const name = file === 'Index' && joined ? joined : file.startsWith(joined) ? file : joined + file;
	return name;
}

function resolveImport(project: Project, from: string, spec: string, files: Set<string>): string | undefined {
	let base: string | undefined;
	const src = project.srcDir === '.' ? '' : project.srcDir;
	if (spec.startsWith('.')) base = posix.join(posix.dirname(from), spec);
	else if (/^(~~|@@)\//.test(spec)) base = spec.slice(3);
	else if (/^[~@]\//.test(spec)) base = posix.join(src, spec.slice(2));
	else if (spec.startsWith('/')) base = spec.slice(1);
	if (base === undefined) return undefined;
	base = posix.normalize(base);
	for (const c of [base, `${base}.vue`, `${base}.ts`, `${base}.js`, `${base}.mjs`, `${base}/index.ts`, `${base}/index.js`, `${base}/index.vue`]) if (files.has(c)) return c;
	return undefined;
}

const IMPORTS = /(?:\bimport\s+(?:[\s\S]*?\s+from\s+)?|\bimport\s*\(\s*|\bexport\s+[\s\S]*?\s+from\s+)['"]([^'"\n]+)['"]/g;
const TAGS = /<([A-Z][\w]*|[a-z][\w]*(?:-[\w]+)+)[\s/>]/g;

export function buildGraph(project: Project): Graph {
	const files = sourceFiles(project);
	const set = new Set(files);
	const src = project.srcDir === '.' ? '' : `${project.srcDir}/`;
	// Auto-imported components: Nuxt's components/ by path, or unplugin-vue-components by file name.
	const components = new Map<string, string>();
	const componentsDir = `${src}components`;
	const deps = { ...project.pkg.dependencies, ...project.pkg.devDependencies };
	const auto = project.framework === 'nuxt' || !!deps['unplugin-vue-components'];
	for (const f of files.filter((x) => x.endsWith('.vue'))) {
		if (project.framework === 'nuxt' && f.startsWith(`${componentsDir}/`)) components.set(nuxtName(f, componentsDir), f);
		const base = pascal(f.split('/').pop()!.replace(/\.vue$/, ''));
		if (!components.has(base)) components.set(base, f);
	}
	const imports = new Map<string, Set<string>>();
	for (const f of files) {
		if (!/\.(vue|ts|js|mjs|tsx|jsx)$/.test(f)) continue;
		const text = readFileSync(join(project.root, f), 'utf8');
		const out = new Set<string>();
		for (const m of text.matchAll(IMPORTS)) {
			const r = resolveImport(project, f, m[1], set);
			if (r && r !== f) out.add(r);
		}
		if (auto && f.endsWith('.vue')) {
			const template = text.match(/<template[\s\S]*<\/template>/)?.[0] ?? '';
			for (const m of template.matchAll(TAGS)) {
				const name = pascal(m[1]).replace(/^Lazy(?=[A-Z])/, '');
				const hit = components.get(name);
				if (hit && hit !== f && (project.framework === 'nuxt' ? hit.startsWith(`${componentsDir}/`) : true)) out.add(hit);
			}
		}
		imports.set(f, out);
	}
	const { pages, note } = project.framework === 'nuxt' ? { pages: nuxtPages(project, files), note: undefined } : routerPages(project, files, set);
	const shell = files.filter((f) => new RegExp(`^${src}(app\\.vue|App\\.vue|layouts/.+\\.vue|error\\.vue)$`).test(f) || f === 'index.html');
	return { files, imports, pages, shell, components, routerNote: note };
}

function nuxtPages(project: Project, files: string[]): Page[] {
	const dir = `${project.srcDir === '.' ? '' : `${project.srcDir}/`}pages/`;
	return files
		.filter((f) => f.startsWith(dir) && f.endsWith('.vue'))
		.map((file) => {
			const segs = file.slice(dir.length, -4).split('/').filter((s) => !/^\(.*\)$/.test(s));
			if (segs[segs.length - 1] === 'index') segs.pop();
			const route = `/${segs.map((s) => s.replace(/^\[\.\.\.(\w+)\]$/, ':$1(.*)*').replace(/\[\[(\w+)\]\]/g, ':$1?').replace(/\[(\w+)\]/g, ':$1')).join('/')}`;
			return { route, file };
		});
}

/** A Vue Router routes array, read where it is written statically: path, component (imported or lazy), children. */
function routerPages(project: Project, files: string[], set: Set<string>): { pages: Page[]; note?: string } {
	const routerFile = files.find((f) => /\.(ts|js)$/.test(f) && /\bcreateRouter\s*\(/.test(readFileSync(join(project.root, f), 'utf8')));
	if (!routerFile) return { pages: [], note: 'No Vue Router routes found: name pages by file.' };
	const text = readFileSync(join(project.root, routerFile), 'utf8');
	const idents = new Map<string, string>();
	for (const m of text.matchAll(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g)) {
		const r = resolveImport(project, routerFile, m[2], set);
		if (r) idents.set(m[1], r);
	}
	// Each `path:` with the object around it; nesting from the objects that hold a children array around it.
	const opens: number[] = [];
	const objects: { start: number; end: number }[] = [];
	for (let i = 0; i < text.length; i++) {
		if (text[i] === '{') opens.push(i);
		else if (text[i] === '}' && opens.length) objects.push({ start: opens.pop()!, end: i });
	}
	type R = { start: number; end: number; path: string; file?: string };
	const routes: R[] = [];
	for (const m of text.matchAll(/\bpath\s*:\s*['"`]([^'"`]*)['"`]/g)) {
		const at = m.index ?? 0;
		const obj = objects.filter((o) => o.start < at && o.end > at).sort((a, b) => b.start - a.start)[0];
		if (!obj) continue;
		const body = text.slice(obj.start, obj.end);
		// The component of this object only (not of its children).
		const own = body.replace(/children\s*:\s*\[[\s\S]*$/, '');
		const lazy = own.match(/component\s*:\s*\(\)\s*=>\s*import\(\s*['"]([^'"]+)['"]\s*\)/);
		const ident = own.match(/component\s*:\s*(\w+)/);
		const file = lazy ? resolveImport(project, routerFile, lazy[1], set) : ident ? idents.get(ident[1]) : undefined;
		routes.push({ start: obj.start, end: obj.end, path: m[1], file });
	}
	const pages: Page[] = [];
	for (const r of routes) {
		const parents = routes.filter((p) => p !== r && p.start < r.start && p.end > r.end).sort((a, b) => a.start - b.start);
		const full = posix.join('/', ...parents.map((p) => p.path), r.path).replace(/\/$/, '') || '/';
		if (r.file) pages.push({ route: full, file: r.file });
	}
	return { pages, note: routes.some((r) => !r.file) ? `Some routes in ${routerFile} have no statically readable component.` : undefined };
}

/** Files reachable from a file through imports and auto-imported components. */
export function closure(graph: Graph, start: string): Set<string> {
	const seen = new Set<string>();
	const queue = [start];
	while (queue.length) {
		const f = queue.pop()!;
		if (seen.has(f)) continue;
		seen.add(f);
		for (const n of graph.imports.get(f) ?? []) queue.push(n);
	}
	return seen;
}

/** Does a page route match what a person typed (`/users/42`, `/users/:id`, `/users/[id]`)? */
export function routeMatches(route: string, typed: string) {
	const norm = (r: string) => `/${r.replace(/^\/+|\/+$/g, '')}`.replace(/\[(\w+)\]/g, ':$1');
	const a = norm(route).split('/');
	const b = norm(typed).split('/');
	if (a.join('/') === b.join('/')) return true;
	if (a.some((s) => s.includes('(.*)'))) return b.length >= a.length - 1 && a.slice(0, -1).every((s, i) => s.startsWith(':') || s === b[i]);
	return a.length === b.length && a.every((s, i) => s.startsWith(':') || s === b[i]);
}

