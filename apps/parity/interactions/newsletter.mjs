// Sending it empty is stopped by the browser; with an address it shows the line that follows.
export default [
	{ click: 'role=button[name="Subscribe"]', wait: 300, label: 'the browser stops an empty send' },
	{ click: 'role=textbox[name="Work email"]', type: 'admin@acme.com', wait: 100, label: 'an email' },
	{ click: 'role=button[name="Subscribe"]', wait: 400, shot: true, label: 'it is sent' },
]
