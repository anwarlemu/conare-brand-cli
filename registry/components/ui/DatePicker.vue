<script setup lang="ts">
import { computed, nextTick, useId } from 'vue'
import { CalendarDays } from 'lucide-vue-next'
import Calendar from '@/components/ui/Calendar.vue'
import PopoverPanel from '@/components/ui/PopoverPanel.vue'
import { usePopover } from '@/composables/usePopover'

// A date in a field: a button drawn as the 32px text field (a #C3C1BF hairline that turns ink while it is open or
// focused, 13px, the placeholder muted) that opens a Calendar in Menu's square panel under it. Opening puts focus on
// the picked day (or today); picking a day closes it and returns focus to the field; Escape closes it unchanged.
// Wire it into Field like Input: <DatePicker :id="id" />.
const props = withDefaults(defineProps<{ id?: string, placeholder?: string, min?: Date, max?: Date, disabled?: (day: Date) => boolean, invalid?: boolean, locale?: string, format?: Intl.DateTimeFormatOptions }>(), { placeholder: 'Pick a date', locale: 'en-US', format: () => ({ month: 'short', day: 'numeric', year: 'numeric' }) })
const model = defineModel<Date | null>({ default: null })
const pop = usePopover({ side: 'bottom', align: 'start', gap: 4 })
const panelId = `date-${useId()}`
const text = computed(() => model.value?.toLocaleDateString(props.locale, props.format))

async function onClick(event: MouseEvent) {
  if (pop.open.value) return pop.hide(event.detail === 0, event.detail === 0)
  await pop.show({ keyboard: event.detail === 0 })
  await nextTick()
  pop.panel.value?.querySelector<HTMLElement>('.ds-day[tabindex="0"]')?.focus({ preventScroll: true })
}
function onKey(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' && !pop.open.value) {
    event.preventDefault()
    void onClick(new MouseEvent('click', { detail: 0 }))
  }
}
function picked() {
  pop.hide(true)
}
</script>

<template>
  <button data-ds="date-picker"
    :id="id"
    :ref="(el) => { pop.anchor.value = el as HTMLElement | null }"
    type="button"
    class="flex h-control-md w-full cursor-pointer items-center gap-2 border border-edge-strong bg-surface px-2.5 text-left text-ui text-fg outline-none transition-[border-color] duration-120 ease-standard focus-visible:border-edge-focus aria-expanded:border-edge-focus aria-invalid:border-action-danger max-md:h-control-touch max-md:text-input"
    aria-haspopup="dialog"
    :aria-expanded="pop.open.value"
    :aria-controls="pop.open.value ? panelId : undefined"
    :aria-invalid="invalid || undefined"
    @click="onClick"
    @keydown="onKey"
  >
    <CalendarDays :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" />
    <span class="min-w-0 flex-1 truncate" :class="!text && 'text-fg-muted'">{{ text ?? placeholder }}</span>
  </button>
  <PopoverPanel data-ds="date-picker" :id="panelId" :pop="pop" role="dialog" aria-label="choose a date" tabindex="-1" class="p-3">
    <Calendar v-model="model" :min="min" :max="max" :disabled="disabled" :locale="locale" @select="picked" />
  </PopoverPanel>
</template>
