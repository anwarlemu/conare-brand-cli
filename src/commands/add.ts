import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, posix, relative } from 'node:path';
import { brand } from '../lib/brand.js';
import { type Project, readProject, unsupported } from '../library/project.js';
import { resolveItems } from '../library/registry.js';
import { init } from './init.js';
import { resolveNames } from './library.js';

// add: copies items and everything they require into the app, rewrites the `@/` imports when the app has no `@`
// alias, installs the npm packages they import and installs the theme once.

export type AddResult = { items: string[]; written: string[]; kept: string[]; packages: string[]; installed: boolean; warnings: string[]; notes: string[] };

/** `@/composables/useMenu` as a path relative to `fromFile` (both under srcDir). */
function relativeImport(spec: string, fromFile: string) {
	const target = spec.slice(2);
	let rel = posix.relative(posix.dirname(fromFile), target);
	if (!rel.startsWith('.')) rel = `./${rel}`;
	return rel;
}

export async function add(root: string, names: string[], opts: { dryRun?: boolean; overwrite?: boolean; install?: boolean } = {}): Promise<AddResult> {
	const project: Project = readProject(root);
	const problem = unsupported(project);
	if (problem) throw new Error(problem);
	// Names as typed: Button, alert-dialog, AlertDialog, badge (an alias); every one resolves before anything is written.
	const resolved = await resolveNames(names);
	const notes = resolved.filter((r) => r.via).map((r) => r.via!);
	const items = await resolveItems(resolved.map((r) => r.name));
	const written: string[] = [];
	const kept: string[] = [];
	const warnings: string[] = [];
	const files = new Map<string, string>();
	for (const item of items) for (const f of item.files) files.set(f.path, f.content);
	for (const [path, raw] of files) {
		const content = project.alias ? raw : raw.replace(/(['"])(@\/[^'"]+)\1/g, (_, q, spec) => `${q}${relativeImport(spec, path)}${q}`);
		const rel = project.srcDir === '.' ? path : join(project.srcDir, path);
		const abs = join(root, rel);
		if (existsSync(abs) && !opts.overwrite) {
			if (readFileSync(abs, 'utf8') !== content) kept.push(rel);
			continue;
		}
		written.push(rel);
		if (!opts.dryRun) {
			mkdirSync(dirname(abs), { recursive: true });
			writeFileSync(abs, content);
		}
	}
	if (kept.length) warnings.push(`Kept ${kept.length} local file(s) that differ from the library; pass --overwrite to replace them.`);

	const have = { ...project.pkg.dependencies, ...project.pkg.devDependencies };
	// Dependencies are `name@range`; a package the app already has keeps its version.
	const nameOf = (spec: string) => spec.replace(/(.)@.*$/, '$1');
	const packages = [...new Set(items.flatMap((i) => i.dependencies))].filter((p) => !have[nameOf(p)]);
	let installed = false;
	if (packages.length && !opts.dryRun && opts.install !== false) {
		const pm = project.packageManager;
		const args = pm === 'npm' ? ['install', ...packages] : ['add', ...packages];
		// Into the app's own package.json; a monorepo's manager installs from the workspace root's lockfile.
		execFileSync(pm, args, { cwd: root, stdio: ['ignore', 'inherit', 'inherit'] });
		installed = true;
	}

	// The theme, once: the components read its utilities.
	const css = project.css ? join(root, project.css) : undefined;
	if (!css || !readFileSync(css, 'utf8').includes(`./${brand().bin}/theme.css`)) {
		const r = init(root, { dryRun: opts.dryRun });
		written.push(...r.writes);
		warnings.push(...r.warnings);
	}
	return { items: items.map((i) => i.name), written: written.map((w) => relative('.', w) || w), kept, packages, installed, warnings, notes };
}
