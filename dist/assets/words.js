/** A line with *emphasis* as words. Only a closed pair of stars round words is emphasis; any other star is drawn. */
export function parseLine(line) {
    const STAR = '\u0000';
    const out = [];
    const src = line.replaceAll('\\*', STAR);
    const re = /(^|[\s("'“‘])\*(\S(?:[^*]*\S)?)\*(?=$|[\s.,;:!?)"'”’])/g;
    let at = 0;
    const push = (s, hi) => {
        for (const t of s.split(/(\s+)/)) {
            if (!t)
                continue;
            if (/^\s+$/.test(t)) {
                glue = false;
                continue;
            }
            const text = t.replaceAll(STAR, '*');
            const last = out[out.length - 1];
            /* A mark next to a word with no space between them stays on it: *agents*, with its comma. */
            if (glue && last && last.hi === hi)
                last.text += text;
            else
                out.push({ text, hi, ...(glue && last ? { glued: true } : {}) });
            glue = true;
        }
    };
    let glue = false;
    for (const m of src.matchAll(re)) {
        push(src.slice(at, m.index + m[1].length), false);
        const from = out.length;
        push(m[2], true);
        if (out[from])
            out[from].raw = `*${out[from].raw ?? out[from].text}`;
        const last = out[out.length - 1];
        last.raw = `${last.raw ?? last.text}*`;
        at = m.index + m[0].length;
    }
    push(src.slice(at), false);
    return out;
}
const bare = (s) => s.replace(/\s+/g, '');
/** A piece of copy as it was typed, on one line. */
export const asTyped = (s) => s.replaceAll('\\*', '*').split('\n').map((l) => l.trim()).join(' ').replace(/\s+/g, ' ').trim();
/**
 * What a set of lines reads as, to compare with what was asked: the drawn words as they were typed (their stars kept).
 * A word broken between letters reads as one word when every letter of the copy is there, in order.
 */
export function readBack(asked, lines, stop = false) {
    let drawn = lines.map((l) => l.words.map((w, i) => (i && !w.glued ? ' ' : '') + (w.raw ?? w.text)).join('')).join(' ');
    if (stop && drawn.endsWith('.'))
        drawn = drawn.slice(0, -1);
    return bare(drawn) === bare(asked) ? asked : drawn;
}
/** The most words (fewer than `n`) for which `fits` holds, found by halving: what to shorten copy to. 0 when none fit. */
export function mostWords(n, fits) {
    let lo = 0;
    let hi = n - 1;
    while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        if (fits(mid))
            lo = mid;
        else
            hi = mid - 1;
    }
    return lo;
}
/** The plain words of a headline, stars removed, as they are read. */
export const plain = (s) => s.split('\n').map((l) => lineText(parseLine(l))).join(' ').replace(/\s+/g, ' ').trim();
function lineText(words) {
    let s = '';
    for (const [i, w] of words.entries())
        s += (i && !w.glued ? ' ' : '') + w.text;
    return s;
}
/**
 * Words wrapped to a width, with the context's font and tracking. A word wider than the line is broken between letters
 * when `breakLong` (nothing is dropped, no hyphen is added); otherwise it overflows and the caller sees a wide line.
 */
export function wrap(ctx, words, max, breakLong) {
    const space = ctx.measureText(' ').width;
    const lines = [];
    let cur = [];
    let w = 0;
    const end = () => {
        if (cur.length)
            lines.push({ words: cur, text: lineText(cur), w });
        cur = [];
        w = 0;
    };
    for (const word of words) {
        const glued = word.glued === true;
        const ww = ctx.measureText(word.text).width;
        const add = cur.length ? (glued ? ww : space + ww) : ww;
        if (cur.length && w + add > max + 0.01) {
            if (glued) {
                /* Keep a glued mark with the word it follows. */
                const prev = cur.pop();
                const pw = ctx.measureText(prev.text).width;
                w -= pw + (cur.length ? space : 0);
                end();
                cur = [prev];
                w = pw;
                if (w + ww <= max + 0.01) {
                    cur.push(word);
                    w += ww;
                    continue;
                }
            }
            else
                end();
        }
        if (!cur.length && ww > max + 0.01 && breakLong) {
            let chunk = '';
            for (const ch of word.text) {
                if (chunk && ctx.measureText(chunk + ch).width > max) {
                    cur = [{ text: chunk, hi: word.hi }];
                    w = ctx.measureText(chunk).width;
                    end();
                    chunk = ch;
                }
                else
                    chunk += ch;
            }
            cur = [{ text: chunk, hi: word.hi }];
            w = ctx.measureText(chunk).width;
            continue;
        }
        if (cur.length)
            w += glued ? ww : space + ww;
        else
            w = ww;
        cur.push(word);
    }
    end();
    return lines;
}
/** Text with line breaks, wrapped, with each paragraph's lines evened out (same count, narrowest width that holds it). */
export function setLines(ctx, text, max, opts = {}) {
    return text.split('\n').flatMap((l) => {
        const words = parseLine(l);
        if (!words.length)
            return [];
        const lines = wrap(ctx, words, max, opts.breakLong === true);
        if (opts.balance === false || lines.length < 2 || lines.length > 6)
            return lines;
        let lo = Math.max(...words.map((w) => ctx.measureText(w.text).width));
        let hi = max;
        if (lo >= hi)
            return lines;
        for (let i = 0; i < 12; i++) {
            const mid = (lo + hi) / 2;
            if (wrap(ctx, words, mid, false).length <= lines.length)
                hi = mid;
            else
                lo = mid;
        }
        const even = wrap(ctx, words, hi, false);
        return even.length === lines.length ? even : lines;
    });
}
