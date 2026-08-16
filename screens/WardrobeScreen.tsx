import React from "react";
import {
  Dimensions,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  UIManager,
  View,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CompositeNavigationProp, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";

import { FloatingActionButton } from "@/components/FloatingActionButton";
import { ThemedText } from "@/components/ThemedText";
import { ClothingCard } from "@/components/ClothingCard";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { Category, CABINET_LIMITS } from "@/types/ClothingItem";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { WardrobeStackParamList } from "@/navigation/WardrobeStackNavigator";
import { generateAIWeatherRecommend, AIWeatherRecommend } from "@/utils/aiClassifier";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<WardrobeStackParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

const { width: screenWidth } = Dimensions.get("window");

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function WardrobeScreen() {
  const { colors } = useTheme();
  const { items, cabinetPreferences } = useWardrobe();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [openDrawer, setOpenDrawer] = React.useState<number | null>(null);

  const [weather, setWeather] = React.useState<AIWeatherRecommend>({
    temp: "22°C",
    condition: "Partly Cloudy",
    tip: "Perfect weather for layering. Try pairing a light Outerwear over your favorite Top today.",
    icon: "cloud"
  });

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(15)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 650,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Fetch realistic, AI-recommended weather styling advice matching wardrobe items
  React.useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await generateAIWeatherRecommend(items);
        setWeather(data);
      } catch (err) {
        console.error("Failed to load weather recommendation:", err);
      }
    };
    if (items.length > 0) {
      fetchWeather();
    }
  }, [items.length]);

  const getCurrentSeason = (): "Spring" | "Summer" | "Fall" | "Winter" => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "Spring";
    if (month >= 5 && month <= 7) return "Summer";
    if (month >= 8 && month <= 10) return "Fall";
    return "Winter";
  };

  const currentSeason = getCurrentSeason();

  const tops = items.filter((item) => item.category === "Tops");
  const bottoms = items.filter((item) => item.category === "Bottoms");
  const outerwear = items.filter((item) => item.category === "Outerwear");
  const shoes = items.filter((item) => item.category === "Shoes");
  const accessories = items.filter((item) => item.category === "Accessories");

  const themeDesign = cabinetPreferences.design;

  const cabinetColors = {
    classic_wood: {
      background: "#EBE3D5",
      borderColor: "#8E7A65",
      drawerBg: "#D8C3A5",
      drawerLabel: "#5D4B3E",
      placeholderText: "#8E7A65",
      plusBadgeBg: "rgba(0,0,0,0.5)",
      hangerWire: "#4A4947",
      metalRod: "#B0B0B0",
      slotItemBg: "rgba(255, 255, 255, 0.45)"
    },
    modern_obsidian: {
      background: "#1F222B",
      borderColor: "#434A59",
      drawerBg: "#2D313F",
      drawerLabel: "#E2E8F0",
      placeholderText: "#7F8D9F",
      plusBadgeBg: "rgba(255,255,255,0.15)",
      hangerWire: "#A2AAB3",
      metalRod: "#7F8D9F",
      slotItemBg: "rgba(255, 255, 255, 0.08)"
    },
    futuristic_neon: {
      background: "#0B0E17",
      borderColor: "#FF007F",
      drawerBg: "#171B26",
      drawerLabel: "#00F5FF",
      placeholderText: "#00F5FF",
      plusBadgeBg: "rgba(0,245,255,0.15)",
      hangerWire: "#FF007F",
      metalRod: "#FF007F",
      slotItemBg: "rgba(0, 245, 255, 0.06)"
    }
  }[themeDesign] || {
    background: "#EBE3D5",
    borderColor: "#8E7A65",
    drawerBg: "#D8C3A5",
    drawerLabel: "#5D4B3E",
    placeholderText: "#8E7A65",
    plusBadgeBg: "rgba(0,0,0,0.5)",
    hangerWire: "#4A4947",
    metalRod: "#B0B0B0",
    slotItemBg: "rgba(255, 255, 255, 0.45)"
  };

  const handleAddItem = () => {
    navigation.navigate("AddItemModal");
  };

  const handleItemPress = (itemId: string) => {
    navigation.navigate("ItemDetail", { itemId });
  };

  const CATEGORY_SHELVES: { name: Category; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { name: "Tops", label: "TOPS RACK", icon: "align-center" },
    { name: "Bottoms", label: "BOTTOMS RAIL", icon: "columns" },
    { name: "Outerwear", label: "OUTERWEAR CABINET", icon: "wind" },
    { name: "Shoes", label: "SHOE SHELF", icon: "grid" },
    { name: "Accessories", label: "ACCESSORIES TRAY", icon: "watch" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundRoot }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.md },
        ]}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: "100%" }}>


        {/* Weather Suggestion Card */}
        <View
          style={[
            styles.weatherCard,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.weatherHeader}>
            <View style={styles.weatherInfo}>
              <Feather name={weather.icon} size={20} color={colors.secondary} />
              <ThemedText style={[styles.weatherText, { color: colors.text }]}>
                {weather.temp} • {weather.condition}
              </ThemedText>
            </View>
            <View
              style={[
                styles.weatherBadge,
                { backgroundColor: colors.primary, borderColor: colors.border },
              ]}
            >
              <ThemedText style={[styles.weatherBadgeText, { color: colors.buttonText }]}>
                TODAY'S LOOK
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.weatherTipText, { color: colors.textSecondary }]}>
            {weather.tip}
          </ThemedText>
        </View>



        {/* Closet Shelf Header */}
        <View style={styles.closetHeaderTitleContainer}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <Feather name="layers" size={16} color={colors.text} style={{ marginRight: Spacing.sm }} />
            <ThemedText style={[styles.closetTitleLabel, { color: colors.text }]}>
              CABINET WARDROBE
            </ThemedText>
            <View style={[styles.capacityBadge, { backgroundColor: items.length >= CABINET_LIMITS[cabinetPreferences.size] ? colors.error + "22" : colors.primary + "22" }]}>
              <ThemedText style={[styles.capacityBadgeText, { color: items.length >= CABINET_LIMITS[cabinetPreferences.size] ? colors.error : colors.primary }]}>
                {items.length} / {CABINET_LIMITS[cabinetPreferences.size]} Slots
              </ThemedText>
            </View>
          </View>
          <Pressable
            onPress={() => navigation.navigate("CabinetCustomizer")}
            style={({ pressed }) => [
              styles.customizeButton,
              {
                borderColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Feather name="sliders" size={12} color={colors.primary} style={{ marginRight: 4 }} />
            <ThemedText style={[styles.customizeButtonText, { color: colors.primary }]}>
              Customize
            </ThemedText>
          </Pressable>
        </View>

        {/* Visual Closet Cabinet */}
        <View
          style={[
            styles.closetCabinet,
            {
              backgroundColor: cabinetColors.background,
              borderColor: cabinetColors.borderColor,
            },
          ]}
        >
          {items.length >= CABINET_LIMITS[cabinetPreferences.size] && (
            <View style={[styles.closetBannerFull, { backgroundColor: colors.error }]}>
              <Feather name="alert-triangle" size={12} color="#FFF" style={{ marginRight: 4 }} />
              <ThemedText style={styles.closetBannerFullText}>CABINET FULL - UPGRADE FOR MORE SPACE</ThemedText>
            </View>
          )}
          
          {/* LEFT BAY: Outerwear shelf (top) & Tops rail (bottom) */}
          <View style={[styles.closetBay, { flex: 1.2, borderRightWidth: 4, borderColor: cabinetColors.borderColor }]}>
            {/* Top Outerwear Shelf */}
            <Pressable
              onPress={() => navigation.navigate("AddItemModal", { initialCategory: "Outerwear" })}
              style={[styles.closetShelf, { height: 75, borderBottomWidth: 4, borderColor: cabinetColors.borderColor }]}
            >
              {outerwear.length === 0 ? (
                <View style={styles.emptyClosetSection}>
                  <Feather name="plus" size={14} color={cabinetColors.placeholderText} />
                  <ThemedText style={[styles.closetPlaceholderText, { color: cabinetColors.placeholderText }]}>Outerwear</ThemedText>
                </View>
              ) : (
                <View style={styles.shelfItemsRow}>
                  {outerwear.slice(0, 2).map((item) => (
                    <Pressable key={item.id} onPress={() => handleItemPress(item.id)}>
                      <Image source={{ uri: item.imageUri }} style={[styles.foldedItemImage, { borderColor: cabinetColors.borderColor, backgroundColor: cabinetColors.slotItemBg }]} />
                    </Pressable>
                  ))}
                  {outerwear.length > 2 && (
                    <View style={[styles.plusBadge, { backgroundColor: cabinetColors.plusBadgeBg }]}>
                      <ThemedText style={styles.plusBadgeText}>+{outerwear.length - 2}</ThemedText>
                    </View>
                  )}
                </View>
              )}
            </Pressable>

            {/* Tops Hanging Rail */}
            <Pressable
              onPress={() => navigation.navigate("AddItemModal", { initialCategory: "Tops" })}
              style={[styles.closetHangingSection, { flex: 1 }]}
            >
              <View style={[styles.metalRod, { backgroundColor: cabinetColors.metalRod }]} />
              {tops.length === 0 ? (
                <View style={styles.emptyClosetSectionHanging}>
                  <Feather name="plus" size={18} color={cabinetColors.placeholderText} style={{ marginBottom: 4 }} />
                  <ThemedText style={[styles.closetPlaceholderTextHanging, { color: cabinetColors.placeholderText }]}>Tops Rail</ThemedText>
                </View>
              ) : (
                <View style={styles.hangingItemsContainer}>
                  {tops.slice(0, 3).map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => handleItemPress(item.id)}
                      style={styles.hangingItemWrapper}
                    >
                      <View style={[styles.hangerWire, { borderColor: cabinetColors.hangerWire }]} />
                      <Image source={{ uri: item.imageUri }} style={[styles.hangingItemImage, { borderColor: cabinetColors.borderColor, backgroundColor: cabinetColors.slotItemBg }]} />
                    </Pressable>
                  ))}
                  {tops.length > 3 && (
                    <View style={[styles.hangingPlusBadge, { backgroundColor: cabinetColors.plusBadgeBg }]}>
                      <ThemedText style={styles.hangingPlusBadgeText}>+{tops.length - 3}</ThemedText>
                    </View>
                  )}
                </View>
              )}
            </Pressable>
          </View>

          {/* MIDDLE BAY: Accessories shelf (top) & 3 Drawers (bottom) */}
          <View style={[styles.closetBay, { flex: 1.5, borderRightWidth: 4, borderColor: cabinetColors.borderColor }]}>
            {/* Accessories Shelf */}
            <Pressable
              onPress={() => navigation.navigate("AddItemModal", { initialCategory: "Accessories" })}
              style={[styles.closetShelf, { height: 110, borderBottomWidth: 4, borderColor: cabinetColors.borderColor }]}
            >
              {accessories.length === 0 ? (
                <View style={styles.emptyClosetSection}>
                  <Feather name="watch" size={18} color={cabinetColors.placeholderText} style={{ marginBottom: 4 }} />
                  <ThemedText style={[styles.closetPlaceholderText, { color: cabinetColors.placeholderText }]}>Accessories</ThemedText>
                </View>
              ) : (
                <View style={styles.shelfItemsRowGrid}>
                  {accessories.slice(0, 3).map((item) => (
                    <Pressable key={item.id} onPress={() => handleItemPress(item.id)}>
                      <Image source={{ uri: item.imageUri }} style={[styles.accessoryItemImage, { borderColor: cabinetColors.borderColor, backgroundColor: cabinetColors.slotItemBg }]} />
                    </Pressable>
                  ))}
                  {accessories.length > 3 && (
                    <View style={[styles.accessoryPlusBadge, { backgroundColor: cabinetColors.plusBadgeBg }]}>
                      <ThemedText style={styles.accessoryPlusBadgeText}>+{accessories.length - 3}</ThemedText>
                    </View>
                  )}
                </View>
              )}
            </Pressable>

            {/* Drawers */}
            <View style={styles.drawersContainer}>
              {[0, 1, 2].map((idx) => {
                const isOpen = openDrawer === idx;
                let drawerItems: any[] = [];
                let label = "";
                let fallbackCat = "";

                if (idx === 0) {
                  drawerItems = accessories;
                  label = `ACCESSORIES (${accessories.length})`;
                  fallbackCat = "Accessories";
                } else if (idx === 1) {
                  drawerItems = outerwear;
                  label = `OUTERWEAR (${outerwear.length})`;
                  fallbackCat = "Outerwear";
                } else {
                  drawerItems = shoes;
                  label = `SHOES (${shoes.length})`;
                  fallbackCat = "Shoes";
                }

                return (
                  <Pressable
                    key={idx}
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setOpenDrawer(isOpen ? null : idx);
                    }}
                    style={[
                      styles.closetDrawer,
                      {
                        height: isOpen ? 120 : 48,
                        backgroundColor: cabinetColors.drawerBg,
                        borderColor: cabinetColors.borderColor,
                      },
                    ]}
                  >
                    {isOpen ? (
                      <View style={styles.openDrawerContent}>
                        <View style={styles.drawerHeaderRow}>
                          <ThemedText style={[styles.openDrawerLabel, { color: cabinetColors.drawerLabel }]}>{label}</ThemedText>
                          <Pressable onPress={() => navigation.navigate("AddItemModal", { initialCategory: fallbackCat as any })}>
                            <Feather name="plus" size={12} color={cabinetColors.drawerLabel} />
                          </Pressable>
                        </View>
                        {drawerItems.length === 0 ? (
                          <ThemedText style={[styles.drawerEmptyText, { color: cabinetColors.placeholderText }]}>Empty Drawer</ThemedText>
                        ) : (
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.drawerItemsScroll}>
                            {drawerItems.map((item) => (
                              <Pressable key={item.id} onPress={() => handleItemPress(item.id)}>
                                <Image source={{ uri: item.imageUri }} style={[styles.drawerItemImage, { borderColor: cabinetColors.borderColor, backgroundColor: cabinetColors.slotItemBg }]} />
                              </Pressable>
                            ))}
                          </ScrollView>
                        )}
                        <View style={[styles.drawerPull, { bottom: 4, top: undefined, backgroundColor: cabinetColors.borderColor }]} />
                      </View>
                    ) : (
                      <>
                        <View style={[styles.drawerPull, { backgroundColor: cabinetColors.borderColor }]} />
                        <ThemedText style={[styles.drawerLabel, { color: cabinetColors.drawerLabel }]}>{label}</ThemedText>
                      </>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* RIGHT BAY: Bottoms rail (left column) & Shoes shelves (right column) */}
          <View style={[styles.closetBay, { flex: 1.3, flexDirection: "row" }]}>
            {/* Left Column: Folded Bottoms Shelf */}
            <Pressable
              onPress={() => navigation.navigate("AddItemModal", { initialCategory: "Bottoms" })}
              style={[styles.closetHangingSection, { flex: 1, borderRightWidth: 3, borderColor: cabinetColors.borderColor, justifyContent: "center" }]}
            >
              {bottoms.length === 0 ? (
                <View style={styles.emptyClosetSection}>
                  <Feather name="plus" size={14} color={cabinetColors.placeholderText} />
                  <ThemedText style={[styles.closetPlaceholderText, { color: cabinetColors.placeholderText }]}>Bottoms</ThemedText>
                </View>
              ) : (
                <View style={styles.foldedPantsStack}>
                  {bottoms.slice(0, 3).map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => handleItemPress(item.id)}
                      style={styles.foldedPantWrapper}
                    >
                      <Image source={{ uri: item.imageUri }} style={[styles.foldedPantImage, { borderColor: cabinetColors.borderColor, backgroundColor: cabinetColors.slotItemBg }]} />
                    </Pressable>
                  ))}
                  {bottoms.length > 3 && (
                    <View style={[styles.hangingPlusBadge, { backgroundColor: cabinetColors.plusBadgeBg, marginTop: 4 }]}>
                      <ThemedText style={styles.hangingPlusBadgeText}>+{bottoms.length - 3}</ThemedText>
                    </View>
                  )}
                </View>
              )}
            </Pressable>

            {/* Right Column: Shoes Stacked Shelves */}
            <View style={{ flex: 1 }}>
              {[0, 1, 2, 3].map((shelfIdx) => {
                const shoeItem = shoes[shelfIdx];
                return (
                  <Pressable
                    key={shelfIdx}
                    onPress={() =>
                      shoeItem
                        ? handleItemPress(shoeItem.id)
                        : navigation.navigate("AddItemModal", { initialCategory: "Shoes" })
                    }
                    style={[
                      styles.shoeShelfCell,
                      {
                        borderBottomWidth: shelfIdx === 3 ? 0 : 3,
                        borderColor: cabinetColors.borderColor,
                      },
                    ]}
                  >
                    {shoeItem ? (
                      <Image source={{ uri: shoeItem.imageUri }} style={[styles.shoeItemImage, { borderColor: cabinetColors.borderColor, backgroundColor: cabinetColors.slotItemBg }]} />
                    ) : (
                      <Feather name="plus" size={12} color={cabinetColors.placeholderText} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Virtual Shelves */}
        <View style={styles.closetContainer}>
          {CATEGORY_SHELVES.map((shelf) => {
            const shelfItems = items.filter((item) => item.category === shelf.name);

            return (
              <View key={shelf.name} style={styles.shelfSection}>
                <View style={styles.shelfHeader}>
                  <View style={styles.shelfTitleContainer}>
                    <Feather name={shelf.icon} size={16} color={colors.textSecondary} style={styles.shelfIcon} />
                    <ThemedText style={[styles.shelfTitle, { color: colors.text }]}>
                      {shelf.label}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.shelfCount, { color: colors.textSecondary }]}>
                    {shelfItems.length} {shelfItems.length === 1 ? "item" : "items"}
                  </ThemedText>
                </View>

                {/* Horizontal Closet Rack */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.shelfScrollViewContent}
                >
                  {shelfItems.map((item) => (
                    <View key={item.id} style={styles.closetItemWrapper}>
                      <ClothingCard
                        item={item}
                        onPress={() => handleItemPress(item.id)}
                      />
                    </View>
                  ))}

                  {/* Pre-configured Add card at the end of the rack, or as a placeholder */}
                  <Pressable
                    onPress={() =>
                      navigation.navigate("AddItemModal", {
                        initialCategory: shelf.name,
                      })
                    }
                    style={[
                      styles.addPlaceholderCard,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.backgroundSecondary,
                        width: shelfItems.length === 0 ? screenWidth - Spacing.lg * 2 : 120,
                        height: shelfItems.length === 0 ? 100 : 160,
                      },
                    ]}
                  >
                    <View style={styles.addPlaceholderContent}>
                      <Feather name="plus" size={24} color={colors.secondary} />
                      <ThemedText style={[styles.addPlaceholderText, { color: colors.textSecondary }]}>
                        {shelfItems.length === 0 ? `Add Your First ${shelf.name}` : "Add New"}
                      </ThemedText>
                    </View>
                  </Pressable>
                </ScrollView>
              </View>
            );
          })}
        </View>
        </Animated.View>
      </ScrollView>
      <FloatingActionButton onPress={handleAddItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing["5xl"],
  },
  headerBlock: {
    marginBottom: Spacing.md,
  },
  dateText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: Spacing.xs,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  weatherCard: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  weatherHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  weatherInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  weatherText: {
    fontSize: 14,
    fontWeight: "600",
  },
  weatherBadge: {
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.xs,
  },
  weatherBadgeText: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
  },
  weatherTipText: {
    fontSize: 13,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statNum: {
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  closetContainer: {
    gap: Spacing.xl,
  },
  shelfSection: {
    marginBottom: Spacing.sm,
  },
  shelfHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
    paddingHorizontal: 2,
  },
  shelfTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  shelfIcon: {
    marginRight: Spacing.sm,
  },
  shelfTitle: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  shelfCount: {
    fontSize: 12,
  },
  shelfScrollViewContent: {
    gap: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  closetItemWrapper: {
    width: 120,
  },
  addPlaceholderCard: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  addPlaceholderContent: {
    alignItems: "center",
    gap: Spacing.xs,
    padding: Spacing.md,
  },
  addPlaceholderText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  closetCabinet: {
    height: 380,
    borderWidth: 6,
    borderRadius: BorderRadius.sm,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: Spacing.xl,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  closetBay: {
    height: "100%",
  },
  closetShelf: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xs,
  },
  closetHangingSection: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: Spacing.xs,
  },
  metalRod: {
    position: "absolute",
    top: 8,
    left: 4,
    right: 4,
    height: 3,
    backgroundColor: "#C0C0C0",
    borderRadius: 2,
    zIndex: 1,
  },
  emptyClosetSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  emptyClosetSectionHanging: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginTop: 20,
  },
  closetPlaceholderText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  closetPlaceholderTextHanging: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  shelfItemsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    width: "100%",
    height: "100%",
  },
  foldedItemImage: {
    width: 32,
    height: 48,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: "#8E7A65",
  },
  plusBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  plusBadgeText: {
    fontSize: 8,
    color: "#FFF",
    fontWeight: "700",
  },
  hangingItemsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: Spacing.xs,
    marginTop: 14,
    width: "100%",
    flexWrap: "wrap",
    paddingHorizontal: 2,
  },
  hangingItemsContainerVertical: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    marginTop: 14,
    width: "100%",
  },
  hangingItemWrapper: {
    alignItems: "center",
  },
  hangerWire: {
    width: 14,
    height: 8,
    borderWidth: 1.2,
    borderColor: "#4A4947",
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderBottomWidth: 0,
    marginBottom: -1,
  },
  hangingItemImage: {
    width: 30,
    height: 45,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: "#8E7A65",
  },
  hangingItemImageBottoms: {
    width: 26,
    height: 50,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: "#8E7A65",
  },
  hangingPlusBadge: {
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 4,
    marginTop: 2,
  },
  hangingPlusBadgeText: {
    fontSize: 8,
    color: "#FFF",
    fontWeight: "700",
  },
  shelfItemsRowGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.xs,
    width: "100%",
    height: "100%",
    padding: 2,
  },
  accessoryItemImage: {
    width: 26,
    height: 26,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: "#8E7A65",
  },
  accessoryPlusBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  accessoryPlusBadgeText: {
    fontSize: 8,
    color: "#FFF",
    fontWeight: "700",
  },
  drawersContainer: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: Spacing.xs,
  },
  closetDrawer: {
    height: 48,
    marginHorizontal: 6,
    marginVertical: 3,
    backgroundColor: "#D8C3A5",
    borderWidth: 2,
    borderColor: "#8E7A65",
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  drawerPull: {
    width: 32,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#8E7A65",
    position: "absolute",
    top: 6,
    alignSelf: "center",
  },
  drawerLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: "#8E7A65",
    marginTop: 18,
  },
  shoeShelfCell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
  },
  shoeItemImage: {
    width: 30,
    height: 30,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: "#8E7A65",
  },
  closetHeaderTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  closetTitleLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  openDrawerContent: {
    width: "100%",
    height: "100%",
    padding: Spacing.xs,
    justifyContent: "space-between",
  },
  drawerHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xs,
  },
  openDrawerLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: "#8E7A65",
  },
  drawerEmptyText: {
    fontSize: 9,
    color: "#8E7A65",
    textAlign: "center",
    fontStyle: "italic",
    marginVertical: Spacing.xs,
  },
  drawerItemsScroll: {
    flexDirection: "row",
    gap: Spacing.xs,
    paddingVertical: 2,
    alignItems: "center",
  },
  drawerItemImage: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: "#8E7A65",
  },
  capacityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    marginLeft: Spacing.sm,
  },
  capacityBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  customizeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  customizeButtonText: {
    fontSize: 10,
    fontWeight: "700",
  },
  closetBannerFull: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  closetBannerFullText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  foldedPantsStack: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    width: "100%",
    marginTop: 6,
  },
  foldedPantWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  foldedPantImage: {
    width: 38,
    height: 24,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
});
