// The docs site's gallery of generated assets (apps/www/public/gallery and its index.json): every share layout, a
// layout at the social sizes, each deck slide, each illustration subject, each merch item and a layout video, drawn
// by the CLI's own modules (run `bun run build` first). Deterministic, so a rerun with no brand change rewrites the
// same bytes. Run it after a change to brand/assets or src/assets: `node scripts/docs-assets.mjs`.
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
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

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const index = { images: [], sizes: [], slides: [], illustrations: [], merch: [], videos: [], design: { steps: [] } };
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
for (const size of ['square', 'portrait', 'story', 'x-banner', 'linkedin-banner', 'email']) {
	const s = og.sizeOf(size);
	const r = await og.renderDesign(og.compose({ template: 'room', size: s, headline: roomHead }), null, { png: true });
	save(`size-room-${size}.png`, r.png);
	index.sizes.push({ id: size, label: s.label, src: `/gallery/size-room-${size}.png`, width: s.w, height: s.h, command: `${b} image room --headline "${roomHead}" --size ${size}` });
}
for (const type of deck.slideTypes()) {
	const r = await deck.renderSlide({ type, sample: true }, { png: true });
	save(`slide-${type}.png`, r.png);
	const d = deck.deckDoc().slides[type];
	index.slides.push({ id: type, label: d.name, description: d.description, src: `/gallery/slide-${type}.png`, width: 1920, height: 1080, command: `${b} deck ${type} --sample` });
}
for (const subject of ill.SUBJECTS()) {
	const r = ill.renderSubject({ subject, width: 900, height: 600 }, { png: true, svg: true });
	save(`illustration-${subject}.png`, r.png);
	save(`illustration-${subject}.svg`, r.svg);
	index.illustrations.push({ id: subject, description: ill.illustrateDoc().subjects[subject], theme: r.theme, src: `/gallery/illustration-${subject}.png`, svg: `/gallery/illustration-${subject}.svg`, width: 900, height: 600, command: `${b} illustrate ${subject} --size 900x600` });
}
for (const item of merch.merchItems()) {
	const variant = item.variants.find((v) => v !== 'white') ?? item.variants[0];
	const r = merch.renderItem(item, { variant, dpi: 72, png: true, guides: true, sample: true });
	save(`merch-${item.id}.png`, r.png);
	index.merch.push({ id: item.id, label: item.name, variant: r.variant, variants: item.variants, trim: `${item.size[0]} x ${item.size[1]} in`, bleed: item.bleed, safe: item.safe, method: item.method, src: `/gallery/merch-${item.id}.png`, width: r.width, height: r.height, command: `${b} merch ${item.id} --variant ${r.variant}${item.layers.some((l) => l.type === 'text' && l.slot === 'headline') ? ' --sample' : ''}` });
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
} else console.warn('ffmpeg is not on PATH: the gallery has no videos.');
// A design made and revised step by step with the design command, as a person would, and one refused request.
{
	const { runDesign } = await import(join(root, 'dist', 'design', 'index.js'));
	const { adapter, paint } = await import(join(root, 'dist', 'design', 'adapter.js'));
	const { mkdtempSync, readFileSync, copyFileSync } = await import('node:fs');
	const { tmpdir } = await import('node:os');
	const cwd = mkdtempSync(join(tmpdir(), 'ds-design-'));
	const io = { cwd, bin: b, out: () => {}, err: (m) => console.warn(m), paint };
	const steps = [
		[['new', 'hero', '--size', 'x-banner', '--headline', 'Every answer comes back with its source', '--body', 'Search across the documents you connect, from one API.', '-o', 'banner.design.json'], 'A new X header'],
		[['revise', 'banner.design.json', 'bigger logo'], 'Bigger logo'],
		[['revise', 'banner.design.json', 'left align the headline'], 'Words set left; the logo follows'],
		[['edit', 'banner.design.json', '--set', 'badge=Now in beta'], 'A badge'],
		[['revise', 'banner.design.json', 'paper theme, hide the guides'], 'Paper, without the guides'],
		[['revise', 'banner.design.json', 'headline a bit bigger'], 'A bigger headline, set again'],
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
