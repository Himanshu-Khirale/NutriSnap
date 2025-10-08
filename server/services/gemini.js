const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
let model = null;

function getModel() {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  if (!genAI) genAI = new GoogleGenerativeAI(apiKey);
  if (!model)
    model = genAI.getGenerativeModel({
      // gemini-1.5 models support vision (images). Gemma does not.
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            foods: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  portion: { type: "string" },
                },
                required: ["name", "portion"],
              },
            },
            nutrition: {
              type: "object",
              properties: {
                calories: { type: "number" },
                protein: { type: "number" },
                carbs: { type: "number" },
                fat: { type: "number" },
                fiber: { type: "number" },
                sugar: { type: "number" },
              },
              required: ["calories", "protein", "carbs", "fat"],
            },
            score: { type: "number" },
            recommendations: { type: "array", items: { type: "string" } },
            alternatives: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  current: { type: "string" },
                  suggestion: { type: "string" },
                  benefit: { type: "string" },
                },
                required: ["current", "suggestion", "benefit"],
              },
            },
          },
          required: ["foods", "nutrition", "score"],
        },
      },
    });
  return model;
}

async function analyzeFoodImageBase64(dataUrl) {
  console.log("Starting Gemini analysis...");
  const model = getModel();
  const b64 = dataUrl.split(",")[1] || dataUrl;
  const mimeType = dataUrl.includes("image/png") ? "image/png" : dataUrl.includes("image/jpeg") ? "image/jpeg" : "image/*";
  
  console.log("Image data length:", b64.length);
  console.log("MIME type:", mimeType);

  const systemPrompt =
    "You are a nutrition expert. Analyze this food image carefully and identify ALL visible foods with specific names and estimated portion sizes. " +
    "Look for: rice, chicken, vegetables, bread, curry, etc. Be specific about what you see. " +
    "Estimate realistic nutrition values based on the foods identified. " +
    "Return a nutrition score (0-100) based on healthiness of the meal."

  try {
    const result = await model.generateContent([
      { text: systemPrompt },
      { inlineData: { data: b64, mimeType } },
    ]);

    const text = result.response.text();
    console.log("Gemini raw response:", text);
    
    try {
      const parsed = JSON.parse(text);
      console.log("Parsed response:", parsed);
      return parsed;
    } catch (e) {
      console.error("JSON parse error:", e.message);
      // try fallback extraction
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        const jsonStr = text.slice(start, end + 1);
        console.log("Extracted JSON:", jsonStr);
        return JSON.parse(jsonStr);
      }
      throw new Error(`Gemini JSON parse failed: ${e.message}. Raw response: ${text}`);
    }
  } catch (error) {
    console.error("Gemini API error:", error.message);
    throw error;
  }
}

module.exports = { analyzeFoodImageBase64 };


