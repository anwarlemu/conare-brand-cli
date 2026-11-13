import { Button } from '@/react/components/ui/Button'
import { Table } from '@/react/components/ui/Table'
// The table every Settings tab and the audit log share: a header row, 13px rows, the line that matters most in ink,
// and buttons one width in the last column.
const members = [
  { name: 'Acme admin', email: 'admin@acme.com', role: 'Admin', joined: '3 months ago' },
  { name: 'Acme operations', email: 'ops@acme.com', role: 'Member', joined: '2 weeks ago' },
  { name: 'Acme support', email: 'support@acme.com', role: 'Member', joined: '4 days ago' },
]

export default function Settings() {
  return (
    <Table variant="settings" framed label="members">
      <thead>
        <tr><th>Name</th><th className="w-24">Role</th><th className="w-32">Joined</th><th className="w-px"><span className="sr-only">Actions</span></th></tr>
      </thead>
      <tbody>
        {members.map(m => (
          <tr key={m.email}>
            <td className="max-w-0">
              <p className="truncate">{m.name}</p>
              <p className="truncate type-meta text-fg-muted">{m.email}</p>
            </td>
            <td>{m.role}</td>
            <td className="type-meta whitespace-nowrap text-fg-muted">{m.joined}</td>
            <td className="text-right"><Button press>Manage</Button></td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
