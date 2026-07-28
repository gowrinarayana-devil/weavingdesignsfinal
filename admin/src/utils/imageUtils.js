/**
 * Extracts all preview images for a design object, handling image_urls (array/json),
 * secondary_image_url (string/json/postgres-array), and preview_image_url.
 * 
 * @param {object} design - The design object
 * @returns {string[]} Array of image URLs
 */
export function getDesignImages(design) {
  if (!design) return [];

  let images = [];

  // 1. Check image_urls array or string
  if (Array.isArray(design.image_urls) && design.image_urls.length > 0) {
    images = design.image_urls.filter(Boolean);
  } else if (typeof design.image_urls === 'string' && design.image_urls.trim()) {
    try {
      const parsed = JSON.parse(design.image_urls);
      if (Array.isArray(parsed) && parsed.length > 0) {
        images = parsed.filter(Boolean);
      }
    } catch (e) {}
  }

  // 2. Check secondary_image_url if JSON array or Postgres array
  if (images.length === 0 && design.secondary_image_url) {
    const sec = design.secondary_image_url.trim();
    if (sec.startsWith('[')) {
      try {
        const parsed = JSON.parse(sec);
        if (Array.isArray(parsed) && parsed.length > 0) {
          images = [
            design.preview_image_url || design.image_url,
            ...parsed
          ].filter(Boolean);
        }
      } catch (e) {}
    } else if (sec.startsWith('{') && sec.endsWith('}')) {
      const parsed = sec.slice(1, -1).split(',').map(s => s.replace(/^"|"$/g, '').trim()).filter(Boolean);
      if (parsed.length > 0) {
        images = [
          design.preview_image_url || design.image_url,
          ...parsed
        ].filter(Boolean);
      }
    }
  }

  // 3. Standard fallback
  if (images.length === 0) {
    if (design.preview_image_url || design.image_url) {
      images.push(design.preview_image_url || design.image_url);
    }
    if (design.secondary_image_url && !design.secondary_image_url.startsWith('[') && !design.secondary_image_url.startsWith('{')) {
      images.push(design.secondary_image_url);
    }
  }

  return [...new Set(images.filter(Boolean))];
}
