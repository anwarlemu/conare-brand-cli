import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { brand } from '../lib/brand.js';
import { type Flavor, type Project, readProject, unsupported } from '../library/project.js';
import { chooseFlavor, flavorProblem, placedFiles, scriptLines } from '../library/flavors.js';
import { flavorsOf, resolveItems } from '../library/registry.js';
import { init } from './init.js';
import { resolveNames } from './library.js';

// add: copies items and everything they require into the app in its flavor (Vue, React, or web components), makes
// their library imports resolve there, installs the npm packages they import with the app's manager and installs the
// brand stylesheet once. Web components are prebuilt modules: copied into the static folder, with the line to load them.

export type AddResult = { items: string[]; flavor: Flavor; written: string[]; kept: string[]; packages: string[]; installed: boolean; warnings: string[]; notes: string[]; scripts: string[] };

export async function add(root: string, names: string[], opts: { dryRun?: boolean; overwrite?: boolean; install?: boolean; framework?: string } = {}): Promise<AddResult> {
	const project: Project = readProject(root);
	const problem = unsupported(project);
	if (problem) throw new Error(problem);
	const flavor = chooseFlavor(project, opts.framework);
	const stop = flavorProblem(project, flavor);
	if (stop) throw new Error(stop);
	// Names as typed: Button, alert-dialog, AlertDialog, badge (an alias); every one resolves before anything is written.
	const resolved = await resolveNames(names);
	const notes = resolved.filter((r) => r.via).map((r) => r.via!);
	const items = await resolveItems(resolved.map((r) => r.name), flavor);
	const missing = items.filter((i) => !flavorsOf(i).includes(flavor));
	if (missing.length) throw new Error(`${missing.map((i) => i.name).join(', ')} ${missing.length === 1 ? 'has' : 'have'} no ${flavor === 'elements' ? 'web component' : flavor === 'react' ? 'React' : 'Vue'} version in this registry yet. Nothing was written. ${flavor === 'vue' ? '' : `Pass --framework ${flavor === 'react' ? 'elements' : 'vue'} for another flavor, or update the package.`}`.trim());
	const written: string[] = [];
	const kept: string[] = [];
	const warnings: string[] = [];
	for (const f of await placedFiles(project, items, flavor)) {
		const abs = join(root, f.path);
		if (existsSync(abs) && !opts.overwrite) {
			if (readFileSync(abs, 'utf8') !== f.content) kept.push(f.path);
			continue;
		}
		written.push(f.path);
		if (!opts.dryRun) {
			mkdirSync(dirname(abs), { recursive: true });
			writeFileSync(abs, f.content);
		}
	}
	if (kept.length) warnings.push(`Kept ${kept.length} local file(s) that differ from the library; pass --overwrite to replace them.`);

	// npm packages: Vue and React flavors import them; prebuilt web components carry their own.
	const have = { ...project.pkg.dependencies, ...project.pkg.devDependencies };
	const nameOf = (spec: string) => spec.replace(/(.)@.*$/, '$1');
	const wanted = flavor === 'vue' ? items.flatMap((i) => i.dependencies) : flavor === 'react' ? items.flatMap((i) => i.flavors?.react?.dependencies ?? []) : [];
	const packages = [...new Set(wanted)].filter((p) => !have[nameOf(p)]);
	let installed = false;
	if (packages.length && !opts.dryRun && opts.install !== false) {
		if (!project.node) warnings.push(`This app has no package.json: install ${packages.join(', ')} yourself.`);
		else {
			const pm = project.packageManager;
			const args = pm === 'npm' ? ['install', ...packages] : ['add', ...packages];
			// Into the app's own package.json; a monorepo's manager installs from the workspace root's lockfile.
			execFileSync(pm, args, { cwd: root, stdio: ['ignore', 'inherit', 'inherit'] });
			installed = true;
		}
	}
	const scripts = flavor === 'elements' ? scriptLines(project, items) : [];
	if (flavor === 'elements' && project.framework === 'angular') notes.push('Angular: add CUSTOM_ELEMENTS_SCHEMA to the schemas of the components that use them.');

	// The brand stylesheet, once: the components read its tokens.
	const r = await init(root, { dryRun: opts.dryRun });
	written.push(...r.writes);
	warnings.push(...r.warnings.filter((w) => !written.includes(w)));
	return { items: items.map((i) => i.name), flavor, written, kept, packages, installed, warnings, notes, scripts };
}

export const flavorLabel = (f: Flavor) => (f === 'elements' ? 'web components' : f === 'react' ? 'React' : 'Vue');
export const brandBin = () => brand().bin;
