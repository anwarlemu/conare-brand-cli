<script setup lang="ts">
import { ref } from 'vue'
import { Check } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Drawer from '@/components/ui/Drawer.vue'
// A choice on a phone, from the bottom edge: which searches to show. The rows are 44px to land a thumb on.
const open = ref(false)
const shows = ['All searches', 'Weak match', 'Nothing found', 'Failed']
const show = ref('All searches')
</script>

<template>
  <div class="flex min-h-40 items-center justify-center">
    <Button @click="open = true">{{ show }}</Button>
    <Drawer v-model:open="open" title="Show" side="bottom" bar>
      <template #default="{ close }">
        <ul class="flex flex-col p-2">
          <li v-for="s in shows" :key="s">
            <button type="button" :aria-pressed="show === s" class="flex h-11 w-full cursor-pointer items-center gap-2 px-3 text-left type-body transition-colors duration-120 ease-standard hover:bg-surface-subtle focus-visible:bg-surface-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus" @click="show = s; close()">
              <span class="min-w-0 flex-1">{{ s }}</span>
              <Check v-if="show === s" :size="14" :stroke-width="1.5" aria-hidden="true" />
            </button>
          </li>
        </ul>
      </template>
    </Drawer>
  </div>
</template>
