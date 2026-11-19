// Rename in place, the tabs, and a switch.
export default [
	{ click: 'role=button[name="rename company"]', wait: 300, label: 'Edit opens the name in place' },
	{ key: 'Meta+a', type: 'Acme Labs', wait: 200, label: 'a new name' },
	{ key: 'Enter', wait: 300, shot: true, label: 'Enter saves it' },
	{ click: 'role=tab[name="Members"]', wait: 300, shot: true, label: 'Members, with Invite members' },
	{ click: 'role=tab[name="Sign-in"]', wait: 300, label: 'Sign-in' },
	{ click: 'role=switch[name="Single sign-on"]', wait: 300, shot: true, label: 'single sign-on turns on' },
	{ click: 'role=tab[name="General"]', wait: 300, label: 'back to General' },
	{ click: 'role=button[name="rename company"]', wait: 300, label: 'Edit again' },
	{ key: 'Escape', wait: 300, label: 'Escape cancels' },
]
