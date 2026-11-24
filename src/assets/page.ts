import type { Outline, SectionInfo } from '../design/index.js';
import { brand } from '../lib/brand.js';

// Pages from the library's site sections, for `design page compose`: an outline (checked by the core) becomes a Vue page,
// a React page and a web-components page that use the installed components (`add` them first), and a plain HTML page
// that needs only the brand stylesheet. Only the outline's words go on the page; links default to "#".

export const SECTIONS: SectionInfo[] = [
	{ type: 'header', description: 'The site header: the logo, links and a button.', copy: [{ id: 'action' }, { id: 'action-href' }], items: { count: [0, 7], copy: [{ id: 'label', required: true }, { id: 'href' }] } },
	{ type: 'hero', description: 'The first section: a label, the headline (its last word or stop in red), a line and one action.', copy: [{ id: 'title', required: true }, { id: 'eyebrow' }, { id: 'accent' }, { id: 'body' }, { id: 'action' }, { id: 'action-href' }] },
	{ type: 'logos', description: 'Names of customers or partners as a strip (use Acme, never a real company you have not cleared).', copy: [{ id: 'title', required: true }, { id: 'tag' }], items: { count: [2, 10], copy: [{ id: 'name', required: true }] } },
	{ type: 'features', description: 'A card per feature in the double rule.', copy: [{ id: 'title', required: true }, { id: 'tag' }, { id: 'body' }], items: { count: [2, 9], copy: [{ id: 'title', required: true }, { id: 'body', required: true }] } },
	{ type: 'bento', description: 'Features as cells of different sizes (size: large, wide or tall).', copy: [{ id: 'title', required: true }, { id: 'tag' }, { id: 'body' }], items: { count: [2, 9], copy: [{ id: 'title', required: true }, { id: 'body', required: true }, { id: 'size' }] } },
	{ type: 'comparison', description: 'What each plan includes: plans separated by |, a row per feature with values separated by | (yes, no or words).', copy: [{ id: 'title', required: true }, { id: 'tag' }, { id: 'body' }, { id: 'plans', required: true }], items: { count: [1, 20], copy: [{ id: 'feature', required: true }, { id: 'values', required: true }] } },
	{ type: 'testimonial', description: 'One quote with the role and company (use Acme, never a real person).', copy: [{ id: 'quote', required: true }, { id: 'role', required: true }, { id: 'company', required: true }, { id: 'tag' }] },
	{ type: 'faq', description: 'Questions and answers.', copy: [{ id: 'title' }, { id: 'tag' }], items: { count: [1, 20], copy: [{ id: 'question', required: true }, { id: 'answer', required: true }] } },
	{ type: 'newsletter', description: 'A sign-up for news by email.', copy: [{ id: 'title', required: true }, { id: 'tag' }, { id: 'body' }, { id: 'action' }, { id: 'sent' }] },
	{ type: 'cta', description: 'The closing call to action on the red room, with one action.', copy: [{ id: 'title', required: true }, { id: 'action' }, { id: 'action-href' }] },
	{ type: 'footer', description: 'The site footer: a line, columns of links (column: the heading each link sits under) and the legal line.', copy: [{ id: 'tagline' }, { id: 'legal' }], items: { count: [0, 24], copy: [{ id: 'label', required: true }, { id: 'href' }, { id: 'column' }] } },
];

type Section = Outline['sections'][number];
const href = (v?: string) => v?.trim() || '#';
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const attr = (v: unknown) => esc(typeof v === 'string' ? v : JSON.stringify(v)).replace(/'/g, '&#39;');
const split = (v?: string) => (v ? v.split('|').map((x) => x.trim()).filter(Boolean) : []);
const cell = (v: string): boolean | string => (/^(yes|true|included|✓)$/i.test(v) ? true : /^(no|false|-|—)$/i.test(v) ? false : v);

/** Each section's props, shared by the flavors (Vue and React take the same names; web components say `heading`). */
function props(s: Section): { name: string; tag: string; p: Record<string, unknown>; action?: { label: string; href: string } } | null {
	const c = s.copy ?? {};
	const items = s.items ?? [];
	const opt = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== ''));
	const act = c.action ? { label: c.action, href: href(c['action-href']) } : undefined;
	switch (s.type) {
		case 'hero': return { name: 'Hero', tag: 'hero', p: opt({ eyebrow: c.eyebrow, title: c.title, accent: c.accent, body: c.body }), action: act };
		case 'logos': return { name: 'LogoStrip', tag: 'logo-strip', p: opt({ title: c.title, tag: c.tag, logos: items.map((i) => ({ name: i.name })) }) };
		case 'features': return { name: 'FeatureGrid', tag: 'feature-grid', p: opt({ title: c.title, tag: c.tag, body: c.body, features: items.map((i) => ({ title: i.title, body: i.body })) }) };
		case 'bento': return { name: 'Bento', tag: 'bento', p: opt({ title: c.title, tag: c.tag, body: c.body, cells: items.map((i) => opt({ title: i.title, body: i.body, size: i.size })) }) };
		case 'comparison': {
			const plans = split(c.plans);
			return { name: 'ComparisonTable', tag: 'comparison-table', p: opt({ title: c.title, tag: c.tag, body: c.body, plans, rows: items.map((i) => ({ feature: i.feature, values: split(i.values).map(cell) })) }) };
		}
		case 'testimonial': return { name: 'Testimonial', tag: 'testimonial', p: opt({ quote: c.quote, role: c.role, company: c.company, tag: c.tag }) };
		case 'faq': return { name: 'Faq', tag: 'faq', p: opt({ title: c.title, tag: c.tag, items: items.map((i) => ({ q: i.question, a: i.answer })) }) };
		case 'newsletter': return { name: 'Newsletter', tag: 'newsletter', p: opt({ title: c.title, tag: c.tag, body: c.body, action: c.action, sentText: c.sent }) };
		case 'cta': return { name: 'CallToAction', tag: 'call-to-action', p: opt({ title: c.title }), action: act };
		default: return null;
	}
}

const headerData = (s?: Section) => ({ items: [], links: (s?.items ?? []).map((i) => ({ label: i.label, href: href(i.href) })), homeLabel: `${brand().name} home` });
function footerData(s?: Section) {
	const cols = new Map<string, { label: string; href: string }[]>();
	for (const i of s?.items ?? []) {
		const k = i.column?.trim() || 'Links';
		cols.set(k, [...(cols.get(k) ?? []), { label: i.label!, href: href(i.href) }]);
	}
	return { columns: [...cols].map(([title, links]) => ({ title, links })), ...(s?.copy?.tagline ? { tagline: s.copy.tagline } : {}), ...(s?.copy?.legal ? { legal: s.copy.legal } : {}), name: brand().name };
}

function vue(o: Outline): Record<string, string> {
	const header = o.sections.find((s) => s.type === 'header');
	const footer = o.sections.find((s) => s.type === 'footer');
	const used = new Set<string>(['SitePage']);
	const body: string[] = [];
	const data: string[] = [];
	o.sections.forEach((s, n) => {
		const x = props(s);
		if (!x) return;
		used.add(x.name);
		const binds = Object.entries(x.p).map(([k, v]) => {
			const kebab = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
			if (typeof v === 'string') return `${kebab}="${esc(v)}"`;
			data.push(`const s${n}_${k} = ${JSON.stringify(v)}`);
			return `:${kebab}="s${n}_${k}"`;
		});
		if (x.action) used.add('ButtonLink');
		const action = x.action ? (s.type === 'hero' ? `<template #action><ButtonLink href="${esc(x.action.href)}" grain pixels arrow>${esc(x.action.label)}</ButtonLink></template>` : `<ButtonLink href="${esc(x.action.href)}" variant="light" fill="black" pixels arrow>${esc(x.action.label)}</ButtonLink>`) : '';
		body.push(action ? `    <${x.name} ${binds.join(' ')}>\n      ${action}\n    </${x.name}>` : `    <${x.name} ${binds.join(' ')} />`);
	});
	const hdr = header?.copy?.action ? `\n    <template #actions><ButtonLink href="${esc(href(header.copy['action-href']))}" size="sm">${esc(header.copy.action)}</ButtonLink></template>` : '';
	if (hdr) used.add('ButtonLink');
	const imports = [...used].map((n) => `import ${n} from '@/components/site/${n}.vue'`).join('\n');
	return {
		'page.vue': `<script setup lang="ts">\n${imports}\n// Built by ${brand().bin} design page compose from the outline: only its words are on the page.\nconst header = ${JSON.stringify(headerData(header))}\nconst footer = ${JSON.stringify(footerData(footer))}\n${data.join('\n')}${o.title ? `\n// The page's title: ${o.title.replace(/\n/g, ' ')} (set it with your router's head).` : ''}\n</script>\n\n<template>\n  <SitePage :header="header" :footer="footer">\n    <template #logo><span class="font-heading text-heading-3 text-fg">${esc(brand().name)}</span></template>${hdr}\n${body.join('\n')}\n  </SitePage>\n</template>\n`,
	};
}

function react(o: Outline): Record<string, string> {
	const header = o.sections.find((s) => s.type === 'header');
	const footer = o.sections.find((s) => s.type === 'footer');
	const used = new Set<string>(['SitePage']);
	const body: string[] = [];
	for (const s of o.sections) {
		const x = props(s);
		if (!x) continue;
		used.add(x.name);
		const binds = Object.entries(x.p).map(([k, v]) => `${k}={${JSON.stringify(v)}}`);
		if (x.action) used.add('ButtonLink');
		const link = (extra: string) => `<ButtonLink href={${JSON.stringify(x.action!.href)}} ${extra}>{${JSON.stringify(x.action!.label)}}</ButtonLink>`;
		if (x.action && s.type === 'hero') body.push(`      <${x.name} ${binds.join(' ')} action={${link('grain pixels arrow')}} />`);
		else if (x.action) body.push(`      <${x.name} ${binds.join(' ')}>\n        ${link('variant="light" fill="black" pixels arrow')}\n      </${x.name}>`);
		else body.push(`      <${x.name} ${binds.join(' ')} />`);
	}
	const act = header?.copy?.action ? ` actions={() => <ButtonLink href={${JSON.stringify(href(header.copy['action-href']))}} size="sm">{${JSON.stringify(header.copy.action)}}</ButtonLink>}` : '';
	if (act) used.add('ButtonLink');
	const imports = [...used].map((n) => `import { ${n} } from '@/components/site/${n}'`).join('\n');
	return {
		'page.tsx': `${imports}\n\n// Built by ${brand().bin} design page compose from the outline: only its words are on the page.\nexport default function Page() {\n  return (\n    <SitePage header={${JSON.stringify(headerData(header))}} footer={${JSON.stringify(footerData(footer))}} logo={<span className="font-heading text-heading-3 text-fg">{${JSON.stringify(brand().name)}}</span>}${act}>\n${body.join('\n')}\n    </SitePage>\n  )\n}\n`,
	};
}

function elements(o: Outline): Record<string, string> {
	const px = brand().elementPrefix ?? brand().bin;
	const header = o.sections.find((s) => s.type === 'header');
	const footer = o.sections.find((s) => s.type === 'footer');
	const tags = new Set<string>(['site-page', 'button-link']);
	const body: string[] = [];
	for (const s of o.sections) {
		const x = props(s);
		if (!x) continue;
		tags.add(x.tag);
		const binds = Object.entries(x.p).map(([k, v]) => {
			const name = k === 'title' ? 'heading' : k === 'role' ? 'job-title' : k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
			return typeof v === 'string' ? `${name}="${esc(v)}"` : `${name}='${attr(v)}'`;
		});
		const action = x.action ? `<${px}-button-link${s.type === 'hero' ? ' slot="action" grain' : ' variant="light" fill="black"'} href="${esc(x.action.href)}" pixels arrow>${esc(x.action.label)}</${px}-button-link>` : '';
		body.push(`    <${px}-${x.tag} ${binds.join(' ')}>${action}</${px}-${x.tag}>`);
	}
	const act = header?.copy?.action ? `\n    <${px}-button-link slot="actions" size="sm" href="${esc(href(header.copy['action-href']))}">${esc(header.copy.action)}</${px}-button-link>\n    <${px}-button-link slot="sheet-actions" size="sm" href="${esc(href(header.copy['action-href']))}">${esc(header.copy.action)}</${px}-button-link>` : '';
	const scripts = [...tags].map((t) => `  <script type="module" src="/${brand().bin}/elements/${t}.js"></script>`).join('\n');
	return {
		'page.html': `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>${esc(o.title ?? brand().name)}</title>\n  <link rel="stylesheet" href="/${brand().bin}/brand.css">\n${scripts}\n</head>\n<body>\n  <!-- Built by ${brand().bin} design page compose from the outline: only its words are on the page. -->\n  <${px}-site-page header='${attr(headerData(header))}' footer='${attr(footerData(footer))}'>\n    <span slot="logo" class="font-heading text-heading-3 text-fg">${esc(brand().name)}</span>${act}\n${body.join('\n')}\n  </${px}-site-page>\n</body>\n</html>\n`,
	};
}

/** Plain HTML: the sections as semantic markup in the brand's classes, for a page with no framework or components. */
function html(o: Outline): Record<string, string> {
	const out: string[] = [];
	const head = (title?: string, tag?: string, body?: string) => `${tag ? `<p class="type-meta text-fg-muted">${esc(tag)}</p>` : ''}${title ? `<h2 class="font-heading text-heading-1 text-fg">${esc(title)}</h2>` : ''}${body ? `<p class="mt-3 type-body-lg text-fg-muted">${esc(body)}</p>` : ''}`;
	const wrap = (inner: string, label: string) => `  <section class="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-10" aria-label="${esc(label)}">${inner}</section>`;
	const button = (label: string, to: string, dark = true) => `<a class="mt-8 inline-flex items-center px-5 py-3 type-ui ${dark ? 'bg-fg text-bg' : 'border border-edge text-fg'}" href="${esc(to)}">${esc(label)}</a>`;
	for (const s of o.sections) {
		const c = s.copy ?? {};
		const items = s.items ?? [];
		switch (s.type) {
			case 'header':
				out.push(`  <header class="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6 lg:px-10"><a href="/" class="font-heading text-heading-3 text-fg">${esc(brand().name)}</a><nav aria-label="Main"><ul class="flex gap-6 type-ui">${items.map((i) => `<li><a href="${esc(href(i.href))}">${esc(i.label!)}</a></li>`).join('')}</ul></nav>${c.action ? `<a class="bg-fg px-4 py-2 type-ui text-bg" href="${esc(href(c['action-href']))}">${esc(c.action)}</a>` : ''}</header>`);
				break;
			case 'hero':
				out.push(`  <section class="mx-auto max-w-[1440px] px-4 pt-24 pb-20 text-center sm:px-6 lg:px-10" aria-label="Introduction">${c.eyebrow ? `<p class="type-meta text-fg-muted">${esc(c.eyebrow)}</p>` : ''}<h1 class="font-heading text-hero text-fg">${esc(c.title!)}${c.accent ? `<span class="text-fg-accent-display">${esc(c.accent)}</span>` : ''}</h1>${c.body ? `<p class="mx-auto mt-4 max-w-[640px] type-body-lg text-fg-muted">${esc(c.body)}</p>` : ''}${c.action ? button(c.action, href(c['action-href'])) : ''}</section>`);
				break;
			case 'logos':
				out.push(wrap(`${head(c.title, c.tag)}<ul class="mt-8 flex flex-wrap gap-8 type-heading-3 text-fg-muted">${items.map((i) => `<li>${esc(i.name!)}</li>`).join('')}</ul>`, c.title ?? 'Logos'));
				break;
			case 'features':
			case 'bento':
				out.push(wrap(`${head(c.title, c.tag, c.body)}<ul class="mt-10 grid gap-px border border-edge bg-edge sm:grid-cols-2 lg:grid-cols-3">${items.map((i) => `<li class="bg-surface px-6 py-6${s.type === 'bento' && (i.size === 'large' || i.size === 'wide') ? ' sm:col-span-2' : ''}"><h3 class="type-heading-3 text-fg">${esc(i.title!)}</h3><p class="mt-2 text-body text-fg-muted">${esc(i.body!)}</p></li>`).join('')}</ul>`, c.title ?? 'Features'));
				break;
			case 'comparison': {
				const plans = split(c.plans);
				out.push(wrap(`${head(c.title, c.tag, c.body)}<div class="mt-10 overflow-x-auto border border-edge"><table class="w-full min-w-[560px] text-left"><thead><tr><th scope="col"><span class="sr-only">Feature</span></th>${plans.map((p) => `<th scope="col" class="px-5 py-4 type-heading-3 font-normal">${esc(p)}</th>`).join('')}</tr></thead><tbody>${items.map((i) => `<tr class="border-t border-edge"><th scope="row" class="px-5 py-4 text-body font-normal">${esc(i.feature!)}</th>${split(i.values).map(cell).map((v) => `<td class="px-5 py-4 text-body">${v === true ? '<span class="sr-only">Included</span><span aria-hidden="true" class="inline-block size-2 bg-home-red"></span>' : v === false ? '<span class="sr-only">Not included</span><span aria-hidden="true">–</span>' : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`, c.title ?? 'Comparison'));
				break;
			}
			case 'testimonial':
				out.push(wrap(`${c.tag ? `<p class="type-meta text-fg-muted">${esc(c.tag)}</p>` : ''}<figure><blockquote class="font-heading text-heading-1 text-fg">${esc(c.quote!)}</blockquote><figcaption class="mt-4 type-meta text-fg-muted">${esc(c.role!)}, ${esc(c.company!)}</figcaption></figure>`, 'Testimonial'));
				break;
			case 'faq':
				out.push(wrap(`${head(c.title ?? 'Frequently asked questions', c.tag)}<div class="mt-8">${items.map((i) => `<details class="border-b border-edge py-4"><summary class="type-heading-4 text-fg">${esc(i.question!)}</summary><p class="mt-2 text-body text-fg-muted">${esc(i.answer!)}</p></details>`).join('')}</div>`, 'FAQ'));
				break;
			case 'newsletter':
				out.push(wrap(`${head(c.title, c.tag, c.body)}<form class="mt-8 flex max-w-[560px] gap-3" action="#"><label class="sr-only" for="newsletter-email">Work email</label><input id="newsletter-email" type="email" required autocomplete="email" class="min-w-0 flex-1 border border-edge px-3 py-2"><button class="bg-fg px-5 py-2 type-ui text-bg">${esc(c.action ?? 'Subscribe')}</button></form>`, c.title ?? 'Newsletter'));
				break;
			case 'cta':
				out.push(`  <section class="bg-surface-accent px-4 py-24 text-center sm:px-6 lg:px-10" aria-label="${esc(c.title!)}"><h2 class="font-heading text-heading-1 text-fg-on-accent">${esc(c.title!)}</h2>${c.action ? button(c.action, href(c['action-href'])) : ''}</section>`);
				break;
			case 'footer': {
				const f = footerData(s);
				out.push(`  <footer class="mx-auto max-w-[1440px] border-t border-edge px-4 py-16 sm:px-6 lg:px-10">${f.tagline ? `<p class="type-body-lg text-fg">${esc(f.tagline)}</p>` : ''}<div class="mt-8 grid gap-8 sm:grid-cols-3">${f.columns.map((col) => `<nav aria-label="${esc(col.title)}"><h2 class="type-meta text-fg-muted">${esc(col.title)}</h2><ul class="mt-3 flex flex-col gap-2 type-ui">${col.links.map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('')}</ul></nav>`).join('')}</div>${f.legal ? `<p class="mt-12 type-meta text-fg-muted">${esc(f.legal)}</p>` : ''}</footer>`);
				break;
			}
		}
	}
	return { 'index.html': `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>${esc(o.title ?? brand().name)}</title>\n  <link rel="stylesheet" href="${brand().bin}/brand.css">\n</head>\n<body class="bg-bg text-fg">\n  <!-- Built by ${brand().bin} design page compose from the outline: only its words are on the page. -->\n${out.join('\n')}\n</body>\n</html>\n` };
}

export const PAGE_FLAVORS = ['vue', 'react', 'elements', 'html'];

export async function writePage(outline: Outline, flavor: string): Promise<Record<string, string>> {
	if (flavor === 'vue') return vue(outline);
	if (flavor === 'react') return react(outline);
	if (flavor === 'elements') return elements(outline);
	if (flavor === 'html') return html(outline);
	throw new Error(`Unknown flavor ${flavor}: ${PAGE_FLAVORS.join(', ')}.`);
}
