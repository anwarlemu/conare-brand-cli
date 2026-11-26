import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { packageRoot } from '../lib/brand.js';
import { rgbOf, surface, toPng, toSvg } from './canvas.js';
import { CopyError } from './glyphs.js';
import { pick } from './io.js';
import { imagesToPdf } from './pdf.js';
import { imageDoc, specFor, unitOf } from './layouts.js';
import { compose, drawDesign } from './og.js';
import { drawExtra, EXTRAS } from './slides-extra.js';
let doc;
export const deckDoc = () => (doc ??= JSON.parse(readFileSync(join(packageRoot, 'brand', 'assets', 'deck.json'), 'utf8')));
export const slideTypes = () => Object.keys(deckDoc().slides);
export const slideSize = () => {
    const full = { x: 0, y: 0, w: W, h: H };
    return { id: 'slide', w: W, h: H, label: 'Slide 16:9', frame: full, safe: full, avoid: [], shown: 640 };
};
const META = ['type', 'theme', 'picture', 'pictures', 'images', 'layers', 'seed', 'sample', 'highlight'];
export function deckCatalog() {
    const d = deckDoc();
    return {
        size: { width: d.width, height: d.height },
        slides: slideTypes().map((id) => ({ id, name: d.slides[id].name, layout: d.slides[id].layout, theme: imageDoc().templates[d.slides[id].layout].theme, description: d.slides[id].description, slots: d.slides[id].slots, required: d.slides[id].required, sample: d.slides[id].sample })),
        themes: Object.keys(imageDoc().themes),
        note: 'Only the copy passed is drawn. --sample fills sample copy.',
    };
}
/** Names other commands use for the same thing. */
const ALIAS = { headline: ['title', 'quote', 'stat'], badge: ['eyebrow', 'number', 'attribution'] };
/** The slots a slide takes, as given (sample copy for the rest when `sample`). Unknown and missing slots throw. */
export function slotsFor(type, given, sample = false) {
    const def = deckDoc().slides[type];
    const out = Object.fromEntries(def.slots.map((k) => [k, sample ? def.sample[k] ?? '' : '']));
    for (const [raw, v] of Object.entries(given)) {
        if (META.includes(raw) || v === undefined)
            continue;
        const k = def.slots.includes(raw) ? raw : ALIAS[raw]?.find((a) => def.slots.includes(a)) ?? raw;
        if (!def.slots.includes(k))
            throw new Error(`A ${type} slide does not take "${raw}". It takes ${def.slots.map((s) => `"${s}"`).join(', ')}.`);
        if (Array.isArray(v) && v.every((x) => typeof x === 'string'))
            out[k] = v.join(' | ');
        else if (typeof v === 'string')
            out[k] = v;
        else
            throw new Error(`A ${type} slide's "${raw}" takes text.`);
    }
    for (const k of def.required)
        if (!out[k]?.trim())
            throw new CopyError(`A ${type} slide needs "${k}" (or --sample for its sample copy).`);
    return out;
}
const W = 1920;
const H = 1080;
/** The design a slide draws. */
export function slideDesign(slide) {
    const type = pick('slide type', slide.type, slideTypes());
    const s = slotsFor(type, slide, slide.sample === true);
    const theme = slide.theme ? pick('theme', slide.theme, Object.keys(imageDoc().themes)) : undefined;
    const layout = deckDoc().slides[type].layout;
    const own = specFor(layout, W, H);
    const u = unitOf(W, H);
    const make = (copy, spec = {}) => compose({ template: layout, size: slideSize(), theme, lenient: true, highlight: slide.highlight, sample: false, seed: slide.seed, layers: slide.layers, ...copy, badge: copy.badge, spec });
    const d = (() => {
        switch (type) {
            case 'cover':
                return make({ headline: s.title, body: s.body, badgeText: s.eyebrow });
            case 'section':
                return make({ headline: s.title, badgeText: s.number, badge: 'label' }, { badgeRatio: 0.22 });
            case 'statement':
                return make({ headline: s.title, badgeText: s.eyebrow, badge: 'dot' });
            case 'bullets': {
                const items = (s.items ?? '').split('|').map((x) => x.trim()).filter(Boolean);
                if (items.length > 6)
                    throw new CopyError(`A bullets slide holds up to 6 points; it was given ${items.length}. Split it.`);
                return make({ headline: s.title, items }, { valign: 'middle', width: 0.86 });
            }
            case 'stat':
                return make({ headline: s.stat, body: s.title }, { bodyRatio: 0.21, bodyWidth: 0.5 });
            case 'quote':
                return make({ headline: s.quote, badgeText: s.attribution, badge: 'dot' }, { badgeFont: 'mono', badgeWeight: 400, badgeTracking: 80, badgeRatio: 0.225, badgeGap: 34 });
            case 'image':
                return make({ headline: s.title, body: s.body, badgeText: s.eyebrow });
            case 'agenda':
            case 'timeline':
            case 'comparison':
            case 'chart':
            case 'team':
            case 'grid':
                /* The title at the top in its share; the slide's part fills what is under it. */
                return make({ headline: s.title || undefined }, { valign: 'top', limit: s.title ? 0.32 : 0.01, width: 0.86, fill: 1 });
            case 'qa':
                return make({ headline: s.title, body: s.body });
            case 'end':
                return make({ headline: s.title, body: s.url || imageDoc().address }, { logo: { ...own.logo, word: true, h: 64 * u } });
        }
    })();
    if (slide.sample)
        d.sample = true;
    return d;
}
export async function renderSlide(slide, opts = { png: true }) {
    const d = slideDesign(slide);
    const type = slide.type;
    const extra = EXTRAS.includes(type) ? type : null;
    const slots = extra ? slotsFor(type, slide, slide.sample === true) : {};
    const paint = async (ctx) => {
        const r = await drawDesign(ctx, d, slide.picture ?? null);
        return extra ? [...r.layers, ...(await drawExtra(ctx, extra, d, r.plan, slots, slide.pictures ?? []))] : r.layers;
    };
    const out = { width: W, height: H, layers: [] };
    if (opts.png !== false || opts.jpg || opts.webp || opts.pdf) {
        const sf = surface(W, H, { scale: opts.scale ?? 1 });
        out.layers = await paint(sf.ctx);
        out.png = toPng(sf, { opaque: true });
        const rgb = rgbOf(sf);
        out.rgb = rgb.rgb;
        if (opts.pdf)
            out.pdf = imagesToPdf([rgb], 960);
        if (opts.jpg)
            out.jpg = sf.canvas.toBuffer('image/jpeg', 92);
        if (opts.webp)
            out.webp = sf.canvas.toBuffer('image/webp', 92);
    }
    if (opts.svg) {
        const sf = surface(W, H, { svg: true });
        out.layers = await paint(sf.ctx);
        out.svg = toSvg(sf);
    }
    return out;
}
