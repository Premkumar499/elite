/**
 * Image Optimization Utilities
 * Automatically resize and compress images before upload
 */

/**
 * Recommended image sizes for e-commerce
 */
export const IMAGE_SPECS = {
  // Main product image (shown in collections grid)
  PRODUCT_MAIN: {
    width: 800,
    height: 800,
    quality: 0.85,
    maxFileSize: 500 * 1024, // 500KB
  },
  // Thumbnail images
  THUMBNAIL: {
    width: 400,
    height: 400,
    quality: 0.80,
    maxFileSize: 200 * 1024, // 200KB
  },
  // High-res for zoom
  HIGH_RES: {
    width: 1500,
    height: 1500,
    quality: 0.90,
    maxFileSize: 1024 * 1024, // 1MB
  },
};

/**
 * Resize and compress image
 * @param {File} file - Original image file
 * @param {Object} options - Size and quality options
 * @returns {Promise<Blob>} - Optimized image blob
 */
export async function optimizeImage(file, options = IMAGE_SPECS.PRODUCT_MAIN) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate dimensions maintaining aspect ratio
        let { width, height } = options;
        const aspectRatio = img.width / img.height;
        
        if (aspectRatio > 1) {
          // Landscape
          height = width / aspectRatio;
        } else {
          // Portrait
          width = height * aspectRatio;
        }
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        
        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/jpeg',
          options.quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 * @param {File} file - Image file to validate
 * @returns {Object} - { valid: boolean, error: string }
 */
export function validateImage(file) {
  const maxSize = 10 * 1024 * 1024; // 10MB original max
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPEG, PNG, or WebP)',
    };
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image size must be less than 10MB',
    };
  }
  
  return { valid: true, error: null };
}

/**
 * Get file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size (e.g., "1.5 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Create preview URL from file
 * @param {File|Blob} file - Image file
 * @returns {string} - Object URL
 */
export function createPreviewURL(file) {
  return URL.createObjectURL(file);
}

/**
 * Cleanup preview URL
 * @param {string} url - Object URL to revoke
 */
export function revokePreviewURL(url) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}
