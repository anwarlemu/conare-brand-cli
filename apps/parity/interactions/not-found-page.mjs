// The way home runs its squares; a cell takes the paper.
export default [
	{ hover: 'role=link[name="Back to the home page"]', wait: 500, label: 'hover the way home' },
	{ hover: 'role=list[name="Pages people look for"] >> role=link[name="Blog"]', wait: 300, label: 'a cell takes the paper' },
]
