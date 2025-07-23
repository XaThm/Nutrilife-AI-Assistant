import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { ProductAnalysis, LifestyleOverhaulPlan, HistoryData, Recommendation } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemPrompt = `You are NutriLife AI, an expert health and wellness assistant. Your goal is to empower users with data-driven insights into their food and lifestyle products. You must be accurate, rely on scientific evidence, and maintain a supportive, non-judgmental tone.
- Provide a clear score and a detailed, easy-to-understand explanation for your analysis.
- Find and include a direct, publicly accessible URL for a representative image of the product.
- Find and include up to 3 direct shopping links for the product from major online retailers (e.g. Amazon, Walmart, Target).
- Identify potential allergens.
- Suggest 2-3 genuinely healthier and widely available alternatives. These alternatives **must** have a likely health score of 'A' or 'B'.
- For lifestyle overhauls, analyze the provided list of daily products, identify patterns, and create a prioritized, actionable plan.
- For recommendations, suggest new products the user hasn't analyzed before, based on their history of liked products.
- Never provide medical diagnoses or treatment plans. Your advice is informational.
- You must always respond in the requested JSON format with all required fields.`;

const productAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        productName: { type: Type.STRING, description: 'The identified name of the product.' },
        imageUrl: { type: Type.STRING, description: 'A direct, publicly accessible URL for a high-quality, representative image of the product.' },
        overallScore: { type: Type.STRING, enum: ['A', 'B', 'C', 'D', 'F'], description: 'A-F score.' },
        summary: { type: Type.STRING, description: 'Detailed explanation for the score, highlighting key pros and cons.' },
        ingredients: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    impact: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative', 'Controversial'] },
                    description: { type: Type.STRING, description: 'Brief explanation of the ingredient\'s health impact.' },
                },
                required: ['name', 'impact', 'description']
            }
        },
        allergens: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of potential common allergens found.' },
        alternatives: {
            type: Type.ARRAY,
            description: "List of 2-3 genuinely healthier alternatives that would likely score an 'A' or 'B' if analyzed.",
            items: {
                type: Type.OBJECT,
                properties: {
                    productName: { type: Type.STRING, description: 'Specific brand/product name for the alternative.' },
                    reason: { type: Type.STRING, description: 'Why this alternative is a healthier choice (e.g., "lower in sugar", "contains whole grains").' },
                },
                required: ['productName', 'reason']
            }
        },
        retailLinks: {
            type: Type.ARRAY,
            description: 'Up to 3 shopping links from major online retailers.',
            items: {
                type: Type.OBJECT,
                properties: {
                    retailer: { type: Type.STRING, description: 'Name of the retailer (e.g., Amazon, Walmart).' },
                    url: { type: Type.STRING, description: 'Direct URL to the product page.' },
                },
                required: ['retailer', 'url']
            }
        }
    },
    required: ['productName', 'imageUrl', 'overallScore', 'summary', 'ingredients', 'allergens', 'alternatives', 'retailLinks']
};

const lifestyleOverhaulSchema = {
    type: Type.OBJECT,
    properties: {
        overallSummary: { type: Type.STRING, description: 'A summary of the user\'s current lifestyle based on products and common patterns.' },
        actionPlan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    originalProduct: { type: Type.STRING },
                    priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'], description: 'Priority for swapping this product.' },
                    reason: { type: Type.STRING, description: 'Why this product should be swapped.' },
                    suggestedSwaps: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                productName: { type: Type.STRING },
                                reason: { type: Type.STRING, description: 'Why this swap is healthier.' },
                            },
                            required: ['productName', 'reason']
                        }
                    }
                },
                required: ['originalProduct', 'priority', 'reason', 'suggestedSwaps']
            }
        },
        generalAdvice: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Broader lifestyle advice.' },
    },
    required: ['overallSummary', 'actionPlan', 'generalAdvice']
};

const recommendationSchema = {
    type: Type.ARRAY,
    description: 'A list of 5 recommended products that are similar to what the user likes but are new to them.',
    items: {
        type: Type.OBJECT,
        properties: {
            productName: { type: Type.STRING, description: 'Specific brand/product name for the recommended product.' },
            reason: { type: Type.STRING, description: 'A brief, compelling reason why the user might like this product based on their history.' },
            imageSearchTerm: { type: Type.STRING, description: 'A simple, 1-2 word search term for finding a relevant product image (e.g., "granola bar", "yogurt").' }
        },
        required: ['productName', 'reason', 'imageSearchTerm']
    }
};

export const analyzeProduct = async (productInfo: string, imageBase64?: string, mimeType?: string): Promise<ProductAnalysis> => {
    let contents;

    // This is probably more verbose than it needs to be, but it's clear.
    if (imageBase64 && mimeType) {
        const imagePart = {
            inlineData: { data: imageBase64, mimeType: mimeType },
        };
        const promptText = `Analyze the product in this image. ${productInfo ? `The user also provided this text context: "${productInfo}"` : 'Use the ingredient list and nutritional facts if visible.'} Provide a public image URL and shopping links for the identified product.`;
        const textPart = { text: promptText };
        contents = { parts: [imagePart, textPart] };
    } else {
        contents = `Analyze the following product: "${productInfo}". Provide a public image URL and shopping links for it.`;
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: 'application/json',
                responseSchema: productAnalysisSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ProductAnalysis;
    } catch (error) {
        console.error("Gemini analysis call failed:", error);
        // A more human error message
        throw new Error("The AI failed to provide an analysis. It might be busy, please try again.");
    }
};

export const getLifestyleOverhaul = async (productList: string): Promise<LifestyleOverhaulPlan> => {
    const prompt = `Please perform a "Lifestyle Overhaul" analysis based on the following list of daily products. Identify the worst offenders, suggest healthier swaps, and provide general advice.\n\nProduct List:\n${productList}`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: 'application/json',
                responseSchema: lifestyleOverhaulSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as LifestyleOverhaulPlan;
    } catch (error) {
        console.error("Error getting lifestyle overhaul:", error);
        throw new Error("Failed to get lifestyle plan from AI. Please check your product list and try again.");
    }
};

export const getRecommendations = async (history: HistoryData): Promise<Recommendation[]> => {
    const likedProducts = history.products.filter(p => p.overallScore === 'A' || p.overallScore === 'B').map(p => p.productName);
    const dislikedProducts = history.products.filter(p => p.overallScore === 'D' || p.overallScore === 'F').map(p => p.productName);
    const allAnalyzedProducts = history.products.map(p => p.productName);

    if (likedProducts.length === 0) {
        return [];
    }

    const prompt = `Based on a user's analysis history, suggest 5 new, healthy products they might like.
    
    The user has analyzed these products and liked them (score A or B):
    ${likedProducts.join(', ') || 'None'}

    The user has analyzed these products and disliked them (score D or F):
    ${dislikedProducts.join(', ') || 'None'}

    CRITICAL: Do not suggest any of the following products that the user has ALREADY analyzed:
    ${allAnalyzedProducts.join(', ')}

    Provide 5 diverse recommendations for products that are generally considered healthy and align with the user's positive preferences. For each recommendation, provide a product name, a brief reason, and a simple 1-2 word search term for an image.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: 'application/json',
                responseSchema: recommendationSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Recommendation[];
    } catch (error) {
        console.error("Error getting recommendations:", error);
        throw new Error("Failed to get recommendations from AI. Please try again later.");
    }
};