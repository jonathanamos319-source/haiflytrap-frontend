/**
 * Optimizes a Cloudinary image URL for performance.
 * Applies auto format (f_auto), auto quality (q_auto), and a width of 800px (w_800).
 * If the URL is not a Cloudinary URL, it returns the original URL.
 */
export function optimizeCloudinaryUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (!url.includes('cloudinary.com')) return url;

  // Insert transformations after '/upload/'
  if (url.includes('/upload/')) {
    const parts = url.split('/upload/');
    // If it already has transformations, don't double apply them
    if (parts[1].startsWith('f_auto') || parts[1].includes('q_auto')) {
      return url;
    }
    return `${parts[0]}/upload/f_auto,q_auto,w_800/${parts[1]}`;
  }

  return url;
}
