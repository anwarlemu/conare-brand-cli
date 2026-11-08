import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { brand } from '../lib/brand.js';

// What kind of Vue app a folder is, where its source and stylesheet live, and how it installs packages.

export type Project = {
	root: string;
	framework: 'nuxt' | 'vite-vue' | 'unknown';
	srcDir: string;
	publicDir: string;
	alias: boolean;
	packageManager: 'bun' | 'pnpm' | 'yarn' | 'npm';
	/** The folder that holds the lockfile (the workspace root in a monorepo). */
	installRoot: string;
	css?: string;
	pkg: Record<string, any>;
	/** Tailwind's major version, from the installed package or the declared range. */
	tailwind?: number;
	/** tailwind-merge (or shadcn's cn package) merges the app's classes: brand sizes go in a form it keeps. */
	merge: boolean;
	typescript: boolean;
};

const LOCKS: [string, Project['packageManager']][] = [['bun.lock', 'bun'], ['bun.lockb', 'bun'], ['pnpm-lock.yaml', 'pnpm'], ['yarn.lock', 'yarn'], ['package-lock.json', 'npm']];

function readJson(path: string) {
	try {
		return JSON.parse(readFileSync(path, 'utf8'));
	} catch {
		return undefined;
	}
}

/** The installed major version of a package, read from node_modules up the tree, else from the declared range. */
function majorOf(root: string, name: string, declared?: string): number | undefined {
	for (let dir = root; ; dir = dirname(dir)) {
		const pkg = readJson(join(dir, 'node_modules', name, 'package.json'));
		if (pkg?.version) return Number(String(pkg.version).split('.')[0]);
		if (dirname(dir) === dir) break;
	}
	const m = declared?.match(/(\d+)/);
	return m ? Number(m[1]) : undefined;
}

export function readProject(root: string): Project {
	const pkg = readJson(join(root, 'package.json')) ?? {};
	const deps: Record<string, string> = { ...pkg.dependencies, ...pkg.devDependencies };
	const nuxtConfig = ['nuxt.config.ts', 'nuxt.config.js', 'nuxt.config.mjs'].find((f) => existsSync(join(root, f)));
	const framework = deps.nuxt || nuxtConfig ? 'nuxt' : deps.vue ? 'vite-vue' : 'unknown';
	// Nuxt 4 keeps the app in app/; Nuxt 3 at the root; Vite in src/.
	const srcDir = framework === 'nuxt' ? (existsSync(join(root, 'app')) ? 'app' : '.') : existsSync(join(root, 'src')) ? 'src' : '.';
	const tsconfigs = ['tsconfig.json', 'tsconfig.app.json', 'jsconfig.json'].map((f) => join(root, f)).filter((f) => existsSync(f));
	const viteConfig = ['vite.config.ts', 'vite.config.js', 'vite.config.mjs', 'vite.config.mts'].map((f) => join(root, f)).find((f) => existsSync(f));
	const alias = framework === 'nuxt' || tsconfigs.some((f) => /"@\/\*"/.test(readFileSync(f, 'utf8'))) || (!!viteConfig && /['"]@['"]\s*:/.test(readFileSync(viteConfig, 'utf8')));
	// A monorepo keeps one lockfile at the workspace root: install there, with its manager.
	let packageManager: Project['packageManager'] = 'npm';
	let installRoot = root;
	for (let dir = root; ; dir = dirname(dir)) {
		const lock = LOCKS.find(([f]) => existsSync(join(dir, f)));
		if (lock) {
			packageManager = lock[1];
			installRoot = dir;
			break;
		}
		if (dirname(dir) === dir || existsSync(join(dir, '.git'))) break;
	}
	if (installRoot === root && !LOCKS.some(([f]) => existsSync(join(root, f)))) {
		const declared = String(pkg.packageManager ?? '').split('@')[0];
		if (declared === 'bun' || declared === 'pnpm' || declared === 'yarn') packageManager = declared;
	}
	let css: string | undefined;
	if (nuxtConfig) {
		const m = readFileSync(join(root, nuxtConfig), 'utf8').match(/css\s*:\s*\[\s*['"]([^'"]+)['"]/);
		if (m) css = m[1].replace(/^[~@]{1,2}\//, `${srcDir === '.' ? '' : `${srcDir}/`}`);
	}
	css ??= [`${srcDir}/assets/css/main.css`, `${srcDir}/assets/main.css`, `${srcDir}/style.css`, `${srcDir}/assets/css/tailwind.css`, `${srcDir}/assets/index.css`, `${srcDir}/index.css`, `${srcDir}/main.css`, `${srcDir}/app.css`].map((p) => p.replace(/^\.\//, '')).find((p) => existsSync(join(root, p)));
	// A Vite app's stylesheet is the one main.ts imports with Tailwind in it.
	if (framework === 'vite-vue') {
		for (const entry of ['main.ts', 'main.js']) {
			const file = join(root, srcDir, entry);
			if (!existsSync(file)) continue;
			for (const m of readFileSync(file, 'utf8').matchAll(/import\s+['"](\.{1,2}\/[^'"]+\.css)['"]/g)) {
				const rel = join(srcDir, m[1]).replace(/^\.\//, '');
				if (existsSync(join(root, rel)) && /@import\s+["']tailwindcss|@tailwind\s/.test(readFileSync(join(root, rel), 'utf8'))) css = rel;
			}
		}
	}
	const tailwind = majorOf(root, 'tailwindcss', deps.tailwindcss ?? deps['@tailwindcss/vite']);
	return { root, framework, srcDir, publicDir: 'public', alias, packageManager, installRoot, css, pkg, tailwind, merge: !!(deps['tailwind-merge'] || deps.cn || deps['tailwind-variants']), typescript: tsconfigs.some((f) => f.endsWith('.json') && !f.endsWith('jsconfig.json')) || existsSync(join(root, 'tsconfig.json')) };
}

/** What stops the design system working here, with the fix; undefined when it can be installed. */
export function unsupported(project: Project): string | undefined {
	const b = brand();
	if (project.framework === 'unknown') {
		const pkg = project.pkg;
		const deps = { ...pkg.dependencies, ...pkg.devDependencies };
		const what = deps.react ? 'a React app' : deps.svelte ? 'a Svelte app' : deps['@angular/core'] ? 'an Angular app' : existsSync(join(project.root, 'package.json')) ? 'not a Vue app (no vue or nuxt in package.json)' : 'not an app folder (no package.json)';
		return `${project.root} is ${what}. ${b.name}'s components are Vue 3.5 single-file components: run ${b.bin} in a Nuxt 4 or Vite + Vue app (or pass --cwd <app folder>).`;
	}
	if (!project.tailwind) return `Tailwind CSS is not installed. ${b.name}'s theme is a Tailwind 4 theme: install it first (${project.packageManager} ${project.packageManager === 'npm' ? 'install -D' : 'add -d'} tailwindcss @tailwindcss/vite), add tailwindcss() to the Vite plugins (Nuxt: vite.plugins in nuxt.config) and @import "tailwindcss" in your main stylesheet.`;
	if (project.tailwind < 4) return `This app is on Tailwind CSS ${project.tailwind}. ${b.name}'s theme needs Tailwind 4 (@theme, @utility): upgrade first with \`npx @tailwindcss/upgrade\`, then run ${b.bin} again. Nothing was written.`;
	return undefined;
}
