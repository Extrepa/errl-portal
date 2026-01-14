/**
 * Image Tracing Utilities
 * Converts raster images (PNG/JPG) to SVG vector format
 */

/**
 * Convert image file to base64 data URL
 */
export function imageToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert image file to blob
 */
export function imageToBlob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const blob = new Blob([reader.result as ArrayBuffer], { type: file.type });
      resolve(blob);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Create a simple SVG placeholder from image dimensions
 * This is a fallback when AI tracing is not available
 */
export async function createSVGPlaceholder(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      
      // Create a simple SVG with the image embedded as base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image x="0" y="0" width="${width}" height="${height}" xlink:href="${base64}"/>
</svg>`;
        URL.revokeObjectURL(url);
        resolve(svg);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Trace image using Gemini Vision API
 */
export interface TraceImageOptions {
  quality?: 'high' | 'medium' | 'low';
  prompt?: string;
  model?: string;
}

export async function traceImageWithGemini(
  imageFile: File,
  apiKey: string,
  options?: TraceImageOptions
): Promise<string> {
  const base64Data = await imageToDataURL(imageFile);
  // Remove data:image/...;base64, prefix
  const base64Image = base64Data.split(',')[1];
  
  const mimeType = imageFile.type || 'image/png';
  const model = options?.model || 'gemini-1.5-flash';
  
  const prompt = options?.prompt || 
    'Convert this image to a clean SVG vector format. Extract the main shapes and paths, use simple colors, and remove any text or complex details. Return only valid SVG code without markdown formatting.';
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 32,
            topP: 1,
            maxOutputTokens: 8192,
          }
        })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }
    
    const data = await response.json();
    const svgContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!svgContent) {
      throw new Error('No SVG content returned from API');
    }
    
    // Clean up the response - remove markdown code blocks if present
    let cleanedSvg = svgContent.trim();
    if (cleanedSvg.startsWith('```')) {
      cleanedSvg = cleanedSvg.replace(/^```(?:svg|xml)?\n?/i, '').replace(/\n?```$/i, '');
    }
    
    // Ensure it's valid SVG
    if (!cleanedSvg.includes('<svg')) {
      throw new Error('Invalid SVG returned from API');
    }
    
    return cleanedSvg.trim();
  } catch (error) {
    console.error('Gemini tracing error:', error);
    throw error;
  }
}

