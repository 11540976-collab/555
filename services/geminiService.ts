import { GoogleGenAI, Type } from "@google/genai";
import { StockHolding, Transaction } from "../types";

// Ensure API key is loaded from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper for retry logic
async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const fetchStockPrices = async (holdings: StockHolding[]): Promise<Record<string, number>> => {
  const symbols = holdings.map(h => h.symbol).join(', ');
  const prompt = `
    I need the current approximate market price (in original currency) for the following stock symbols: ${symbols}.
    Assume current date is ${new Date().toISOString()}.
    If it's a weekend or closed market, give the last closing price.
    Return a JSON object where keys are symbols and values are numeric prices.
  `;

  try {
    const response = await retry(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             prices: {
                type: Type.ARRAY,
                items: {
                   type: Type.OBJECT,
                   properties: {
                      symbol: { type: Type.STRING },
                      price: { type: Type.NUMBER }
                   }
                }
             }
          }
        }
      }
    }));

    const jsonText = response.text;
    if (!jsonText) return {};

    const data = JSON.parse(jsonText);
    const result: Record<string, number> = {};
    
    if (data.prices && Array.isArray(data.prices)) {
        data.prices.forEach((item: any) => {
            result[item.symbol] = item.price;
        });
    }
    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {};
  }
};

export const generateFinancialAdvice = async (transactions: Transaction[]): Promise<string> => {
  // Summarize specifically for the prompt to save tokens/complexity
  const recentTx = transactions.slice(0, 20).map(t => 
    `${t.date}: ${t.type} $${t.amount} (${t.category}) - ${t.note}`
  ).join('\n');

  const prompt = `
    You are a personal financial advisor. Analyze the following recent transactions for a user in Taiwan (TWD currency).
    Provide a concise, 3-bullet point summary of their spending habits and 1 actionable suggestion to save money.
    Keep the tone encouraging but professional. Use Traditional Chinese (zh-TW).

    Transactions:
    ${recentTx}
  `;

  try {
    const response = await retry(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    }));
    return response.text || "無法生成建議。";
  } catch (error) {
    console.error("Gemini Advice Error:", error);
    return "發生錯誤，無法獲取建議。";
  }
};