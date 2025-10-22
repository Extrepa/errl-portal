import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const colorPrompts = {
  'Cyberpunk Neon': 'glowing, iridescent, neon blue and violet highlights',
  'Sunset Flare': 'warm, glowing, fiery orange and deep pink highlights',
  'Toxic Slime': 'lurid, glowing, acid green and sickly yellow highlights',
  'Golden Chrome': 'polished, reflective, liquid gold and brilliant white highlights',
};

const anglePrompts = {
  'Front-On': 'viewed directly from the front',
  'Tilted Left': 'viewed from a 45-degree angle from the left',
  'From Above': 'viewed from a high angle, looking down',
  'Heroic Low': 'viewed from a low angle, looking up',
};

app.post('/api/generate-image', async (req, res) => {
  try {
    const { text, color, angle } = req.body || {};
    if (!text || !color || !angle) {
      return res.status(400).send('Missing required fields: text, color, angle');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).send('Server is not configured with GEMINI_API_KEY');
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Typography of the words '${text}'. The style is a ${colorPrompts[color] || colorPrompts['Cyberpunk Neon']}, liquid chrome, drippy slime font. The text should be highly detailed and photorealistic, casting a soft glow. Set against a clean, dark, slightly textured background like asphalt or dark stone. Rendered as a 3D, ultra-realistic image, ${anglePrompts[angle] || anglePrompts['Front-On']}.`;

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });

    if (!response.generatedImages?.length) {
      return res.status(502).send('No image generated');
    }

    const base64 = response.generatedImages[0].image.imageBytes;
    return res.json({ imageDataUrl: `data:image/png;base64,${base64}` });
  } catch (err) {
    console.error('Error in /api/generate-image:', err);
    return res.status(500).send(err && err.message ? err.message : 'Unknown server error');
  }
});

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
