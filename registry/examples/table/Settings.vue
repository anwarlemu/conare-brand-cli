<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import Table from '@/components/ui/Table.vue'
// The table every Settings tab and the audit log share: a header row, 13px rows, the line that matters most in ink,
// and buttons one width in the last column.
const members = [
  { name: 'Acme admin', email: 'admin@acme.com', role: 'Admin', joined: '3 months ago' },
  { name: 'Acme operations', email: 'ops@acme.com', role: 'Member', joined: '2 weeks ago' },
  { name: 'Acme support', email: 'support@acme.com', role: 'Member', joined: '4 days ago' },
]
</script>

<template>
  <Table variant="settings" framed label="members">
    <thead>
      <tr><th>Name</th><th class="w-24">Role</th><th class="w-32">Joined</th><th class="w-px"><span class="sr-only">Actions</span></th></tr>
    </thead>
    <tbody>
      <tr v-for="m in members" :key="m.email">
        <td class="max-w-0">
          <p class="truncate">{{ m.name }}</p>
          <p class="truncate type-meta text-fg-muted">{{ m.email }}</p>
        </td>
        <td>{{ m.role }}</td>
        <td class="type-meta whitespace-nowrap text-fg-muted">{{ m.joined }}</td>
        <td class="text-right"><Button press>Manage</Button></td>
      </tr>
    </tbody>
  </Table>
</template>
