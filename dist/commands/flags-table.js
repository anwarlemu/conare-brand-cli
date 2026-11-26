// Every command's flags in one place: the parser, the unknown-flag check and the manifest all read it.
/** Flags that take a value (the rest are switches). */
export const VALUE_FLAGS = new Set(['cwd', 'components', 'pages', 'framework', 'title', 'text', 'subtitle', 'eyebrow', 'by', 'author', 'image', 'template', 'size', 'ground', 'out', 'format', 'section', 'token', 'surface', 'group', 'state', 'part', 'prop', 'theme', 'badge', 'highlight', 'partner', 'credit', 'input', 'body', 'number', 'items', 'stat', 'quote', 'attribution', 'url', 'fps', 'at', 'seed', 'shape', 'variant', 'headline', 'dpi', 'file', 'example', 'width', 'height', 'note', 'page', 'badge-style', 'scale', 'name', 'role', 'email', 'phone', 'date', 'data', 'people', 'left', 'right', 'leftItems', 'rightItems', 'button', 'total', 'asset-base']);
export const REPEAT_FLAGS = new Set(['prop']);
// The flags each command takes; anything else is a mistake to report, not to ignore (a typo would widen an apply).
export const COMMON = ['cwd', 'json', 'help'];
export const FLAGS = {
    list: [],
    add: ['update', 'dry-run', 'overwrite', 'install', 'framework'],
    apply: ['components', 'pages', 'with-shared', 'dry-run', 'redo'],
    view: ['source', 'full', 'framework'],
    show: ['source', 'full', 'framework'],
    search: [],
    info: [],
    diff: ['framework'],
    init: ['dry-run'],
    check: ['fix', 'all'],
    hook: [],
    tokens: [],
    image: ['headline', 'title', 'body', 'text', 'subtitle', 'badge', 'eyebrow', 'badge-style', 'note', 'page', 'by', 'author', 'image', 'template', 'size', 'width', 'height', 'ground', 'theme', 'out', 'format', 'scale', 'list', 'highlight', 'partner', 'credit', 'seed', 'sample', 'input'],
    video: ['loop', 'name', 'role', 'headline', 'title', 'body', 'text', 'subtitle', 'badge', 'eyebrow', 'badge-style', 'note', 'page', 'template', 'size', 'width', 'height', 'ground', 'out', 'list', 'theme', 'highlight', 'partner', 'credit', 'image', 'seed', 'sample', 'format', 'fps', 'at', 'still'],
    brand: ['section', 'token'],
    principles: ['surface'],
    component: ['group', 'part', 'state', 'prop', 'source'],
    deck: ['data', 'people', 'left', 'right', 'leftItems', 'rightItems', 'input', 'sample', 'scale', 'seed', 'headline', 'badge', 'title', 'body', 'eyebrow', 'number', 'items', 'stat', 'quote', 'attribution', 'url', 'image', 'theme', 'format', 'out', 'list'],
    illustrate: ['size', 'width', 'height', 'ground', 'sample', 'scale', 'theme', 'seed', 'shape', 'image', 'transparent', 'format', 'out', 'list'],
    merch: ['variant', 'theme', 'sample', 'seed', 'title', 'headline', 'url', 'dpi', 'format', 'out', 'guides', 'list'],
    icons: ['theme', 'out'],
    email: ['headline', 'title', 'body', 'text', 'badge', 'eyebrow', 'items', 'button', 'url', 'total', 'date', 'number', 'note', 'name', 'role', 'email', 'phone', 'asset-base', 'out', 'list'],
    print: ['variant', 'theme', 'sample', 'seed', 'title', 'headline', 'body', 'text', 'badge', 'eyebrow', 'name', 'role', 'email', 'phone', 'date', 'stat', 'quote', 'by', 'note', 'url', 'dpi', 'format', 'out', 'guides', 'list'],
    figma: ['out', 'file', 'size', 'theme', 'headline', 'badge', 'badge-style', 'note', 'partner', 'credit', 'sample', 'subtitle', 'title', 'text', 'eyebrow', 'body', 'number', 'items', 'stat', 'quote', 'attribution', 'url', 'seed', 'example', 'width'],
    manifest: [],
    describe: [],
};
