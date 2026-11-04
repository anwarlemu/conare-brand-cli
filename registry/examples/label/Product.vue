<script setup lang="ts">
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
// A label over its field, and one with a note: the label names the field, the note says it can be left empty.
</script>

<template>
  <div class="flex w-90 max-w-full flex-col gap-4">
    <div class="flex flex-col gap-1.5"><Label for="label-name">Name</Label><Input id="label-name" placeholder="production-agent" /></div>
    <div class="flex flex-col gap-1.5"><Label for="label-desc" hint="optional">Description</Label><Input id="label-desc" placeholder="What it is for" /></div>
  </div>
</template>
