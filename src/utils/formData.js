/**
 * Builds multipart FormData from a flat payload (handles File values for uploads).
 * Array values (e.g. multiple image files under one field) are appended once per
 * item under the same key, matching how multer's `.array(fieldName)` expects
 * repeated fields rather than a single array-valued one.
 */
export function toFormData(payload) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) formData.append(key, item);
      });
    } else {
      formData.append(key, value);
    }
  });
  return formData;
}

/**
 * Axios instances that default to `Content-Type: application/json` will otherwise
 * JSON-stringify a FormData body instead of sending it as multipart. Passing this
 * as the request config clears that default so the browser sets the correct
 * `multipart/form-data; boundary=...` header itself.
 */
export const MULTIPART_HEADERS = { headers: { "Content-Type": undefined } };
