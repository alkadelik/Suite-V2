export const shouldReturnToRedirect = (redirect: unknown): redirect is string => {
  return typeof redirect === "string" && redirect.trim().length > 0
}

export const shouldAutoEnableManagedDelivery = ({
  pathname,
  redirect,
}: {
  pathname: string
  redirect: unknown
}): boolean => {
  return pathname === "/onboarding" && !shouldReturnToRedirect(redirect)
}
