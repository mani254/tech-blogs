export interface ImageFileSpecs {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface ReadImageResult {
  dataUrl: string;
  specs: ImageFileSpecs;
}

/**
 * Extracts a human-readable title from an image filename.
 * Example: 'vacation-trip_2026.png' -> 'Vacation Trip 2026'
 */
export function cleanTitleFromFilename(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Reads an image File on the client, producing a preview data URL and natural dimension specifications.
 */
export function readImageFileSpecs(file: File): Promise<ReadImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read image file.'));
    };

    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      if (typeof dataUrl !== 'string') {
        reject(new Error('Invalid image data URL format.'));
        return;
      }

      const img = new Image();
      img.onerror = () => {
        reject(new Error('Failed to load image for metadata calculation.'));
      };

      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const aspectRatio =
          height > 0 ? parseFloat((width / height).toFixed(4)) : 1;

        resolve({
          dataUrl,
          specs: {
            width,
            height,
            aspectRatio,
          },
        });
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}
