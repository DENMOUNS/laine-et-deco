import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

/**
 * Analyzes an image and returns a description of the product it might contain.
 */
export async function analyzeProductImage(base64Image: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(',')[1] || base64Image,
              },
            },
            {
              text: "Décris brièvement ce produit de décoration ou de laine (couleur, type d'objet, matière probable) en 3-5 mots clés séparés par des virgules pour une recherche. Réponds uniquement avec les mots clés.",
            },
          ],
        },
      ],
    });

    return response.text || "";
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "";
  }
}

/**
 * Filters products based on a search query (text or keywords from image).
 */
export function filterProductsByQuery(products: Product[], query: string): Product[] {
  if (!query) return products;
  
  const searchTerms = query.toLowerCase().split(/[,\s]+/).filter(t => t.length > 2);
  
  return products.filter(product => {
    const searchableText = `${product.name} ${product.category} ${product.description} ${product.material || ''} ${product.brand || ''}`.toLowerCase();
    
    // If it's a simple string search
    if (searchTerms.length === 0) return searchableText.includes(query.toLowerCase());
    
    // If it's keyword based (from image analysis)
    return searchTerms.some(term => searchableText.includes(term));
  });
}
