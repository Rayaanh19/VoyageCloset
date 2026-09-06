import React, { createContext, useContext, useState, useEffect } from "react";
import { ClothingItem, Outfit, CabinetPreferences, CABINET_LIMITS } from "@/types/ClothingItem";
import { storage } from "@/utils/storage";
import { removeBackground } from "@/utils/aiClassifier";

interface WardrobeContextType {
  items: ClothingItem[];
  outfits: Outfit[];
  loading: boolean;
  addItem: (item: ClothingItem) => Promise<void>;
  updateItem: (item: ClothingItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addOutfit: (outfit: Outfit) => Promise<void>;
  refreshItems: () => Promise<void>;
  refreshOutfits: () => Promise<void>;
  cabinetPreferences: CabinetPreferences;
  updateCabinetPreferences: (prefs: CabinetPreferences) => Promise<void>;
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export function WardrobeProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [cabinetPreferences, setCabinetPreferences] = useState<CabinetPreferences>({
    size: "small",
    design: "classic_wood",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [loadedItems, loadedOutfits, loadedPrefs] = await Promise.all([
      storage.getClothingItems(),
      storage.getOutfits(),
      storage.getCabinetPreferences(),
    ]);
    setItems(loadedItems);
    setOutfits(loadedOutfits);
    setCabinetPreferences(loadedPrefs);
    setLoading(false);

    // Clean backgrounds of previously uploaded images in the background
    migrateOldImages(loadedItems);
  };

  const migrateOldImages = async (currentItems: ClothingItem[]) => {
    const removeBgKey = process.env.EXPO_PUBLIC_REMOVE_BG_API_KEY?.trim();
    if (!removeBgKey) return;

    // Filter items that do not have transparent PNGs as their image URIs
    const itemsToMigrate = currentItems.filter(
      (item) => item.imageUri && !item.imageUri.startsWith("data:image/png") && !item.imageUri.includes("_transparent.png")
    );

    if (itemsToMigrate.length === 0) return;

    console.log(`[MIGRATION] Found ${itemsToMigrate.length} items to remove background...`);

    // Process them sequentially to avoid rate limits
    for (const item of itemsToMigrate) {
      try {
        console.log(`[MIGRATION] Removing background for item: ${item.name || item.id}`);
        const transparentUri = await removeBackground(item.imageUri);
        if (transparentUri) {
          const updatedItem = { ...item, imageUri: transparentUri };
          await storage.updateClothingItem(updatedItem);
          setItems((prev) => prev.map((i) => (i.id === item.id ? updatedItem : i)));
        }
      } catch (err) {
        console.error(`[MIGRATION] Failed for item ${item.id}:`, err);
      }
    }
  };

  const addItem = async (item: ClothingItem) => {
    const limit = CABINET_LIMITS[cabinetPreferences.size];
    if (items.length >= limit) {
      throw new Error(`Cabinet limit reached! Your ${cabinetPreferences.size} cabinet can only hold ${limit} items.`);
    }
    await storage.addClothingItem(item);
    setItems((prev) => [...prev, item]);
  };

  const updateItem = async (item: ClothingItem) => {
    await storage.updateClothingItem(item);
    setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
  };

  const deleteItem = async (id: string) => {
    await storage.deleteClothingItem(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addOutfit = async (outfit: Outfit) => {
    await storage.addOutfit(outfit);
    setOutfits((prev) => [...prev, outfit]);
  };

  const refreshItems = async () => {
    const loadedItems = await storage.getClothingItems();
    setItems(loadedItems);
  };

  const refreshOutfits = async () => {
    const loadedOutfits = await storage.getOutfits();
    setOutfits(loadedOutfits);
  };

  const updateCabinetPreferences = async (prefs: CabinetPreferences) => {
    await storage.saveCabinetPreferences(prefs);
    setCabinetPreferences(prefs);
  };

  return (
    <WardrobeContext.Provider
      value={{
        items,
        outfits,
        loading,
        addItem,
        updateItem,
        deleteItem,
        addOutfit,
        refreshItems,
        refreshOutfits,
        cabinetPreferences,
        updateCabinetPreferences,
      }}
    >
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe() {
  const context = useContext(WardrobeContext);
  if (!context) {
    throw new Error("useWardrobe must be used within WardrobeProvider");
  }
  return context;
}
