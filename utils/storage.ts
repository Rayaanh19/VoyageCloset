import AsyncStorage from "@react-native-async-storage/async-storage";
import { ClothingItem, Outfit, CabinetPreferences } from "@/types/ClothingItem";

const CLOTHING_ITEMS_KEY = "@wardrobe_items";
const OUTFITS_KEY = "@wardrobe_outfits";

export const storage = {
  async getClothingItems(): Promise<ClothingItem[]> {
    try {
      const data = await AsyncStorage.getItem(CLOTHING_ITEMS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading clothing items:", error);
      return [];
    }
  },

  async saveClothingItems(items: ClothingItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CLOTHING_ITEMS_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving clothing items:", error);
    }
  },

  async addClothingItem(item: ClothingItem): Promise<void> {
    const items = await this.getClothingItems();
    items.push(item);
    await this.saveClothingItems(items);
  },

  async updateClothingItem(updatedItem: ClothingItem): Promise<void> {
    const items = await this.getClothingItems();
    const index = items.findIndex((item) => item.id === updatedItem.id);
    if (index !== -1) {
      items[index] = updatedItem;
      await this.saveClothingItems(items);
    }
  },

  async deleteClothingItem(id: string): Promise<void> {
    const items = await this.getClothingItems();
    const filteredItems = items.filter((item) => item.id !== id);
    await this.saveClothingItems(filteredItems);
  },

  async getOutfits(): Promise<Outfit[]> {
    try {
      const data = await AsyncStorage.getItem(OUTFITS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading outfits:", error);
      return [];
    }
  },

  async saveOutfits(outfits: Outfit[]): Promise<void> {
    try {
      await AsyncStorage.setItem(OUTFITS_KEY, JSON.stringify(outfits));
    } catch (error) {
      console.error("Error saving outfits:", error);
    }
  },

  async addOutfit(outfit: Outfit): Promise<void> {
    const outfits = await this.getOutfits();
    outfits.push(outfit);
    await this.saveOutfits(outfits);
  },

  async getCabinetPreferences(): Promise<CabinetPreferences> {
    try {
      const data = await AsyncStorage.getItem("@cabinet_preferences");
      return data ? JSON.parse(data) : { size: "small", design: "classic_wood" };
    } catch (error) {
      console.error("Error loading cabinet preferences:", error);
      return { size: "small", design: "classic_wood" };
    }
  },

  async saveCabinetPreferences(prefs: CabinetPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem("@cabinet_preferences", JSON.stringify(prefs));
    } catch (error) {
      console.error("Error saving cabinet preferences:", error);
    }
  },
};
