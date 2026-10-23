import { getFileExtension } from './attachmentFiles'

// Cover images and profile photos accept the same formats.
const imageMimeTypesByExtension: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}

export const acceptedImageExtensions = Object.keys(imageMimeTypesByExtension)
  .map((extension) => `.${extension}`)
  .join(',')

export const maximumCoverImageSizeInBytes = 5 * 1024 * 1024

export const maximumAvatarSizeInBytes = 2 * 1024 * 1024

type ImageFileMessages = {
  type: string
  size: string
}

export type ImageFileCheck =
  | { isAccepted: true; mimeType: string; extension: string }
  | { isAccepted: false; errorMessage: string }

export function checkImageFile(file: File, maximumSizeInBytes: number, messages: ImageFileMessages): ImageFileCheck {
  const extension = getFileExtension(file.name)
  const mimeType = imageMimeTypesByExtension[extension]
  if (!mimeType) return { isAccepted: false, errorMessage: messages.type }
  if (file.size > maximumSizeInBytes) return { isAccepted: false, errorMessage: messages.size }
  // Saved as .jpg whether the file was named .jpg or .jpeg.
  return { isAccepted: true, mimeType, extension: extension === 'jpeg' ? 'jpg' : extension }
}
