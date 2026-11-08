// registry/ -> apps/www/public/r (one JSON per item and index.json) and apps/www/app/registry.generated.json (what the
// docs site lists). It validates every item, derives its files and dependencies from its imports, runs the value
// check over the whole library and type-checks it with vue-tsc. Any problem fails the build.
//
//   bun scripts/build-registry.ts           build, check and type-check
//   bun scripts/build-registry.ts --no-tsc  skip the type check (faster while iterating)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkText, formatFinding } from '../src/check/engine.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const reg = join(root, 'registry');
const outDir = join(root, 'apps', 'www', 'public', 'r');
const brand = JSON.parse(readFileSync(join(root, 'brand', 'brand.json'), 'utf8'));
const errors: string[] = [];
// Packages are pinned to the ranges this repository builds and type-checks against.
const rootPkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const ranges: Record<string, string> = { ...rootPkg.dependencies, ...rootPkg.devDependencies };
const pinned = (p: string) => (ranges[p] ? `${p}@${ranges[p]}` : p);
const fail = (msg: string) => errors.push(msg);

type Example = { name: string; label: string; center: boolean; half: boolean };
type Doc = { name: string; title: string; type: string; group: string; description: string; use_for: string; never: string[]; source: string; files: string[]; examples: Example[]; body: string };

/** The frontmatter this registry writes: `key: value` (plain or JSON-quoted) and `key:` followed by `  - item` lines. */
function frontmatter(text: string, file: string): Record<string, string | string[]> & { body: string } {
	const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
	if (!m) throw new Error(`${file}: no frontmatter`);
	const out: Record<string, string | string[]> = {};
	let list: string[] | undefined;
	const value = (v: string) => (v.startsWith('"') ? JSON.parse(v) : v);
	for (const line of m[1].split('\n')) {
		const item = line.match(/^\s+-\s+(.*)$/);
		if (item && list) list.push(value(item[1].trim()));
		else {
			const kv = line.match(/^([\w-]+):\s*(.*)$/);
			if (!kv) continue;
			if (kv[2] === '') out[kv[1]] = list = [];
			else {
				out[kv[1]] = value(kv[2].trim());
				list = undefined;
			}
		}
	}
	return Object.assign(out, { body: m[2].trim() });
}

const docs: Doc[] = readdirSync(join(reg, 'docs'))
	.filter((f) => f.endsWith('.md'))
	.sort()
	.map((f) => {
		const fm = frontmatter(readFileSync(join(reg, 'docs', f), 'utf8'), f);
		const name = f.slice(0, -3);
		for (const key of ['name', 'title', 'type', 'group', 'description', 'use_for', 'source']) if (typeof fm[key] !== 'string' || !fm[key]) fail(`docs/${f}: \`${key}\` is missing`);
		if (fm.name !== name) fail(`docs/${f}: name \`${fm.name}\` does not match the file`);
		if (!brand.groups[fm.group as string]) fail(`docs/${f}: group \`${fm.group}\` is not one of ${Object.keys(brand.groups).join(', ')}`);
		const examples = ((fm.examples as string[]) ?? []).map((e) => {
			const [ex, label, opts = ''] = e.split('|').map((s) => s.trim());
			return { name: ex, label: label || ex, center: /\bcenter\b/.test(opts), half: /\bhalf\b/.test(opts) };
		});
		return { name, title: fm.title as string, type: fm.type as string, group: fm.group as string, description: fm.description as string, use_for: fm.use_for as string, never: (fm.never as string[]) ?? [], source: fm.source as string, files: (fm.files as string[]) ?? [], examples, body: fm.body };
	});

// Which item owns which file.
const owner = new Map<string, string>();
for (const d of docs) {
	if (!d.files.length) fail(`${d.name}: lists no files`);
	for (const f of d.files) {
		if (!existsSync(join(reg, f))) fail(`${d.name}: ${f} does not exist`);
		if (owner.has(f)) fail(`${f} is listed by both ${owner.get(f)} and ${d.name}`);
		owner.set(f, d.name);
	}
}
// Every component belongs to an item.
const walk = (dir: string): string[] => readdirSync(join(reg, dir), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(posix.join(dir, e.name)) : [posix.join(dir, e.name)]));
for (const f of walk('components')) if (!owner.has(f)) fail(`${f} belongs to no item (add it to a docs entry's files)`);

const IMPORT = /(?:^|\n)\s*import\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g;
// The docs site bundles the library's raw source into its server build, where `typeof window` (and `typeof document`)
// is folded away and the build fails; feature checks go through globalThis instead.
const TYPEOF_GLOBAL = /\btypeof\s+(window|document)\b/;
function guardGlobals(path: string, text: string) {
	const m = text.match(TYPEOF_GLOBAL);
	if (m) fail(`${path}: uses \`${m[0]}\`, which breaks the docs site's server build (it bundles raw source); check through globalThis instead (\`globalThis.matchMedia\`, \`'IntersectionObserver' in globalThis\`) or inside onMounted`);
}
const NUXT_ONLY = /from\s+['"](#app|#imports|#components|nuxt\/|@nuxt\/)|\b(useFetch|useAsyncData|useState|useRoute|useRouter|navigateTo|useRuntimeConfig|\$fetch|NuxtLink|useNuxtApp|definePageMeta)\b/;

/** A file's `@/` imports as registry paths, and its bare package imports. */
function importsOf(path: string) {
	const text = readFileSync(join(reg, path), 'utf8');
	const local: string[] = [];
	const packages: string[] = [];
	for (const m of text.matchAll(IMPORT)) {
		const spec = m[1];
		if (spec.startsWith('@/')) {
			const target = spec.slice(2);
			const resolved = [target, `${target}.ts`, `${target}/index.ts`].find((p) => existsSync(join(reg, p)));
			if (!resolved) fail(`${path}: cannot resolve ${spec}`);
			else local.push(resolved);
		} else if (spec.startsWith('.')) fail(`${path}: relative import ${spec}; use @/ so add can place it`);
		else if (spec !== 'vue') packages.push(spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]);
	}
	return { text, local, packages };
}

/** Files, required items and packages of a set of entry files, following @/ imports. */
function closure(entries: string[], self?: string) {
	const files = new Set<string>();
	const requires = new Set<string>();
	const packages = new Set<string>();
	const queue = [...entries];
	while (queue.length) {
		const f = queue.shift()!;
		if (files.has(f)) continue;
		const own = owner.get(f);
		if (own && own !== self) {
			requires.add(own);
			continue;
		}
		files.add(f);
		const { local, packages: p } = importsOf(f);
		p.forEach((x) => packages.add(x));
		queue.push(...local);
	}
	return { files: [...files], requires: [...requires].sort(), packages: [...packages].sort() };
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const index: unknown[] = [];
const site: unknown[] = [];
let checked = 0;
for (const d of docs) {
	const { files, requires, packages } = closure(d.files, d.name);
	for (const f of files) {
		const text = readFileSync(join(reg, f), 'utf8');
		// Apps that only add components (or apply a selection) scope the brand's base to these roots.
		if (f.endsWith('.vue') && f.startsWith('components/') && !/<template>[\s\S]*\sdata-ds="/.test(text)) fail(`${f}: its root element needs data-ds="<name>" (the scoped base styles the library by it)`);
		if (NUXT_ONLY.test(text)) fail(`${f}: uses Nuxt-only code (${text.match(NUXT_ONLY)?.[0]}); components take data through props`);
		guardGlobals(f, text);
	}
	const exDir = join(reg, 'examples', d.name);
	const exFiles = existsSync(exDir) ? readdirSync(exDir).filter((f) => f.endsWith('.vue')).map((f) => f.slice(0, -4)) : [];
	if (!exFiles.length) fail(`${d.name}: has no example in examples/${d.name}/`);
	if (!d.examples.length) fail(`${d.name}: its docs list no examples`);
	for (const e of d.examples) if (!exFiles.includes(e.name)) fail(`${d.name}: example ${e.name} is listed but examples/${d.name}/${e.name}.vue does not exist`);
	for (const e of exFiles) if (!d.examples.some((x) => x.name === e)) fail(`${d.name}: examples/${d.name}/${e}.vue is not listed in its docs`);
	const examples = d.examples.map((e) => {
		const path = `examples/${d.name}/${e.name}.vue`;
		const c = closure([path], d.name);
		guardGlobals(path, readFileSync(join(reg, path), 'utf8'));
		return { ...e, path, content: readFileSync(join(reg, path), 'utf8'), requires: c.requires, packages: c.packages };
	});
	const item = { name: d.name, title: d.title, type: d.type, group: d.group, description: d.description, use_for: d.use_for, never: d.never, source: d.source, body: d.body, requires, dependencies: packages.map(pinned), files: files.map((path) => ({ path, content: readFileSync(join(reg, path), 'utf8') })), examples };
	writeFileSync(join(outDir, `${d.name}.json`), `${JSON.stringify(item, null, 2)}\n`);
	index.push({ ...item, files, examples: d.examples.map((e) => e.name) });
	site.push({ name: d.name, title: d.title, group: d.group, description: d.description, use_for: d.use_for, never: d.never, source: d.source, body: d.body, requires, dependencies: packages, files, examples: d.examples });
}
writeFileSync(join(outDir, 'index.json'), `${JSON.stringify({ name: brand.name, registryUrl: brand.registryUrl, items: index }, null, 2)}\n`);
writeFileSync(join(root, 'apps', 'www', 'app', 'registry.generated.json'), `${JSON.stringify({ groups: brand.groups, items: site }, null, 2)}\n`);

// The value check over the whole library: components, composables and examples.
for (const f of walk('.').filter((p) => /\.(vue|ts|css)$/.test(p))) {
	const { findings } = checkText(`registry/${f}`, readFileSync(join(reg, f), 'utf8'));
	checked++;
	for (const x of findings) fail(formatFinding(x));
}

if (!process.argv.includes('--no-tsc') && !errors.length) {
	try {
		execFileSync(join(root, 'node_modules', '.bin', 'vue-tsc'), ['--noEmit', '-p', join(root, 'tsconfig.registry.json')], { cwd: root, stdio: 'pipe' });
	} catch (error) {
		const e = error as { stdout?: Buffer; stderr?: Buffer };
		fail(`vue-tsc:\n${e.stdout?.toString() ?? ''}${e.stderr?.toString() ?? ''}`);
	}
}

if (errors.length) {
	console.error(`registry: ${errors.length} problem(s)\n${errors.map((e) => `  ${e}`).join('\n')}`);
	process.exit(1);
}
console.log(`registry: ${docs.length} items, ${checked} files checked, written to apps/www/public/r`);
