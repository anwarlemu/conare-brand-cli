import { join, resolve } from 'node:path';
import { brand } from '../lib/brand.js';
import { helpRow } from '../lib/help-row.js';
import { drawLockup, lockupRatio } from '../assets/art.js';
import { color, surface, toPng } from '../assets/canvas.js';
import { oneOf, str, type Flags } from '../assets/flags.js';
import { CopyError } from '../assets/glyphs.js';
import { display, pick, write } from '../assets/io.js';
import { imageDoc } from '../assets/layouts.js';

// `email <template>`: emails as plain HTML tables with inline styles (what survives Gmail, Outlook and Apple Mail):
// newsletter, announcement, receipt, password reset, and a signature. Only the words passed are written; colors are the
// brand's tokens and the brand's faces lead each font list, with the system faces after them for mail apps without
// web fonts. The logo is written beside the HTML as logo.png; host it and pass --asset-base so mail apps can load it.

export const EMAILS = ['newsletter', 'announcement', 'receipt', 'password-reset', 'signature'] as const;
type Kind = (typeof EMAILS)[number];

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const paras = (s: string) => s.split(/\n{2,}|\\n\\n/).map((p) => p.trim()).filter(Boolean);
const list = (s: string | undefined) => (s ?? '').split('|').map((x) => x.trim()).filter(Boolean);

export function emailHelp(): string {
	const b = brand().bin;
	const row = (c: string, w: string) => helpRow(c, w, 56);
	return [
		'Emails as HTML tables with inline styles, in the brand\'s colors and type: they survive Gmail, Outlook and Apple Mail.',
		'',
		row(`${b} email newsletter --headline "..." --body "..." --items "Title: text | ..."`, 'A newsletter'),
		row(`${b} email announcement --badge New --headline "..." --body "..." --button "Read more" --url https://...`, 'An announcement'),
		row(`${b} email receipt --headline "Your receipt" --items "Pro plan, $49 | Extra seats, $20" --total "$69" --date "24 Nov 2026"`, 'A receipt'),
		row(`${b} email password-reset --body "..." --button "Reset password" --url https://...`, 'A password reset'),
		row(`${b} email signature --name "Ada Acme" --role "Engineer" --email ada@acme.com`, 'An email signature'),
		'',
		'Only the words you pass are written; a button needs both --button and --url. --note goes in the footer, with the brand\'s address.',
		'--asset-base https://your.site/email/ points the logo at where you host logo.png (written beside the HTML). --out a folder (default email/).',
	].join('\n');
}

export async function runEmail(cwd: string, args: string[], flags: Flags): Promise<{ json: unknown; text: string }> {
	if (flags.list === true || args[0] === 'list') return { json: { templates: EMAILS }, text: EMAILS.join('\n') };
	if (args.length !== 1) throw new Error(`Name one email: ${EMAILS.join(', ')}.`);
	const kind = pick('email', args[0]!, EMAILS) as Kind;
	const v = (names: string[]) => oneOf(flags, names)?.trim() || undefined;
	const c = {
		headline: v(['headline', 'title']), body: v(['body', 'text']), badge: v(['badge', 'eyebrow']), items: v(['items']), button: v(['button']), url: v(['url']),
		total: v(['total']), date: v(['date']), number: v(['number']), note: v(['note']), name: v(['name']), role: v(['role']), email: v(['email']), phone: v(['phone']),
	};
	if (c.button && !c.url) throw new Error('A button needs --url (where it goes).');
	if (c.url && !/^https?:\/\//.test(c.url)) throw new Error('--url is a full address (https://...).');
	const T = imageDoc().themes.white!;
	const k = { bg: color(T.bg), paper: color(imageDoc().themes.paper!.bg), ink: color(T.ink), muted: color(T.muted), line: color('neutral-700'), button: color(imageDoc().accentSmall), onButton: color('off-white'), accent: color(imageDoc().accent) };
	const files = brand().fonts.files;
	const fam = (role: string, fallback: string) => `'${files.find((f) => f.role === role)?.family ?? 'Arial'}', ${fallback}`;
	const display_ = fam('heading', "Georgia, 'Times New Roman', serif");
	const text = fam('brand', 'Arial, Helvetica, sans-serif');
	const mono = fam('code', "'Courier New', monospace");
	const base = (str(flags['asset-base']) ?? '').replace(/\/?$/, (m) => (str(flags['asset-base']) ? '/' : m));
	const logo = `<img src="${esc(base)}logo.png" width="140" height="${Math.round(140 / lockupRatio('primary'))}" alt="${esc(brand().name)}" style="display:block;border:0;width:140px;height:auto">`;
	const p = (s: string, extra = '') => `<p style="margin:0 0 16px;font-family:${text};font-size:16px;line-height:1.55;color:${k.ink}${extra}">${esc(s)}</p>`;
	const h1 = (s: string) => `<h1 style="margin:0 0 20px;font-family:${display_};font-weight:400;font-size:34px;line-height:1.1;letter-spacing:-0.01em;color:${k.ink}">${esc(s.replace(/[.!?]$/, ''))}<span style="color:${k.accent}">${/[!?]$/.test(s) ? esc(s.slice(-1)) : '.'}</span></h1>`;
	const btn = () => (c.button && c.url ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px"><tr><td style="background:${k.button}"><a href="${esc(c.url)}" style="display:inline-block;padding:13px 22px;font-family:${text};font-size:15px;font-weight:500;color:${k.onButton};text-decoration:none">${esc(c.button)}</a></td></tr></table>` : '');
	const badge = () => (c.badge ? `<p style="margin:0 0 14px;font-family:${mono};font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${k.button}"><span style="display:inline-block;width:8px;height:8px;background:${k.accent};margin-right:8px"></span>${esc(c.badge)}</p>` : '');
	const need = (key: keyof typeof c, what: string) => {
		if (!c[key]) throw new CopyError(`The ${kind} email needs --${key} (${what}).`);
		return c[key]!;
	};
	let inner = '';
	if (kind === 'signature') {
		const name = need('name', 'the person\'s name');
		const html = `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr><td style="padding:0 16px 0 0;vertical-align:top">${logo.replace('width="140"', 'width="96"').replace('width:140px', 'width:96px')}</td><td style="padding:0 0 0 16px;border-left:1px solid ${k.line};vertical-align:top"><p style="margin:0;font-family:${display_};font-size:18px;color:${k.ink}">${esc(name)}</p>${c.role ? `<p style="margin:2px 0 6px;font-family:${text};font-size:13px;color:${k.muted}">${esc(c.role)}</p>` : ''}${[c.email ? `<a href="mailto:${esc(c.email)}" style="color:${k.ink};text-decoration:none">${esc(c.email)}</a>` : '', c.phone ? esc(c.phone) : '', c.url ? `<a href="${esc(c.url)}" style="color:${k.ink};text-decoration:none">${esc(c.url.replace(/^https?:\/\//, ''))}</a>` : ''].filter(Boolean).map((x) => `<p style="margin:0;font-family:${mono};font-size:12px;line-height:1.6;color:${k.ink}">${x}</p>`).join('')}</td></tr></table>`;
		return finish(cwd, flags, kind, html);
	}
	if (kind === 'newsletter') {
		inner += h1(need('headline', 'the issue\'s headline'));
		for (const x of paras(c.body ?? '')) inner += p(x);
		for (const it of list(c.items)) {
			const m = /^([^:]+):\s*(.+)$/.exec(it);
			inner += `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${k.line};margin-top:8px"><tr><td style="padding:18px 0 4px"><p style="margin:0 0 6px;font-family:${display_};font-size:21px;line-height:1.2;color:${k.ink}">${esc(m ? m[1]!.trim() : it)}</p>${m ? `<p style="margin:0;font-family:${text};font-size:15px;line-height:1.55;color:${k.muted}">${esc(m[2]!)}</p>` : ''}</td></tr></table>`;
		}
		inner += btn();
	} else if (kind === 'announcement') {
		inner += badge() + h1(need('headline', 'what is announced'));
		for (const x of paras(c.body ?? '')) inner += p(x);
		inner += btn();
	} else if (kind === 'receipt') {
		inner += h1(need('headline', 'its title, like "Your receipt"'));
		if (c.number || c.date) inner += `<p style="margin:0 0 20px;font-family:${mono};font-size:13px;color:${k.muted}">${[c.number, c.date].filter(Boolean).map((x) => esc(x!)).join(' &nbsp;·&nbsp; ')}</p>`;
		const rows = list(need('items', 'the lines, "Item, amount | ..."')).map((r) => {
			const at = r.lastIndexOf(',');
			if (at < 0) throw new CopyError(`Each receipt line is "item, amount"; "${r}" is not.`);
			return [r.slice(0, at).trim(), r.slice(at + 1).trim()];
		});
		inner += `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${rows.map(([a, b]) => `<tr><td style="padding:12px 0;border-top:1px solid ${k.line};font-family:${text};font-size:15px;color:${k.ink}">${esc(a!)}</td><td align="right" style="padding:12px 0;border-top:1px solid ${k.line};font-family:${mono};font-size:15px;color:${k.ink}">${esc(b!)}</td></tr>`).join('')}${c.total ? `<tr><td style="padding:14px 0;border-top:2px solid ${k.ink};font-family:${text};font-size:15px;font-weight:500;color:${k.ink}">Total</td><td align="right" style="padding:14px 0;border-top:2px solid ${k.ink};font-family:${mono};font-size:16px;color:${k.ink}">${esc(c.total)}</td></tr>` : ''}</table>`;
		for (const x of paras(c.body ?? '')) inner += p(x, ';margin-top:20px');
	} else {
		if (c.headline) inner += h1(c.headline);
		for (const x of paras(need('body', 'what the email says'))) inner += p(x);
		need('button', 'the button\'s words');
		inner += btn();
		inner += `<p style="margin:0;font-family:${mono};font-size:12px;line-height:1.6;color:${k.muted};word-break:break-all">${esc(c.url!)}</p>`;
	}
	const footer = `<p style="margin:0;font-family:${mono};font-size:12px;line-height:1.6;color:${k.muted}">${[c.note, imageDoc().address].filter(Boolean).map((x) => esc(x!)).join('<br>')}</p>`;
	const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(c.headline ?? brand().name)}</title></head>
<body style="margin:0;padding:0;background:${k.paper}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${k.paper}"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${k.bg};border:1px solid ${k.line}">
<tr><td style="padding:32px 40px 24px">${logo}</td></tr>
<tr><td style="padding:8px 40px 24px">${inner}</td></tr>
<tr><td style="padding:20px 40px 28px;border-top:1px solid ${k.line}">${footer}</td></tr>
</table></td></tr></table>
</body></html>
`;
	return finish(cwd, flags, kind, html);
}

function finish(cwd: string, flags: Flags, kind: string, html: string) {
	const dir = resolve(cwd, str(flags.out) ?? 'email');
	const file = join(dir, `${kind}.html`);
	write(file, html);
	/* The logo at twice its shown size, in ink on clear, for mail apps that load remote images. */
	const h = 48;
	const w = Math.round(h * lockupRatio('primary'));
	const s = surface(w, h);
	drawLockup(s.ctx, 0, 0, h, color('off-black'), 'primary');
	write(join(dir, 'logo.png'), toPng(s));
	return { json: { files: [{ path: display(cwd, file), format: 'html' }, { path: display(cwd, join(dir, 'logo.png')), format: 'png', width: w, height: h }] }, text: `${display(cwd, file)}\n${display(cwd, join(dir, 'logo.png'))}  host it, then pass --asset-base` };
}
