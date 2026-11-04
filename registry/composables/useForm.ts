import { computed, reactive, ref } from 'vue'

/** A rule for one field: the message to show when the value is wrong, or nothing when it is right. */
export type Rule<V extends Record<string, unknown>> = (value: V[keyof V], values: V) => string | undefined

/**
 * A form's values, its errors and its submit (the Form item). An error shows once its field has been left or the form
 * submitted, never while the first value is still being typed; after that it updates as the value changes. `submit`
 * checks every rule and runs `send` only when all pass, holding `sending` while it runs; a thrown Error's message
 * becomes the form's `failure`.
 */
export function useForm<V extends Record<string, unknown>>(initial: V, rules: Partial<Record<keyof V, Rule<V>>>) {
  const values = reactive({ ...initial }) as V
  const touched = reactive<Record<string, boolean>>({})
  const tried = ref(false)
  const sending = ref(false)
  const failure = ref('')

  const all = computed(() => {
    const out: Partial<Record<keyof V, string>> = {}
    for (const key of Object.keys(rules) as Array<keyof V>) {
      const message = rules[key]?.(values[key], values)
      if (message) out[key] = message
    }
    return out
  })
  /** The errors to show now. */
  const errors = computed(() => {
    const out: Partial<Record<keyof V, string>> = {}
    for (const key of Object.keys(all.value) as Array<keyof V>) if (tried.value || touched[String(key)]) out[key] = all.value[key]
    return out
  })
  const valid = computed(() => Object.keys(all.value).length === 0)

  function touch(key: keyof V) {
    touched[String(key)] = true
  }
  async function submit(send: (values: V) => Promise<void> | void) {
    tried.value = true
    failure.value = ''
    if (!valid.value || sending.value) return false
    sending.value = true
    try {
      await send(values)
      return true
    }
    catch (error) {
      failure.value = error instanceof Error ? error.message : 'Something went wrong. Try again.'
      return false
    }
    finally {
      sending.value = false
    }
  }
  function reset() {
    Object.assign(values, initial)
    for (const key of Object.keys(touched)) delete touched[key]
    tried.value = false
    failure.value = ''
  }

  return { values, errors, valid, sending, failure, touch, submit, reset }
}
