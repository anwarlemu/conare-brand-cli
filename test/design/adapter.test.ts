import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { adapter, paint } from '../../src/design/adapter.js';
import { compose, LAYOUTS, renderDesign, type Layout } from '../../src/assets/og.js';
import { customSize, sizeOf } from '../../src/assets/layouts.js';
import { renderImages } from '../../src/image/render.js';
import { renderSlide } from '../../src/assets/deck.js';
import { TEMPLATES, type GroundId, type TemplateId } from '../../src/image/spec.js';
import type { TemplateInfo } from '../../src/design/index.js';
import { designConformance } from './conformance.js';

const dir = mkdtempSync(join(tmpdir(), 'ds-design-pic-'));
const picture = join(dir, 'a picture.png');
const c = createCanvas(900, 600);
const g = c.getContext('2d');
g.fillStyle = '#336699';
g.fillRect(0, 0, 900, 600);
writeFileSync(picture, c.toBuffer('image/png'));

/* Short copy is what a post carries: the headline, a line and a label. The foot's note, page and credit go with the long
   copy (on the red theme every line is large, so a full foot is refused there with a suggestion, which tryDraw allows). */
const words = (long: boolean) => (t: TemplateInfo) =>
	Object.fromEntries(
		t.copy.filter(({ id }) => long || !['note', 'page', 'credit'].includes(id) || t.copy.filter((c) => c.required).some((c) => c.id === id)).map(({ id }) => [
			id,
			id === 'headline' || id === 'quote' ? (long ? 'Everything your agents need to search, buy and reply in one place' : 'Ship your next idea today')
			: id === 'stat' ? (long ? '1,000,000+' : '42%')
			: id === 'badge' ? 'Product update'
			: id === 'body' ? (long ? 'Acme indexes the documents you bring and returns the right passage with its source.' : 'One line about it')
			: id === 'items' ? (long ? 'Search every document | Parse scanned PDFs, tables and slides | Rerank passages | Return each answer with its source' : 'One | Two')
			: id === 'partner' ? 'Acme'
			: id === 'page' ? '1 / 5'
			: id === 'note' ? 'For teams'
			: id === 'credit' ? '@acme'
			: id === 'by' ? 'Head of platform, Acme'
			: id === 'url' ? 'example.com'
			: 'Words',
		]),
	);

designConformance(adapter(), {
	paint,
	picture,
	short: words(false),
	long: words(true),
	timeout: 300_000,
	async plain(doc) {
		const size = doc.size.id === 'custom' ? customSize(doc.size.width, doc.size.height) : sizeOf(doc.size.id);
		const k = doc.copy;
		if ((LAYOUTS as readonly string[]).includes(doc.template)) return (await renderDesign(compose({ template: doc.template as Layout, size, headline: k.headline, body: k.body, badgeText: k.badge, note: k.note, page: k.page, credit: k.credit, partner: k.partner }), null)).png;
		if (TEMPLATES.some((t) => t.id === doc.template)) return (await renderImages({ template: doc.template as TemplateId, sizes: [size!], ground: doc.theme as GroundId, title: k.headline!, text: k.body, eyebrow: k.badge, by: k.by }))[0]!.png;
		if (doc.template === 'slide-cover') return (await renderSlide({ type: 'cover', title: k.headline, body: k.body, eyebrow: k.badge })).png;
		return undefined;
	},
});
