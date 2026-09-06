import { Category, Gender, Occasion, Season, ClothingItem } from "@/types/ClothingItem";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";

export interface AIClassificationResult {
  name: string;
  category: Category;
  colors: string[];
  seasons: Season[];
  occasions: Occasion[];
  gender: Gender;
  source: "cloud" | "local";
}

const COLOR_MAP: { [key: string]: string } = {
  black: "Obsidian",
  white: "Alabaster",
  gray: "Charcoal",
  grey: "Charcoal",
  brown: "Espresso",
  beige: "Oatmeal",
  tan: "Camel",
  blue: "Midnight Blue",
  navy: "Midnight Blue",
  red: "Burgundy",
  green: "Olive",
  gold: "Gold",
  silver: "Silver",
};

function cleanJsonString(str: string): string {
  let cleaned = str.trim();

  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");

  const isArray = firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace);
  const startChar = isArray ? "[" : "{";
  const endChar = isArray ? "]" : "}";

  const startIdx = cleaned.indexOf(startChar);
  if (startIdx === -1) return cleaned;

  let count = 0;
  let endIdx = -1;
  let inString = false;
  let escape = false;

  for (let i = startIdx; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === "\\") {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === startChar) {
        count++;
      } else if (char === endChar) {
        count--;
        if (count === 0) {
          endIdx = i;
          break;
        }
      }
    }
  }

  if (endIdx !== -1) {
    return cleaned.substring(startIdx, endIdx + 1);
  }

  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

/**
 * Helper to call Gemini Flash API with fallback endpoints (gemini-2.5-flash -> gemini-1.5-flash)
 */
async function callGeminiFlash(
  geminiKey: string,
  parts: any[],
  responseMimeType = "application/json"
): Promise<string> {
  const models = ["gemini-2.5-flash", "gemini-1.5-flash"];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { responseMimeType },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API error (${model}): ${res.status} - ${errText}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (err: any) {
      console.warn(`[GEMINI] Model ${model} call failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini Flash models failed.");
}

export async function classifyClothingItem(imageUri: string, initialCategory?: Category): Promise<AIClassificationResult> {
  const filename = imageUri.split("/").pop() || "";
  const lowerName = filename.toLowerCase();

  console.log(`[AURA] Starting classification...`);

  // Extract base64 image data
  let base64Image = "";
  let mimeType = "image/jpeg";

  if (imageUri.startsWith("data:")) {
    const matches = imageUri.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
    if (matches) {
      mimeType = matches[1];
      base64Image = matches[2];
    }
  }

  if (!base64Image) {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 800 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      base64Image = manipResult.base64 || "";
    } catch (e) {
      console.warn("[AURA] ImageManipulator failed for URI", e);
    }
  }

  // 1. Try Gemini Vision API first
  const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim();
  if (geminiKey && base64Image) {
    try {
      console.log(`[AURA] Sending request to Gemini Vision API...`);
      const systemPrompt = `You are an expert fashion classification AI built for a virtual wardrobe application. Your task is to analyze an uploaded image of a clothing item or accessory and return highly accurate, structured metadata about it.

Analyze the provided image and extract the following information:
1. Category: Broad classification (Top, Bottom, Outerwear, Footwear, Accessory, Full Body).
2. Sub-Category: Specific item type (e.g., T-Shirt, Jeans, Sneaker, Watch, Dress, Sunglasses).
3. Gender: The target demographic for the item (Men, Women, Unisex, Kids). Default to Unisex if it cannot be definitively determined.
4. Primary Color: The dominant color of the item (Use standard color names like Navy Blue, Crimson, Charcoal, etc.).
5. Hex Code: An approximate 6-character hex code for the primary color.
6. Secondary Colors: A list of any other notable colors in the pattern or detailing (keep empty if solid).

OUTPUT FORMAT:
You must respond ONLY with a raw, valid JSON object. Do not include markdown formatting, conversational text, or explanations. Use the exact keys shown below:
{
  "category": "",
  "sub_category": "",
  "gender": "",
  "primary_color": "",
  "primary_color_hex": "",
  "secondary_colors": [],
  "confidence_score": 0.00,
  "short_description": ""
}`;

      const content = await callGeminiFlash(geminiKey, [
        { text: systemPrompt },
        {
          inlineData: {
            mimeType,
            data: base64Image,
          },
        },
      ]);

      if (content) {
        const cleanedContent = cleanJsonString(content);
        console.log("Vision AI strict JSON response:", cleanedContent);
        const jsonResponse = JSON.parse(cleanedContent);

        const categoryMap: { [key: string]: Category } = {
          "Top": "Tops",
          "Bottom": "Bottoms",
          "Outerwear": "Outerwear",
          "Footwear": "Shoes",
          "Accessory": "Accessories",
          "Full Body": "Tops"
        };
        const genderMap: { [key: string]: Gender } = {
          "Men": "men",
          "Women": "women",
          "Unisex": "unisex",
          "Kids": "unisex"
        };

        const apiCategory = categoryMap[jsonResponse.category] || initialCategory || "Tops";
        const apiGender = genderMap[jsonResponse.gender] || "unisex";
        
        let primaryColor = jsonResponse.primary_color || "White";
        let colorsList = [primaryColor];
        
        let matchedColor = primaryColor;
        const lowerColor = matchedColor.toLowerCase();
        for (const [key, premiumColor] of Object.entries(COLOR_MAP)) {
          if (lowerColor.includes(key)) {
            matchedColor = premiumColor;
            if (key === "black") colorsList = ["Black"];
            else if (key === "white") colorsList = ["White"];
            else if (key === "gray" || key === "grey") colorsList = ["Gray"];
            else if (key === "brown") colorsList = ["Brown"];
            else if (key === "blue" || key === "navy") colorsList = ["Blue"];
            else if (key === "red") colorsList = ["Red"];
            else if (key === "green") colorsList = ["Green"];
            else if (key === "gold") colorsList = ["Yellow"];
            else if (key === "silver") colorsList = ["Gray"];
            break;
          }
        }

        const name = `${matchedColor} ${jsonResponse.sub_category || "Item"}`;

        let seasons: Season[] = ["Spring", "Summer"];
        let occasions: Occasion[] = ["Casual"];

        if (apiCategory === "Outerwear" || name.includes("Sweater") || name.includes("Boots")) {
          seasons = ["Fall", "Winter"];
          occasions = ["Work", "Formal"];
        } else if (name.includes("Watch") || name.includes("Trousers") || name.includes("Loafers")) {
          seasons = ["Spring", "Summer", "Fall", "Winter"];
          occasions = ["Work", "Formal"];
        }

        return {
          name,
          category: apiCategory,
          colors: colorsList,
          seasons,
          occasions,
          gender: apiGender,
          source: "cloud",
        };
      }
    } catch (apiError: any) {
      console.warn("Vision AI connection failed or timed out. Trying secondary model:", apiError.message);
    }
  }

  // 2. Secondary Backup: BLIP captioning model via standard fetch (works on Web & Native)
  try {
    const blipHeaders: { [key: string]: string } = {
      "Content-Type": "image/jpeg",
    };
    if (process.env.EXPO_PUBLIC_HF_TOKEN) {
      blipHeaders["Authorization"] = `Bearer ${process.env.EXPO_PUBLIC_HF_TOKEN}`;
    }

    let bodyData: ArrayBuffer | null = null;
    if (base64Image) {
      const binary = atob(base64Image);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      bodyData = bytes.buffer;
    } else {
      const res = await fetch(imageUri);
      bodyData = await res.arrayBuffer();
    }

    const uploadPromise = fetch(
      "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
      {
        method: "POST",
        headers: blipHeaders,
        body: bodyData,
      }
    ).then(async (res) => {
      const bodyText = await res.text();
      return { status: res.status, body: bodyText };
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 10000)
    );

    const uploadResult = await Promise.race([uploadPromise, timeoutPromise]);

    if (uploadResult.status === 200 && uploadResult.body) {
      const predictions = JSON.parse(uploadResult.body);
      if (Array.isArray(predictions) && predictions.length > 0) {
        const caption = (
          predictions[0].generated_text ||
          predictions[0].label ||
          ""
        ).toLowerCase();
        console.log("AURA secondary BLIP generated caption:", caption);

        let detectedCategory: Category | null = null;
        let itemNoun = "";

        if (
          caption.includes("watch") || 
          caption.includes("clock") || 
          caption.includes("timepiece") || 
          caption.includes("wrist")
        ) {
          detectedCategory = "Accessories";
          itemNoun = "Chronograph Watch";
        } else if (
          caption.includes("sunglass") || 
          caption.includes("spectacles") || 
          caption.includes("glasses") ||
          caption.includes("goggles")
        ) {
          detectedCategory = "Accessories";
          itemNoun = "Editorial Sunglasses";
        } else if (
          caption.includes("bag") || 
          caption.includes("purse") || 
          caption.includes("wallet") || 
          caption.includes("backpack") ||
          caption.includes("handbag") ||
          caption.includes("tote")
        ) {
          detectedCategory = "Accessories";
          itemNoun = "Leather Bag";
        } else if (
          caption.includes("t-shirt") || 
          caption.includes("tee") || 
          caption.includes("tshirt") || 
          caption.includes("polo") ||
          caption.includes("jersey")
        ) {
          detectedCategory = "Tops";
          itemNoun = "Cotton Tee";
        } else if (
          caption.includes("shirt") || 
          caption.includes("blouse") ||
          caption.includes("top") ||
          caption.includes("sweater") || 
          caption.includes("cardigan") ||
          caption.includes("pullover") ||
          caption.includes("knitwear")
        ) {
          detectedCategory = "Tops";
          itemNoun = caption.includes("sweater") || caption.includes("knit") ? "Knit Sweater" : "Structured Shirt";
        } else if (
          caption.includes("jeans") ||
          caption.includes("denim")
        ) {
          detectedCategory = "Bottoms";
          itemNoun = "Denim Jeans";
        } else if (
          caption.includes("pants") || 
          caption.includes("trousers") || 
          caption.includes("slacks") ||
          caption.includes("chinos") ||
          caption.includes("shorts") ||
          caption.includes("skirt")
        ) {
          detectedCategory = "Bottoms";
          itemNoun = caption.includes("shorts") ? "Tailored Shorts" : caption.includes("skirt") ? "Elegant Skirt" : "Classic Trousers";
        } else if (
          caption.includes("coat") || 
          caption.includes("trench") || 
          caption.includes("overcoat") ||
          caption.includes("jacket") || 
          caption.includes("blazer") || 
          caption.includes("suit") ||
          caption.includes("outerwear")
        ) {
          detectedCategory = "Outerwear";
          itemNoun = caption.includes("jacket") ? "Structured Jacket" : caption.includes("blazer") ? "Fitted Blazer" : "Classic Trenchcoat";
        } else if (
          caption.includes("sneaker") || 
          caption.includes("running shoe") ||
          caption.includes("shoes") || 
          caption.includes("boots") || 
          caption.includes("loafer") || 
          caption.includes("sandal") ||
          caption.includes("footwear")
        ) {
          detectedCategory = "Shoes";
          itemNoun = caption.includes("boots") ? "Leather Boots" : caption.includes("sneaker") ? "Essential Sneakers" : "Premium Shoes";
        }

        if (detectedCategory) {
          let matchedColor = "Alabaster";
          let colorsList = ["White"];
          let colorFound = false;

          for (const [key, premiumColor] of Object.entries(COLOR_MAP)) {
            if (caption.includes(key)) {
              matchedColor = premiumColor;
              if (key === "black") colorsList = ["Black"];
              else if (key === "white") colorsList = ["White"];
              else if (key === "gray" || key === "grey") colorsList = ["Gray"];
              else if (key === "brown") colorsList = ["Brown"];
              else if (key === "blue" || key === "navy") colorsList = ["Blue"];
              else if (key === "red") colorsList = ["Red"];
              else if (key === "green") colorsList = ["Green"];
              else if (key === "gold") colorsList = ["Yellow"];
              else if (key === "silver") colorsList = ["Gray"];
              colorFound = true;
              break;
            }
          }

          if (!colorFound) {
            for (const [key, premiumColor] of Object.entries(COLOR_MAP)) {
              if (lowerName.includes(key)) {
                matchedColor = premiumColor;
                if (key === "black") colorsList = ["Black"];
                else if (key === "white") colorsList = ["White"];
                else if (key === "gray" || key === "grey") colorsList = ["Gray"];
                else if (key === "brown") colorsList = ["Brown"];
                else if (key === "blue" || key === "navy") colorsList = ["Blue"];
                else if (key === "red") colorsList = ["Red"];
                else if (key === "green") colorsList = ["Green"];
                else if (key === "gold") colorsList = ["Yellow"];
                else if (key === "silver") colorsList = ["Gray"];
                colorFound = true;
                break;
              }
            }
          }

          if (!colorFound) {
            if (detectedCategory === "Bottoms" || detectedCategory === "Shoes") {
              matchedColor = "Obsidian";
              colorsList = ["Black"];
            } else if (detectedCategory === "Accessories") {
              matchedColor = "Obsidian";
              colorsList = ["Black"];
            }
          }

          const name = `${matchedColor} ${itemNoun}`;
          let seasons: Season[] = ["Spring", "Summer"];
          let occasions: Occasion[] = ["Casual"];

          if (detectedCategory === "Outerwear" || itemNoun.includes("Sweater") || itemNoun.includes("Boots")) {
            seasons = ["Fall", "Winter"];
            occasions = ["Work", "Formal"];
          } else if (itemNoun.includes("Watch") || itemNoun.includes("Trousers") || itemNoun.includes("Loafers")) {
            seasons = ["Spring", "Summer", "Fall", "Winter"];
            occasions = ["Work", "Formal"];
          }

          let detectedGender: Gender = "unisex";
          if (
            caption.includes("man ") || 
            caption.includes(" men") || 
            caption.includes("male") || 
            caption.includes("gentleman") || 
            caption.includes("boy") || 
            caption.includes(" guy")
          ) {
            detectedGender = "men";
          } else if (
            caption.includes("woman") || 
            caption.includes("women") || 
            caption.includes("female") || 
            caption.includes("lady") || 
            caption.includes("girl")
          ) {
            detectedGender = "women";
          }

          return {
            name,
            category: detectedCategory,
            colors: colorsList,
            seasons,
            occasions,
            gender: detectedGender,
            source: "cloud",
          };
        }
      }
    }
  } catch (blipError: any) {
    console.warn("AURA secondary BLIP model failed/timed out:", blipError.message);
  }

  // 3. Smart Local Fallback
  let category: Category = initialCategory || "Tops";
  if (
    lowerName.includes("shirt") ||
    lowerName.includes("top") ||
    lowerName.includes("tee") ||
    lowerName.includes("tshirt") ||
    lowerName.includes("blouse") ||
    lowerName.includes("sweater") ||
    lowerName.includes("hoodie") ||
    lowerName.includes("polo") ||
    lowerName.includes("cami")
  ) {
    category = "Tops";
  } else if (
    lowerName.includes("pants") ||
    lowerName.includes("jeans") ||
    lowerName.includes("trousers") ||
    lowerName.includes("skirt") ||
    lowerName.includes("shorts") ||
    lowerName.includes("chinos") ||
    lowerName.includes("slacks") ||
    lowerName.includes("leggings")
  ) {
    category = "Bottoms";
  } else if (
    lowerName.includes("coat") ||
    lowerName.includes("jacket") ||
    lowerName.includes("blazer") ||
    lowerName.includes("cardigan") ||
    lowerName.includes("trench") ||
    lowerName.includes("outerwear")
  ) {
    category = "Outerwear";
  } else if (
    lowerName.includes("shoe") ||
    lowerName.includes("boot") ||
    lowerName.includes("sneaker") ||
    lowerName.includes("loafer") ||
    lowerName.includes("heels") ||
    lowerName.includes("sandals") ||
    lowerName.includes("flats")
  ) {
    category = "Shoes";
  } else if (
    lowerName.includes("watch") ||
    lowerName.includes("glasses") ||
    lowerName.includes("hat") ||
    lowerName.includes("belt") ||
    lowerName.includes("bag") ||
    lowerName.includes("scarf") ||
    lowerName.includes("accessory")
  ) {
    category = "Accessories";
  }

  let matchedColor = "Alabaster";
  let colorsList: string[] = ["White"];

  for (const [key, premiumColor] of Object.entries(COLOR_MAP)) {
    if (lowerName.includes(key)) {
      matchedColor = premiumColor;
      if (key === "black") colorsList = ["Black"];
      else if (key === "white") colorsList = ["White"];
      else if (key === "gray" || key === "grey") colorsList = ["Gray"];
      else if (key === "brown") colorsList = ["Brown"];
      else if (key === "blue" || key === "navy") colorsList = ["Blue"];
      else if (key === "red") colorsList = ["Red"];
      else if (key === "green") colorsList = ["Green"];
      else if (key === "gold") colorsList = ["Yellow"];
      else if (key === "silver") colorsList = ["Gray"];
      break;
    }
  }

  let name = "";
  if (category === "Tops") {
    name = `${matchedColor} Structured Shirt`;
  } else if (category === "Bottoms") {
    name = `${matchedColor} Slim Chinos`;
  } else if (category === "Outerwear") {
    name = `${matchedColor} Modern Overcoat`;
  } else if (category === "Shoes") {
    name = `${matchedColor} Classic Loafers`;
  } else {
    name = `${matchedColor} Fine Accessory`;
  }

  let seasons: Season[] = ["Spring", "Summer"];
  let occasions: Occasion[] = ["Casual"];

  if (category === "Outerwear") {
    seasons = ["Fall", "Winter"];
    occasions = ["Work", "Formal"];
  }

  return {
    name,
    category,
    colors: colorsList,
    seasons,
    occasions,
    gender: "unisex",
    source: "local",
  };
}

export interface AISuggestedOutfit {
  name: string;
  itemIds: string[];
  reasoning: string;
}

export async function generateAIOutfits(items: ClothingItem[]): Promise<AISuggestedOutfit[]> {
  const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim();
  if (!geminiKey) {
    throw new Error("Gemini API key is not configured. Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.");
  }

  const systemPrompt = `You are a professional fashion stylist AI. Your task is to recommend up to 3 unique, stylish outfit combinations based on the user's virtual wardrobe.

Instructions:
1. Recommend UP TO 3 outfits. If the user has very few items in their wardrobe, only recommend as many unique outfits as can be logically constructed.
2. Each outfit MUST consist of:
   - Exactly 1 Top and 1 Bottom (required)
   - Optionally 1 Shoes item and/or 1 Accessories item and/or 1 Outerwear item (if available in the list).
3. CRITICAL: Items labeled with "newly_added": true are recently added to the user's wardrobe. You MUST prioritize creating outfits that include these newly added items.
4. CRITICAL: Only use the exact IDs of the items provided in the list. Do not invent new item IDs under any circumstances.
5. For each outfit, provide:
   - "name": A stylish name for the outfit.
   - "itemIds": An array of strings containing the exact item IDs used in this outfit.
   - "reasoning": A detailed explanation of why this outfit works, focusing on color coordination, style synergy, and suitability.

OUTPUT FORMAT:
Return ONLY a raw, valid JSON array containing the objects with the following schema:
[
  {
    "name": "Outfit Name",
    "itemIds": ["id1", "id2"],
    "reasoning": "Stylist explanation."
  }
]`;

  const sortedItems = [...items].sort((a, b) => {
    const timeA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
    const timeB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
    return timeB - timeA;
  });

  const itemsContext = sortedItems.map((i, index) => ({
    id: i.id,
    name: i.name || "Unnamed Item",
    category: i.category,
    colors: i.colors,
    gender: i.gender,
    newly_added: index < 3 && items.length > 3
  }));

  try {
    const text = await callGeminiFlash(geminiKey, [
      { text: systemPrompt },
      { text: `Here is the list of available clothing items:\n${JSON.stringify(itemsContext, null, 2)}` }
    ]);

    const cleanedContent = cleanJsonString(text);
    const parsed = JSON.parse(cleanedContent);

    if (Array.isArray(parsed)) {
      return parsed as AISuggestedOutfit[];
    } else if (parsed && typeof parsed === "object") {
      if (Array.isArray((parsed as any).outfits)) {
        return (parsed as any).outfits as AISuggestedOutfit[];
      }
      if (Array.isArray((parsed as any).suggestions)) {
        return (parsed as any).suggestions as AISuggestedOutfit[];
      }
    }
    return [];
  } catch (err: any) {
    console.error("AI Stylist error:", err);
    throw err;
  }
}

export async function removeBackground(uri: string): Promise<string | null> {
  const removeBgKey = process.env.EXPO_PUBLIC_REMOVE_BG_API_KEY?.trim();
  if (!removeBgKey) {
    console.log("[BACKGROUND REMOVAL] No EXPO_PUBLIC_REMOVE_BG_API_KEY found, skipping background removal.");
    return null;
  }

  console.log("[BACKGROUND REMOVAL] Starting background removal using Remove.bg for URI");
  try {
    let base64Image = "";
    if (uri.startsWith("data:")) {
      base64Image = uri.split(",")[1];
    } else {
      try {
        base64Image = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (e) {
        const response = await fetch(uri);
        const blob = await response.blob();
        base64Image = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const res = reader.result as string;
            resolve(res.split(",")[1] || "");
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    }

    if (!base64Image) {
      console.warn("[BACKGROUND REMOVAL] Could not obtain base64 image data.");
      return null;
    }

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": removeBgKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_file_b64: base64Image,
        size: "preview",
        type: "product"
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn("[BACKGROUND REMOVAL] API error:", response.status, errText);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const outputBase64 = base64ArrayBuffer(arrayBuffer);
    const transparentUri = `data:image/png;base64,${outputBase64}`;

    console.log("[BACKGROUND REMOVAL] Background removed successfully!");
    return transparentUri;
  } catch (error) {
    console.error("[BACKGROUND REMOVAL] Failed:", error);
    return null;
  }
}

function base64ArrayBuffer(arrayBuffer: ArrayBuffer): string {
  let base64 = '';
  const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const bytes = new Uint8Array(arrayBuffer);
  const byteLength = bytes.byteLength;
  const byteRemainder = byteLength % 3;
  const mainLength = byteLength - byteRemainder;

  let a, b, c, d;
  let chunk;

  for (let i = 0; i < mainLength; i += 3) {
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    a = (chunk & 16515072) >> 18;
    b = (chunk & 258048) >> 12;
    c = (chunk & 4032) >> 6;
    d = chunk & 63;
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }

  if (byteRemainder === 1) {
    chunk = bytes[mainLength];
    a = (chunk & 252) >> 2;
    b = (chunk & 3) << 4;
    base64 += encodings[a] + encodings[b] + '==';
  } else if (byteRemainder === 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
    a = (chunk & 64512) >> 10;
    b = (chunk & 1008) >> 4;
    c = (chunk & 15) << 2;
    base64 += encodings[a] + encodings[b] + encodings[c] + '=';
  }

  return base64;
}

export interface AIWeatherRecommend {
  temp: string;
  condition: string;
  tip: string;
  icon: "sun" | "cloud" | "cloud-rain" | "wind" | "thermometer";
}

export async function generateAIWeatherRecommend(items: ClothingItem[]): Promise<AIWeatherRecommend> {
  const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim();
  if (!geminiKey) {
    return {
      temp: "22°C",
      condition: "Partly Cloudy",
      tip: "Perfect weather for layering. Try pairing a light Outerwear over your favorite Top today.",
      icon: "cloud"
    };
  }

  const localTime = new Date().toLocaleString();
  const itemsContext = items.slice(0, 10).map(i => ({
    name: i.name || "Unnamed Item",
    category: i.category,
    colors: i.colors
  }));

  const systemPrompt = `You are a professional fashion stylist and weather assistant. Your task is to generate a realistic current weather forecast (temperature in Celsius and condition) suitable for the current date/time, and provide a highly personalized, stylish outfit recommendation tip using only the user's wardrobe items.

Current Date/Time: ${localTime}

Instructions:
1. Generate a realistic temperature in Celsius (e.g., "22°C" or "15°C") based on the current season/month.
2. Select a suitable weather condition (e.g., "Sunny", "Partly Cloudy", "Rainy", "Windy", "Cool").
3. Map the condition to one of these Feather icon names: "sun", "cloud", "cloud-rain", "wind", "thermometer".
4. Provide a personalized styling tip (maximum 2 sentences) that refers to actual items from the user's wardrobe.
5. Do not invent items they don't have.

OUTPUT FORMAT:
Return ONLY a raw, valid JSON object with the following schema:
{
  "temp": "22°C",
  "condition": "Partly Cloudy",
  "tip": "Dressing tip here referencing user's actual items.",
  "icon": "cloud"
}
`;

  try {
    const text = await callGeminiFlash(geminiKey, [
      { text: systemPrompt },
      { text: `Here are some items from the user's closet:\n${JSON.stringify(itemsContext, null, 2)}` }
    ]);
    const cleaned = cleanJsonString(text);
    return JSON.parse(cleaned) as AIWeatherRecommend;
  } catch (error) {
    return {
      temp: "22°C",
      condition: "Partly Cloudy",
      tip: "Perfect weather for layering. Try pairing a light Outerwear over your favorite Top today.",
      icon: "cloud"
    };
  }
}

export interface AIPackingResult {
  destination: string;
  expectedWeather: {
    temp: string;
    condition: string;
    summary: string;
  };
  packedItemIds: string[];
  essentialChecklist: {
    category: string;
    items: string[];
  }[];
  reasoning: string;
}

export async function generateTravelPackingList(
  destination: string,
  durationDays: number,
  tripType: string,
  wardrobeItems: ClothingItem[]
): Promise<AIPackingResult> {
  const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim();
  if (!geminiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const itemsPayload = wardrobeItems.map((i) => ({
    id: i.id,
    name: i.name || "Unnamed Item",
    category: i.category,
    colors: i.colors,
    seasons: i.seasons,
  }));

  const systemPrompt = `You are an expert travel assistant and personal stylist. Your task is to plan a packing checklist for a user's trip.
  
Destination: ${destination}
Duration: ${durationDays} days
Trip Style: ${tripType}

Current Date: ${new Date().toLocaleDateString()}

Based on the destination, analyze its typical weather and temperature for this time of year.
Select appropriate clothing items and accessories from the user's wardrobe that they should pack.
Also, create a list of general travel essentials (electronics, toiletries, documents) tailored to this specific destination and trip style.

Instructions:
1. Provide expected temperature (in Celsius, e.g., "18°C" or "5°C") and weather condition (e.g., "Rainy", "Sunny", "Cold").
2. Filter the user's wardrobe items to suggest exactly what to pack. Only select items that exist in the wardrobe payload. Return their IDs in the "packedItemIds" array. Select up to 8 items max.
3. Generate a checklist of essential non-clothing items grouped by category (e.g. Documents, Electronics, Toiletries).
4. Provide a 2-sentence explanation of why you chose these items.

OUTPUT FORMAT:
Return ONLY a raw, valid JSON object with the following schema:
{
  "destination": "${destination}",
  "expectedWeather": {
    "temp": "15°C",
    "condition": "Partly Cloudy",
    "summary": "Mild weather, perfect for exploring."
  },
  "packedItemIds": ["item_id_1", "item_id_2"],
  "essentialChecklist": [
    {
      "category": "Documents",
      "items": ["Passport", "Visa printout", "Travel insurance"]
    },
    {
      "category": "Electronics",
      "items": ["Phone charger", "Travel adapter (Type C)"]
    }
  ],
  "reasoning": "Reasoning explaining why this wardrobe fits the weather."
}
`;

  try {
    const text = await callGeminiFlash(geminiKey, [
      { text: systemPrompt },
      { text: `Here are the items in the user's wardrobe:\n${JSON.stringify(itemsPayload, null, 2)}` }
    ]);
    const cleaned = cleanJsonString(text);
    return JSON.parse(cleaned) as AIPackingResult;
  } catch (err: any) {
    throw new Error("Gemini API error: " + err.message);
  }
}
