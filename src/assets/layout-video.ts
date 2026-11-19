import { dirname, join, resolve } from 'node:path';
import { BADGES, LAYOUTS, compose, imageDoc, motionLength, sizeIds, sizeOf, type BadgeStyle, type Layout, type Pic } from './og.js';
import { display, num, pick, unknown, write, type OutFile } from './io.js';
import { readPicture } from './picture.js';
import { renderVideo, still, VIDEO_FORMATS, type VideoFormat } from './video.js';
import { VIDEO_SIZES } from '../video/spec.js';

// `video --template <layout>`: a share-image layout coming in the way the site moves (the label and lockup settle up,
// the headline's letters wait faint and red and settle to ink, the line follows, a window arrives on the long
// ease-out), then holds. MP4 (H.264) or WebM (VP9) through ffmpeg, or --still for one PNG frame.

type Flags = Record<string, string | boolean | string[] | undefined>;
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

export function layoutVideoSizes() {
	const video = VIDEO_SIZES.map((s) => ({ id: s.id, width: s.width, height: s.height }));
	const image = sizeIds().filter((id) => !video.some((v) => v.id === id)).map((id) => ({ id, width: sizeOf(id)!.w, height: sizeOf(id)!.h }));
	return [...video, ...image];
}

function sizeFor(token: string) {
	const all = layoutVideoSizes();
	const n = token.trim().toLowerCase().replace('×', 'x');
	const hit = all.find((s) => s.id === n || `${s.width}x${s.height}` === n) ?? (sizeOf(n) ? all.find((s) => s.id === sizeOf(n)!.id) : undefined);
	if (!hit) throw unknown('size', token, [...all.map((s) => s.id), 'all']);
	return hit;
}

export async function runLayoutVideo(cwd: string, args: string[], flags: Flags): Promise<{ json: unknown; text: string }> {
	if (args.length) throw new Error(`Unexpected \`${args.join(' ')}\`. Pass --template, --size and --title.`);
	for (const n of ['title', 'text', 'eyebrow', 'image', 'size', 'theme', 'out', 'format', 'badge', 'highlight', 'partner', 'credit', 'fps', 'at']) if (flags[n] === true) throw new Error(`--${n} needs a value.`);
	const template = pick('template', String(flags.template), LAYOUTS) as Layout;
	const theme = str(flags.theme) ? pick('theme', str(flags.theme)!, Object.keys(imageDoc().themes)) : str(flags.ground) === 'ink' ? 'black' : str(flags.ground) ? pick('ground', str(flags.ground)!, ['paper']) : undefined;
	const badge = str(flags.badge) ? (pick('badge', str(flags.badge)!, BADGES) as BadgeStyle) : undefined;
	const highlight = str(flags.highlight) ? pick('highlight', str(flags.highlight)!, Object.keys(imageDoc().highlights)) : undefined;
	const fps = num('fps', flags.fps, 12, 60, { integer: true }) ?? 30;
	const at = num('at', flags.at, 0, 60);
	const isStill = flags.still === true || at !== undefined;
	const formatRaw = str(flags.format) ?? (isStill ? 'png' : 'mp4');
	const formats: string[] = formatRaw === 'both' ? ['mp4', 'webm'] : [formatRaw];
	if (isStill) pick('format', formatRaw, ['png']);
	else for (const f of formats) pick('format', f, [...VIDEO_FORMATS, 'both']);
	if (str(flags.image) && template !== 'feature') throw new Error(`${template} has no picture window. --image goes in the feature layout.`);
	let pic: Pic | null = null;
	if (str(flags.image)) {
		const p = await readPicture(cwd, str(flags.image)!, 1600);
		pic = { img: p.canvas, w: p.width, h: p.height };
	}
	const tokens = (str(flags.size) ?? 'square').split(',').map((s) => s.trim()).filter(Boolean);
	const sizes = tokens.flatMap((t) => (t.toLowerCase() === 'all' ? layoutVideoSizes() : [sizeFor(t)]));
	const out = str(flags.out);
	const named = out && /\.(mp4|webm|png)$/i.test(out) ? resolve(cwd, out) : undefined;
	if (named && sizes.length * formats.length > 1) throw new Error('--out is a file, so ask for one size and one format. For several, pass a directory.');
	const dir = named ? dirname(named) : resolve(cwd, out ?? 'imagery');
	const files: OutFile[] = [];
	for (const s of [...new Map(sizes.map((x) => [x.id, x])).values()]) {
		const d = compose({ template, w: s.width, h: s.height, theme, headline: typeof flags.title === 'string' ? flags.title : undefined, body: typeof flags.text === 'string' ? flags.text : undefined, badge, badgeText: typeof flags.eyebrow === 'string' ? flags.eyebrow : undefined, highlight, partner: typeof flags.partner === 'string' ? flags.partner : undefined, credit: str(flags.credit) });
		const stem = named ? named.replace(/\.(mp4|webm|png)$/i, '') : join(dir, `${template}-${s.id}${theme ? `-${theme}` : ''}`);
		if (isStill) {
			const png = await still(d, pic, at === undefined ? undefined : at);
			write(`${stem}.png`, png);
			files.push({ path: display(cwd, `${stem}.png`), format: 'png', template, size: s.id, width: s.width, height: s.height, at: at ?? motionLength(d) });
			continue;
		}
		for (const f of formats as VideoFormat[]) {
			const v = await renderVideo(d, pic, fps, f);
			write(`${stem}.${f}`, v.data);
			files.push({ path: display(cwd, `${stem}.${f}`), format: f, template, size: s.id, width: s.width, height: s.height, fps, frames: v.frames, seconds: v.seconds });
		}
	}
	return { json: { files }, text: files.map((f) => `${f.path}  ${f.width}x${f.height}${f.frames ? `  ${f.frames} frames at ${f.fps} fps (${f.seconds}s)` : ''}`).join('\n') };
}
