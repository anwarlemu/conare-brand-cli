// The questions answer beside the list; the hero's action runs its squares.
export default [
	{ click: 'role=tab[name=/Is my data used/]', wait: 400, width: 1440, label: 'a question opens its answer' },
	{ key: 'ArrowDown', wait: 400, width: 1440, label: 'ArrowDown moves to the next question' },
	{ click: 'role=button[name=/Is my data used/]', wait: 400, width: 390, label: 'on a phone it opens under its question' },
]
