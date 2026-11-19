// The header's paper block follows the pointer; the footer's labels roll.
export default [
	{ hover: 'role=link[name="Blog"]', wait: 400, width: 1440, label: 'hover a header link' },
	{ hover: 'role=link[name="Changelog"]', wait: 400, label: 'hover a footer link' },
	{ click: 'role=button[name="Open menu"]', wait: 500, width: 390, label: 'the phone sheet opens' },
	{ key: 'Escape', wait: 300, width: 390, label: 'Escape closes it' },
]
