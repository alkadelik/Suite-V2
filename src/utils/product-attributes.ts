import type { IProductDetails, IProductVariantDetails } from "@/modules/inventory/types"

/**
 * Attribute option for select field
 */
export interface AttributeOption {
  label: string
  value: string
  [key: string]: unknown
}

/**
 * Product attribute with select field options
 */
export interface ProductAttribute {
  attribute_name: string
  attribute_uid: string
  options: AttributeOption[]
}

/**
 * Attribute with its unique values
 */
export interface AttributeWithValues {
  attribute_name: string
  attribute_uid: string
  values: Array<{
    value_name: string
    value_uid: string
  }>
}

/**
 * Result of extracting attributes from products
 */
export interface ExtractedAttributes {
  attributes: AttributeWithValues[]
  totalProducts: number
  totalVariants: number
}

/**
 * Extract all unique attributes and their values from product variants
 *
 * @param products - Array of products
 * @returns Object containing unique attributes with their values
 *
 * @example
 * const products = [...]; // from API
 * const result = extractAttributesFromProducts(products);
 * console.log(result);
 * // {
 * //   attributes: [
 * //     {
 * //       attribute_name: "Size",
 * //       attribute_uid: "190586f8-fa1a-4b16-8732-b66760a90d00",
 * //       values: [
 * //         { value_name: "Medium", value_uid: "c8a9b33f-da24-4e1c-aca0-38cbda4cb91c" },
 * //         { value_name: "Large", value_uid: "8933e6b4-0be9-4277-a3d7-507a39d0d901" }
 * //       ]
 * //     }
 * //   ],
 * //   totalProducts: 2,
 * //   totalVariants: 3
 * // }
 */
export function extractAttributesFromProducts(products: IProductDetails[]): ExtractedAttributes {
  // Map to store attributes with their values
  const attributesMap = new Map<string, AttributeWithValues>()

  let totalVariants = 0

  // Iterate through all products and their variants
  products.forEach((product) => {
    product.variants.forEach((variant) => {
      totalVariants++

      // Iterate through each variant's attributes
      variant.attributes.forEach((attr) => {
        const attributeUid = attr.attribute

        // Get or create attribute entry
        if (!attributesMap.has(attributeUid)) {
          attributesMap.set(attributeUid, {
            attribute_name: attr.attribute_name,
            attribute_uid: attributeUid,
            values: [],
          })
        }

        const attribute = attributesMap.get(attributeUid)!

        // Check if this value already exists
        const valueExists = attribute.values.some((v) => v.value_uid === attr.value)

        // Add value if it doesn't exist
        if (!valueExists) {
          attribute.values.push({
            value_name: attr.attribute_value,
            value_uid: attr.value,
          })
        }
      })
    })
  })

  // Convert map to array and sort by attribute name
  const attributes = Array.from(attributesMap.values()).sort((a, b) =>
    a.attribute_name.localeCompare(b.attribute_name),
  )

  // Sort values within each attribute
  attributes.forEach((attr) => {
    attr.values.sort((a, b) => a.value_name.localeCompare(b.value_name))
  })

  return {
    attributes,
    totalProducts: products.length,
    totalVariants,
  }
}

/**
 * Extract attributes from a single product's variants
 * Returns array formatted for use with SelectField components
 *
 * @param product - Single product
 * @returns Array of attributes with options formatted for SelectField
 *
 * @example
 * const product = {...}; // from API
 * const attributes = getProductAttributesForSelect(product);
 * // [
 * //   {
 * //     attribute_name: "Size",
 * //     attribute_uid: "190586f8-fa1a-4b16-8732-b66760a90d00",
 * //     options: [
 * //       { label: "Medium", value: "c8a9b33f-da24-4e1c-aca0-38cbda4cb91c" },
 * //       { label: "Large", value: "8933e6b4-0be9-4277-a3d7-507a39d0d901" }
 * //     ]
 * //   }
 * // ]
 */
export function getProductAttributesForSelect(product: IProductDetails): ProductAttribute[] {
  // Map to store attributes with their values
  const attributesMap = new Map<string, ProductAttribute>()

  // Iterate through all variants
  product.variants.forEach((variant) => {
    // Iterate through each variant's attributes
    variant.attributes.forEach((attr) => {
      const attributeUid = attr.attribute

      // Get or create attribute entry
      if (!attributesMap.has(attributeUid)) {
        attributesMap.set(attributeUid, {
          attribute_name: attr.attribute_name,
          attribute_uid: attributeUid,
          options: [],
        })
      }

      const attribute = attributesMap.get(attributeUid)!

      // Check if this value already exists
      const valueExists = attribute.options.some((opt) => opt.value === attr.value)

      // Add value if it doesn't exist
      if (!valueExists) {
        attribute.options.push({
          label: attr.attribute_value,
          value: attr.value,
        })
      }
    })
  })

  // Convert map to array and sort by attribute name
  const attributes = Array.from(attributesMap.values()).sort((a, b) =>
    a.attribute_name.localeCompare(b.attribute_name),
  )

  // Sort options within each attribute
  attributes.forEach((attr) => {
    attr.options.sort((a, b) => a.label.localeCompare(b.label))
  })

  return attributes
}

/**
 * Get all unique attribute names across products
 *
 * @param products - Array of products
 * @returns Array of unique attribute names
 */
export function getUniqueAttributeNames(products: IProductDetails[]): string[] {
  const names = new Set<string>()

  products.forEach((product) => {
    product.variants.forEach((variant) => {
      variant.attributes.forEach((attr) => {
        names.add(attr.attribute_name)
      })
    })
  })

  return Array.from(names).sort()
}

/**
 * Get all values for a specific attribute across all products
 *
 * @param products - Array of products
 * @param attributeName - Name of the attribute to get values for
 * @returns Array of unique attribute values
 */
export function getAttributeValues(
  products: IProductDetails[],
  attributeName: string,
): Array<{ value_name: string; value_uid: string }> {
  const valuesMap = new Map<string, string>()

  products.forEach((product) => {
    product.variants.forEach((variant) => {
      variant.attributes.forEach((attr) => {
        if (attr.attribute_name === attributeName) {
          valuesMap.set(attr.value, attr.attribute_value)
        }
      })
    })
  })

  return Array.from(valuesMap.entries())
    .map(([uid, name]) => ({ value_name: name, value_uid: uid }))
    .sort((a, b) => a.value_name.localeCompare(b.value_name))
}

/**
 * Find a variant that matches the selected attribute values
 *
 * @param product - The product to search within
 * @param selectedAttributes - Record of attribute UIDs to selected value UIDs
 * @returns The matching variant or null if no match found
 *
 * @example
 * const selectedAttributes = {
 *   'attribute-uid-1': 'value-uid-a',
 *   'attribute-uid-2': 'value-uid-b'
 * }
 * const variant = findVariantByAttributes(product, selectedAttributes)
 */
export function findVariantByAttributes(
  product: IProductDetails,
  selectedAttributes: Record<string, string>,
): IProductVariantDetails | null {
  const selectedAttributeCount = Object.keys(selectedAttributes).length

  // If no attributes selected, return null
  if (selectedAttributeCount === 0) {
    return null
  }

  // Find variant that matches all selected attributes
  return (
    product.variants.find((variant) => {
      // Check if this variant has all the selected attributes with matching values
      return Object.entries(selectedAttributes).every(([attributeUid, valueUid]) => {
        return variant.attributes.some(
          (attr) => attr.attribute === attributeUid && attr.value === valueUid,
        )
      })
    }) || null
  )
}

/**
 * Get the total number of unique attributes for a product
 *
 * @param product - The product to check
 * @returns Number of unique attributes
 */
export function getProductAttributeCount(product: IProductDetails): number {
  const attributeUids = new Set<string>()

  product.variants.forEach((variant) => {
    variant.attributes.forEach((attr) => {
      attributeUids.add(attr.attribute)
    })
  })

  return attributeUids.size
}
