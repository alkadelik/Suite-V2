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

export const onInvalidSubmit = ({ errors }: OnInvalidSubmitParams): void => {
  const firstErrorFieldName = Object.keys(errors)[0]
  const el = document.querySelector(`[name="${firstErrorFieldName}"]`)
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" })
  }
}
