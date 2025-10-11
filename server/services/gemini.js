const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyDVfBL5j9aYESKZymqKRRRd63e1_8vtnUQ";
const preferredModelName = "gemini-2.5-pro";
let genAI = null;
let model = null;

function getModel(schemaType = "foodAnalysis") {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  if (!genAI) genAI = new GoogleGenerativeAI(apiKey);
  
  const foodAnalysisSchema = {
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
  };

  const recipeSchema = {
    type: "object",
    properties: {
      recipe: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          prepTime: { type: "string" },
          cookTime: { type: "string" },
          servings: { type: "number" },
          ingredients: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                amount: { type: "string" },
                unit: { type: "string" },
              },
              required: ["name", "amount", "unit"],
            },
          },
          instructions: { type: "array", items: { type: "string" } },
          tips: { type: "array", items: { type: "string" } },
        },
        required: ["title", "description", "prepTime", "cookTime", "servings", "ingredients", "instructions"],
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
          sodium: { type: "number" },
          vitamins: {
            type: "object",
            properties: {
              vitaminA: { type: "number" },
              vitaminC: { type: "number" },
              vitaminD: { type: "number" },
              vitaminE: { type: "number" },
              vitaminK: { type: "number" },
              thiamine: { type: "number" },
              riboflavin: { type: "number" },
              niacin: { type: "number" },
              folate: { type: "number" },
              vitaminB12: { type: "number" }
            }
          },
          minerals: {
            type: "object",
            properties: {
              calcium: { type: "number" },
              iron: { type: "number" },
              magnesium: { type: "number" },
              phosphorus: { type: "number" },
              potassium: { type: "number" },
              zinc: { type: "number" },
              copper: { type: "number" },
              manganese: { type: "number" },
              selenium: { type: "number" }
            }
          },
        },
        required: ["calories", "protein", "carbs", "fat"],
      },
      substitutions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            original: { type: "string" },
            substitute: { type: "string" },
            benefit: { type: "string" },
            reason: { type: "string" },
          },
          required: ["original", "substitute", "benefit", "reason"],
        },
      },
    },
    required: ["recipe", "nutrition"],
  };

  const schema = schemaType === "recipe" ? recipeSchema : foodAnalysisSchema;
  
  if (!model || model._schemaType !== schemaType) {
    try {
      // Try preferred model first
      model = genAI.getGenerativeModel({
        model: preferredModelName,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });
      model._schemaType = schemaType;
      console.log(`Using Gemini model: ${preferredModelName} for ${schemaType}`);
    } catch (e) {
      console.warn(`Failed to init model ${preferredModelName}: ${e.message}. Falling back to gemini-1.5-pro`);
      model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });
      model._schemaType = schemaType;
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

async function generateRecipeFromIngredients(ingredientsText, imageBase64 = null) {
  console.log("Starting recipe generation...");
  const model = getModel("recipe");
  
  let prompt = `You are a professional chef and nutritionist. Create a delicious, healthy recipe based on the following ingredients: ${ingredientsText}

Please provide a comprehensive response including:
1. A creative recipe title
2. Brief description of the dish
3. Prep and cook times
4. Number of servings
5. Detailed ingredient list with quantities
6. Step-by-step cooking instructions
7. Chef's tips for best results
8. Complete nutrition information per serving
9. Healthier ingredient substitutions if applicable

Make the recipe practical, delicious, and nutritionally balanced.`;

  if (imageBase64) {
    prompt += "\n\nI've also provided an image of the ingredients. Please analyze the image to better understand what's available and create the most appropriate recipe.";
  }

  try {
    let result;
    if (imageBase64) {
      const b64 = imageBase64.split(",")[1] || imageBase64;
      let mimeType = "image/jpeg";
      try {
        const mimeMatch = /^data:([^;]+);base64,/.exec(imageBase64);
        if (mimeMatch && mimeMatch[1]) {
          const detected = mimeMatch[1].toLowerCase();
          if (detected === "image/jpg") mimeType = "image/jpeg";
          else if (["image/png", "image/jpeg", "image/webp", "image/heic", "image/heif"].includes(detected)) {
            mimeType = detected;
          }
        }
      } catch (_) {
        // keep default image/jpeg
      }

      result = await model.generateContent([
        { text: prompt },
        { inlineData: { data: b64, mimeType } },
      ]);
    } else {
      result = await model.generateContent([{ text: prompt }]);
    }

    const text = result.response.text();
    console.log("Gemini recipe response:", text);
    
    try {
      const parsed = JSON.parse(text);
      console.log("Parsed recipe response:", parsed);
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
    console.error("Gemini recipe generation error:", error.message);
    throw error;
  }
}


module.exports = { 
  analyzeFoodImageBase64, 
  generateRecipeFromIngredients
};


