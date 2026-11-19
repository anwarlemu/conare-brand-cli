// Sending it empty is stopped by the browser; filled, it shows what happens next; Send another brings it back.
export default [
	{ click: 'role=button[name="Send message"]', wait: 300, label: 'the browser stops an empty send' },
	{ click: 'role=textbox[name="Name"]', type: 'Acme admin', wait: 100, label: 'a name' },
	{ click: 'role=textbox[name="Work email"]', type: 'admin@acme.com', wait: 100, label: 'an email' },
	{ click: 'role=textbox[name="Message"]', type: 'Search over our help center.', wait: 100, label: 'a message' },
	{ click: 'role=button[name="Send message"]', wait: 400, shot: true, label: 'it is sent' },
	{ click: 'role=button[name="Send another"]', wait: 300, label: 'the form again' },
]
