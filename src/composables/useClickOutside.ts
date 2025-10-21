import { onMounted, onBeforeUnmount, type Ref } from "vue"

/**
 * Composable to detect clicks outside of specified elements
 * @param targetRefs - Array of refs to elements that should be ignored when clicked
 * @param handler - Callback function to execute when click outside is detected
 * @param options - Configuration options
 */
export function useClickOutside(
  targetRefs: Ref<HTMLElement | null> | Ref<HTMLElement | null>[],
  handler: (event: MouseEvent) => void,
  options: {
    enabled?: Ref<boolean>
    eventType?: "mousedown" | "mouseup" | "click"
  } = {},
) {
  const { enabled, eventType = "mousedown" } = options
  const refs = Array.isArray(targetRefs) ? targetRefs : [targetRefs]

  const handleClickOutside = (event: MouseEvent) => {
    // Skip if disabled
    if (enabled && !enabled.value) return

    const target = event.target as HTMLElement

    // Check if click is outside all target refs
    const isOutside = refs.every((ref) => {
      const element = ref.value
      return element && !element.contains(target)
    })

    if (isOutside) {
      handler(event)
    }
  }

  onMounted(() => {
    // Use capture phase for better performance and correct behavior
    document.addEventListener(eventType, handleClickOutside, true)
  })

  onBeforeUnmount(() => {
    document.removeEventListener(eventType, handleClickOutside, true)
  })
}
