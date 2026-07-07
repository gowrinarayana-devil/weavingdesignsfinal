/**
 * Dynamically constructs optimized image URLs using Supabase Storage transformations
 * or Unsplash query parameters. Converts format to webp and scales resolution.
 * 
 * @param {string} url - Original image URL
 * @param {number} width - Target width in pixels
 * @param {number} quality - Target compression quality (1-100)
 * @returns {string} The optimized image URL
 */
export function getOptimizedImageUrl(url, width = 400, quality = 75) {
  if (!url) return '';
  
  // Apply Supabase Storage transformation parameters
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&quality=${quality}&format=webp`;
  }
  
  // Apply Unsplash parameter transformations (for mock catalog)
  if (url.includes('images.unsplash.com')) {
    try {
      const u = new URL(url);
      u.searchParams.set('w', width.toString());
      u.searchParams.set('q', quality.toString());
      u.searchParams.set('fm', 'webp');
      return u.toString();
    } catch (e) {
      return url;
    }
  }
  
  return url;
}
