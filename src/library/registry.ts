import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { brand, packageRoot, registryHost } from '../lib/brand.js';

// The registry as built by scripts/build-registry.ts: r/ in the release tree, apps/www/public/r in a checkout.
// Falls back to the published registry (registryUrl/r) when an item is not bundled.

export type RegistryFile = { path: string; content: string };
export type RegistryItem = {
	name: string;
	title: string;
	group: string;
	description: string;
	use_for: string;
	never: string[];
	source: string;
	files: RegistryFile[];
	requires: string[];
	dependencies: string[];
	examples: { name: string; path: string; content: string }[];
};
export type IndexEntry = Omit<RegistryItem, 'files' | 'examples'> & { files: string[]; examples: string[] };

export function registryDir(): string | undefined {
	for (const dir of [join(packageRoot, 'r'), join(packageRoot, 'apps', 'www', 'public', 'r')]) if (existsSync(join(dir, 'index.json'))) return dir;
	return undefined;
}

export async function readIndex(): Promise<IndexEntry[]> {
	const dir = registryDir();
	if (dir) return JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8')).items;
	const res = await fetch(`${registryHost()}/r/index.json`);
	if (!res.ok) throw new Error(`No bundled registry and ${registryHost()}/r/index.json answered ${res.status}`);
	return ((await res.json()) as { items: IndexEntry[] }).items;
}

export async function readItem(name: string): Promise<RegistryItem> {
	const dir = registryDir();
	if (dir && existsSync(join(dir, `${name}.json`))) return JSON.parse(readFileSync(join(dir, `${name}.json`), 'utf8'));
	const res = await fetch(`${registryHost()}/r/${name}.json`);
	if (!res.ok) throw new Error(`Unknown item \`${name}\` (run \`${brand().bin} list\`)`);
	return (await res.json()) as RegistryItem;
}

/** Items with everything they require, required items first. */
export async function resolveItems(names: string[]): Promise<RegistryItem[]> {
	const seen = new Map<string, RegistryItem>();
	const visit = async (name: string, trail: string[]) => {
		if (seen.has(name) || trail.includes(name)) return;
		const item = await readItem(name);
		for (const dep of item.requires) await visit(dep, [...trail, name]);
		seen.set(name, item);
	};
	for (const n of names) await visit(n, []);
	return [...seen.values()];
}
