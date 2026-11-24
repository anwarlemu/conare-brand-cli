import { brand } from '../lib/brand.js';
import { copyFlags, str, type Flags } from '../assets/flags.js';
import { unknown } from '../assets/io.js';
import { LAYOUTS } from '../assets/og.js';
import { layoutVideoSizes, runLayoutVideo, runMotionVideo } from '../assets/layout-video.js';
import { MOTIONS, type MotionKind } from '../assets/motion-extra.js';
import { helpRow } from '../lib/help-row.js';
import { renderVideo, writeVideos, type WrittenVideo } from '../video/render.js';
import { refuseVideo, resolveVideo, videoCatalog, videoTemplate, VIDEO_CODEC, VIDEO_FPS, VIDEO_FRAMES, VIDEO_TEMPLATES } from '../video/spec.js';

export function videoHelp(): string {
	const b = brand().bin;
	return [
		'Short videos from the brand tokens, the vendored faces and the logo files.',
		`Headless Motion JPEG MP4, ${VIDEO_FRAMES} frames at ${VIDEO_FPS} fps. The same inputs write the same bytes.`,
		'No browser and no system fonts. The file plays in ffprobe, ffmpeg, VLC and QuickTime. It is not H.264.',
		'',
		`  ${b} video --template headline --size square --title "..."`,
		`  ${b} video --template statement --size landscape --title "..." --text "..."`,
		`  ${b} video --template announcement --size vertical --title "..." --eyebrow "..." --text "..."`,
		`  ${b} video --template logo --size all`,
		`  ${b} video --list`,
		'',
		'Templates: headline, statement, announcement, logo. There is no default template.',
		'Sizes: square 1080x1080, vertical 1080x1920 (9:16), landscape 1920x1080 (16:9). Default size is square. --size all writes every size.',
		'--ground paper (the default) or ink. --out is a directory (default imagery/) or one .mp4 when there is one size.',
		'Headline does not draw --text. Logo does not draw a title, --text or --eyebrow.',
		'--text and --subtitle must match when both are set.',
		'',
		'Layout videos: any share-image layout coming in the way the site moves, through ffmpeg (H.264 MP4 or VP9 WebM):',
		helpRow(`${b} video hero --headline "..." --size landscape`, 'The homepage card, 30 fps MP4', 54),
		helpRow(`${b} video room --sample --size vertical --format both`, 'MP4 and WebM for a story', 54),
		helpRow(`${b} video card --sample --still`, 'The settled last frame as PNG', 54),
		helpRow(`${b} video hero --sample --at 0.5`, 'The frame half a second in, as PNG', 54),
		`Layouts: ${LAYOUTS.filter((l) => l !== 'avatar').join(', ')}. Sizes: ${layoutVideoSizes().map((s) => `${s.id} ${s.width}x${s.height}`).join(', ')}.`,
		'The label and lockup settle up 12px over the entrance step, the headline letters wait faint and red and settle to ink (40ms apart, lines 100ms apart),',
		'the line and footer follow, a window arrives on the long ease-out, then the frame holds 1.5s. Every curve and duration is a motion token; nothing eases in.',
		helpRow(`${b} video logo-reveal --theme red`, 'The lockup settling in: an intro or outro sting', 54),
		helpRow(`${b} video lower-third --name "Ada Acme" --role "Acme"`, 'A name and role on a transparent ground (WebM)', 54),
		helpRow(`${b} video stat --headline "100M+ documents"`, 'The big number counting up to its value', 54),
		helpRow(`${b} video walkthrough --image a.png,b.png,c.png --headline "..."`, 'Screenshots one after another in the window', 54),
		'--loop fades a layout video to its ground at the end so it loops cleanly (gif always does).',
		'--fps 12 to 60 (default 30). --format mp4 (default), webm, gif or a list. --headline, --body, --badge, --theme, --highlight, --partner, --credit, --note, --image, --seed and --sample as in image.',
		'Only the copy you pass is drawn; copy that does not fit whole is an error naming what to shorten.',
	].join('\n');
}

export async function runVideo(cwd: string, args: string[], flags: Flags): Promise<{ json: unknown; text: string }> {
	if (flags.help === true) return { json: videoCatalog(), text: videoHelp() };
	if (flags.list === true || args[0] === 'list') {
		const spec = videoCatalog();
		const text = [
			'Templates',
			...spec.templates.map((template) => `  ${template.id.padEnd(16)}${template.description}`),
			'',
			'Sizes',
			...spec.sizes.map((size) => `  ${size.id.padEnd(16)}${String(size.width).padStart(4)}x${size.height}  ${size.description}`),
			'',
			'Grounds',
			...spec.grounds.map((ground) => `  ${ground.id.padEnd(16)}${ground.description}`),
			'',
			`${spec.frames} frames at ${spec.fps} fps. ${spec.codec} in ${spec.container}.`,
		].join('\n');
		return { json: spec, text };
	}
	const first = args[0]?.toLowerCase();
	const flagTemplate = str(flags.template)?.toLowerCase();
	const known = (t: string) => (LAYOUTS as readonly string[]).includes(t) || Boolean(videoTemplate(t));
	const firstIs = Boolean(first && known(first));
	if (firstIs && flagTemplate && first !== flagTemplate) throw new Error(`\`${first}\` and --template ${flagTemplate} disagree. Pass one.`);
	const asked = flagTemplate ?? (firstIs ? first : undefined);
	const rest = firstIs ? args.slice(1) : args;
	if (first && (MOTIONS as readonly string[]).includes(first)) return runMotionVideo(cwd, first as MotionKind, args.slice(1), flags);
	if (asked && (LAYOUTS as readonly string[]).includes(asked)) return runLayoutVideo(cwd, asked, rest, flags);
	if (!asked && rest[0] && !/\s/.test(rest[0])) throw unknown('template', rest[0], [...VIDEO_TEMPLATES.map((t) => t.id), ...LAYOUTS.filter((l) => l !== 'avatar')]);
	for (const f of ['highlight', 'partner', 'credit', 'note', 'page', 'badge-style', 'image', 'format', 'fps', 'at', 'still', 'seed', 'sample', 'width', 'height']) if (flags[f] !== undefined) throw new Error(`--${f} goes with a layout video (${LAYOUTS.filter((l) => l !== 'avatar').join(', ')}).`);
	blank(flags, ['template', 'title', 'headline', 'text', 'body', 'subtitle', 'eyebrow', 'badge', 'size', 'ground', 'theme', 'out']);
	if (rest.length) throw new Error(`Unexpected \`${rest.join(' ')}\`. Pass --template, --size and --title.`);
	const copy = copyFlags(flags);
	if (str(flags.out) && /\.(webm|mov|gif|png)$/i.test(str(flags.out)!)) throw new Error('The clips are MP4: name the file .mp4, or use a layout video for WebM.');
	const requested = resolveVideo({ template: asked, size: str(flags.size), ground: str(flags.ground) ?? str(flags.theme) });
	const title = copy.headline?.trim() || undefined;
	const text = copy.body?.trim() || undefined;
	const eyebrow = copy.badge?.trim() || undefined;
	refuseVideo(requested.template, { title, text, eyebrow });
	const clips = await renderVideo({ ...requested, title, text, eyebrow });
	const files = writeVideos(cwd, str(flags.out), clips);
	return {
		json: { template: requested.template, ground: requested.ground, fps: VIDEO_FPS, frames: VIDEO_FRAMES, codec: VIDEO_CODEC, files: files.map(fileJson) },
		text: files.map((file) => `${file.path}  ${file.width}x${file.height}  ${file.frames} frames at ${file.fps} fps`).join('\n'),
	};
}

function fileJson(file: WrittenVideo) {
	return { path: file.path, format: file.format, template: file.template, size: file.size, ground: file.ground, width: file.width, height: file.height, fps: file.fps, frames: file.frames };
}

function blank(flags: Flags, names: string[]) {
	for (const name of names) if (flags[name] === '' || flags[name] === true) throw new Error(`--${name} needs a value.`);
}
