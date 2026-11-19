// A side link leads to its section, which becomes the one being read.
export default [
	{ click: 'role=link[name="Fees"]', wait: 600, width: 1440, label: 'Fees is read' },
	{ hover: 'role=link[name="Accounts"]', wait: 300, width: 1440, label: 'hover another section' },
]
