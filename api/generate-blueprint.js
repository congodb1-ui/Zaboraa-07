import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { prompt } = req.body || {};
    const targetPrompt = prompt || '3D isometric enterprise cloud architecture blueprint';
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in Vercel environment variables.');
    }

    const ai = new GoogleGenAI({ apiKey });

    // Use Gemini's multimodal image generation model compatible with standard API keys
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: targetPrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: '16:9'
        }
      }
    });

    let imageBase64 = null;
    const candidates = response.candidates || [];
    for (const candidate of candidates) {
      const parts = candidate.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          imageBase64 = part.inlineData.data;
          break;
        }
      }
      if (imageBase64) break;
    }

    if (imageBase64) {
      return res.status(200).json({
        success: true,
        imageBase64,
        model: 'gemini-3-pro-image-preview',
        prompt: targetPrompt
      });
    } else {
      throw new Error('No image data returned from model response.');
    }
  } catch (err) {
    console.error('Serverless generation error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
      fallbackUrl: '/assets/images/blueprint_3d_isometric_1791610246387.jpg'
    });
  }
}
