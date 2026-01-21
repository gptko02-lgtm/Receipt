import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeReceiptImage = async (file: File): Promise<Omit<ReceiptItem, 'id'>[]> => {
  try {
    const imagePart = await fileToGenerativePart(file);

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          imagePart,
          {
            text: `Analyze this receipt image and extract the following information:
            1. Date (Format: YYYY-MM-DD). If the year is missing, assume the current year.
            2. Merchant Name (Store name).
            3. Total Amount (Number only).
            4. Notes (Any specific details like "Lunch", "Taxi", or leave empty if unclear).
            
            Return the data as a JSON array.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING, description: "Date of transaction in YYYY-MM-DD format" },
              merchantName: { type: Type.STRING, description: "Name of the merchant or store" },
              amount: { type: Type.NUMBER, description: "Total amount of the receipt" },
              notes: { type: Type.STRING, description: "Short description or category if available, otherwise empty string" },
            },
            required: ["date", "merchantName", "amount"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text);
    return data;

  } catch (error) {
    console.error("Error analyzing receipt:", error);
    throw new Error("영수증 분석 중 오류가 발생했습니다. 이미지가 명확한지 확인해주세요.");
  }
};