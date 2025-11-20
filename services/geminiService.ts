import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

/**
 * Edits an image based on a text prompt using Gemini 2.5 Flash Image.
 * 
 * @param base64Image The original image in base64 format.
 * @param mimeType The mime type of the image.
 * @param prompt The text instruction for editing.
 * @param referenceImage Optional reference image (e.g., for virtual try-on) in base64.
 * @param referenceMimeType Optional mime type for the reference image.
 * @returns The edited image as a base64 data URI.
 */
export const editImageWithGemini = async (
  base64Image: string,
  mimeType: string,
  prompt: string,
  referenceImage?: string | null,
  referenceMimeType?: string
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Strip data URI prefix if present to get raw base64
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const parts: any[] = [
    {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    }
  ];

  // If a reference image is provided, add it to the request parts
  if (referenceImage && referenceMimeType) {
    const referenceBase64 = referenceImage.replace(/^data:image\/\w+;base64,/, "");
    parts.push({
      inlineData: {
        data: referenceBase64,
        mimeType: referenceMimeType,
      },
    });
  }

  // Add the text prompt last
  parts.push({
    text: prompt,
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const respMime = part.inlineData.mimeType || 'image/png';
          return `data:${respMime};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data returned from the model.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to process image.");
  }
};