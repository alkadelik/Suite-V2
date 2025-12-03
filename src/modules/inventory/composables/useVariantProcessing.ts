import type { Ref } from "vue"
import type { IVariantConfiguration } from "./useProductFormState"
import { displayError } from "@/utils/error-handler"

/**
 * API Mutation Functions Type
 * Type-safe wrappers for API mutations
 */
interface IAttributeValueItem {
  value: string
  sort_order: number
}

interface IApiMutations {
  createAttribute: (
    payload: {
      name: string
      data_type: string
      is_required: boolean
      sort_order: number
      is_active: boolean
    },
    options: {
      onSuccess: (response: unknown) => void
      onError: (error: unknown) => void
    },
  ) => void
  createAttributeValues: (
    payload: {
      attributeUid: string
      values: IAttributeValueItem[]
    },
    options: {
      onSuccess: (response: unknown) => void
      onError: (error: unknown) => void
    },
  ) => void
}

/**
 * Composable for variant processing and API interactions
 *
 * Architectural decisions:
 * - Async processing with proper error handling
 * - Sequential API calls to maintain data integrity
 * - AbortController support for cleanup (not implemented yet)
 * - Idempotent operations - checks for existing UIDs
 * - Promise-based for async/await usage
 *
 * @param variantConfiguration - Ref to variant configuration array
 * @param apiMutations - API mutation functions
 * @returns Processing functions for variants
 */
export function useVariantProcessing(
  variantConfiguration: Ref<IVariantConfiguration[]>,
  apiMutations: IApiMutations,
) {
  const { createAttribute, createAttributeValues } = apiMutations

  /**
   * Check if a string is a valid UUID
   * UUIDs are 36 characters long with dashes (e.g., "550e8400-e29b-41d4-a716-446655440000")
   */
  const isValidUuid = (value: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(value)
  }

  /**
   * Extract UID from API response
   * Handles different response structures safely
   */
  const extractUid = (response: unknown): string => {
    try {
      const value = (response as { data: { data: { uid: string } } })?.data?.data?.uid
      return typeof value === "string" && value.length > 0 ? value : ""
    } catch (error) {
      console.error("Could not extract UID from response:", response, error)
      return ""
    }
  }

  /**
   * Get variant value (handles object/string types)
   */
  const getVariantValue = (variant: IVariantConfiguration): string => {
    if (!variant?.name) return ""

    if (typeof variant.name === "object" && variant.name !== null) {
      return (variant.name.value as string) || ""
    }

    return variant.name
  }

  /**
   * Create custom attribute and return its UID
   * Wraps API call in Promise for async/await usage
   */
  const createAttributeAndGetUid = async (customName: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      createAttribute(
        {
          name: customName,
          data_type: "text",
          is_required: false,
          sort_order: 1,
          is_active: true,
        },
        {
          onSuccess: (response: unknown) => {
            const uid = extractUid(response)
            if (!uid) {
              reject(new Error(`No UID returned for custom attribute: ${customName}`))
              return
            }
            resolve(uid)
          },
          onError: (error: unknown) => {
            console.error(`Failed to create custom attribute "${customName}":`, error)
            displayError(error)
            reject(new Error(String(error)))
          },
        },
      )
    })
  }

  const createValuesInBulk = async (
    valuesToCreate: Array<{
      label: string
      value: string | { label: string; value: string }
      sortOrder: number
    }>,
    attributeUid: string,
  ): Promise<Array<{ label: string; uid: string }>> => {
    const bulkPayload = valuesToCreate.map((item) => {
      const valueString =
        typeof item.value === "object" && item.value !== null && "label" in item.value
          ? item.value.label
          : typeof item.value === "string"
            ? item.value
            : String(item.value)

      return {
        value: valueString,
        sort_order: item.sortOrder,
      }
    })

    return new Promise((resolve, reject) => {
      createAttributeValues(
        {
          attributeUid: attributeUid,
          values: bulkPayload,
        },
        {
          onSuccess: (response: unknown) => {
            try {
              const responseData = (
                response as { data: { data: Array<{ uid: string; value: string }> } }
              )?.data?.data

              if (!Array.isArray(responseData)) {
                reject(new Error("Invalid response format from bulk create"))
                return
              }

              const results = valuesToCreate.map((item, index) => {
                const responseItem = responseData[index]
                if (!responseItem?.uid) {
                  throw new Error(`No UID returned for value at index ${index}`)
                }
                return {
                  label: item.label,
                  uid: responseItem.uid,
                }
              })

              resolve(results)
            } catch (error) {
              console.error("Failed to process bulk create response:", error)
              reject(error instanceof Error ? error : new Error(String(error)))
            }
          },
          onError: (error: unknown) => {
            console.error("Bulk create API call failed:", error)
            displayError(error)
            reject(new Error(String(error)))
          },
        },
      )
    })
  }

  const processVariantValues = async (
    variant: IVariantConfiguration,
    attributeUid: string,
  ): Promise<void> => {
    const values = variant.values || []

    if (values.length === 0) {
      return
    }

    const processedValues: Array<{ label: string; value: string }> = []
    const valuesToCreate: Array<{
      label: string
      value: string | { label: string; value: string }
      sortOrder: number
    }> = []

    for (let index = 0; index < values.length; index++) {
      const value = values[index]
      const isObject =
        typeof value === "object" && value !== null && "label" in value && "value" in value
      const hasUID = isObject && isValidUuid(value.value) && value.value !== "custom_type"

      if (hasUID) {
        processedValues.push({
          label: value.label,
          value: value.value,
        })
      } else {
        const labelString =
          typeof value === "object" && value !== null && "label" in value
            ? value.label
            : typeof value === "string"
              ? value
              : String(value)

        valuesToCreate.push({
          label: labelString,
          value: value,
          sortOrder: index + 1,
        })
      }
    }

    if (valuesToCreate.length > 0) {
      try {
        const createdValues = await createValuesInBulk(valuesToCreate, attributeUid)

        for (const created of createdValues) {
          processedValues.push({
            label: created.label,
            value: created.uid,
          })
        }
      } catch (error) {
        console.error(`[FAIL] Failed to create values in bulk:`, error)
        throw new Error(`Failed to create values: ${String(error)}`)
      }
    }

    variant.values = processedValues.map((v) => ({ label: v.label, value: v.value }))
  }

  /**
   * Process a single variant
   * Creates custom attributes or uses existing ones
   */
  const processVariant = async (variant: IVariantConfiguration): Promise<void> => {
    const isCustomVariant = getVariantValue(variant) === "custom_type"
    let attributeUid: string

    if (isCustomVariant) {
      const customName = variant.customName?.trim()
      if (!customName) {
        console.warn("Custom variant has no name, skipping")
        return
      }

      attributeUid = await createAttributeAndGetUid(customName)

      // Update variant name with new attribute UID
      variant.name = {
        label: customName,
        value: attributeUid,
      }
    } else {
      attributeUid = typeof variant.name === "object" ? (variant.name?.value as string) : ""
      if (!attributeUid) {
        console.warn("Existing variant has no attribute UID, skipping")
        return
      }
    }

    await processVariantValues(variant, attributeUid)
  }

  const processVariantConfiguration = async (): Promise<void> => {
    const variantsToProcess = variantConfiguration.value.filter(
      (variant) => variant.values.length > 0,
    )

    if (variantsToProcess.length === 0) {
      return
    }

    for (const variant of variantsToProcess) {
      await processVariant(variant)
    }
  }

  return {
    extractUid,
    getVariantValue,
    isValidUuid,
    createAttributeAndGetUid,
    processVariantValues,
    processVariant,
    processVariantConfiguration,
  }
}
