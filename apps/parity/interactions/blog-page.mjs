// A category narrows the posts, the search narrows them further, Escape clears it.
export default [
	{ click: 'role=button[name="Changelog"]', wait: 400, shot: true, label: 'Changelog shows its posts' },
	{ click: 'role=button[name="All"]', wait: 300, label: 'All again' },
	{ click: 'role=searchbox[name="Search the blog"]', type: 'rerank', wait: 400, shot: true, label: 'the search narrows them' },
	{ type: 'zzz', wait: 300, shot: true, label: 'nothing matches says so' },
	{ key: 'Escape', wait: 300, label: 'Escape clears it' },
]
