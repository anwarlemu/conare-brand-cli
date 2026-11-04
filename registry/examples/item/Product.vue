<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Item from '@/components/ui/Item.vue'
import ItemGroup from '@/components/ui/ItemGroup.vue'
// A card's rows: what a namespace is, a row with its tool, and rows that open something, filling to the card's edge
// under the pointer.
</script>

<template>
  <div class="grid gap-6 md:grid-cols-2">
    <Card title="contracts">
      <ItemGroup class="-my-2">
        <li><Item title="Documents"><template #meta><span class="tabular-nums">412,830</span></template></Item></li>
        <li><Item title="Region"><template #meta>United States</template></Item></li>
        <li><Item title="Embedding model" description="Used for every document in it"><template #meta><span class="type-code-sm">acme-embed-1</span></template></Item></li>
        <li><Item title="API key" description="Last used 2 min ago"><template #actions><Button>Rotate</Button></template></Item></li>
      </ItemGroup>
    </Card>
    <Card title="Settings">
      <ItemGroup class="-my-2">
        <li><Item href="#members" title="Members" arrow><template #meta>4 of 10 seats</template></Item></li>
        <li><Item href="#billing" title="Billing" arrow><template #meta>Pro</template></Item></li>
        <li><Item href="#keys" title="API keys" description="Create and revoke keys" arrow /></li>
      </ItemGroup>
    </Card>
  </div>
</template>
