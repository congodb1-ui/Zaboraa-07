import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { prompt } = req.body || {};
    const targetPrompt = prompt || '3D isometric enterprise cloud architecture blueprint';
    
    const project = process.env.GOOGLE_CLOUD_PROJECT || 'prime-bridge-511404-a3';
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

    // Initialize GoogleGenAI SDK explicitly in Vertex AI mode
    const ai = new GoogleGenAI({
      vertexai: true,
      project,
      location
    });

    // Execute Imagen 3 request on Vertex AI
    const imgResp = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: targetPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
        outputMimeType: 'image/jpeg'
      }
    });

    const imageBase64 = imgResp.generatedImages?.[0]?.image?.imageBytes;

    if (imageBase64) {
      return res.status(200).json({
        success: true,
        imageBase64,
        model: 'imagen-3.0-generate-002 (Vertex AI)',
        prompt: targetPrompt
      });
    } else {
      throw new Error('No image bytes returned from Vertex AI Imagen 3 model.');
    }
  } catch (err) {
    console.error('Vertex AI serverless generation error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
      fallbackUrl: '/assets/images/blueprint_3d_isometric_1791610246387.jpg'
    });
  }
}
