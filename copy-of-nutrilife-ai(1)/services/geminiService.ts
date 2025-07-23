import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { ProductAnalysis, LifestyleOverhaulPlan } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `You are NutriLife AI, an expert health and wellness assistant. Your goal is to empower users with data-driven insights into their food and lifestyle products. You must be accurate, rely on scientific evidence, and maintain a supportive, non-judgmental tone.
- Provide a clear score and a detailed, easy-to-understand explanation for your analysis.
- Identify potential allergens.
- Suggest 2-3 genuinely healthier and widely available alternatives.
- For lifestyle overhauls, analyze the provided list of daily products, identify patterns, and create a prioritized, actionable plan.
- Never provide medical diagnoses or treatment plans. Your advice is informational.
- You must always respond in the requested JSON format with all required fields.`;

const productAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        productName: { type: Type.STRING, description: 'The identified name of the product.' },
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
            items: {
                type: Type.OBJECT,
                properties: {
                    productName: { type: Type.STRING, description: 'Specific brand/product name for the alternative.' },
                    reason: { type: Type.STRING, description: 'Why this alternative is a healthier choice.' },
                },
                required: ['productName', 'reason']
            }
        },
    },
    required: ['productName', 'overallScore', 'summary', 'ingredients', 'allergens', 'alternatives']
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

export const analyzeProduct = async (productInfo: string, imageBase64?: string, mimeType?: string): Promise<ProductAnalysis> => {
    let contents: any;

    if (imageBase64 && mimeType) {
        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: imageBase64,
            },
        };
        const textPrompt = `Analyze the product in this image. ${productInfo ? `The user also provided this text context: "${productInfo}"` : 'Use the ingredient list and nutritional facts if visible.'}`;
        const textPart = { text: textPrompt };
        contents = { parts: [imagePart, textPart] };
    } else {
        // For text-only prompts, sending the content as a simple string is the most robust method
        // and aligns with the primary documentation for the Gemini API.
        contents = `Analyze the following product: "${productInfo}"`;
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: productAnalysisSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ProductAnalysis;
    } catch (error) {
        console.error("Error analyzing product:", error);
        throw new Error("Failed to get analysis from AI. Please check the product information and try again.");
    }
};

export const getLifestyleOverhaul = async (productList: string): Promise<LifestyleOverhaulPlan> => {
    const prompt = `Please perform a "Lifestyle Overhaul" analysis based on the following list of daily products. Identify the worst offenders, suggest healthier swaps, and provide general advice.\n\nProduct List:\n${productList}`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
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