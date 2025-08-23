import { toast } from "@/composables/useToast"

/** Copy text to clipboard and show toast notification
 *
 * @param text The text to copy to clipboard
 */
export function clipboardCopy(text: string) {
  // Clipboard API not available
  if (!navigator.clipboard) return
  //   Use Clipboard API to copy text
  navigator.clipboard.writeText(text).then(
    () => toast.success("Copied to clipboard"),
    () => toast.error("Failed to copy to clipboard"),
  )
}
