export const shouldReturnToRedirect = (redirect: unknown): redirect is string => {
  return typeof redirect === "string" && redirect.trim().length > 0
}
