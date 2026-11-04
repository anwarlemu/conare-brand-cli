<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
import Step from '@/components/ui/Step.vue'
import Steps from '@/components/ui/Steps.vue'
import { useSteps } from '@/composables/useSteps'
// Steps that open one at a time: the one to do is the only open thing, a finished step folds to a line that says what
// came of it, and a step not reached is dimmed and locked.
const { state, reach, toggle } = useSteps()
const said = ['Key created', 'Prompt copied']
</script>

<template>
  <Steps class="max-w-140">
    <Step :n="1" title="Create a key" :state="state(1)" :says="said[0]" @open="toggle(1)">
      <p class="type-meta text-fg-muted">Your agent uses it to read what you connect.</p>
      <PixelButton @click="reach(2)">Create key</PixelButton>
    </Step>
    <Step :n="2" title="Give the prompt to your agent" :state="state(2)" :says="said[1]" @open="toggle(2)">
      <p class="type-meta text-fg-muted">It connects Acme's documents and runs a first search.</p>
      <PixelButton @click="reach(3)">Copy prompt</PixelButton>
    </Step>
    <Step :n="3" title="Watch the first write" :state="state(3)" @open="toggle(3)">
      <p class="type-meta text-fg-muted">Documents show here as they land.</p>
      <Button @click="reach(1)">Start again</Button>
    </Step>
  </Steps>
</template>
