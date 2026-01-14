export const svgToPngBlob = async (
  svg: string,
  width: number,
  height: number
): Promise<Blob> => {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  try {
    const img = new Image();
    const loaded = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load SVG for export.'));
    });
    img.src = url;
    await loaded;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context not available.');
    }
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((output) => {
        if (!output) {
          reject(new Error('PNG export failed.'));
          return;
        }
        resolve(output);
      }, 'image/png');
    });

    return pngBlob;
  } finally {
    URL.revokeObjectURL(url);
  }
};
