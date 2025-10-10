const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyDVfBL5j9aYESKZymqKRRRd63e1_8vtnUQ";
const preferredModelName = "gemini-2.5-pro";
let genAI = null;
let model = null;

function getModel() {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  if (!genAI) genAI = new GoogleGenerativeAI(apiKey);
  if (!model) {
    try {
      // Try preferred model first
      model = genAI.getGenerativeModel({
        model: preferredModelName,
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
      console.log(`Using Gemini model: ${preferredModelName}`);
    } catch (e) {
      console.warn(`Failed to init model ${preferredModelName}: ${e.message}. Falling back to gemini-1.5-pro`);
      model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
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
    }
  }
  return model;
}

async function analyzeFoodImageBase64(dataUrl) {
  console.log("Starting Gemini analysis...");
  const model = getModel();
  const b64 = dataUrl.split(",")[1] || dataUrl;
  // Detect a concrete image mime type from the data URL. Default to image/jpeg if unknown.
  let mimeType = "image/jpeg";
  try {
    const mimeMatch = /^data:([^;]+);base64,/.exec(dataUrl);
    if (mimeMatch && mimeMatch[1]) {
      const detected = mimeMatch[1].toLowerCase();
      if (detected === "image/jpg") mimeType = "image/jpeg";
      else if (
        detected === "image/png" ||
        detected === "image/jpeg" ||
        detected === "image/webp" ||
        detected === "image/heic" ||
        detected === "image/heif"
      ) {
        mimeType = detected;
      }
    }
  } catch (_) {
    // keep default image/jpeg
  }
  
  console.log("Image data length:", b64.length);
  console.log("MIME type:", mimeType);

  const systemPrompt =
    "You are a nutrition expert. Analyze this food image carefully and identify ALL visible foods with specific names and estimated portion sizes. " +
    "Look for: rice, chicken, vegetables, bread, curry, etc. Be specific about what you see. " +
    "Estimate realistic nutrition values based on the foods identified. " +
    "Return a nutrition score (0-100) based on healthiness of the meal."

  try {
    let result;
    try {
      result = await model.generateContent([
        { text: systemPrompt },
        { inlineData: { data: b64, mimeType } },
      ]);
    } catch (primaryError) {
      // Retry once with image/jpeg if mime type was not jpeg
      const message = String(primaryError && primaryError.message || "");
      const isUnsupportedMime = message.includes("Unsupported MIME type") || message.includes("400");
      if (mimeType !== "image/jpeg" && isUnsupportedMime) {
        console.warn(`Retrying analysis with image/jpeg due to MIME error (was ${mimeType})`);
        mimeType = "image/jpeg";
        result = await model.generateContent([
          { text: systemPrompt },
          { inlineData: { data: b64, mimeType } },
        ]);
      } else {
        throw primaryError;
      }
    }

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


