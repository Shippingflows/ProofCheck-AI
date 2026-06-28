export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpg",
  "image/jpeg",
] as const;

export const ACCEPTED_EXTENSIONS = ".pdf,.png,.jpg,.jpeg";

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_FILE_SIZE_LABEL = "50 MB";

const EXTENSION_PATTERN = /\.(pdf|png|jpe?g)$/i;

export interface FileValidationResult {
  ok: boolean;
  error?: string;
}

/**
 * Validates an uploaded file against supported type, size, and readability
 * rules. Returns a readable, human-facing message on failure.
 *
 * Note: this performs structural checks only. It does not parse document
 * contents and makes no completeness or verification claims.
 */
export function validateFile(file: File | null): FileValidationResult {
  if (!file) {
    return { ok: false, error: "No file selected." };
  }

  const hasAcceptedType = (ACCEPTED_FILE_TYPES as readonly string[]).includes(
    file.type
  );
  const hasAcceptedExtension = EXTENSION_PATTERN.test(file.name);

  // Some browsers report an empty MIME type for valid files, so we fall back
  // to the file extension when the type is missing.
  if (!hasAcceptedType && !(file.type === "" && hasAcceptedExtension)) {
    return {
      ok: false,
      error: `Unsupported file type. Please upload a PDF, PNG, JPG, or JPEG file.`,
    };
  }

  if (!hasAcceptedExtension && file.type === "") {
    return {
      ok: false,
      error: `Unsupported or unreadable file. Please upload a PDF, PNG, JPG, or JPEG file.`,
    };
  }

  if (file.size === 0) {
    return {
      ok: false,
      error: "This file appears to be empty or unreadable. Please re-export and try again.",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: `File is too large (${formatFileSize(file.size)}). Maximum allowed size is ${MAX_FILE_SIZE_LABEL}.`,
    };
  }

  return { ok: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
