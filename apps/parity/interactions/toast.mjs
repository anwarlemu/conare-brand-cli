// One note, then a burst: three at most, the oldest making way; pointing at them holds their time.
export default [
	{ click: 'role=button[name="Delete a document"]', wait: 500, shot: true, label: 'a note rises in the corner' },
	{ click: 'role=button[name="Delete a document"]', wait: 60, label: 'a second' },
	{ click: 'role=button[name="Delete a document"]', wait: 60, label: 'a third' },
	{ click: 'role=button[name="Delete a document"]', wait: 700, shot: true, label: 'a fourth: three show at most' },
	{ hover: 'text=northwind-msa-4.pdf', wait: 4500, shot: true, label: 'pointing at them holds their time' },
	{ clickAt: [10, 10], wait: 4600, shot: true, label: 'away from them, they leave after four seconds' },
]
