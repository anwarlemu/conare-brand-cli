import { onMounted, ref, watch } from 'vue'
import type { Flavor } from '~/utils/registry'

// The flavor a viewer reads the component pages in (Vue, React or Web component), the same on every page and kept for
// their next visit. Storage can be refused (a private window, blocked site data): the choice then lasts the visit.
const KEY = 'ds-flavor'
const flavor = ref<Flavor>('vue')
let loaded = false

export function useFlavor() {
  onMounted(() => {
    if (loaded) return
    loaded = true
    try {
      const saved = localStorage.getItem(KEY)
      if (saved === 'vue' || saved === 'react' || saved === 'elements') flavor.value = saved
    }
    catch {}
    watch(flavor, (now) => {
      try { localStorage.setItem(KEY, now) }
      catch {}
    })
  })
  return flavor
}
