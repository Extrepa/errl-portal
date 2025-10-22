import type { ColorTheme, CameraAngle } from '../types';

export const generateDrippyTextImage = async (
  text: string,
  color: ColorTheme,
  angle: CameraAngle
): Promise<string> => {
  const res = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, color, angle }),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Failed to generate image');
  }

  const data = (await res.json()) as { imageDataUrl: string };
  return data.imageDataUrl;
};
