import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// What kind of Vue app a folder is, where its source and stylesheet live, and how it installs packages.

export type Project = { root: string; framework: 'nuxt' | 'vite-vue' | 'unknown'; srcDir: string; publicDir: string; alias: boolean; packageManager: 'bun' | 'pnpm' | 'yarn' | 'npm'; css?: string; pkg: Record<string, any> };

export function readProject(root: string): Project {
	const pkg = existsSync(join(root, 'package.json')) ? JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) : {};
	const deps = { ...pkg.dependencies, ...pkg.devDependencies };
	const nuxtConfig = ['nuxt.config.ts', 'nuxt.config.js', 'nuxt.config.mjs'].find((f) => existsSync(join(root, f)));
	const framework = deps.nuxt || nuxtConfig ? 'nuxt' : deps.vue ? 'vite-vue' : 'unknown';
	// Nuxt 4 keeps the app in app/; Nuxt 3 at the root; Vite in src/.
	const srcDir = framework === 'nuxt' ? (existsSync(join(root, 'app')) ? 'app' : '.') : existsSync(join(root, 'src')) ? 'src' : '.';
	const tsconfig = ['tsconfig.json', 'tsconfig.app.json', 'jsconfig.json'].map((f) => join(root, f)).find(existsSync);
	const alias = framework === 'nuxt' || (!!tsconfig && /"@\/\*"/.test(readFileSync(tsconfig, 'utf8')));
	const packageManager = existsSync(join(root, 'bun.lock')) || existsSync(join(root, 'bun.lockb')) ? 'bun' : existsSync(join(root, 'pnpm-lock.yaml')) ? 'pnpm' : existsSync(join(root, 'yarn.lock')) ? 'yarn' : 'npm';
	let css: string | undefined;
	if (nuxtConfig) {
		const m = readFileSync(join(root, nuxtConfig), 'utf8').match(/css\s*:\s*\[\s*['"]([^'"]+)['"]/);
		if (m) css = m[1].replace(/^[~@]{1,2}\//, `${srcDir === '.' ? '' : `${srcDir}/`}`);
	}
	css ??= [`${srcDir}/assets/css/main.css`, `${srcDir}/assets/main.css`, `${srcDir}/style.css`, `${srcDir}/assets/css/tailwind.css`, `${srcDir}/index.css`].map((p) => p.replace(/^\.\//, '')).find((p) => existsSync(join(root, p)));
	return { root, framework, srcDir, publicDir: 'public', alias, packageManager, css, pkg };
}
