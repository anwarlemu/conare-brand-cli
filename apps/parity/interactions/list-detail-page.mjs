// Filter the list, open a row by press and by Enter, come back.
export default [
	{ click: 'role=textbox[name="filter namespaces"]', type: 'con', wait: 300, shot: true, label: 'the filter narrows the list' },
	{ type: 'zzz', wait: 300, label: 'no match says so' },
	{ click: 'role=textbox[name="filter namespaces"]', key: 'Meta+a', wait: 100, label: 'select the filter' },
	{ key: 'Backspace', wait: 300, label: 'clear it' },
	{ click: 'role=row[name=/support/]', wait: 400, shot: true, label: 'a row opens its page' },
	{ click: 'role=button[name="All namespaces"]', wait: 400, label: 'back to the list' },
	{ focus: 'role=row[name=/contracts/]', key: 'Enter', wait: 400, label: 'Enter opens the focused row' },
]
