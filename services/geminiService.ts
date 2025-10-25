import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { ChatMessage } from '../types';
console.log(process.env.API_KEY)
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const imageModel = 'gemini-2.5-flash-image';
const textModel = 'gemini-2.5-flash';

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
    return {
        inlineData: {
            data: base64Data,
            mimeType,
        },
    };
};

export const generateStyledImage = async (base64Image: string, mimeType: string, stylePrompt: string): Promise<string> => {
    const imagePart = fileToGenerativePart(base64Image, mimeType);
    const response = await ai.models.generateContent({
        model: imageModel,
        contents: { parts: [imagePart, { text: stylePrompt }] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
    }
    
    // If no image is found, construct a detailed error.
    let errorMessage = "AI failed to generate an image.";
    if (response.promptFeedback?.blockReason) {
        errorMessage = `Request was blocked: ${response.promptFeedback.blockReason}.`;
    } else if (candidate?.content?.parts?.[0]?.text) {
        errorMessage = `AI returned a text response: "${candidate.content.parts[0].text}"`;
    }

    throw new Error(errorMessage);
};

export const refineImage = async (base64Image: string, mimeType: string, refinePrompt: string): Promise<string> => {
    const imagePart = fileToGenerativePart(base64Image, mimeType);
    const response = await ai.models.generateContent({
        model: imageModel,
        contents: { parts: [imagePart, { text: refinePrompt }] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
    }

    // If no image is found, construct a detailed error.
    let errorMessage = "AI failed to refine the image.";
    if (response.promptFeedback?.blockReason) {
        errorMessage = `Request was blocked: ${response.promptFeedback.blockReason}.`;
    } else if (candidate?.content?.parts?.[0]?.text) {
        errorMessage = `AI returned a text response: "${candidate.content.parts[0].text}"`;
    }

    throw new Error(errorMessage);
};


const productSchema = {
    type: Type.OBJECT,
    properties: {
        itemName: { type: Type.STRING, description: 'Name of the furniture or decor item.' },
        description: { type: Type.STRING, description: 'A brief description of the item.' },
        purchaseLink: { type: Type.STRING, description: 'A URL to a retail page where a similar item can be purchased.' },
    },
     required: ['itemName', 'description', 'purchaseLink'],
};

const chatResponseSchema = {
    type: Type.OBJECT,
    properties: {
        response: { type: Type.STRING, description: 'The textual response to the user.' },
        products: {
            type: Type.ARRAY,
            description: 'A list of shoppable products mentioned or relevant to the conversation.',
            items: productSchema,
        },
    },
    required: ['response'],
};


export const getChatResponse = async (history: ChatMessage[], latestPrompt: string, imageContext?: { data: string; mimeType: string }): Promise<{ text: string, products: any[] }> => {
    
    const contents: any = {
        parts: [{
            text: `System instruction: You are an expert interior design assistant. Your role is to analyze images, answer user questions, and provide helpful suggestions. When asked for products, find shoppable links. Always format your reply within the specified JSON schema.
            
            Conversation History:
            ${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

            Latest user prompt: ${latestPrompt}`
        }],
    };

    if (imageContext) {
        contents.parts.unshift(fileToGenerativePart(imageContext.data, imageContext.mimeType));
    }
    
    const response = await ai.models.generateContent({
        model: textModel,
        contents: contents,
        config: {
            responseMimeType: 'application/json',
            responseSchema: chatResponseSchema,
        }
    });

    try {
        const jsonText = response.text;
        const parsed = JSON.parse(jsonText);
        return {
            text: parsed.response || "I'm sorry, I couldn't process that request.",
            products: parsed.products || []
        };
    } catch (e) {
        console.error("Failed to parse Gemini response:", e);
        // Fallback for non-JSON or malformed responses
        return {
            text: response.text || "I'm sorry, I encountered an error.",
            products: []
        };
    }
};
