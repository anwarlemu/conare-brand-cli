// The docs site's gallery of generated assets (apps/www/public/gallery and its index.json): every share layout, a
// layout at every size (social, ads, backgrounds, wallpapers), each deck slide, each illustration subject, each print
// document and merch item, the layout videos and motion clips, the icon set and the email templates, drawn by the CLI's
// own modules and commands (run `bun run build` first). Deterministic, so a rerun with no brand change rewrites the
// same bytes. Run it after a change to brand/assets or src/assets: `node scripts/docs-assets.mjs`.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const out = join(root, 'apps', 'www', 'public', 'gallery');
const brand = (await import(join(root, 'dist', 'lib', 'brand.js'))).brand();
const og = await import(join(root, 'dist', 'assets', 'og.js'));
const deck = await import(join(root, 'dist', 'assets', 'deck.js'));
const merch = await import(join(root, 'dist', 'assets', 'merch.js'));
const ill = await import(join(root, 'dist', 'illustrate', 'draw.js'));
const video = await import(join(root, 'dist', 'assets', 'video.js'));
const b = brand.bin;
const { loadImage } = await import('@napi-rs/canvas');

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const index = { images: [], sizes: [], slides: [], illustrations: [], documents: [], merch: [], videos: [], motion: [], icons: [], emails: [], design: { steps: [] } };
const save = (name, data) => writeFileSync(join(out, name), data);

for (const t of og.LAYOUTS) {
	const size = og.sizeOf(t === 'avatar' ? 'avatar' : 'og');
	const d = og.compose({ template: t, size, sample: true });
	const r = await og.renderDesign(d, null, { png: true });
	save(`image-${t}.png`, r.png);
	const doc = og.imageDoc().templates[t];
	const s = doc.sample;
	const q = (k) => (s[k] ? ` --${k} "${s[k]}"` : '');
	index.images.push({ id: t, label: doc.label, description: doc.description, theme: d.theme, src: `/gallery/image-${t}.png`, width: size.w, height: size.h, command: `${b} image ${t}${t === 'avatar' ? ' --size avatar' : `${q('headline')}${q('body')}${q('badge')}${q('partner')}${q('note')}`}` });
}
const roomHead = og.imageDoc().templates.room.sample.headline;
for (const size of og.sizeIds()) {
	const s = og.sizeOf(size);
	/* The room layout where it lays out; the hero (logo and words) on the sizes too small or too thin for the room. */
	const t = size === 'avatar' ? 'avatar' : og.sizesFor('room').includes(size) ? 'room' : 'hero';
	const copy = t === 'avatar' ? {} : t === 'room' ? { headline: roomHead } : { headline: og.imageDoc().templates.hero.sample.headline };
	const big = s.w * s.h > 2_500_000;
	const r = await og.renderDesign(og.compose({ template: t, size: s, ...copy }), null, big ? { jpg: true } : { png: true });
	const file = `size-${t}-${size}.${big ? 'jpg' : 'png'}`;
	save(file, big ? r.jpg : r.png);
	index.sizes.push({ id: size, label: s.label, note: s.note, src: `/gallery/${file}`, width: s.w, height: s.h, command: `${b} image ${t}${copy.headline ? ` --headline "${copy.headline}"` : ''} --size ${size}` });
}
/* The slides with no sample copy in the brand (their data is always yours) are shown on Acme's. */
const ACME = {
	agenda: { title: 'Today.', items: ['Where Acme searches today', 'What changes', 'The rollout', 'Questions'] },
	chart: { title: 'Searches a week at Acme.', data: 'Mon 120 | Tue 180 | Wed 240 | Thu 210 | Fri 160' },
	timeline: { title: 'The rollout.', items: ['May: Connect the help center', 'June: Sync the shared drive', 'July: Open search to every team'] },
	comparison: { title: 'Before and after.', left: 'Before', right: 'After', leftItems: ['Folders searched by hand', 'Answers without sources'], rightItems: ['One search across every file', 'Every answer with its source'] },
	grid: { title: 'What the team made.' },
	team: { title: 'The Acme team.', people: ['Acme admin, Head of search', 'Acme engineer, Platform', 'Acme designer, Product', 'Acme lead, Support'] },
	qa: { title: 'Questions?', body: 'Write to admin@acme.com' },
};
const flagsOf = (o) => Object.entries(o).map(([k, v]) => `--${k} "${Array.isArray(v) ? v.join(' | ') : v}"`).join(' ');
for (const type of deck.slideTypes()) {
	const own = ACME[type];
	const r = await deck.renderSlide(own ? { type, ...own, ...(type === 'grid' ? { pictures: await Promise.all(['image-feature', 'image-app'].map(async (n) => { const img = await loadImage(readFileSync(join(out, `${n}.png`))); return { img, w: img.width, h: img.height }; })) } : {}) } : { type, sample: true }, { png: true });
	save(`slide-${type}.png`, r.png);
	const d = deck.deckDoc().slides[type];
	index.slides.push({ id: type, label: d.name, description: d.description, src: `/gallery/slide-${type}.png`, width: 1920, height: 1080, command: own ? `${b} deck ${type} ${flagsOf(own)}` : `${b} deck ${type} --sample` });
}
for (const subject of ill.SUBJECTS()) {
	const r = ill.renderSubject({ subject, width: 900, height: 600 }, { png: true, svg: true });
	save(`illustration-${subject}.png`, r.png);
	save(`illustration-${subject}.svg`, r.svg);
	index.illustrations.push({ id: subject, description: ill.illustrateDoc().subjects[subject], theme: r.theme, src: `/gallery/illustration-${subject}.png`, svg: `/gallery/illustration-${subject}.svg`, width: 900, height: 600, command: `${b} illustrate ${subject} --size 900x600` });
}
/* The print documents on Acme's details (their words are always the person's own). */
const PRINT = {
	headline: 'How Acme searches every file', badge: 'Case study', body: 'Acme connected its help center and shared drive in a week. Every team now asks in plain words and gets the passage that answers, with the file it came from.',
	name: 'Acme admin', role: 'Head of search', email: 'admin@acme.com', url: 'acme.com', date: '24 Nov 2026', stat: '3x', quote: 'We stopped searching folders by hand.', by: 'Head of search, Acme', note: 'Acme, Inc.',
};
const flagLine = (o) => Object.entries(o).map(([k, v]) => `--${k} "${v}"`).join(' ');
for (const item of merch.merchItems()) {
	const variant = item.variants.find((v) => v !== 'white') ?? item.variants[0];
	const doc = item.kind === 'document';
	const slots = doc ? Object.fromEntries([...new Set(item.layers.filter((l) => l.type === 'text').map((l) => l.slot))].filter((k) => PRINT[k]).map((k) => [k, k === 'headline' && item.id === 'certificate' ? 'Certificate of completion' : k === 'badge' && item.id === 'certificate' ? 'Acme search course' : PRINT[k]])) : undefined;
	const r = merch.renderItem(item, { variant, dpi: 72, png: true, guides: true, ...(doc ? { slots } : { sample: true }) });
	save(`merch-${item.id}.png`, r.png);
	(item.kind === 'document' ? index.documents : index.merch).push({ id: item.id, label: item.name, variant: r.variant, variants: item.variants, trim: `${item.size[0]} x ${item.size[1]} in`, bleed: item.bleed, safe: item.safe, method: item.method, src: `/gallery/merch-${item.id}.png`, width: r.width, height: r.height, command: doc ? `${b} print ${item.id} --variant ${r.variant} ${flagLine(slots)}` : `${b} merch ${item.id} --variant ${r.variant}${item.layers.some((l) => l.type === 'text' && l.slot === 'headline') ? ' --sample' : ''}` });
}
if (video.hasFfmpeg()) {
	for (const [t, size] of [['hero', 'og'], ['room', 'square']]) {
		const s = og.sizeOf(size);
		const d = og.compose({ template: t, size: s, sample: true });
		for (const f of ['mp4', 'webm']) {
			const v = await video.renderVideo(d, null, 30, f);
			save(`video-${t}.${f}`, v.data);
		}
		save(`video-${t}.png`, await video.still(d, null));
		index.videos.push({ id: t, src: `/gallery/video-${t}.mp4`, webm: `/gallery/video-${t}.webm`, poster: `/gallery/video-${t}.png`, width: s.w, height: s.h, command: `${b} video ${t} --sample --size ${size} --format both` });
	}
	/* The motion clips, made by the video command itself; the poster is the clip's last frame (the lower third's, while it is up). */
	const { mkdtempSync, readdirSync, copyFileSync } = await import('node:fs');
	const { tmpdir } = await import('node:os');
	const tmp = mkdtempSync(join(tmpdir(), 'ds-motion-'));
	const cli = (argv, cwd = tmp) => {
		const r = spawnSync(process.execPath, [join(root, 'bin.js'), ...argv], { cwd, encoding: 'utf8' });
		if (r.status !== 0) throw new Error(`${b} ${argv.join(' ')} failed: ${r.stderr}`);
	};
	const clips = [
		['logo-reveal', ['--size', 'square'], 'The logo coming in on the brand ease, then holding', 'mp4'],
		['stat', ['--size', 'square', '--headline', '100M+', '--body', 'Documents searched.'], 'A number counting up to its value', 'mp4'],
		['lower-third', ['--name', 'Acme speaker', '--role', 'Head of search, Acme'], 'A name and role over your video (WebM with transparency)', 'webm'],
		['walkthrough', ['--size', 'landscape', '--headline', 'See every answer with its source.', '--image', ['chart', 'comparison', 'team'].map((t) => join(out, `slide-${t}.png`)).join(',')], 'Screenshots shown in turn in the brand frame (here, three of the slides above)', 'mp4'],
	];
	for (const [kind, extra, label, ext] of clips) {
		const dir = join(tmp, kind);
		cli(['video', kind, ...extra, '--format', ext, '--out', dir]);
		const f = readdirSync(dir).find((x) => x.endsWith(`.${ext}`));
		copyFileSync(join(dir, f), join(out, `motion-${kind}.${ext}`));
		spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...(ext === 'webm' ? ['-c:v', 'libvpx-vp9'] : []), ...(kind === 'lower-third' ? [] : ['-sseof', '-0.2']), '-i', join(dir, f), ...(kind === 'lower-third' ? ['-ss', '2'] : []), '-frames:v', '1', join(out, `motion-${kind}.png`)]);
		const p = readFileSync(join(out, `motion-${kind}.png`));
		index.motion.push({ id: kind, label, src: `/gallery/motion-${kind}.${ext}`, type: `video/${ext}`, poster: `/gallery/motion-${kind}.png`, width: p.readUInt32BE(16), height: p.readUInt32BE(20), command: `${b} video ${kind} ${extra.map((a) => (a.startsWith('/') ? 'one.png,two.png,three.png' : /\s/.test(a) ? `"${a}"` : a)).join(' ')}`.trim() });
	}
	/* A layout as a loop and a GIF. */
	cli(['video', 'hero', '--sample', '--size', 'square', '--format', 'gif', '--loop', '--out', join(tmp, 'loop.gif')]);
	copyFileSync(join(tmp, 'loop.gif'), join(out, 'motion-loop.gif'));
	index.motion.push({ id: 'loop', label: 'A layout as a GIF loop', src: '/gallery/motion-loop.gif', type: 'image/gif', width: 1080, height: 1080, command: `${b} video hero --sample --size square --format gif --loop` });
} else console.warn('ffmpeg is not on PATH: the gallery has no videos.');
{
	const { mkdtempSync, readdirSync, copyFileSync } = await import('node:fs');
	const { tmpdir } = await import('node:os');
	const tmp = mkdtempSync(join(tmpdir(), 'ds-icons-'));
	const cli = (argv) => {
		const r = spawnSync(process.execPath, [join(root, 'bin.js'), ...argv], { cwd: tmp, encoding: 'utf8' });
		if (r.status !== 0) throw new Error(`${b} ${argv.join(' ')} failed: ${r.stderr}`);
	};
	cli(['icons', '--out', 'icons']);
	const dir = join(tmp, 'icons');
	const files = readdirSync(dir, { recursive: true }).map(String);
	for (const [f, label] of [['favicon-512.png', 'Favicon 512'], ['maskable-512.png', 'Maskable icon'], ['app-icon-1024.png', 'App icon'], ['avatar-400.png', 'Social avatar'], ['og-default.png', 'Default share image']]) {
		if (!files.includes(f)) continue;
		copyFileSync(join(dir, f), join(out, `icons-${f}`));
		const p = readFileSync(join(out, `icons-${f}`));
		index.icons.push({ id: f, label, src: `/gallery/icons-${f}`, width: p.readUInt32BE(16), height: p.readUInt32BE(20) });
	}
	index.iconSet = { count: files.filter((f) => f.startsWith('svg/') && f.endsWith('.svg')).length, files: files.filter((f) => f !== 'svg' && !f.startsWith('svg/')).sort(), samples: files.filter((f) => f.startsWith('svg/') && f.endsWith('.svg')).sort().slice(0, 24).map((f) => { copyFileSync(join(dir, f), join(out, `icon-${f.slice(4)}`)); return { name: f.slice(4, -4), src: `/gallery/icon-${f.slice(4)}` }; }), command: `${b} icons --out icons` };
	/* The email templates, as written; their logo.png sits beside them. */
	mkdirSync(join(out, 'email'), { recursive: true });
	const mails = {
		newsletter: ['--headline', 'What shipped at Acme this month', '--body', 'Three changes to how the team searches.', '--items', 'Help center: every article is searchable | Shared drive: new files are read as they arrive | Sources: every answer links to its file'],
		announcement: ['--badge', 'New', '--headline', 'Search now covers the shared drive', '--body', 'Every file in the drive is read and kept in step.', '--button', 'Read more', '--url', 'https://acme.com/news'],
		receipt: ['--headline', 'Your receipt', '--items', 'Pro plan, $49 | Extra seats, $20', '--total', '$69', '--date', '24 Nov 2026'],
		'password-reset': ['--body', 'Someone asked to reset the password for admin@acme.com. If it was you, choose a new one.', '--button', 'Reset password', '--url', 'https://acme.com/reset'],
		signature: ['--name', 'Acme admin', '--role', 'Head of search', '--email', 'admin@acme.com'],
	};
	for (const [kind, extra] of Object.entries(mails)) {
		cli(['email', kind, ...extra, '--out', join('email', kind)]);
		const d = join(tmp, 'email', kind);
		for (const f of readdirSync(d)) copyFileSync(join(d, f), join(out, 'email', f.endsWith('.html') ? `${kind}.html` : f));
		index.emails.push({ id: kind, src: `/gallery/email/${kind}.html`, command: `${b} email ${kind} ${extra.map((a) => (/[\s$|]/.test(a) ? `"${a}"` : a)).join(' ')}`.trim() });
	}
}
// A design made and revised step by step with the design command, as a person would, and one refused request.
{
	const { runDesign } = await import(join(root, 'dist', 'design', 'index.js'));
	const { adapter, paint } = await import(join(root, 'dist', 'design', 'adapter.js'));
	const { mkdtempSync, copyFileSync } = await import('node:fs');
	const { tmpdir } = await import('node:os');
	const cwd = mkdtempSync(join(tmpdir(), 'ds-design-'));
	const io = { cwd, bin: b, out: () => {}, err: (m) => console.warn(m), paint };
	const steps = [
		[['new', 'hero', '--size', 'x-banner', '--headline', 'Every answer comes back with its source', '--body', 'Search across the documents you connect, from one API.', '-o', 'banner.design.json'], 'A new X header'],
		[['revise', 'banner.design.json', 'bigger logo'], 'Bigger logo'],
		[['revise', 'banner.design.json', 'left align the headline'], 'Words set left; the logo follows'],
		[['edit', 'banner.design.json', '--set', 'badge=Now in beta'], 'A badge'],
		[['revise', 'banner.design.json', 'paper theme, hide the guides'], 'Paper, without the guides'],
		[['revise', 'banner.design.json', 'smaller headline'], 'A smaller headline, set again in the same column'],
		[['revise', 'banner.design.json', 'headline a bit bigger'], 'A bit bigger: larger type, the same column'],
	];
	const shell = (argv) => argv.map((a) => (/[\s"]/.test(a) ? `"${a}"` : a)).join(' ');
	for (const [i, [argv, label]] of steps.entries()) {
		if ((await runDesign(argv, adapter(), io)) !== 0) throw new Error(`design ${shell(argv)} failed`);
		copyFileSync(join(cwd, 'banner.png'), join(out, `design-${i + 1}.png`));
		index.design.steps.push({ step: i + 1, label, src: `/gallery/design-${i + 1}.png`, width: 1500, height: 500, command: `${b} design ${shell(argv)}` });
	}
	const ask = ['revise', 'banner.design.json', 'make the logo neon green'];
	let said = '';
	if ((await runDesign(ask, adapter(), { ...io, err: (m) => (said += m) })) !== 1) throw new Error('an off-brand request was not refused');
	index.design.refused = { command: `${b} design ${shell(ask)}`, message: said.split('\n').slice(0, 2).join(' ') };
	await runDesign(['variants', 'banner.design.json', '--by', 'theme', '--count', '4'], adapter(), io);
	copyFileSync(join(cwd, 'banner-by-theme.png'), join(out, 'design-variants.png'));
	await runDesign(['sizes', 'banner.design.json', '--to', 'og,square,story'], adapter(), io);
	copyFileSync(join(cwd, 'banner-sizes.png'), join(out, 'design-sizes.png'));
	const dims = (f) => {
		const p = readFileSync(join(out, f));
		return { width: p.readUInt32BE(16), height: p.readUInt32BE(20) };
	};
	index.design.variants = { src: '/gallery/design-variants.png', ...dims('design-variants.png'), command: `${b} design variants banner.design.json --by theme` };
	index.design.sizes = { src: '/gallery/design-sizes.png', ...dims('design-sizes.png'), command: `${b} design sizes banner.design.json --to og,square,story` };
	index.design.file = readFileSync(join(cwd, 'banner.design.json'), 'utf8');
}
save('index.json', `${JSON.stringify(index, null, 2)}\n`);
const du = spawnSync('du', ['-sh', out], { encoding: 'utf8' }).stdout.trim();
console.log(`gallery: ${Object.values(index).flat().length + index.design.steps.length} examples, ${du}`);
