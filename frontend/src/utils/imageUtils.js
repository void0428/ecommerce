/**
 * Get the full image URL for a product image
 * @param {string|null|undefined} imagePath - The image path from the API
 * @returns {string} - Full URL to the image or placeholder
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://via.placeholder.com/300x400?text=No+Image';
  }

  // If it's already a full URL (from API), return it as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it starts with /media/, use it as is
  if (imagePath.startsWith('/media/')) {
    return `http://localhost:8000${imagePath}`;
  }

  // If it starts with /, prepend the base URL
  if (imagePath.startsWith('/')) {
    return `http://localhost:8000${imagePath}`;
  }

  // Otherwise, assume it's a relative path and prepend /media/
  return `http://localhost:8000/media/${imagePath}`;
};

