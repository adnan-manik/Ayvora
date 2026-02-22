import { GoogleGenAI, Type } from "@google/genai";
import { PERFUMES } from '../constants';
import { Product } from '../types';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const getPerfumeRecommendation = async (userPreferences: string): Promise<{ product: Product | null, reason: string }> => {
  try {
    const model = "gemini-3-flash-preview";
    
    // Create a simplified catalog string to save tokens and context
    const catalog = PERFUMES.map(p => ({
      id: p.id,
      name: p.name,
      notes: p.notes.join(", "),
      description: p.description,
      category: p.category
    }));

    const prompt = `
      I am a user looking for a perfume recommendation.
      My preferences are: "${userPreferences}".
      
      Here is the available catalog of perfumes:
      ${JSON.stringify(catalog)}

      Please recommend the single best match from the catalog.
      Return the result in strict JSON format.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedId: { type: Type.STRING, description: "The ID of the matching product" },
            reason: { type: Type.STRING, description: "A short, persuasive reason why this perfume matches the user's request" }
          },
          required: ["recommendedId", "reason"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    if (result.recommendedId) {
      const product = PERFUMES.find(p => p.id === result.recommendedId) || null;
      return { product, reason: result.reason };
    }

    return { product: null, reason: "I couldn't find a perfect match, but try browsing our Best Sellers!" };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { product: null, reason: "Sorry, our AI perfumer is currently taking a break. Please browse the collection manually." };
  }
};
