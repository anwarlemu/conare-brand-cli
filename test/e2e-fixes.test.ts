import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { elementTypes } from '../src/library/element-types.js';
import { insertLinks } from '../src/install/stylesheets.js';

// Regressions found installing the packed CLI into fresh scaffolds (Next, Vite + React, SvelteKit, Astro, Angular, a
// plain site, Django, Nuxt): each test is one bug.

const bin = join(__dirname, '..', 'bin.js');
const registry = join(__dirname, '..', 'apps', 'www', 'public', 'r');
const env = { ...process.env, DS_REGISTRY_DIR: registry };
const json = (cwd: string, ...args: string[]) => JSON.parse(execFileSync('node', [bin, ...args, '--cwd', cwd, '--json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env }));
function app(files: Record<string, string>) {
	const dir = mkdtempSync(join(tmpdir(), 'conare-e2e-'));
	for (const [rel, text] of Object.entries(files)) {
		mkdirSync(dirname(join(dir, rel)), { recursive: true });
		writeFileSync(join(dir, rel), text);
	}
	return dir;
}
const read = (dir: string, rel: string) => readFileSync(join(dir, rel), 'utf8');
const pkg = (deps: Record<string, string>, dev: Record<string, string> = {}) => JSON.stringify({ name: 'acme', private: true, dependencies: deps, devDependencies: dev });
const has = existsSync(join(registry, 'menu.json')) && JSON.parse(readFileSync(join(registry, 'menu.json'), 'utf8')).flavors?.elements;

describe.skipIf(!has)('web components in apps', () => {
	it('loads every element an item defines (a menu needs menu-item.js too), once each', () => {
		const dir = app({ 'index.html': '<!doctype html><html><head><title>Acme</title></head><body></body></html>\n' });
		const r = json(dir, 'add', 'menu', 'dialog');
		const srcs = r.scripts.map((l: string) => l.match(/src="([^"]+)"/)![1]);
		expect(srcs).toEqual(expect.arrayContaining(['/conare-ds/elements/menu.js', '/conare-ds/elements/menu-item.js', '/conare-ds/elements/menu-label.js', '/conare-ds/elements/menu-separator.js', '/conare-ds/elements/dialog.js']));
		expect(new Set(srcs).size).toBe(srcs.length);
		expect(json(dir, 'view', 'menu').items[0].imports.join('\n')).toContain('menu-item.js');
	});

	it('writes types for the tags (React JSX, Svelte, the tag map) and the manifest, and rewrites them on the next add', () => {
		const dir = app({ 'package.json': pkg({ react: '19.2.0', 'react-dom': '19.2.0' }, { vite: '7.0.0', typescript: '5.9.0' }), 'tsconfig.json': '{ "files": [] }', 'index.html': '<!doctype html><html><head></head><body></body></html>\n', 'src/index.css': 'body {}\n', 'src/main.tsx': "import './index.css';\n" });
		json(dir, 'add', 'button', '--no-install');
		const first = read(dir, 'src/conare-ds/elements.d.ts');
		expect(first).toContain("'conare-button': ButtonElement.Button");
		expect(first).toContain("declare module 'react'");
		expect(first).not.toContain('svelte/elements');
		expect(first).toContain('export class Button extends HTMLElement');
		const manifest = JSON.parse(read(dir, 'public/conare-ds/elements/custom-elements.json'));
		expect(manifest.modules.map((m: { path: string }) => m.path)).toContain('elements/button.js');
		expect(manifest.modules.some((m: { path: string }) => m.path === 'elements/menu.js')).toBe(false);
		json(dir, 'add', 'menu', '--no-install');
		const second = read(dir, 'src/conare-ds/elements.d.ts');
		expect(second).toContain("'conare-button'");
		expect(second).toContain("'conare-menu-item'");
		const svelte = app({ 'package.json': pkg({}, { '@sveltejs/kit': '2.0.0', svelte: '5.0.0', typescript: '5.9.0' }), 'tsconfig.json': '{}', 'src/app.html': '<html><head></head><body>%sveltekit.body%</body></html>\n' });
		json(svelte, 'add', 'button');
		expect(read(svelte, 'src/conare-ds/elements.d.ts')).toContain("declare module 'svelte/elements'");
	});

	it('the app\'s flavor follows what add installed: a React app without Tailwind views and diffs the web components', () => {
		const dir = app({ 'package.json': pkg({ react: '19.2.0' }, { vite: '7.0.0' }), 'src/index.css': 'body {}\n', 'src/main.tsx': "import './index.css';\n", 'index.html': '<html><head></head><body></body></html>\n' });
		json(dir, 'add', 'button');
		expect(json(dir, 'view', 'button').items[0].flavor).toBe('elements');
		expect(json(dir, 'diff', 'button').items[0].files.every((f: { status: string }) => f.status === 'same')).toBe(true);
		expect(json(dir, 'info').flavor).toBe('elements');
	});

	it('Vue and Nuxt apps that take the elements are told, and set, isCustomElement for the prefix; Angular is told about CUSTOM_ELEMENTS_SCHEMA', () => {
		const nuxt = app({ 'package.json': pkg({ nuxt: '4.0.0', vue: '3.5.0' }), 'nuxt.config.ts': "export default defineNuxtConfig({\n  devtools: { enabled: false },\n})\n", 'app/app.vue': '<template><main /></template>\n' });
		const r = json(nuxt, 'add', 'button', '--framework', 'elements');
		expect(read(nuxt, 'nuxt.config.ts')).toContain("vue: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('conare-') } },");
		expect(r.notes.join(' ')).toContain('app.head.script');
		json(nuxt, 'add', 'tabs', '--framework', 'elements');
		expect(read(nuxt, 'nuxt.config.ts').match(/isCustomElement/g)).toHaveLength(1);
		const vite = app({ 'package.json': pkg({ vue: '3.5.0' }, { vite: '7.0.0', '@vitejs/plugin-vue': '6.0.0' }), 'vite.config.ts': "import vue from '@vitejs/plugin-vue'\nexport default { plugins: [vue()] }\n", 'index.html': '<html><head></head><body></body></html>\n', 'src/main.ts': '' });
		json(vite, 'add', 'button', '--framework', 'elements');
		expect(read(vite, 'vite.config.ts')).toContain("vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('conare-') } } })");
		const ng = app({ 'package.json': pkg({ '@angular/core': '20.0.0' }), 'angular.json': '{}', 'src/index.html': '<html><head></head><body></body></html>\n', 'src/styles.css': '' });
		expect(json(ng, 'add', 'button').notes.join(' ')).toContain('schemas: [CUSTOM_ELEMENTS_SCHEMA]');
	});

	it('view shows a React example with the app\'s imports, not the library\'s @/react paths', () => {
		const dir = app({ 'package.json': pkg({ react: '19.2.0', next: '16.0.0' }, { tailwindcss: '^4.1.0' }), 'tsconfig.json': '{ "compilerOptions": { "paths": { "@/*": ["./*"] } } }', 'app/globals.css': '@import "tailwindcss";\n', 'app/layout.tsx': 'import "./globals.css";\n' });
		const v = json(dir, 'view', 'dialog').items[0];
		expect(v.examples[0].content).toContain("from '@/components/ui/Dialog'");
		expect(v.examples[0].content).not.toContain('@/react/');
	});
});

describe('element types from the registry\'s declaration files', () => {
	it('the types file for every element compiles, strict, with the React hooks and the tag map, and checks props', async () => {
		const ts = (await import('typescript')).default;
		const dir = join(__dirname, '..', 'apps', 'www', 'public', 'elements');
		const modules = readdirSync(dir).filter((f) => f.endsWith('.d.ts')).map((f) => ({ name: f.replace(/\.d\.ts$/, ''), dts: readFileSync(join(dir, f), 'utf8') }));
		const out = mkdtempSync(join(tmpdir(), 'conare-types-'));
		writeFileSync(join(out, 'elements.d.ts'), elementTypes({ pkg: { dependencies: { react: '19.2.0' } }, framework: 'vite-react' }, modules));
		writeFileSync(join(out, 'use.tsx'), "export const a = <conare-button variant=\"dark\" icon>Go</conare-button>\nexport const b = <conare-tabs label=\"x\" options={['a', 'b']} value=\"a\" />\nexport const c: Date | null | undefined = document.querySelector('conare-date-picker')?.value\nexport const d: boolean | undefined = document.querySelector('conare-input')?.checkValidity()\n// @ts-expect-error a variant the button does not have\nexport const e = <conare-button variant=\"nope\">Go</conare-button>\n");
		const program = ts.createProgram([join(out, 'elements.d.ts'), join(out, 'use.tsx')], { strict: true, noEmit: true, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'], typeRoots: [join(__dirname, '..', 'node_modules', '@types')], types: ['react'] });
		expect(ts.getPreEmitDiagnostics(program).map((d) => ts.flattenDiagnosticMessageText(d.messageText, ' '))).toEqual([]);
	});
});

describe('stylesheet links', () => {
	it('before </head>, the links take the indent of the head\'s lines', () => {
		const layout = '<html>\n\t<head>\n\t\t<meta charset="utf-8" />\n\t</head>\n</html>\n';
		expect(insertLinks(layout, ['<link rel="stylesheet" href="/x.css">'])).toBe('<html>\n\t<head>\n\t\t<meta charset="utf-8" />\n\t\t<link rel="stylesheet" href="/x.css">\n\t</head>\n</html>\n');
	});
});
