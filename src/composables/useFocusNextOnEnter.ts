/**
 * Prevents Enter from submitting a form and instead moves focus to the
 * next focusable field — used on multi-step forms where native submit-on-Enter
 * would skip ahead to the next wizard step instead of just the next field.
 */
export function focusNextOnEnter(event: KeyboardEvent) {
  const target = event.target as HTMLElement

  // Allow Enter to behave normally inside multiline inputs and on buttons
  // (e.g. the actual submit/back buttons, or in-form action buttons).
  if (target.tagName === "TEXTAREA" || target.tagName === "BUTTON") return

  event.preventDefault()

  const form = target.closest("form")
  if (!form) return

  const focusable = Array.from(
    form.querySelectorAll<HTMLElement>(
      'input:not([type="hidden"]):not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetParent !== null)

  const currentIndex = focusable.indexOf(target)
  const next = focusable[currentIndex + 1]
  next?.focus()
}
