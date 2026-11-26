// Measuring and wrapping against the real font, so a line breaks where it will draw.
export function measure(face, text, size, trackingEm = 0) {
    if (!text)
        return 0;
    const chars = [...text];
    const tracking = trackingEm * size * Math.max(0, chars.length - 1);
    return face.font.getAdvanceWidth(text, size) + tracking;
}
/** Cap height of H, so a line can sit on its letters rather than on the font's accent box. */
export function capHeight(face, size) {
    const box = face.font.charToGlyph('H').getBoundingBox();
    return (box.y2 / face.font.unitsPerEm) * size;
}
/** Depth of y below the baseline. */
export function descent(face, size) {
    const box = face.font.charToGlyph('y').getBoundingBox();
    return Math.max(0, (-box.y1 / face.font.unitsPerEm) * size);
}
export function blockHeight(face, lines, size, leading) {
    if (!lines.length)
        return 0;
    return capHeight(face, size) + (lines.length - 1) * size * leading + descent(face, size);
}
/**
 * Largest size in the range whose wrap fits the width, the line cap and the height, or undefined: copy is never cut.
 * `breakWords` lets a word wider than the line break between letters at the smallest size.
 */
export function fit(face, text, maxWidth, opts) {
    const clean = normalize(text);
    const floor = Math.floor(opts.minSize);
    for (let size = Math.floor(opts.maxSize); size >= floor; size -= 1) {
        const lines = wrap(face, clean, size, maxWidth, opts.tracking, opts.breakWords === true && size === floor);
        const tooWide = lines.some((l) => measure(face, l, size, opts.tracking) > maxWidth + 0.5);
        if (!tooWide && lines.length <= opts.maxLines && blockHeight(face, lines, size, opts.leading) <= opts.maxHeight + 0.5)
            return { size, lines: balance(face, clean, size, maxWidth, opts.tracking, lines) };
    }
    return undefined;
}
/** The same number of lines at the narrowest width that holds them, so the last line is not a word on its own. */
function balance(face, text, size, maxWidth, tracking, lines) {
    if (lines.length < 2 || lines.length > 6 || text.includes('\n'))
        return lines;
    let lo = Math.max(...text.split(/\s+/).map((w) => measure(face, w, size, tracking)));
    let hi = maxWidth;
    if (lo >= hi)
        return lines;
    for (let i = 0; i < 12; i++) {
        const mid = (lo + hi) / 2;
        if (wrap(face, text, size, mid, tracking).length <= lines.length)
            hi = mid;
        else
            lo = mid;
    }
    const even = wrap(face, text, size, hi, tracking);
    return even.length === lines.length ? even : lines;
}
export function wrap(face, text, size, maxWidth, tracking, breakWords = true) {
    const lines = [];
    for (const paragraph of text.split('\n')) {
        const words = paragraph.split(/\s+/).filter(Boolean);
        if (!words.length)
            continue;
        let line = '';
        for (const word of words) {
            const next = line ? `${line} ${word}` : word;
            if (measure(face, next, size, tracking) <= maxWidth)
                line = next;
            else {
                if (line)
                    lines.push(line);
                line = !breakWords || measure(face, word, size, tracking) <= maxWidth ? word : breakWord(face, word, size, maxWidth, tracking, lines);
            }
        }
        if (line)
            lines.push(line);
    }
    return lines.length ? lines : [''];
}
function breakWord(face, word, size, maxWidth, tracking, lines) {
    let chunk = '';
    for (const ch of word) {
        const next = chunk + ch;
        if (measure(face, next, size, tracking) <= maxWidth)
            chunk = next;
        else {
            if (chunk)
                lines.push(chunk);
            chunk = ch;
        }
    }
    return chunk;
}
export function normalize(text) {
    return text
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((l) => l.replace(/[ \t]+/g, ' ').trim())
        .join('\n')
        .trim();
}
/** The site's headlines carry a red full stop. Keep a stop the copy already has, including one before a closing quote, and add one when it has none. A quote by itself is not a stop. */
export function withStop(text) {
    const t = normalize(text);
    if (/[.?!…]['"”’]*$/.test(t))
        return t;
    return `${t}.`;
}
