import { heicTo } from "heic-to"
import imageCompression from "browser-image-compression"

/**
 * Composable for converting and compressing image files
 * Supports HEIC/HEIF/AVIF conversion and automatic compression
 * Uses heic-to library with libheif 1.20.2 for better format support
 */
export function useImageConverter() {
  /**
   * Converts and compresses an image file
   * - HEIC/HEIF files are converted to JPEG first
   * - AVIF files are converted to JPEG first
   * - All images are compressed to max 500KB and 1920px
   * @param file - The original image file
   * @returns Promise resolving to processed file
   */
  const convertAndCompressImage = async (file: File): Promise<File> => {
    try {
      // Check for HEIC/HEIF files by extension and MIME type
      const isHeic =
        file.type === "image/heic" ||
        file.type === "image/heif" ||
        file.name.toLowerCase().endsWith(".heic") ||
        file.name.toLowerCase().endsWith(".heif")

      // Check for AVIF files by extension and MIME type
      const isAvif = file.type === "image/avif" || file.name.toLowerCase().endsWith(".avif")

      if (isHeic) {
        // Convert HEIC to JPEG, then compress
        const convertedFile = await convertHeicToJpeg(file)
        return await compressImage(convertedFile)
      }

      if (isAvif) {
        // Convert AVIF to JPEG using browser-image-compression
        return await compressImageWithConversion(file, "image/jpeg")
      }

      // For standard formats, just compress
      return await compressImage(file)
    } catch (error) {
      console.error("Error processing image:", error)
      throw error
    }
  }

  /**
   * Converts HEIC/HEIF image to JPEG format using heic-to library
   * @param file - HEIC/HEIF image file
   * @returns Promise resolving to JPEG file
   */
  const convertHeicToJpeg = async (file: File): Promise<File> => {
    try {
      // Convert to JPEG blob using heic-to
      const convertedBlob = await heicTo({
        blob: file,
        type: "image/jpeg",
        quality: 0.9,
      })

      // Create new File from blob
      const convertedFile = new File(
        [convertedBlob],
        file.name.replace(/\.(heic|heif)$/i, ".jpg"), // Rename extension
        {
          type: "image/jpeg",
          lastModified: file.lastModified,
        },
      )

      return convertedFile
    } catch (error) {
      console.error("Error converting HEIC/HEIF file:", error)
      throw new Error(
        `Failed to convert "${file.name}". Your device may not support HEIC conversion.`,
      )
    }
  }

  /**
   * Compresses an image and optionally converts to a different format
   * @param file - Image file to compress
   * @param fileType - Target file type (e.g., 'image/jpeg')
   * @returns Promise resolving to compressed file
   */
  const compressImageWithConversion = async (file: File, fileType?: string): Promise<File> => {
    try {
      // Compression options with format conversion
      const options = {
        maxSizeMB: 0.5, // Target: 500KB
        maxWidthOrHeight: 1920, // Max dimension
        useWebWorker: false, // Disabled to prevent race conditions with concurrent uploads
        fileType: fileType || file.type, // Convert format if specified
      }

      // Compress the image
      const compressedBlob = await imageCompression(file, options)

      // Determine filename
      let fileName = file.name
      if (fileType && fileType !== file.type) {
        // Change extension based on target type
        const newExt = fileType.split("/")[1] || "jpg"
        fileName = file.name.replace(/\.[^/.]+$/, `.${newExt}`)
      }

      // Create File from compressed blob
      const compressedFile = new File([compressedBlob], fileName, {
        type: fileType || file.type || "image/jpeg",
        lastModified: file.lastModified,
      })

      return compressedFile
    } catch (error) {
      console.error("Error compressing image:", error)
      throw new Error(`Failed to compress "${file.name}".`)
    }
  }

  /**
   * Compresses an image to target size and dimensions
   * @param file - Image file to compress
   * @returns Promise resolving to compressed file
   */
  const compressImage = async (file: File): Promise<File> => {
    try {
      // Compression options matching the documented flow
      const options = {
        maxSizeMB: 0.5, // Target: 500KB
        maxWidthOrHeight: 1920, // Max dimension
        useWebWorker: false, // Disabled to prevent race conditions with concurrent uploads
      }

      // Compress the image
      const compressedBlob = await imageCompression(file, options)

      // Create File from compressed blob
      const compressedFile = new File([compressedBlob], file.name, {
        type: file.type || "image/jpeg",
        lastModified: file.lastModified,
      })

      return compressedFile
    } catch (error) {
      console.error("Error compressing image:", error)
      throw new Error(`Failed to compress "${file.name}". Please try a different image.`)
    }
  }

  /**
   * Processes multiple image files in parallel
   * @param files - Array of image files
   * @returns Promise resolving to array of processed files
   */
  const convertAndCompressMultiple = async (files: File[]): Promise<File[]> => {
    const promises = files.map((file) => convertAndCompressImage(file))
    return Promise.all(promises)
  }

  return {
    convertAndCompressImage,
    convertHeicToJpeg,
    compressImageWithConversion,
    compressImage,
    convertAndCompressMultiple,
  }
}
