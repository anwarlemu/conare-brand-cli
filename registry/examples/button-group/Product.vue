<script setup lang="ts">
import { ref } from 'vue'
import { ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight, Copy } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import ButtonGroup from '@/components/ui/ButtonGroup.vue'
import Menu from '@/components/ui/Menu.vue'
import MenuItem from '@/components/ui/MenuItem.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
import TextSwap from '@/components/visuals/TextSwap.vue'
import { useCopy } from '@/composables/useCopy'
// The agent prompt's split button: Copy prompt, and an arrow with the one-click installs. Then secondary buttons that
// share a hairline, as a pager does.
const { copied, copy } = useCopy()
const page = ref(2)
</script>

<template>
  <div class="grid items-center gap-2 md:grid-cols-[112px_minmax(0,1fr)] md:gap-x-6 md:gap-y-8">
    <p class="type-meta leading-7 text-fg-muted">Split</p>
    <div class="h-28">
      <ButtonGroup label="connect your agent">
        <PixelButton :done="copied" @click="copy('Connect to Acme over MCP.')">
          <TextSwap :on="copied">
            <template #a><Copy :size="12" :stroke-width="1.5" aria-hidden="true" />Copy prompt</template>
            <template #b><Check :size="12" :stroke-width="2" aria-hidden="true" />Copied</template>
          </TextSwap>
        </PixelButton>
        <Menu label="other ways to connect" trigger-label="other ways to connect" align="end" width="200px" trigger-class="relative inline-flex h-control-sm w-control-sm cursor-pointer items-center justify-center bg-action-primary text-action-primary-fg transition-[background-color] duration-120 ease-standard hover:bg-edge-accent focus-visible:outline-edge-accent max-md:h-control-touch max-md:w-control-touch">
          <template #trigger="{ open }"><ChevronDown :size="12" :stroke-width="1.5" class="transition-[rotate] duration-120 ease-out motion-reduce:transition-none" :class="open && 'rotate-180'" aria-hidden="true" /></template>
          <MenuItem href="#cursor"><span class="flex-1">Add to Cursor</span><ArrowUpRight :size="12" :stroke-width="1.5" aria-hidden="true" /></MenuItem>
          <MenuItem href="#vscode"><span class="flex-1">Add to VS Code</span><ArrowUpRight :size="12" :stroke-width="1.5" aria-hidden="true" /></MenuItem>
        </Menu>
      </ButtonGroup>
    </div>
    <p class="mt-4 type-meta leading-7 text-fg-muted md:mt-0">Secondary</p>
    <div>
      <ButtonGroup label="pages">
        <Button icon aria-label="previous page" :disabled="page === 1" @click="page--"><ChevronLeft :size="14" :stroke-width="1.5" /></Button>
        <Button class="tabular-nums" aria-live="polite">Page {{ page }} of 4</Button>
        <Button icon aria-label="next page" :disabled="page === 4" @click="page++"><ChevronRight :size="14" :stroke-width="1.5" /></Button>
      </ButtonGroup>
    </div>
  </div>
</template>
