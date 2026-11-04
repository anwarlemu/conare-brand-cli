<script setup lang="ts">
import { computed, provide } from 'vue'
import { DIRECTION, type Dir } from '@/composables/useDirection'

// Sets the reading direction for what is inside it (the `dir` attribute, so logical utilities such as ps-, me- and
// text-start follow it) and provides it to components through useDirection(). Code stays left to right: pre, code and
// kbd inside it keep `ltr`, as the code windows do.
const props = withDefaults(defineProps<{ dir?: Dir }>(), { dir: 'ltr' })
provide(DIRECTION, computed(() => props.dir))
</script>

<template>
  <div class="ds-dir" :dir="dir"><slot /></div>
</template>

<style>
.ds-dir :is(pre, code, kbd) { direction: ltr; unicode-bidi: isolate; }
</style>
