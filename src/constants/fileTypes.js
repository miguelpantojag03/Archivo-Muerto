// ─── Allowed attachment types ──────────────────────────────────────

export const MAX_FILE_SIZE_MB  = 50
export const MAX_FILE_SIZE_B   = MAX_FILE_SIZE_MB * 1024 * 1024

export const ALLOWED_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg',
  'pdf',
  'doc', 'docx',
  'xls', 'xlsx',
  'ppt', 'pptx',
  'txt', 'md', 'csv',
  'zip',
]

export const MIME_TYPES = {
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  png:  'image/png',
  webp: 'image/webp',
  gif:  'image/gif',
  svg:  'image/svg+xml',
  pdf:  'application/pdf',
  doc:  'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls:  'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt:  'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt:  'text/plain',
  md:   'text/markdown',
  csv:  'text/csv',
  zip:  'application/zip',
}

// Which extensions can be previewed inside the app
export const PREVIEWABLE_IMAGES = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']
export const PREVIEWABLE_TEXT   = ['txt', 'md', 'csv']
export const PREVIEWABLE_PDF    = ['pdf']

export function isImage(ext)  { return PREVIEWABLE_IMAGES.includes(ext?.toLowerCase()) }
export function isText(ext)   { return PREVIEWABLE_TEXT.includes(ext?.toLowerCase()) }
export function isPDF(ext)    { return ext?.toLowerCase() === 'pdf' }

export function formatFileSize(bytes) {
  if (bytes < 1024)            return `${bytes} B`
  if (bytes < 1024 * 1024)     return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getExtension(filename) {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

export function validateFile(file) {
  const ext = getExtension(file.name)
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `File type ".${ext}" is not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`
  }
  if (file.size > MAX_FILE_SIZE_B) {
    return `File is too large (${formatFileSize(file.size)}). Maximum allowed: ${MAX_FILE_SIZE_MB} MB`
  }
  return null // null = valid
}
