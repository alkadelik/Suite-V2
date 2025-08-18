interface ToTableArrayOptions {
  headers?: string[]
  keyMap?: string[]
}

export function toTableArray(
  data: Record<string, unknown>[],
  options: ToTableArrayOptions = {},
): unknown[][] {
  if (!data.length) return []

  const customHeaders = options.headers

  // Use either the custom headers or derive from the first object
  const headers: string[] = customHeaders || Object.keys(data[0])

  // If custom headers are provided, use them as the *order and labels*,
  // but expect the original object to have keys matching these headers or a separate map
  const keyMap: string[] = options.keyMap || headers // assume headers = keys if keyMap not given

  const rows: unknown[][] = data.map((obj) => keyMap.map((key) => obj[key]))

  return [headers, ...rows]
}
