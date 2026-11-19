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
const index = { images: [], sizes: [], slides: [], illustrations: [], merch: [], videos: [] };
const save = (name, data) => writeFileSync(join(out, name), data);

for (const t of og.LAYOUTS) {
	const d = og.compose({ template: t, w: 1200, h: 630 });
	const r = await og.renderDesign(d, null, { png: true });
	save(`image-${t}.png`, r.png);
	const doc = og.imageDoc().templates[t];
	index.images.push({ id: t, label: doc.label, description: doc.description, theme: d.theme, src: `/gallery/image-${t}.png`, width: 1200, height: 630, command: `${b} image --template ${t} --title "${doc.headline}"` });
}
for (const size of ['square', 'portrait', 'story', 'x-banner', 'linkedin-banner', 'email']) {
	const s = og.sizeOf(size);
	const r = await og.renderDesign(og.compose({ template: 'room', w: s.w, h: s.h }), null, { png: true });
	save(`size-room-${size}.png`, r.png);
	index.sizes.push({ id: size, label: s.label, src: `/gallery/size-room-${size}.png`, width: s.w, height: s.h, command: `${b} image --template room --size ${size}` });
}
for (const type of deck.slideTypes()) {
	const r = await deck.renderSlide({ type }, { png: true });
	save(`slide-${type}.png`, r.png);
	const d = deck.deckDoc().slides[type];
	index.slides.push({ id: type, label: d.name, description: d.description, src: `/gallery/slide-${type}.png`, width: 1920, height: 1080, command: `${b} deck ${type}` });
}
for (const subject of ill.SUBJECTS()) {
	const r = ill.renderSubject({ subject, width: 900, height: 600 }, { png: true, svg: true });
	save(`illustration-${subject}.png`, r.png);
	save(`illustration-${subject}.svg`, r.svg);
	index.illustrations.push({ id: subject, description: ill.illustrateDoc().subjects[subject], theme: r.theme, src: `/gallery/illustration-${subject}.png`, svg: `/gallery/illustration-${subject}.svg`, width: 900, height: 600, command: `${b} illustrate ${subject} --size 900x600` });
}
for (const item of merch.merchItems()) {
	const variant = item.variants.find((v) => v !== 'white') ?? item.variants[0];
	const r = merch.renderItem(item, { variant, dpi: 50, png: true, guides: true });
	save(`merch-${item.id}.png`, r.png);
	index.merch.push({ id: item.id, label: item.name, variant: r.variant, variants: item.variants, trim: `${item.size[0]} x ${item.size[1]} in`, bleed: item.bleed, safe: item.safe, method: item.method, src: `/gallery/merch-${item.id}.png`, width: r.width, height: r.height, command: `${b} merch ${item.id} --variant ${r.variant}` });
}
if (video.hasFfmpeg()) {
	for (const [t, size] of [['hero', 'og'], ['room', 'square']]) {
		const s = og.sizeOf(size);
		const d = og.compose({ template: t, w: s.w, h: s.h });
		for (const f of ['mp4', 'webm']) {
			const v = await video.renderVideo(d, null, 30, f);
			save(`video-${t}.${f}`, v.data);
		}
		save(`video-${t}.png`, await video.still(d, null));
		index.videos.push({ id: t, src: `/gallery/video-${t}.mp4`, webm: `/gallery/video-${t}.webm`, poster: `/gallery/video-${t}.png`, width: s.w, height: s.h, command: `${b} video --template ${t} --size ${size} --format both` });
	}
} else console.warn('ffmpeg is not on PATH: the gallery has no videos.');
save('index.json', `${JSON.stringify(index, null, 2)}\n`);
const du = spawnSync('du', ['-sh', out], { encoding: 'utf8' }).stdout.trim();
console.log(`gallery: ${Object.values(index).flat().length} examples, ${du}`);
