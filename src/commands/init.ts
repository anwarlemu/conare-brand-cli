import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { brand, packageRoot } from '../lib/brand.js';
import { readProject, unsupported } from '../library/project.js';
import type { Project } from '../library/project.js';

// init: the brand stylesheet and theme beside the app's main stylesheet, the fonts and textures in its public folder,
// and the agent contract. It changes no component and no copy.

export type InitResult = { project: Project; writes: string[]; warnings: string[] };

const START = '<!-- ds:contract:start -->';
const END = '<!-- ds:contract:end -->';

const fill = (text: string) => text.replaceAll('{{brand}}', brand().name).replaceAll('{{cli}}', `npx ${brand().bin}`).replaceAll('{{bin}}', brand().bin).replaceAll('{{registry}}', brand().registryUrl).replaceAll('{{source}}', brand().source);

export function init(root: string, opts: { dryRun?: boolean } = {}): InitResult {
	const project = readProject(root);
	const writes: string[] = [];
	const warnings: string[] = [];
	const write = (rel: string, content: string) => {
		// Unchanged files are not rewritten (or reported), so a second run changes nothing.
		if (existsSync(join(root, rel)) && readFileSync(join(root, rel), 'utf8') === content) return;
		writes.push(rel);
		if (opts.dryRun) return;
		mkdirSync(dirname(join(root, rel)), { recursive: true });
		writeFileSync(join(root, rel), content);
	};
	const build = join(packageRoot, 'build');
	if (!existsSync(join(build, 'brand.css'))) throw new Error('build/ is missing: run the package build first');
	// Nothing is written where the theme cannot work: a clear message with the fix instead of a half-set-up app.
	const problem = unsupported(project);
	if (problem) throw new Error(problem);

	// The stylesheet.
	const css = project.css ?? `${project.srcDir === '.' ? '' : `${project.srcDir}/`}assets/css/main.css`;
	if (!project.css) warnings.push(`No main stylesheet found: created ${css}. Nuxt: add it to \`css\` in nuxt.config; Vite: import it in main.ts.`);
	const dsDir = join(dirname(css), brand().bin);
	write(join(dsDir, 'brand.css'), readFileSync(join(build, 'brand.css'), 'utf8'));
	write(join(dsDir, 'theme.css'), readFileSync(join(build, 'theme.css'), 'utf8'));
	const current = existsSync(join(root, css)) ? readFileSync(join(root, css), 'utf8') : '';
	const imports = [`@import "./${brand().bin}/brand.css";`, `@import "./${brand().bin}/theme.css";`];
	if (!imports.every((l) => current.includes(l))) {
		let next = current.replace(/^\s*@import\s+["']\.\/[\w-]+\/(brand|theme)\.css["'];\s*\n?/gm, '');
		const tw = next.match(/@import\s+["']tailwindcss["'][^;]*;\n?/);
		if (tw) next = next.replace(tw[0], `${tw[0].trimEnd()}\n${imports.join('\n')}\n`);
		else next = `@import "tailwindcss";\n${imports.join('\n')}\n${next}`;
		// Tailwind scans the app's own files; the installed components live there too.
		write(css, next);
	}

	// Fonts and textures, served at the brand's asset base.
	const assets = join(project.publicDir, brand().assetBase.replace(/^\//, ''));
	for (const sub of ['fonts', 'textures']) {
		const fresh = readdirSync(join(build, sub)).some((f) => !existsSync(join(root, assets, sub, f)));
		if (!fresh) continue;
		writes.push(join(assets, sub));
		if (!opts.dryRun) cpSync(join(build, sub), join(root, assets, sub), { recursive: true });
	}

	// Agent contract and guide.
	const guide = fill(readFileSync(join(packageRoot, 'brand', 'agent-guide.md'), 'utf8'));
	write('.ds/agent-guide.md', guide);
	const contract = fill(readFileSync(join(packageRoot, 'brand', 'contract.md'), 'utf8')).trim();
	const agents = existsSync(join(root, 'AGENTS.md')) ? readFileSync(join(root, 'AGENTS.md'), 'utf8') : '';
	const blockText = `${START}\n${contract}\n${END}`;
	const nextAgents = agents.includes(START) ? agents.replace(new RegExp(`${START}[\\s\\S]*?${END}`), blockText) : `${agents ? `${agents.trimEnd()}\n\n` : ''}${blockText}\n`;
	if (nextAgents !== agents) write('AGENTS.md', nextAgents);
	return { project, writes: writes.map((w) => relative('.', w) || w), warnings };
}
