import { brand, tokens } from '../lib/brand.js';
import { readIndex } from '../library/registry.js';

export async function list() {
	const items = await readIndex();
	return items.map((i) => ({ name: i.name, title: i.title, group: brand().groups[i.group] ?? i.group, description: i.description, requires: i.requires, dependencies: i.dependencies }));
}

/** Tokens whose name or value matches every term. */
export function findTokens(terms: string[]) {
	const t = tokens();
	return Object.entries(t)
		.filter(([n, v]) => terms.every((term) => n.includes(term) || v.light.toLowerCase().includes(term.toLowerCase())))
		.map(([name, v]) => ({ name, value: v.value, light: v.light, dark: v.dark }));
}
