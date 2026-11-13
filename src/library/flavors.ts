import { existsSync, readFileSync } from 'node:fs';
import { join, posix } from 'node:path';
import { brand } from '../lib/brand.js';
import { type Flavor, type Project, flavorOf } from './project.js';
import { type RegistryItem, readModule } from './registry.js';

// The library in the flavor an app takes (Vue for Vue and Nuxt, React for React apps, web components for everything
// else), and where each flavor's files land in the app, with their library imports made to resolve there.

export const FLAVORS: Flavor[] = ['vue', 'react', 'elements'];

export function chooseFlavor(project: Project | undefined, override?: string): Flavor {
	if (override) {
		const f = override.toLowerCase().replace(/^web-?components?$|^wc$|^custom-?elements$/, 'elements');
		if (!FLAVORS.includes(f as Flavor)) throw new Error(`--framework takes vue, react or elements (web components), not \`${override}\`.`);
		return f as Flavor;
	}
	return project ? flavorOf(project.framework) : 'vue';
}

/** The app's import alias for its source folder (`@/` in Vite, Next and Nuxt; `~/` in React Router), if it has one. */
export function aliasOf(project: Project): string | undefined {
	if (project.framework === 'nuxt') return '@/';
	if (project.framework === 'sveltekit') return '$lib/';
	const src = project.srcDir === '.' ? '' : project.srcDir;
	for (const f of ['tsconfig.json', 'tsconfig.app.json', 'jsconfig.json']) {
		let text = '';
		try {
			text = readFileSync(join(project.root, f), 'utf8');
		} catch {
			continue;
		}
		for (const m of text.matchAll(/"([@~#$][\w-]*\/)\*"\s*:\s*\[\s*"\.?\/?([^"*]*)\*?"/g)) {
			const target = m[2].replace(/\/$/, '');
			if (target === src || (target === '' && src === '')) return m[1];
		}
	}
	return project.alias ? '@/' : undefined;
}

/** A library-relative path (`components/ui/Button.vue`) as an import from one placed file to another. */
function relativeSpec(fromPlaced: string, toPlaced: string) {
	let rel = posix.relative(posix.dirname(fromPlaced), toPlaced);
	if (!rel.startsWith('.')) rel = `./${rel}`;
	return rel;
}

/** A Vue library file as `add` writes it into this app (the `@/` imports made relative when the app has no alias). */
export function localContent(project: Project, path: string, content: string) {
	if (project.alias) return content;
	return content.replace(/(['"])(@\/[^'"]+)\1/g, (_, q: string, spec: string) => `${q}${relativeSpec(path, spec.slice(2))}${q}`);
}

const srcJoin = (project: Project, path: string) => (project.srcDir === '.' ? path : posix.join(project.srcDir, path));

/** Where a React file goes: its target, else the app's source folder without the library's `react/` prefix. */
export const reactPath = (project: Project, f: { path: string; target?: string }) => f.target ?? srcJoin(project, f.path.replace(/^(registry\/)?react\//, ''));

/** A React library file as written into this app: `@/react/...` imports through the app's alias, else relative. */
export function reactContent(project: Project, item: { path: string; target?: string }, content: string, siblings: { path: string; target?: string }[] = []) {
	const alias = aliasOf(project);
	const here = reactPath(project, item);
	return content.replace(/(['"])@\/react\/([^'"]+)\1/g, (_, q: string, rest: string) => {
		const sib = siblings.find((s) => s.path.replace(/^(registry\/)?react\//, '').replace(/\.(tsx|ts|jsx|js)$/, '') === rest.replace(/\.(tsx|ts|jsx|js)$/, ''));
		if (!sib?.target && alias && alias !== '$lib/') return `${q}${alias}${rest}${q}`;
		const to = sib ? reactPath(project, sib).replace(/\.(tsx|ts|jsx|js)$/, '') : srcJoin(project, rest);
		return `${q}${relativeSpec(here, to)}${q}`;
	});
}

/** The folder web component modules are copied to, and the URL they are served at. */
export function elementsDir(project: Project) {
	const base = brand().assetBase.replace(/^\//, '');
	const publicRoot = project.publicDir === '.' ? '' : `${project.publicDir}/`;
	return { dir: `${publicRoot}${base}/elements`, url: `${project.publicUrl}/${base}/elements` };
}

export type Placed = { path: string; content: string; library: string };

/** An item's files as they land in this app, in a flavor (web components: the prebuilt modules and what they import). */
export async function placedFiles(project: Project, items: RegistryItem[], flavor: Flavor): Promise<Placed[]> {
	const out: Placed[] = [];
	if (flavor === 'vue') {
		for (const item of items) for (const f of item.files) out.push({ path: srcJoin(project, f.path), content: localContent(project, f.path, f.content), library: f.path });
		return out;
	}
	if (flavor === 'react') {
		const all = items.flatMap((i) => i.flavors?.react?.files ?? []);
		for (const f of all) out.push({ path: reactPath(project, f), content: reactContent(project, f, f.content, all), library: f.path });
		return out;
	}
	const { dir } = elementsDir(project);
	const seen = new Set<string>();
	const queue = items.flatMap((i) => i.flavors?.elements?.modules ?? []);
	while (queue.length) {
		const mod = queue.shift()!.replace(/^\/+/, '');
		if (seen.has(mod)) continue;
		seen.add(mod);
		const content = await readModule(mod);
		const name = mod.replace(/^elements\//, '');
		out.push({ path: posix.join(dir, name), content, library: mod });
		// Its shared chunk and the modules it imports come too.
		for (const m of content.matchAll(/(?:\bimport\s*(?:[\w*{}\s,]+\s*from\s*)?|\bimport\s*\(\s*|\bexport\s*[\w*{}\s,]+\s*from\s*)['"](\.{1,2}\/[^'"]+)['"]/g)) queue.push(posix.normalize(posix.join(posix.dirname(mod), m[1])));
	}
	return out;
}

/** The lines a page needs to use web components, for the modules of the named items. */
export function scriptLines(project: Project, items: RegistryItem[]) {
	const { url } = elementsDir(project);
	return items.flatMap((i) => (i.flavors?.elements?.modules ?? []).filter((m) => !/(chunk|shared|lib)[-./]/.test(m.split('/').pop() ?? '')).slice(0, 1).map((m) => `<script type="module" src="${url}/${m.replace(/^\/?elements\//, '')}"></script>`));
}

export const present = (root: string, rel: string) => existsSync(join(root, rel));
