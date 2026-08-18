import { computed, ref, toValue, type MaybeRefOrGetter } from "vue"

/**
 * Collapses a list to the first `limit` items with a See all / See less toggle,
 * mirroring the worklist behaviour. The toggle only appears beyond `limit`.
 */
export function useSeeAll<T>(items: MaybeRefOrGetter<T[]>, limit = 3) {
  const expanded = ref(false)
  const all = computed(() => toValue(items) ?? [])
  const hasToggle = computed(() => all.value.length > limit)
  const visible = computed(() => (expanded.value ? all.value : all.value.slice(0, limit)))
  const toggle = () => {
    expanded.value = !expanded.value
  }
  return { expanded, hasToggle, visible, toggle }
}
