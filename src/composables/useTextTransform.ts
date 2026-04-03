import { ref, type Ref } from "vue"

/**
 * Composable for text transformations
 *
 * Architectural decisions:
 * - Auto-capitalization on input for better UX
 * - No error messages - seamless transformation
 * - Preserves cursor position when capitalizing
 *
 * @returns Text transformation utilities
 */
export function useTextTransform() {
  /**
   * Capitalize the first letter of a string
   */
  const capitalizeFirstLetter = (text: string): string => {
    if (!text || typeof text !== "string") return text
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  /**
   * Create a ref that auto-capitalizes the first letter
   * Used for v-model binding with automatic transformation
   */
  const useCapitalizedInput = (
    initialValue = "",
  ): {
    value: Ref<string>
    transform: () => void
  } => {
    const value = ref<string>(initialValue)

    const transform = () => {
      if (value.value && value.value.length > 0) {
        const capitalized = capitalizeFirstLetter(value.value)
        if (capitalized !== value.value) {
          value.value = capitalized
        }
      }
    }

    return {
      value,
      transform,
    }
  }

  /**
   * Handle input event with auto-capitalization
   * Use this as @input handler for immediate capitalization
   */
  const handleCapitalizedInput = (event: Event, modelValue: Ref<string>): void => {
    const target = event.target as HTMLInputElement
    const cursorPosition = target.selectionStart || 0
    const oldValue = target.value
    const newValue = capitalizeFirstLetter(oldValue)

    if (newValue !== oldValue) {
      modelValue.value = newValue
      // Preserve cursor position after capitalization
      requestAnimationFrame(() => {
        target.setSelectionRange(cursorPosition, cursorPosition)
      })
    } else {
      modelValue.value = newValue
    }
  }

  return {
    capitalizeFirstLetter,
    useCapitalizedInput,
    handleCapitalizedInput,
  }
}
