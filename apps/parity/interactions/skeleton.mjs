// The rows land a second and a half after the page loads; Reload holds them again (the rules come in after 300ms) and
// they land again.
export default [
	{ example: 'Product', wait: 1600, shot: true, label: 'the rows land' },
	{ example: 'Product', click: 'role=button[name="Reload"]', wait: 500, shot: true, label: 'Reload holds them, the rules come in' },
	{ example: 'Product', wait: 1400, shot: true, label: 'they land again' },
]
