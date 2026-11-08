import { resolve } from 'node:path';
import { brand } from './lib/brand.js';
import { formatFinding, runCheck } from './check/engine.js';
import { add } from './commands/add.js';
import { apply, formatApply, readState } from './commands/apply.js';
import { init } from './commands/init.js';
import { diff, formatInfo, formatView, info, search, view } from './commands/library.js';
import { findTokens, list } from './commands/small.js';

const HELP = () => {
	const b = brand().bin;
	const row = (cmd: string, what: string) => `  ${`${b} ${cmd}`.padEnd(44)}${what}`;
	const more = (text: string) => `      ${text}`;
	return [
		`${brand().name} design system (${b})`,
		'',
		'Restyle an app:',
		row('apply', "The whole app: style values to the brand's tokens, the library's look on buttons,"),
		`  ${''.padEnd(44)}fields, cards, dialogs, tables...; theme and fonts installed`,
		row('apply button card dialog', "Only those kinds, wherever the app uses them (its components and elements)"),
		row('apply /settings /billing', 'Only those pages (by route), with the components only they use'),
		row('apply app/pages/settings.vue', 'Pages by file (or a glob in quotes); an app component by name (PrimaryButton)'),
		row('apply --components button,card --pages /settings', ''),
		more('--with-shared  include layouts and components other pages share'),
		more('--dry-run [--json]  list every file it would touch and why, write nothing'),
		more('--redo  repeat the recorded scope (.ds/state.json)'),
		'',
		'Use the library:',
		row('add <item...>', 'Copy items (Button, alert-dialog, badge...) and what they need into the app'),
		more('--dry-run   --overwrite (replace files that differ)   --no-install (skip packages)'),
		row('view <item...> [--source]', 'How to use an item: rules, props, slots, events, examples, source'),
		row('search <words>', 'Find items by what they do'),
		row('list', 'Every item, with what it requires'),
		row('diff <item...>', "Your copy of an item against the library's"),
		'',
		'The app:',
		row('info', "The app's setup, installed items, applied scope and what to run next"),
		row('init', 'The brand stylesheet, theme, fonts and agent contract only'),
		row('check [paths...] [--fix] [--all]', 'Values off the tokens (the applied scope; --all for every file)'),
		row('tokens [term...]', 'Find tokens by name or value'),
		'',
		'Common options: --cwd <dir> (default: the current folder), --json (machine output on stdout).',
		`Registry: ${brand().registryUrl}/r/index.json`,
	].join('\n');
};

const VALUE_FLAGS = new Set(['cwd', 'components', 'pages']);

export function parse(argv: string[]) {
	const flags: Record<string, string | boolean> = {};
	const rest: string[] = [];
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		const eq = a.match(/^--([\w-]+)=(.*)$/);
		if (eq) flags[eq[1]] = eq[2];
		else if (a.startsWith('--') && VALUE_FLAGS.has(a.slice(2))) flags[a.slice(2)] = argv[++i] ?? '';
		else if (a === '-h') flags.help = true;
		else if (a.startsWith('--no-')) flags[a.slice(5)] = false;
		else if (a.startsWith('--')) flags[a.slice(2)] = true;
		else rest.push(a);
	}
	return { command: rest[0], args: rest.slice(1), flags };
}

const listFlag = (v: string | boolean | undefined) => (typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : undefined);

// The flags each command takes; anything else is a mistake to report, not to ignore (a typo would widen an apply).
const COMMON = ['cwd', 'json', 'help'];
const FLAGS: Record<string, string[]> = {
	list: [],
	add: ['dry-run', 'overwrite', 'install'],
	apply: ['components', 'pages', 'with-shared', 'dry-run', 'redo'],
	view: ['source', 'full'],
	show: ['source', 'full'],
	search: [],
	info: [],
	diff: [],
	init: ['dry-run'],
	check: ['fix', 'all'],
	tokens: [],
};

async function main() {
	const { command, args, flags } = parse(process.argv.slice(2));
	const known = command ? FLAGS[command] : undefined;
	if (known) {
		const bad = Object.keys(flags).filter((f) => !COMMON.includes(f) && !known.includes(f));
		if (bad.length) throw new Error(`Unknown option${bad.length > 1 ? 's' : ''} for ${command}: ${bad.map((f) => `--${f}`).join(', ')}. ${brand().bin} ${command} takes ${[...known, ...COMMON].map((f) => `--${f}`).join(', ')}.`);
	}
	const cwd = resolve(typeof flags.cwd === 'string' ? flags.cwd : process.cwd());
	const json = flags.json === true;
	const out = (value: unknown, text: string) => console.log(json ? JSON.stringify(value, null, 2) : text);
	if (flags.help && command) {
		console.log(HELP());
		return;
	}
	switch (command) {
		case 'list': {
			const items = await list();
			out({ items }, items.map((i) => `${i.name.padEnd(22)} ${i.group.padEnd(12)} ${i.description}`).join('\n'));
			return;
		}
		case 'add': {
			if (!args.length) throw new Error(`Name at least one item: ${brand().bin} add button (\`${brand().bin} search <words>\` finds one)`);
			const r = await add(cwd, args, { dryRun: flags['dry-run'] === true, overwrite: flags.overwrite === true, install: flags.install !== false });
			out(r, [...r.notes.map((n) => `note: ${n}`), `${flags['dry-run'] ? 'Would add' : 'Added'} ${r.items.join(', ')}`, ...r.written.map((w) => `  + ${w}`), ...(r.packages.length ? [`Packages: ${r.packages.join(', ')}${r.installed ? ' (installed)' : ''}`] : []), ...r.warnings.map((w) => `warning: ${w}`), ...(flags['dry-run'] ? [] : [`How to use: ${brand().bin} view ${r.items[r.items.length - 1]}`])].join('\n'));
			return;
		}
		case 'apply': {
			const r = await apply(cwd, { targets: args, components: listFlag(flags.components), pages: listFlag(flags.pages), withShared: flags['with-shared'] === true, dryRun: flags['dry-run'] === true, redo: flags.redo === true });
			out({ scope: r.scope, files: r.files.map((f) => ({ file: f.file, reason: f.reason, changes: f.changes })), skipped: r.skipped, sharedLeftOut: r.sharedLeftOut, setup: r.setup, warnings: r.warnings, dryRun: r.dryRun, state: r.dryRun ? undefined : r.state }, formatApply(r));
			return;
		}
		case 'view':
		case 'show': {
			if (!args.length) throw new Error(`Name an item: ${brand().bin} view button`);
			const v = await view(cwd, args);
			out({ items: v }, v.map((x) => formatView(x, flags.source === true || flags.full === true)).join('\n\n'));
			return;
		}
		case 'search': {
			if (!args.length) throw new Error(`Say what you are looking for: ${brand().bin} search date picker`);
			const r = await search(args);
			out({ results: r }, r.length ? r.map((x) => `${x.name.padEnd(22)} ${x.group.padEnd(11)} ${x.description}`).join('\n') : `Nothing matches. \`${brand().bin} list\` shows every item.`);
			return;
		}
		case 'info': {
			const r = await info(cwd);
			out(r, formatInfo(r));
			return;
		}
		case 'diff': {
			if (!args.length) throw new Error(`Name an item: ${brand().bin} diff button`);
			const r = await diff(cwd, args);
			out({ items: r }, r.map((i) => i.files.map((f) => (f.status === 'changed' ? f.diff : `${f.path}: ${f.status === 'same' ? 'same as the library' : `not in this app (${brand().bin} add ${i.name})`}`)).join('\n')).join('\n'));
			if (r.some((i) => i.files.some((f) => f.status === 'changed'))) process.exitCode = 1;
			return;
		}
		case 'init': {
			const r = init(cwd, { dryRun: flags['dry-run'] === true });
			out({ framework: r.project.framework, writes: r.writes, warnings: r.warnings }, [`${r.project.framework} app at ${cwd}`, ...r.writes.map((w) => `  + ${w}`), ...r.warnings.map((w) => `warning: ${w}`)].join('\n'));
			return;
		}
		case 'check': {
			// With an applied scope, the check enforces the brand on that scope only, so a partial adoption passes.
			const state = readState(cwd);
			const scoped = !args.length && flags.all !== true && state && !state.whole;
			const r = runCheck(cwd, { paths: scoped ? state.checked : args, fix: flags.fix === true });
			const note = scoped ? ' in the applied scope (--all checks every file)' : '';
			const n = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;
			out({ ...r, scope: scoped ? state.checked : undefined }, [...r.findings.map(formatFinding), `${n(r.files, 'file')}${note}, ${n(r.findings.length, 'finding')}${r.fixed ? `, ${r.fixed} fixed` : ''} (${r.ms}ms)`].join('\n'));
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
			if (command && command !== 'help' && command !== '--help') {
				console.error(`\nUnknown command \`${command}\`.`);
				process.exitCode = 1;
			}
	}
}

main().catch((error) => {
	console.error(`${brand().bin}: ${(error as Error).message}`);
	process.exitCode = 1;
});
