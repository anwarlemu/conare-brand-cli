import { resolve } from 'node:path';
import { brand } from './lib/brand.js';
import { formatFinding, runCheck } from './check/engine.js';
import { add } from './commands/add.js';
import { init } from './commands/init.js';
import { findTokens, list } from './commands/small.js';

const HELP = () => `${brand().name} design system (${brand().bin})

Usage:
  ${brand().bin} list [--json]                 Every component, with what it requires
  ${brand().bin} add <item...> [options]       Copy items and their dependencies into the app, install packages
      --dry-run   show the writes only      --overwrite   replace files that differ
      --no-install  skip the package install
  ${brand().bin} init [--dry-run]              Install the brand stylesheet, theme, fonts and agent contract
  ${brand().bin} check [paths...] [--json] [--fix]
                                        Flag raw colors, radii, sizes and durations off the tokens,
                                        transition-all, ease-in, shadows and other icon packs
  ${brand().bin} tokens [term...] [--json]     Find tokens by name or value

Common options: --cwd <dir> (default: the current folder), --json (machine output on stdout).
Registry: ${brand().registryUrl}/r/index.json`;

function parse(argv: string[]) {
	const flags: Record<string, string | boolean> = {};
	const rest: string[] = [];
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === '--cwd') flags.cwd = argv[++i];
		else if (a.startsWith('--no-')) flags[a.slice(5)] = false;
		else if (a.startsWith('--')) flags[a.slice(2)] = true;
		else rest.push(a);
	}
	return { command: rest[0], args: rest.slice(1), flags };
}

async function main() {
	const { command, args, flags } = parse(process.argv.slice(2));
	const cwd = resolve(typeof flags.cwd === 'string' ? flags.cwd : process.cwd());
	const json = flags.json === true;
	const out = (value: unknown, text: string) => console.log(json ? JSON.stringify(value, null, 2) : text);
	switch (command) {
		case 'list': {
			const items = await list();
			out({ items }, items.map((i) => `${i.name.padEnd(18)} ${i.group.padEnd(12)} ${i.description}`).join('\n'));
			return;
		}
		case 'add': {
			if (!args.length) throw new Error(`Name at least one item: ${brand().bin} add button`);
			const r = await add(cwd, args, { dryRun: flags['dry-run'] === true, overwrite: flags.overwrite === true, install: flags.install !== false });
			out(r, [`${flags['dry-run'] ? 'Would add' : 'Added'} ${r.items.join(', ')}`, ...r.written.map((w) => `  + ${w}`), ...(r.packages.length ? [`Packages: ${r.packages.join(', ')}${r.installed ? ' (installed)' : ''}`] : []), ...r.warnings.map((w) => `warning: ${w}`)].join('\n'));
			return;
		}
		case 'init': {
			const r = init(cwd, { dryRun: flags['dry-run'] === true });
			out({ framework: r.project.framework, writes: r.writes, warnings: r.warnings }, [`${r.project.framework} app at ${cwd}`, ...r.writes.map((w) => `  + ${w}`), ...r.warnings.map((w) => `warning: ${w}`)].join('\n'));
			return;
		}
		case 'check': {
			const r = runCheck(cwd, { paths: args, fix: flags.fix === true });
			out(r, [...r.findings.map(formatFinding), `${r.files} files, ${r.findings.length} findings${r.fixed ? `, ${r.fixed} fixed` : ''} (${r.ms}ms)`].join('\n'));
			if (r.findings.length) process.exitCode = 1;
			return;
		}
		case 'tokens': {
			const t = findTokens(args);
			out({ tokens: t }, t.map((x) => `${x.name.padEnd(40)} ${x.light}${x.dark !== x.light ? `  (dark ${x.dark})` : ''}`).join('\n'));
			return;
		}
		default:
			console.log(HELP());
			if (command && command !== 'help' && command !== '--help') process.exitCode = 1;
	}
}

main().catch((error) => {
	console.error(`${brand().bin}: ${(error as Error).message}`);
	process.exitCode = 1;
});
