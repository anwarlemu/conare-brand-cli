import { dirname, join, resolve } from 'node:path';
import { assertDrawn } from '../design/adapter.js';
import { copyFlags, seedOf, sizesFrom, str, type Flags } from './flags.js';
import { picOf, pictureNotes } from './image.js';
import { display, num, pick, unknown, write, type OutFile } from './io.js';
import { customSize, imageDoc, LAYOUTS, sizeIds, sizeOf, type Layout, type Size } from './layouts.js';
import { compose, motionLength, renderDesign, type Design, type Pic } from './og.js';
import { readPicture } from './picture.js';
import { renderVideo, still, VIDEO_FORMATS, type VideoFormat } from './video.js';
import { renderMotion, type MotionKind } from './motion-extra.js';
import { VIDEO_SIZES } from '../video/spec.js';

// `video <layout>`: a share-image layout coming in the way the site moves (the label and lockup settle up, the
// headline's letters wait faint and red and settle to ink, the line follows, a window arrives on the long ease-out),
// then holds. MP4 (H.264) or WebM (VP9) through ffmpeg, or --still for one PNG frame.

/** Video sizes: the video ids (a vertical keeps the story's safe area), then the share sizes. */
export function videoSizeOf(token: string): Size | undefined {
	const n = token.trim().toLowerCase().replace('×', 'x');
	if (n === 'landscape' || n === '1920x1080') return { ...customSize(1920, 1080), id: 'landscape', label: 'Landscape 16:9', shown: 640 };
	if (n === 'vertical' || n === 'story' || n === '1080x1920') return { ...sizeOf('story')!, id: n === 'story' ? 'story' : 'vertical' };
	return sizeOf(n);
}

export function layoutVideoSizes() {
	const video = VIDEO_SIZES.map((s) => ({ id: s.id as string, width: s.width, height: s.height }));
	const image = sizeIds().filter((id) => id !== 'avatar' && !video.some((v) => v.id === id)).map((id) => ({ id, width: sizeOf(id)!.w, height: sizeOf(id)!.h }));
	return [...video, ...image];
}

/** `video logo-reveal | lower-third | stat | walkthrough`: the motion pieces that are not one layout coming in. */
export async function runMotionVideo(cwd: string, kind: MotionKind, args: string[], flags: Flags): Promise<{ json: unknown; text: string }> {
	if (args.length) throw new Error(`Unexpected \`${args.join(' ')}\`.`);
	const fps = num('fps', flags.fps, 12, 60, { integer: true }) ?? 30;
	const fmt = (str(flags.format) ?? (kind === 'lower-third' ? 'webm' : 'mp4')).split(',').flatMap((f) => (f === 'both' ? ['mp4', 'webm'] : [f]));
	const formats = fmt.map((f) => pick('format', f, [...VIDEO_FORMATS] as const) as VideoFormat);
	const theme = str(flags.theme) ? pick('theme', str(flags.theme)!, Object.keys(imageDoc().themes)) : undefined;
	const size = videoSizeOf(str(flags.size) ?? (kind === 'lower-third' ? 'landscape' : 'square'));
	if (!size) throw unknown('size', String(flags.size), layoutVideoSizes().map((x) => x.id));
	const copy = copyFlags(flags);
	let design: Design | undefined;
	let pictures: Pic[] = [];
	if (kind === 'stat') design = compose({ template: 'funding', size, theme, headline: copy.headline, body: copy.body, badgeText: copy.badge, highlight: str(flags.highlight) });
	if (kind === 'walkthrough') {
		const list = (str(flags.image) ?? '').split(',').map((x) => x.trim()).filter(Boolean);
		for (const f of list) pictures.push(picOf(await readPicture(cwd, f, 2000)));
		design = compose({ template: 'feature', size, theme, headline: copy.headline, body: copy.body, badgeText: copy.badge });
	}
	const dir = resolve(cwd, str(flags.out) ?? 'imagery');
	const files: OutFile[] = [];
	for (const f of formats) {
		const r = await renderMotion({ kind, size, theme, design, pictures, name: str(flags.name), role: str(flags.role), fps, format: f });
		const path = join(dir, `${kind}-${size.id}${theme ? `-${theme}` : ''}.${f}`);
		write(path, r.data);
		files.push({ path: display(cwd, path), format: f, template: kind, size: size.id, width: r.w, height: r.h, fps, frames: r.frames, seconds: r.seconds });
	}
	return { json: { files }, text: files.map((f) => `${f.path}  ${f.width}x${f.height}  ${f.frames} frames at ${f.fps} fps (${f.seconds}s)`).join('\n') };
}

export async function runLayoutVideo(cwd: string, template: string, args: string[], flags: Flags): Promise<{ json: unknown; text: string }> {
	if (args.length) throw new Error(`Unexpected \`${args.join(' ')}\`. Pass the layout, --size and --headline.`);
	for (const n of ['image', 'size', 'theme', 'out', 'format', 'highlight', 'fps', 'at', 'seed']) if (flags[n] === true) throw new Error(`--${n} needs a value.`);
	const layout = pick('template', template, LAYOUTS.filter((l) => l !== 'avatar')) as Layout;
	if (str(flags.theme) && str(flags.ground)) throw new Error('Pass --theme or --ground, not both.');
	const theme = str(flags.theme) ? pick('theme', str(flags.theme)!, Object.keys(imageDoc().themes)) : str(flags.ground) === 'ink' ? 'black' : str(flags.ground) ? pick('ground', str(flags.ground)!, ['paper']) : undefined;
	const copy = copyFlags(flags);
	const highlight = str(flags.highlight) ? pick('highlight', str(flags.highlight)!, Object.keys(imageDoc().highlights)) : undefined;
	const fps = num('fps', flags.fps, 12, 60, { integer: true }) ?? 30;
	const at = num('at', flags.at, 0, 60);
	const isStill = flags.still === true || at !== undefined;
	const out = str(flags.out);
	const outExt = out ? /\.(mp4|webm|png)$/i.exec(out)?.[1]?.toLowerCase() : undefined;
	const formatRaw = str(flags.format) ?? (isStill ? 'png' : outExt === 'webm' ? 'webm' : 'mp4');
	if (isStill) pick('format', formatRaw, ['png']);
	const formats = isStill ? [] : formatRaw.split(',').flatMap((f) => (f === 'both' ? [...VIDEO_FORMATS] : [pick('format', f, [...VIDEO_FORMATS, 'both'] as const) as VideoFormat]));
	if (outExt && outExt !== (isStill ? 'png' : formats[0])) throw new Error(`--out ends in .${outExt} and this writes ${isStill ? 'png' : formats.join(', ')}.`);
	if (str(flags.image) && layout !== 'feature' && layout !== 'app') throw new Error(`${layout} has no picture window. --image goes in the feature layout (or app).`);
	const picture = str(flags.image) ? await readPicture(cwd, str(flags.image)!, 2000) : null;
	const pic: Pic | null = picture ? picOf(picture) : null;
	const sizes = (str(flags.size) ?? (flags.width ? 'custom' : 'square')).split(',').map((s) => s.trim()).filter(Boolean).flatMap((t) => {
		if (t.toLowerCase() === 'all') return layoutVideoSizes().map((s) => videoSizeOf(s.id)!);
		if (t.toLowerCase() === 'custom') return sizesFrom(['custom'], flags, []);
		const s = videoSizeOf(t);
		if (!s || s.id === 'avatar') throw unknown('size', t, [...layoutVideoSizes().map((x) => x.id), 'all']);
		return [s];
	});
	const named = outExt ? resolve(cwd, out!) : undefined;
	if (named && sizes.length * Math.max(1, formats.length) > 1) throw new Error('--out is a file, so ask for one size and one format. For several, pass a directory.');
	const dir = named ? dirname(named) : resolve(cwd, out ?? 'imagery');
	const files: OutFile[] = [];
	const notes = new Set<string>();
	const designs = [...new Map(sizes.map((x) => [x.id + x.w + x.h, x])).values()].map((size) => [size, compose({ template: layout, size, theme, headline: copy.headline, body: copy.body, badge: copy.badgeStyle, badgeText: copy.badge, note: copy.note, page: copy.page, highlight, partner: copy.partner, credit: copy.credit, seed: seedOf(flags), sample: flags.sample === true })] as [Size, Design]);
	for (const [size, d] of designs) {
		/* Draws the still first: copy that does not fit is refused before any frame is written. */
		const first = await renderDesign(d, pic, { png: false, svg: false, rgb: true });
		assertDrawn({ kind: 'image', template: layout, size: { id: size.id === 'vertical' ? 'story' : size.id === 'landscape' ? 'video' : size.id, width: size.w, height: size.h }, copy: flags.sample === true ? {} : { headline: copy.headline, body: copy.body, badge: copy.badge, note: copy.note, page: copy.page, credit: copy.credit, partner: copy.partner }, layers: first.layers });
		for (const n of pictureNotes(picture, first.layers.find((l) => l.id === 'picture')?.box.w ?? 0, str(flags.image))) notes.add(n);
		if (size.note) notes.add(`${size.label}: ${size.note}`);
		const stem = named ? named.replace(/\.(mp4|webm|png)$/i, '') : join(dir, `${layout}-${size.id === 'custom' ? `${size.w}x${size.h}` : size.id}${theme ? `-${theme}` : ''}`);
		if (isStill) {
			const png = await still(d, pic, at === undefined ? undefined : at);
			write(`${stem}.png`, png);
			files.push({ path: display(cwd, `${stem}.png`), format: 'png', template: layout, size: size.id, width: size.w, height: size.h, at: at ?? motionLength(d) });
			continue;
		}
		for (const f of formats) {
			const v = await renderVideo(d, pic, fps, f, undefined, { loop: flags.loop === true || f === 'gif' });
			write(`${stem}.${f}`, v.data);
			files.push({ path: display(cwd, `${stem}.${f}`), format: f, template: layout, size: size.id, width: size.w, height: size.h, fps, frames: v.frames, seconds: v.seconds });
		}
	}
	return { json: { files, notes: [...notes] }, text: [...files.map((f) => `${f.path}  ${f.width}x${f.height}${f.frames ? `  ${f.frames} frames at ${f.fps} fps (${f.seconds}s)` : ''}`), ...[...notes].map((n) => `note: ${n}`)].join('\n') };
}
