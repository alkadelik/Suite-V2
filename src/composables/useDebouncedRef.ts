import { ref, watch, onBeforeUnmount, type Ref } from "vue"

export function useDebouncedRef<T>(
  sourceRef: Ref<T>,
  delay = 750,
  onDebounce: () => void = () => {},
): Ref<T> {
  const debounced = ref<T>(sourceRef.value) as Ref<T>
  const timeout = ref<ReturnType<typeof setTimeout> | null>(null)

  const clear = () => {
    if (timeout.value !== null) {
      clearTimeout(timeout.value as ReturnType<typeof setTimeout>)
      timeout.value = null
    }
  }

  watch(sourceRef, (newVal) => {
    clear()
    timeout.value = setTimeout(() => {
      debounced.value = newVal
      onDebounce()
    }, delay)
  })

  onBeforeUnmount(clear)

  return debounced
}
