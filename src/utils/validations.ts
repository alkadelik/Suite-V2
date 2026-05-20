const ctrlKeys: string[] = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"]

/** numbers only */
export const keyPressNumberOnly = (e: KeyboardEvent): void => {
  if (!ctrlKeys.includes(e.key) && !/[0-9]/.test(e.key)) {
    e.preventDefault()
  }
}

/** Alphabets, numbers and dash only */
export const keyPressAlphaNumbericDashOnly = (e: KeyboardEvent): void => {
  if (!ctrlKeys.includes(e.key) && !/^[a-zA-Z0-9-]/.test(e.key)) {
    e.preventDefault()
  }
}

export const slugify = (value: string | number): string => {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // replace all non-alphanumerics with dashes
    .replace(/-+/g, "-") // collapse multiple dashes
    .replace(/^-+|-+$/g, "") // trim leading/trailing dashes
}

export interface InvalidSubmitErrors {
  [key: string]: unknown
}

export interface OnInvalidSubmitParams {
  errors: InvalidSubmitErrors
}

export const getFirstValidationErrorKey = (errors: InvalidSubmitErrors): string | undefined =>
  Object.keys(errors)[0]

export const getValidationTargetElement = (
  target: string | null | undefined,
): HTMLElement | null => {
  if (!target) return null

  const selectors = [`[data-validation-target="${target}"]`, `[name="${target}"]`, `#${target}`]

  for (const selector of selectors) {
    const element = document.querySelector(selector)
    if (element instanceof HTMLElement) {
      return element
    }
  }

  return null
}

export const scrollToValidationTarget = (
  target: string | null | undefined,
  options: ScrollIntoViewOptions = { behavior: "smooth", block: "center" },
): HTMLElement | null => {
  const element = getValidationTargetElement(target)
  if (element) {
    const rect = element.getBoundingClientRect()
    const viewportPadding = 24
    const isVisibleInViewport =
      rect.top >= viewportPadding &&
      rect.bottom <= window.innerHeight - viewportPadding &&
      rect.left >= 0 &&
      rect.right <= window.innerWidth

    if (!isVisibleInViewport) {
      element.scrollIntoView(options)
    }
  }
  return element
}

export const focusValidationTarget = (target: string | null | undefined): void => {
  const container = getValidationTargetElement(target)
  if (!container) return

  if (typeof container.focus === "function") {
    container.focus()
    return
  }

  const focusable = container.querySelector<HTMLElement>(
    "input, select, textarea, button, [tabindex]:not([tabindex='-1'])",
  )
  focusable?.focus()
}

export const scrollToAndFocusValidationTarget = (
  target: string | null | undefined,
  options: ScrollIntoViewOptions = { behavior: "smooth", block: "center" },
): void => {
  const element = scrollToValidationTarget(target, options)
  if (!element) return

  if (typeof element.focus === "function") {
    element.focus()
    return
  }

  const focusable = element.querySelector<HTMLElement>(
    "input, select, textarea, button, [tabindex]:not([tabindex='-1'])",
  )
  focusable?.focus()
}

export const onInvalidSubmit = ({ errors }: OnInvalidSubmitParams): void => {
  const firstErrorFieldName = getFirstValidationErrorKey(errors)
  if (firstErrorFieldName) {
    scrollToAndFocusValidationTarget(firstErrorFieldName, {
      behavior: "smooth",
      block: "center",
    })
  }
}
