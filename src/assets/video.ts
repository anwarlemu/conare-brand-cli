import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { surface, rgbOf, toPng } from './canvas.js';
import { drawDesign, motionLength, type Design, type Pic } from './og.js';

// Layout videos: every frame drawn by the same code as the still (drawDesign with a time), piped as raw RGB into
// ffmpeg. MP4 is H.264 (yuv420p, faststart), WebM is VP9; both single-threaded and bit-exact, so the same inputs
// write the same bytes on one ffmpeg build.

export const VIDEO_FORMATS = ['mp4', 'webm'] as const;
export type VideoFormat = (typeof VIDEO_FORMATS)[number];

export function hasFfmpeg(): boolean {
	const r = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
	return r.status === 0;
}

/** One frame at `t` seconds as PNG (the still option). */
export async function still(d: Design, pic: Pic | null, t?: number): Promise<Buffer> {
	const s = surface(d.w, d.h);
	await drawDesign(s.ctx, d, pic, t === undefined ? undefined : { t, u: 1 });
	return toPng(s, { opaque: true });
}

/** Draws every frame and streams it into ffmpeg; returns the file's bytes and its length in seconds. */
export async function renderVideo(d: Design, pic: Pic | null, fps: number, format: VideoFormat, seconds?: number): Promise<{ data: Buffer; seconds: number; frames: number }> {
	if (!hasFfmpeg()) throw new Error('ffmpeg is not on PATH. Install it (brew install ffmpeg, apt install ffmpeg) or pass --still for a PNG.');
	const len = seconds ?? motionLength(d);
	const n = Math.max(1, Math.round(len * fps));
	const dir = mkdtempSync(join(tmpdir(), 'ds-video-'));
	const file = join(dir, `out.${format}`);
	const pad = 'pad=ceil(iw/2)*2:ceil(ih/2)*2';
	const codec = format === 'mp4'
		? ['-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-x264-params', 'threads=1']
		: ['-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '30', '-pix_fmt', 'yuv420p', '-row-mt', '0'];
	const args = ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${d.w}x${d.h}`, '-r', String(fps), '-i', '-', '-vf', pad, ...codec, '-threads', '1', '-map_metadata', '-1', '-fflags', '+bitexact', '-flags:v', '+bitexact', file];
	const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'ignore', 'pipe'] });
	let err = '';
	ff.stderr.on('data', (c) => (err += c));
	const done = new Promise<number>((res) => ff.on('close', (code) => res(code ?? 1)));
	try {
		for (let i = 0; i < n; i++) {
			const s = surface(d.w, d.h);
			await drawDesign(s.ctx, d, pic, { t: i / fps, u: 1 });
			if (!ff.stdin.write(rgbOf(s).rgb)) await new Promise((r) => ff.stdin.once('drain', r));
		}
		ff.stdin.end();
		const code = await done;
		if (code !== 0) throw new Error(`ffmpeg failed: ${err.trim()}`);
		return { data: readFileSync(file), seconds: len, frames: n };
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}
