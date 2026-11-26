import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { brand, packageRoot } from '../lib/brand.js';
const FILE_ROLE = { display: 'heading', text: 'brand', ui: 'text', mono: 'code' };
/** Copy that cannot be drawn whole: too long for its place, or a character no brand face has. */
export class CopyError extends Error {
}
let table;
const glyphs = () => (table ??= JSON.parse(readFileSync(join(packageRoot, 'build', 'glyphs.json'), 'utf8')));
function covers(role, code) {
    const file = brand().fonts.files.find((f) => f.role === FILE_ROLE[role]) ?? brand().fonts.files[0];
    return (glyphs()[file.file] ?? []).some(([a, b]) => code >= a && code <= b);
}
/** Characters of `text` a role's face has no glyph for (spaces, line breaks and joiners aside). */
export function missing(role, text) {
    return [...new Set([...text])].filter((ch) => !/[\s​-‍︎️⁠]/u.test(ch) && !covers(role, ch.codePointAt(0)));
}
/**
 * The role a piece of copy draws in: the one asked for when its face has every character, else the product face (the
 * widest the brand ships: Latin Extended and Cyrillic), else an error naming the characters.
 */
export function roleFor(role, text, what = 'copy') {
    const lost = missing(role, text);
    if (!lost.length)
        return role;
    if (role !== 'ui') {
        const still = missing('ui', text);
        if (!still.length)
            return 'ui';
    }
    const none = missing('ui', text).slice(0, 8);
    throw new CopyError(`The brand's faces cannot draw ${none.map((c) => `"${c}"`).join(', ')} in the ${what}. Write it with letters they have (Latin, Cyrillic); emoji and other scripts would fall out of the brand's type.`);
}
