export type Category = "Tops" | "Bottoms" | "Shoes" | "Accessories" | "Outerwear";
export type Season = "Spring" | "Summer" | "Fall" | "Winter";
export type Occasion = "Casual" | "Work" | "Formal" | "Sport";
export type Gender = "men" | "women" | "unisex";

export interface ClothingItem {
  id: string;
  imageUri: string;
  name?: string;
  category: Category;
  gender: Gender;
  seasons: Season[];
  colors: string[];
  occasions: Occasion[];
  dateAdded: string;
}

export interface Outfit {
  id: string;
  name: string;
  items: string[];
  reasoning: string;
  dateCreated: string;
}

export type CabinetSize = "small" | "medium" | "large" | "walk-in";
export type CabinetDesign = "classic_wood" | "modern_obsidian" | "futuristic_neon";

export interface CabinetPreferences {
  size: CabinetSize;
  design: CabinetDesign;
}

export const CABINET_LIMITS: Record<CabinetSize, number> = {
  small: 6,
  medium: 15,
  large: 40,
  "walk-in": 150,
};
