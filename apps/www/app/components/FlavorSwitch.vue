<script setup lang="ts">
import Tabs from '@/components/ui/Tabs.vue'
import { FLAVORS, type Flavor } from '~/utils/registry'
import { useFlavor } from '~/utils/flavor'

// Vue, React or Web component: what the install line, the usage, the examples' code and the source show. The choice
// holds across pages and visits.
const flavor = useFlavor()
const pick = (v: Flavor) => { flavor.value = v }
</script>

<template>
  <Tabs :model-value="flavor" :options="FLAVORS" label="framework" @update:model-value="pick" />
</template>
