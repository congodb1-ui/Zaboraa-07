import { GoogleGenAI } from '@google/genai';

const MODEL = 'gemini-3.1-flash-image';
const FALLBACK_URL =
  '/assets/images/blueprint_3d_isometric_1791610246387.jpg';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured.');
    return res.status(500).json({
      success: false,
      error: 'Image generation is not configured.',
      fallbackUrl: FALLBACK_URL,
    });
  }

  try {
    const prompt = req.body?.prompt;

    if (
      prompt !== undefined &&
      (typeof prompt !== 'string' || prompt.length > 10000)
    ) {
      return res.status(400).json({
        success: false,
        error: 'Prompt must be a string of at most 10000 characters.',
      });
    }

    const targetPrompt =
      prompt?.trim() ||
      'Create a detailed 3D isometric enterprise cloud architecture blueprint. Use a professional enterprise architecture diagram style, clearly organized components, precise network connections, readable labels, and a 16:9 landscape composition.';

    const ai = new GoogleGenAI({ apiKey });

    const interaction = await ai.interactions.create({
      model: MODEL,
      input: targetPrompt,
      response_format: {
        type: 'image',
        mime_type: 'image/png',
        aspect_ratio: '16:9',
        image_size: '2K',
      },
    });

    const generatedImage = interaction.output_image;

    if (!generatedImage?.data) {
      throw new Error('The model returned no image data.');
    }

    return res.status(200).json({
      success: true,
      imageBase64: generatedImage.data,
      mimeType: generatedImage.mime_type || 'image/png',
      model: MODEL,
      prompt: targetPrompt,
    });
  } catch (err) {
    console.error('Blueprint generation failed:', {
      message: err?.message,
      status: err?.status,
    });

    return res.status(502).json({
      success: false,
      error: 'Blueprint generation failed. Please try again.',
      fallbackUrl: FALLBACK_URL,
    });
  }
}
