/**
 * Validates if a string is a valid email.
 */
export const validateEmail = (value: string): true | string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value) ? true : "Invalid email address format"
}

/**
 * Validates if a string meets a minimum length.
 */
export const validateMinLength = (min: number) => {
  return (value: string): true | string =>
    value.length >= min ? true : `Must be at least ${min} characters long`
}

/**
 * Validates if a string meets a maximum length.
 */
export const validateMaxLength = (max: number) => {
  return (value: string): true | string =>
    value.length <= max ? true : `Must be at most ${max} characters long`
}

/**
 * Validates if a string meets a minimum length.
 */
export const validateExactLength = (length: number) => {
  return (value: string): true | string =>
    value.length === length ? true : `Must be exactly ${length} characters long`
}

/**
 * Validates if a string is a strong password (min length, number, uppercase, etc.)
 */
export const validateStrongPassword = (min: number = 8) => {
  return (value: string): true | string => {
    const hasUpper = /[A-Z]/.test(value)
    const hasLower = /[a-z]/.test(value)
    const hasNumber = /\d/.test(value)
    const hasSymbol = /[\W_]/.test(value)

    if (value.length < min) return `Password must be at least ${min} characters`
    if (!hasUpper || !hasLower || !hasNumber || !hasSymbol)
      return "Password must contain uppercase, lowercase, number & symbol"

    return true
  }
}

/**
 * Returns a validator that checks if a value matches the original password.
 * Use inside react-hook-form validateFn by passing the watched password.
 */
export const validateConfirmPassword = (originalPassword: string) => {
  return (value: string): true | string =>
    value === originalPassword ? true : "Passwords do not match"
}

/**
 * Validates that a value is not empty.
 */
export const validateRequired = (value: string): true | string => {
  return value?.trim() ? true : "This field is required"
}
