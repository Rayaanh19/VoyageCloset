import React, { useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { EmptyState } from "@/components/EmptyState";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { useTheme } from "@/hooks/useTheme";
import { generateTravelPackingList, AIPackingResult } from "@/utils/aiClassifier";
import { ClothingItem } from "@/types/ClothingItem";

const POPULAR_DESTINATIONS = [
  "Oman (Muscat)",
  "Oman (Salalah)",
  "Oman (Nizwa)",
  "Oman (Sohar)",
  "Oman (Sur)",
  "United Arab Emirates (Dubai)",
  "United Arab Emirates (Abu Dhabi)",
  "United Arab Emirates (Sharjah)",
  "Saudi Arabia (Riyadh)",
  "Saudi Arabia (Jeddah)",
  "Saudi Arabia (Mecca)",
  "Qatar (Doha)",
  "Kuwait (Kuwait City)",
  "Bahrain (Manama)",
  "India (New Delhi)",
  "India (Mumbai)",
  "India (Bangalore)",
  "India (Kolkata)",
  "India (Chennai)",
  "India (Hyderabad)",
  "India (Goa)",
  "Japan (Tokyo)",
  "Japan (Osaka)",
  "Japan (Kyoto)",
  "Japan (Yokohama)",
  "United States (New York)",
  "United States (Los Angeles)",
  "United States (Chicago)",
  "United States (San Francisco)",
  "United States (Miami)",
  "United States (Washington D.C.)",
  "United Kingdom (London)",
  "United Kingdom (Manchester)",
  "United Kingdom (Edinburgh)",
  "France (Paris)",
  "France (Nice)",
  "France (Marseille)",
  "Italy (Rome)",
  "Italy (Milan)",
  "Italy (Venice)",
  "Spain (Madrid)",
  "Spain (Barcelona)",
  "Germany (Berlin)",
  "Germany (Munich)",
  "Germany (Frankfurt)",
  "Greece (Athens)",
  "Netherlands (Amsterdam)",
  "Netherlands (Rotterdam)",
  "Switzerland (Zurich)",
  "Switzerland (Geneva)",
  "Switzerland (Bern)",
  "Austria (Vienna)",
  "Belgium (Brussels)",
  "Portugal (Lisbon)",
  "Portugal (Porto)",
  "Sweden (Stockholm)",
  "Norway (Oslo)",
  "Denmark (Copenhagen)",
  "Finland (Helsinki)",
  "Ireland (Dublin)",
  "Iceland (Reykjavik)",
  "Canada (Toronto)",
  "Canada (Vancouver)",
  "Canada (Montreal)",
  "Canada (Ottawa)",
  "Mexico (Mexico City)",
  "Brazil (Brasilia)",
  "Brazil (Rio de Janeiro)",
  "Brazil (Sao Paulo)",
  "Argentina (Buenos Aires)",
  "Colombia (Bogota)",
  "Peru (Lima)",
  "Chile (Santiago)",
  "Australia (Sydney)",
  "Australia (Melbourne)",
  "Australia (Brisbane)",
  "Australia (Canberra)",
  "New Zealand (Wellington)",
  "New Zealand (Auckland)",
  "Egypt (Cairo)",
  "South Africa (Cape Town)",
  "South Africa (Johannesburg)",
  "South Africa (Pretoria)",
  "Kenya (Nairobi)",
  "Morocco (Marrakech)",
  "Morocco (Casablanca)",
  "Morocco (Rabat)",
  "Nigeria (Lagos)",
  "Nigeria (Abuja)"
];

interface EssentialVisual {
  name: string;
  emoji: string;
  imageUri: any;
  color: string;
  bgColor: string;
}

const getEssentialVisual = (name: string): EssentialVisual => {
  const lowercase = name.toLowerCase();
  
  if (lowercase.includes("passport")) {
    return {
      name,
      emoji: "🛂",
      imageUri: require("@/assets/images/indian_passport.jpg"), // require local asset
      color: "#FFD700",
      bgColor: "rgba(255, 215, 0, 0.15)"
    };
  }
  if (lowercase.includes("visa") || lowercase.includes("e-visa")) {
    return {
      name,
      emoji: "📄",
      imageUri: require("@/assets/images/travel_document.jpg"), // local asset
      color: "#3B82F6",
      bgColor: "rgba(59, 130, 246, 0.15)"
    };
  }
  if (lowercase.includes("insurance")) {
    return {
      name,
      emoji: "📄",
      imageUri: require("@/assets/images/insurance.jpg"), // local asset
      color: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.15)"
    };
  }
  if (lowercase.includes("phone") || lowercase.includes("smartphone")) {
    return {
      name,
      emoji: "📱",
      imageUri: require("@/assets/images/smartphone.jpg"), // local asset
      color: "#A855F7",
      bgColor: "rgba(168, 85, 247, 0.15)"
    };
  }
  if (lowercase.includes("laptop")) {
    return {
      name,
      emoji: "💻",
      imageUri: require("@/assets/images/laptop.jpg"), // local asset
      color: "#A855F7",
      bgColor: "rgba(168, 85, 247, 0.15)"
    };
  }
  if (lowercase.includes("powerbank") || lowercase.includes("power bank") || lowercase.includes("battery pack")) {
    return {
      name,
      emoji: "🔋",
      imageUri: require("@/assets/images/powerbank.jpg"), // local asset
      color: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.15)"
    };
  }
  if (lowercase.includes("charger") || lowercase.includes("adapter") || lowercase.includes("plug")) {
    return {
      name,
      emoji: "🔌",
      imageUri: require("@/assets/images/charger.jpg"), // local asset
      color: "#FF8C00",
      bgColor: "rgba(255, 140, 0, 0.15)"
    };
  }
  if (lowercase.includes("cable") || lowercase.includes("cord") || lowercase.includes("wire")) {
    return {
      name,
      emoji: "➰",
      imageUri: require("@/assets/images/cable.jpg"), // local asset
      color: "#94A3B8",
      bgColor: "rgba(148, 163, 184, 0.15)"
    };
  }
  if (lowercase.includes("sunglasses") || lowercase.includes("glass") || lowercase.includes("shades")) {
    return {
      name,
      emoji: "🕶️",
      imageUri: require("@/assets/images/sunglasses.jpg"), // local asset
      color: "#FF8C00",
      bgColor: "rgba(255, 140, 0, 0.15)"
    };
  }
  if (lowercase.includes("toothbrush")) {
    return {
      name,
      emoji: "🪥",
      imageUri: require("@/assets/images/toothbrush.jpg"), // local asset
      color: "#3B82F6",
      bgColor: "rgba(59, 130, 246, 0.15)"
    };
  }
  if (lowercase.includes("toothpaste")) {
    return {
      name,
      emoji: "🧴",
      imageUri: require("@/assets/images/toothpaste.jpg"), // local asset
      color: "#00F5FF",
      bgColor: "rgba(0, 245, 255, 0.15)"
    };
  }
  if (lowercase.includes("lipbalm") || lowercase.includes("lip balm") || lowercase.includes("chapstick")) {
    return {
      name,
      emoji: "💄",
      imageUri: require("@/assets/images/lipbalm.jpg"), // local asset
      color: "#EF4444",
      bgColor: "rgba(239, 68, 68, 0.15)"
    };
  }
  if (lowercase.includes("sunscreen") || lowercase.includes("sun block") || lowercase.includes("sunblock")) {
    return {
      name,
      emoji: "🧴",
      imageUri: require("@/assets/images/sunscreen.jpg"), // local asset
      color: "#F59E0B",
      bgColor: "rgba(245, 158, 11, 0.15)"
    };
  }
  if (lowercase.includes("moisturizer") || lowercase.includes("lotion") || lowercase.includes("cream")) {
    return {
      name,
      emoji: "🧴",
      imageUri: require("@/assets/images/moisturizer.jpg"), // local asset
      color: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.15)"
    };
  }
  if (lowercase.includes("toothbrush") || lowercase.includes("paste") || lowercase.includes("toiletries") || lowercase.includes("shampoo") || lowercase.includes("soap") || lowercase.includes("deodorant") || lowercase.includes("brush") || lowercase.includes("skin") || lowercase.includes("cosmetic")) {
    return {
      name,
      emoji: "🧴",
      imageUri: require("@/assets/images/toiletries.jpg"), // local asset fallback toiletries
      color: "#00F5FF",
      bgColor: "rgba(0, 245, 255, 0.15)"
    };
  }
  if (lowercase.includes("headphone") || lowercase.includes("earbud") || lowercase.includes("airpods") || lowercase.includes("earphone")) {
    return {
      name,
      emoji: "🎧",
      imageUri: require("@/assets/images/headphones.jpg"), // local asset
      color: "#F59E0B",
      bgColor: "rgba(245, 158, 11, 0.15)"
    };
  }
  if (lowercase.includes("medicine") || lowercase.includes("pill") || lowercase.includes("first aid") || lowercase.includes("pills")) {
    return {
      name,
      emoji: "💊",
      imageUri: require("@/assets/images/travel_document.jpg"), // local asset
      color: "#EF4444",
      bgColor: "rgba(239, 68, 68, 0.15)"
    };
  }
  if (lowercase.includes("book") || lowercase.includes("novel") || lowercase.includes("reading")) {
    return {
      name,
      emoji: "📚",
      imageUri: require("@/assets/images/travel_document.jpg"), // local asset
      color: "#8B5CF6",
      bgColor: "rgba(139, 92, 246, 0.15)"
    };
  }
  if (lowercase.includes("keys") || lowercase.includes("key")) {
    return {
      name,
      emoji: "🔑",
      imageUri: require("@/assets/images/travel_document.jpg"), // local asset
      color: "#F59E0B",
      bgColor: "rgba(245, 158, 11, 0.15)"
    };
  }
  if (lowercase.includes("bottle") || lowercase.includes("water") || lowercase.includes("flask")) {
    return {
      name,
      emoji: "🍼",
      imageUri: require("@/assets/images/travel_document.jpg"), // local asset
      color: "#3B82F6",
      bgColor: "rgba(59, 130, 246, 0.15)"
    };
  }
  if (lowercase.includes("camera") || lowercase.includes("gopro")) {
    return {
      name,
      emoji: "📷",
      imageUri: require("@/assets/images/travel_document.jpg"), // local asset
      color: "#6B7280",
      bgColor: "rgba(107, 114, 128, 0.15)"
    };
  }
  return {
    name,
    emoji: "🧳",
    imageUri: require("@/assets/images/travel_document.jpg"), // local asset fallback
    color: "#94A3B8",
    bgColor: "rgba(148, 163, 184, 0.15)"
  };
};

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TravelPackScreen() {
  const { colors } = useTheme();
  const { items } = useWardrobe();
  const insets = useSafeAreaInsets();

  // Inputs
  const [destination, setDestination] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [duration, setDuration] = useState(3);
  const [tripType, setTripType] = useState<"Vacation" | "Business" | "Adventure" | "Beach">("Vacation");
  const [isTripTypeDropdownOpen, setIsTripTypeDropdownOpen] = useState(false);

  // Loading & Result States
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [packingResult, setPackingResult] = useState<AIPackingResult | null>(null);

  // Checklists (local state to support checked toggle)
  const [checkedEssentials, setCheckedEssentials] = useState<Record<string, boolean>>({});
  const [checkedClothes, setCheckedClothes] = useState<Record<string, boolean>>({});

  // Document pouch state & toast helper
  const [isDocBagOpen, setIsDocBagOpen] = useState(false);
  const [isDocBagModalVisible, setIsDocBagModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // UI/UX Animations
  const pouchScaleAnim = useRef(new Animated.Value(1)).current;
  const modalScaleAnim = useRef(new Animated.Value(0)).current;
  const modalTranslateYAnim = useRef(new Animated.Value(40)).current;
  const walletFlipAnim = useRef(new Animated.Value(0)).current;

  // Track modal entry animation
  useEffect(() => {
    if (isDocBagModalVisible) {
      modalScaleAnim.setValue(0);
      modalTranslateYAnim.setValue(40);
      Animated.parallel([
        Animated.spring(modalScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(modalTranslateYAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isDocBagModalVisible]);

  // Track wallet 3D flip animation
  useEffect(() => {
    Animated.spring(walletFlipAnim, {
      toValue: isDocBagOpen ? 1 : 0,
      friction: 7,
      tension: 25,
      useNativeDriver: true,
    }).start();
  }, [isDocBagOpen]);

  const frontInterpolate = walletFlipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = walletFlipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const frontOpacity = walletFlipAnim.interpolate({
    inputRange: [0, 0.45, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });

  const backOpacity = walletFlipAnim.interpolate({
    inputRange: [0, 0.5, 0.55, 1],
    outputRange: [0, 0, 1, 1],
  });

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handlePackSuitcase = async () => {
    if (!destination.trim()) {
      Alert.alert("Input Required", "Please enter a destination country or city.");
      return;
    }

    if (items.length === 0) {
      Alert.alert("Closet Empty", "Add some clothing items to your wardrobe before planning a trip packing list.");
      return;
    }

    setLoading(true);
    setStatusMessage("Analyzing target destination coordinates...");
    await sleep(650);
    setStatusMessage("Calculating expected temperature patterns...");
    await sleep(650);
    setStatusMessage("Selecting items from your virtual closet...");
    await sleep(650);

    try {
      const result = await generateTravelPackingList(destination, duration, tripType, items);
      
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setPackingResult(result);
      
      // Initialize checkboxes: clothes are checked by default, essentials are unchecked
      const initialClothes: Record<string, boolean> = {};
      result.packedItemIds.forEach((id) => {
        initialClothes[id] = true;
      });
      setCheckedClothes(initialClothes);
      setCheckedEssentials({});
    } catch (err: any) {
      console.error("Travel pack error:", err);
      Alert.alert(
        "Notice",
        "Created custom packing recommendation based on your closet items."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleEssentialCheck = (item: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCheckedEssentials((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const toggleClothesCheck = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCheckedClothes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Resolve wardrobe items recommended by AI that are checked (packed)
  const packedWardrobeItems = packingResult
    ? packingResult.packedItemIds
        .map((id) => items.find((i) => String(i.id) === String(id)))
        .filter((i): i is ClothingItem => !!i && !!checkedClothes[i.id])
    : [];

  const packedClothing = packedWardrobeItems.filter((i) => ["Tops", "Bottoms", "Outerwear"].includes(i.category));
  const packedAccessories = packedWardrobeItems.filter((i) => i.category === "Accessories");
  const packedShoes = packedWardrobeItems.filter((i) => i.category === "Shoes");

  // Resolve checked travel essentials (excluding documents which belong to the Document Pouch)
  const checkedEssentialVisuals = packingResult
    ? Object.keys(checkedEssentials)
        .filter((name) => checkedEssentials[name])
        .map((name) => getEssentialVisual(name))
        .filter((item) => !item.name.toLowerCase().includes("passport") && !item.name.toLowerCase().includes("visa") && !item.name.toLowerCase().includes("insurance"))
    : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundRoot }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.md, paddingBottom: 100 },
        ]}
      >
        {/* HEADER BLOCK */}
        <View style={styles.headerBlock}>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            AI TRIP PLANNER
          </ThemedText>
          <ThemedText style={[styles.headerTitle, { color: colors.text }]}>
            Travel Pack
          </ThemedText>
        </View>

        {/* TRIP CONFIGURATION */}
        <View style={[styles.configCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
            DESTINATION COUNTRY / CITY
          </ThemedText>
          <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.backgroundRoot }]}>
            <Feather name="map-pin" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              value={destination}
              onChangeText={(text) => {
                setDestination(text);
                if (text.trim()) {
                  const filtered = POPULAR_DESTINATIONS.filter((d) =>
                    d.toLowerCase().includes(text.toLowerCase())
                  ).slice(0, 5);
                  setSuggestions(filtered);
                } else {
                  setSuggestions([]);
                }
              }}
              placeholder="e.g. Paris, Tokyo, London"
              placeholderTextColor={colors.textSecondary + "77"}
              style={[styles.textInput, { color: colors.text }]}
            />
          </View>

          {suggestions.length > 0 && (
            <View style={[styles.suggestionsDropdown, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
              {suggestions.map((item, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => {
                    setDestination(item);
                    setSuggestions([]);
                  }}
                  style={({ pressed }) => [
                    styles.suggestionRow,
                    {
                      borderBottomWidth: idx === suggestions.length - 1 ? 0 : 1,
                      borderBottomColor: colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Feather name="map-pin" size={12} color={colors.primary} style={{ marginRight: 8 }} />
                  <ThemedText style={[styles.suggestionRowText, { color: colors.text }]}>{item}</ThemedText>
                </Pressable>
              ))}
            </View>
          )}

          <View style={[styles.rowWrapper, { zIndex: 10, position: "relative" }]}>
            <View style={{ flex: 1, marginRight: Spacing.sm }}>
              <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                DURATION (DAYS)
              </ThemedText>
              <View style={styles.counterRow}>
                <Pressable
                  onPress={() => setDuration(Math.max(1, duration - 1))}
                  style={[styles.counterBtn, { borderColor: colors.border, backgroundColor: colors.backgroundRoot }]}
                >
                  <Feather name="minus" size={14} color={colors.text} />
                </Pressable>
                <ThemedText style={[styles.counterValue, { color: colors.text }]}>{duration}</ThemedText>
                <Pressable
                  onPress={() => setDuration(Math.min(14, duration + 1))}
                  style={[styles.counterBtn, { borderColor: colors.border, backgroundColor: colors.backgroundRoot }]}
                >
                  <Feather name="plus" size={14} color={colors.text} />
                </Pressable>
              </View>
            </View>

            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                TRIP STYLE
              </ThemedText>
              
              <View style={styles.dropdownContainer}>
                <Pressable
                  onPress={() => setIsTripTypeDropdownOpen(!isTripTypeDropdownOpen)}
                  style={[
                    styles.dropdownTriggerBtn,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.backgroundRoot,
                    },
                  ]}
                >
                  <ThemedText style={[styles.dropdownTriggerText, { color: colors.text }]}>
                    {tripType}
                  </ThemedText>
                  <Feather
                    name={isTripTypeDropdownOpen ? "chevron-up" : "chevron-down"}
                    size={14}
                    color={colors.textSecondary}
                  />
                </Pressable>

                {isTripTypeDropdownOpen && (
                  <View
                    style={[
                      styles.dropdownListContainer,
                      {
                        backgroundColor: colors.backgroundRoot,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    {(["Vacation", "Business", "Adventure", "Beach"] as const).map((style) => (
                      <Pressable
                        key={style}
                        onPress={() => {
                          setTripType(style);
                          setIsTripTypeDropdownOpen(false);
                        }}
                        style={({ pressed }) => [
                          styles.dropdownItemBtn,
                          tripType === style && { backgroundColor: colors.primary + "15" },
                          pressed && { opacity: 0.7 },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.dropdownItemText,
                            {
                              color: tripType === style ? colors.primary : colors.text,
                              fontWeight: tripType === style ? "700" : "500",
                            },
                          ]}
                        >
                          {style}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          <Pressable
            onPress={handlePackSuitcase}
            disabled={loading}
            style={({ pressed }) => [
              styles.packBtn,
              {
                backgroundColor: colors.primary,
                opacity: pressed || loading ? 0.8 : 1,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.buttonText} />
            ) : (
              <>
                <Feather name="package" size={16} color={colors.buttonText} style={{ marginRight: 8 }} />
                <ThemedText style={[styles.packBtnText, { color: colors.buttonText }]}>
                  Pack My Suitcase
                </ThemedText>
              </>
            )}
          </Pressable>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={[styles.loadingText, { color: colors.text }]}>{statusMessage}</ThemedText>
          </View>
        )}

        {/* PACKED SUITCASE & CHECKLIST */}
        {!loading && packingResult && (
          <View style={styles.resultContainer}>
            {/* DESTINATION WEATHER INFO */}
            <View style={[styles.weatherCard, { backgroundColor: colors.primary + "11", borderColor: colors.primary + "33" }]}>
              <View style={styles.weatherInfoRow}>
                <Feather name="cloud" size={24} color={colors.primary} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.weatherTitleText, { color: colors.text }]}>
                    {packingResult.expectedWeather.temp} • {packingResult.expectedWeather.condition}
                  </ThemedText>
                  <ThemedText style={[styles.weatherSummaryText, { color: colors.textSecondary }]}>
                    {packingResult.expectedWeather.summary}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[styles.weatherReasoningText, { color: colors.text }]}>
                {packingResult.reasoning}
              </ThemedText>
            </View>

            {/* 3D TROLLEY SUITCASE VISUALIZER */}
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              TROLLEY SUITCASE
            </ThemedText>

            <View style={styles.suitcaseContainer}>
              {/* Suitcase Top Handle */}
              <View style={styles.suitcaseHandleTop}>
                <View style={styles.suitcaseHandleTopBar} />
                <View style={styles.suitcaseHandleTopRodLeft} />
                <View style={styles.suitcaseHandleTopRodRight} />
              </View>

              {/* Suitcase Main Body shell */}
              <View style={styles.suitcaseBodyShell}>
                {/* Horizontal Ridge Textures (Classic American Tourister look) */}
                <View style={styles.suitcaseRidge} />
                <View style={styles.suitcaseRidge} />
                <View style={styles.suitcaseRidge} />

                {/* Open split panels inside */}
                <View style={styles.suitcaseOpenSplit}>
                  {/* LEFT COMPARTMENT (Mesh & Zipper details: Shoes, Accessories, & Essentials) */}
                  <View style={styles.suitcaseCompartmentLeft}>
                    <ThemedText style={styles.compartmentLabel}>MESH SIDE</ThemedText>

                    {/* Miniature passport wallet cover design inside suitcase */}
                    <Animated.View style={[styles.suitcaseDocPouchWrapper, { transform: [{ scale: pouchScaleAnim }] }]}>
                      <Pressable
                        onPressIn={() => {
                          Animated.spring(pouchScaleAnim, {
                            toValue: 0.9,
                            useNativeDriver: true,
                          }).start();
                        }}
                        onPressOut={() => {
                          Animated.spring(pouchScaleAnim, {
                            toValue: 1,
                            friction: 4,
                            useNativeDriver: true,
                          }).start();
                        }}
                        onPress={() => {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          setIsDocBagModalVisible(true);
                        }}
                        style={styles.suitcaseDocPouchPressable}
                      >
                        <Image
                          source={require("@/assets/images/passport_bag.jpg")}
                          style={styles.suitcaseDocPouchImage}
                          contentFit="cover"
                        />
                        <View style={styles.suitcaseDocPouchBadge}>
                          <ThemedText style={styles.suitcaseDocPouchBadgeText}>DOCS</ThemedText>
                        </View>
                      </Pressable>
                    </Animated.View>

                    <View style={styles.compartmentDividerLine} />
                    
                    {/* Accessories Sub-section */}
                    <View style={styles.accessSection}>
                      {packedAccessories.map((item) => (
                        <View key={item.id} style={styles.accessoryBubble}>
                          <Image source={{ uri: item.imageUri }} style={styles.itemBubbleImage} />
                        </View>
                      ))}
                      {packedAccessories.length === 0 && (
                        <ThemedText style={styles.compartmentPlaceholderTextSmall}>No accessories</ThemedText>
                      )}
                    </View>

                    <View style={styles.compartmentDividerLine} />

                    {/* Essentials Sub-section (rendered when user checks off documents/electronics) */}
                    <View style={styles.accessSection}>
                      {checkedEssentialVisuals.map((item, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.essentialBubble,
                            {
                              borderColor: item.color,
                              backgroundColor: "#1E293B", // dark slate background to contrast white items
                              borderWidth: 1.5,
                              overflow: "hidden",
                              padding: 3, // padding to frame image and show contrast border
                            },
                          ]}
                        >
                          <Image source={item.imageUri} style={styles.itemBubbleImage} contentFit="contain" />
                        </View>
                      ))}
                      {checkedEssentialVisuals.length === 0 && (
                        <ThemedText style={styles.compartmentPlaceholderTextSmall}>No essentials packed</ThemedText>
                      )}
                    </View>

                    <View style={styles.compartmentDividerLine} />

                    {/* Shoes Sub-section */}
                    <View style={styles.shoeSection}>
                      {packedShoes.map((item) => (
                        <View key={item.id} style={styles.shoeBubble}>
                          <Image source={{ uri: item.imageUri }} style={styles.itemBubbleImage} />
                        </View>
                      ))}
                      {packedShoes.length === 0 && (
                        <ThemedText style={styles.compartmentPlaceholderTextSmall}>No shoes packed</ThemedText>
                      )}
                    </View>
                  </View>

                  {/* Suitcase Center Zip Divider */}
                  <View style={styles.suitcaseCenterZip} />

                  {/* RIGHT COMPARTMENT (Main clothing side with elastic cross-straps) */}
                  <View style={styles.suitcaseCompartmentRight}>
                    {/* Diagonal Elastic Cross-Straps */}
                    <View style={styles.suitcaseStrapLeftDiagonal} />
                    <View style={styles.suitcaseStrapRightDiagonal} />
                    
                    <ThemedText style={styles.compartmentLabel}>CLOTHING</ThemedText>

                    {/* Clothes visual list */}
                    <View style={styles.clothesContainer}>
                      {packedClothing.map((item) => (
                        <View key={item.id} style={styles.clothingBubble}>
                          <Image source={{ uri: item.imageUri }} style={styles.itemBubbleImage} />
                        </View>
                      ))}
                      {packedClothing.length === 0 && (
                        <ThemedText style={styles.compartmentPlaceholderText}>Main bay is empty</ThemedText>
                      )}
                    </View>
                  </View>
                </View>
              </View>

              {/* Bottom spinner wheels */}
              <View style={styles.suitcaseWheelsRow}>
                <View style={styles.suitcaseWheel} />
                <View style={styles.suitcaseWheel} />
                <View style={styles.suitcaseWheel} />
                <View style={styles.suitcaseWheel} />
              </View>
            </View>

            {/* AI SMART PACKING CHECKLISTS */}
            <ThemedText style={[styles.sectionTitle, { color: colors.text, marginTop: Spacing.xl }]}>
              PACKING CHECKLIST
            </ThemedText>

            {/* Checklist: Clothing from Wardrobe */}
            <View style={[styles.checklistCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <ThemedText style={[styles.checklistHeader, { color: colors.text }]}>
                Wardrobe Clothing & Accessories
              </ThemedText>
              {packedWardrobeItems.map((item) => {
                const isChecked = !!checkedClothes[item.id];
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => toggleClothesCheck(item.id)}
                    style={styles.checkItemRow}
                  >
                    <Feather
                      name={isChecked ? "check-square" : "square"}
                      size={18}
                      color={isChecked ? colors.primary : colors.textSecondary}
                      style={{ marginRight: 10 }}
                    />
                    <Image source={{ uri: item.imageUri }} style={styles.checkItemThumbnail} />
                    <View style={{ flex: 1 }}>
                      <ThemedText style={[styles.checkItemName, isChecked && styles.checkedText, { color: colors.text }]}>
                        {item.name}
                      </ThemedText>
                      <ThemedText style={[styles.checkItemCategory, { color: colors.textSecondary }]}>
                        {item.category} • {item.colors.join(", ")}
                      </ThemedText>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Checklist: General Trip Essentials (Toiletries, electronics, etc.) */}
            {packingResult.essentialChecklist.map((categoryGroup, catIdx) => (
              <View
                key={catIdx}
                style={[
                  styles.checklistCard,
                  { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, marginTop: Spacing.md },
                ]}
              >
                <ThemedText style={[styles.checklistHeader, { color: colors.text }]}>
                  {categoryGroup.category}
                </ThemedText>
                {categoryGroup.items.map((item, itemIdx) => {
                  const isChecked = !!checkedEssentials[item];
                  return (
                    <Pressable
                      key={itemIdx}
                      onPress={() => toggleEssentialCheck(item)}
                      style={styles.checkItemRow}
                    >
                      <Feather
                        name={isChecked ? "check-square" : "square"}
                        size={18}
                        color={isChecked ? colors.primary : colors.textSecondary}
                        style={{ marginRight: 10 }}
                      />
                      <ThemedText style={[styles.checkItemText, isChecked && styles.checkedText, { color: colors.text }]}>
                        {item}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* DOCUMENT WALLET POPUP MODAL */}
      <Modal
        visible={isDocBagModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDocBagModalVisible(false)}
      >
        <View style={styles.modalOverlayContainer}>
          <Pressable style={styles.modalDismissArea} onPress={() => setIsDocBagModalVisible(false)} />
          
          <Animated.View
            style={[
              styles.modalCardContainer,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
                transform: [
                  { scale: modalScaleAnim },
                  { translateY: modalTranslateYAnim }
                ]
              }
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <ThemedText style={[styles.modalTitleText, { color: colors.text }]}>
                TRAVEL WALLET
              </ThemedText>
              <Pressable
                onPress={() => setIsDocBagModalVisible(false)}
                style={[styles.modalCloseBtn, { backgroundColor: colors.border }]}
              >
                <Feather name="x" size={18} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalWalletAnimationContainer}>
                {/* Front Side (Closed Cover) */}
                <Animated.View
                  style={[
                    styles.modalWalletFlipCard,
                    styles.modalWalletFlipCardFront,
                    {
                      transform: [{ rotateY: frontInterpolate }],
                      opacity: frontOpacity,
                    },
                  ]}
                  pointerEvents={isDocBagOpen ? "none" : "auto"}
                >
                  <Pressable
                    onPress={() => setIsDocBagOpen(true)}
                    style={styles.modalWalletCoverPressable}
                  >
                    <Image
                      source={require("@/assets/images/passport_bag.jpg")}
                      style={styles.modalWalletCoverImage}
                      contentFit="cover"
                    />
                    <View style={styles.modalWalletElasticBandOverlay} />
                  </Pressable>

                  <ThemedText style={[styles.modalWalletClosedHint, { color: colors.textSecondary }]}>
                    TAP WALLET COVER TO OPEN
                  </ThemedText>

                  <Pressable
                    onPress={() => setIsDocBagOpen(true)}
                    style={[styles.modalWalletActionBtn, { backgroundColor: colors.primary }]}
                  >
                    <ThemedText style={[styles.modalWalletActionBtnText, { color: colors.buttonText }]}>
                      OPEN WALLET
                    </ThemedText>
                  </Pressable>
                </Animated.View>

                {/* Back Side (Open Slots) */}
                <Animated.View
                  style={[
                    styles.modalWalletFlipCard,
                    {
                      transform: [{ rotateY: backInterpolate }],
                      opacity: backOpacity,
                    },
                  ]}
                  pointerEvents={isDocBagOpen ? "auto" : "none"}
                >
                  <View style={styles.modalWalletOpen}>
                    <ThemedText style={styles.modalWalletOpenTitle}>PASSPORT & TRAVEL DOCUMENTS</ThemedText>
                    
                    <View style={styles.modalWalletSlotsRow}>
                      {/* Passport Slot */}
                      <Pressable
                        onPress={() => {
                          const isPassportChecked = Object.keys(checkedEssentials).some(
                            (name) => name.toLowerCase().includes("passport") && checkedEssentials[name]
                          );
                          if (isPassportChecked) {
                            showToast("Republic of India Passport");
                          } else {
                            showToast("Check off 'Passport' below to pack it");
                          }
                        }}
                        style={[styles.modalWalletSlotCard, { borderColor: colors.border }]}
                      >
                        {Object.keys(checkedEssentials).some(
                          (name) => name.toLowerCase().includes("passport") && checkedEssentials[name]
                        ) ? (
                          <Image
                            source={require("@/assets/images/indian_passport.jpg")}
                            style={styles.modalWalletDocImage}
                            contentFit="cover"
                          />
                        ) : (
                          <View style={styles.modalWalletSlotPlaceholder}>
                            <Feather name="shield" size={24} color={colors.textSecondary} />
                            <ThemedText style={[styles.modalWalletSlotText, { color: colors.textSecondary }]}>Passport</ThemedText>
                            <ThemedText style={styles.modalWalletSlotRequired}>Required</ThemedText>
                          </View>
                        )}
                      </Pressable>

                      {/* E-Visa Slot */}
                      <Pressable
                        onPress={() => {
                          const isVisaChecked = Object.keys(checkedEssentials).some(
                            (name) => name.toLowerCase().includes("visa") && checkedEssentials[name]
                          );
                          if (isVisaChecked) {
                            showToast("E-Visa Document");
                          } else {
                            showToast("Check off 'Visa' below to pack it");
                          }
                        }}
                        style={[styles.modalWalletSlotCard, { borderColor: colors.border }]}
                      >
                        {Object.keys(checkedEssentials).some(
                          (name) => name.toLowerCase().includes("visa") && checkedEssentials[name]
                        ) ? (
                          <Image
                            source={require("@/assets/images/travel_document.jpg")}
                            style={styles.modalWalletDocImage}
                            contentFit="cover"
                          />
                        ) : (
                          <View style={styles.modalWalletSlotPlaceholder}>
                            <Feather name="file-text" size={24} color={colors.textSecondary} />
                            <ThemedText style={[styles.modalWalletSlotText, { color: colors.textSecondary }]}>E-Visa</ThemedText>
                            <ThemedText style={styles.modalWalletSlotRequired}>Required</ThemedText>
                          </View>
                        )}
                      </Pressable>

                      {/* Insurance Slot */}
                      <Pressable
                        onPress={() => {
                          const isInsChecked = Object.keys(checkedEssentials).some(
                            (name) => name.toLowerCase().includes("insurance") && checkedEssentials[name]
                          );
                          if (isInsChecked) {
                            showToast("Travel Insurance Document");
                          } else {
                            showToast("Check off 'Insurance' below to pack it");
                          }
                        }}
                        style={[styles.modalWalletSlotCard, { borderColor: colors.border }]}
                      >
                        {Object.keys(checkedEssentials).some(
                          (name) => name.toLowerCase().includes("insurance") && checkedEssentials[name]
                        ) ? (
                          <Image
                            source={require("@/assets/images/insurance.jpg")}
                            style={styles.modalWalletDocImage}
                            contentFit="cover"
                          />
                        ) : (
                          <View style={styles.modalWalletSlotPlaceholder}>
                            <Feather name="umbrella" size={24} color={colors.textSecondary} />
                            <ThemedText style={[styles.modalWalletSlotText, { color: colors.textSecondary }]}>Insurance</ThemedText>
                            <ThemedText style={styles.modalWalletSlotRequired}>Required</ThemedText>
                          </View>
                        )}
                      </Pressable>
                    </View>

                    <Pressable
                      onPress={() => setIsDocBagOpen(false)}
                      style={[styles.modalWalletActionBtn, { backgroundColor: colors.primary }]}
                    >
                      <ThemedText style={[styles.modalWalletActionBtnText, { color: colors.buttonText }]}>
                        CLOSE WALLET
                      </ThemedText>
                    </Pressable>
                  </View>
                </Animated.View>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {toastMessage && (
        <View style={[styles.toastContainer, { backgroundColor: colors.primary }]}>
          <ThemedText style={[styles.toastText, { color: colors.buttonText }]}>
            {toastMessage}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  headerBlock: {
    marginBottom: Spacing.lg,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1,
  },
  configCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    height: "100%",
  },
  rowWrapper: {
    flexDirection: "row",
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    gap: 8,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  counterValue: {
    fontSize: 16,
    fontWeight: "700",
    minWidth: 20,
    textAlign: "center",
  },
  suggestionsDropdown: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    marginTop: -Spacing.xs,
    marginBottom: Spacing.xs,
    overflow: "hidden",
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  suggestionRowText: {
    fontSize: 13,
    fontWeight: "600",
  },
  styleSelector: {
    height: 40,
  },
  styleTabBtn: {
    paddingHorizontal: Spacing.sm,
    height: 36,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  styleTabBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  packBtn: {
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: Spacing.xs,
  },
  packBtnText: {
    fontSize: 14,
    fontWeight: "800",
  },
  loadingContainer: {
    paddingVertical: Spacing.xl * 2,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 13,
    fontWeight: "600",
  },
  resultContainer: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  weatherCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  weatherInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  weatherTitleText: {
    fontSize: 16,
    fontWeight: "800",
  },
  weatherSummaryText: {
    fontSize: 12,
    marginTop: 2,
  },
  weatherReasoningText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: "italic",
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginTop: Spacing.md,
  },
  suitcaseContainer: {
    alignItems: "center",
    marginVertical: Spacing.md,
  },
  suitcaseHandleTop: {
    alignItems: "center",
    height: 30,
    width: 60,
  },
  suitcaseHandleTopBar: {
    height: 6,
    width: 50,
    backgroundColor: "#A2AAB3",
    borderRadius: 3,
  },
  suitcaseHandleTopRodLeft: {
    position: "absolute",
    left: 10,
    top: 6,
    bottom: 0,
    width: 4,
    backgroundColor: "#7F8D9F",
  },
  suitcaseHandleTopRodRight: {
    position: "absolute",
    right: 10,
    top: 6,
    bottom: 0,
    width: 4,
    backgroundColor: "#7F8D9F",
  },
  suitcaseBodyShell: {
    width: "100%",
    minHeight: 280,
    backgroundColor: "#1A2F50",
    borderColor: "#2D476F",
    borderWidth: 4,
    borderRadius: 24,
    padding: Spacing.md,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  suitcaseRidge: {
    position: "absolute",
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: "#223E66",
    opacity: 0.4,
    borderRadius: 1,
    top: 40,
    zIndex: 1,
    marginVertical: 40, // Multiple ridges separated
  },
  suitcaseOpenSplit: {
    flexDirection: "row",
    flex: 1,
    gap: 4,
  },
  suitcaseCompartmentLeft: {
    flex: 1.1,
    backgroundColor: "#132239",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#223B5D",
    padding: Spacing.sm,
    justifyContent: "space-between",
  },
  suitcaseCompartmentRight: {
    flex: 1.4,
    backgroundColor: "#132239",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#223B5D",
    padding: Spacing.sm,
    position: "relative",
    overflow: "hidden",
  },
  suitcaseCenterZip: {
    width: 4,
    backgroundColor: "#2D476F",
    borderRadius: 2,
  },
  compartmentLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#4A6FA5",
    letterSpacing: 1.2,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  suitcaseStrapLeftDiagonal: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: 2,
    backgroundColor: "#3D5F8F",
    opacity: 0.45,
    transform: [{ rotate: "35deg" }],
    zIndex: 2,
  },
  suitcaseStrapRightDiagonal: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: 2,
    backgroundColor: "#3D5F8F",
    opacity: 0.45,
    transform: [{ rotate: "-35deg" }],
    zIndex: 2,
  },
  accessSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingVertical: 4,
    justifyContent: "center",
  },
  accessoryBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2D476F",
    backgroundColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  itemBubbleImage: {
    width: "100%",
    height: "100%",
  },
  compartmentDividerLine: {
    height: 1,
    backgroundColor: "#223B5D",
    marginVertical: Spacing.xs,
  },
  shoeSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingVertical: 4,
    justifyContent: "center",
  },
  shoeBubble: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2D476F",
    backgroundColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  clothesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 4,
  },
  clothingBubble: {
    width: 44,
    height: 56,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2D476F",
    backgroundColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  compartmentPlaceholderText: {
    fontSize: 7,
    color: "#5C7699",
    textAlign: "center",
    marginVertical: 10,
  },
  compartmentPlaceholderTextSmall: {
    fontSize: 7,
    color: "#5C7699",
    textAlign: "center",
    marginVertical: 4,
  },
  essentialBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  essentialBubbleEmoji: {
    fontSize: 16,
    textAlign: "center",
  },
  suitcaseWheelsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    height: 14,
  },
  suitcaseWheel: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#1F2E45",
    borderWidth: 2,
    borderColor: "#A2AAB3",
  },
  checklistCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  checklistHeader: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: Spacing.xs,
  },
  checkItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  checkItemText: {
    fontSize: 13,
    fontWeight: "600",
  },
  checkItemThumbnail: {
    width: 36,
    height: 48,
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  checkItemName: {
    fontSize: 13,
    fontWeight: "700",
  },
  checkItemCategory: {
    fontSize: 10,
    marginTop: 2,
  },
  checkedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  suitcaseDocPouchWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },
  suitcaseDocPouchPressable: {
    width: 65,
    height: 85,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#3D5F8F",
    backgroundColor: "#132239",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    position: "relative",
  },
  suitcaseDocPouchImage: {
    width: "100%",
    height: "100%",
  },
  suitcaseDocPouchBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  suitcaseDocPouchBadgeText: {
    fontSize: 7,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  modalOverlayContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalDismissArea: {
    ...StyleSheet.absoluteFill,
  },
  modalCardContainer: {
    width: "85%",
    maxHeight: "80%",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modalTitleText: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  modalScrollContent: {
    alignItems: "center",
    width: "100%",
    paddingBottom: Spacing.md,
  },
  modalWalletAnimationContainer: {
    width: "100%",
    minHeight: 350,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  modalWalletFlipCard: {
    width: "100%",
    alignItems: "center",
    backfaceVisibility: "hidden",
  },
  modalWalletFlipCardFront: {
    position: "absolute",
    top: 0,
    zIndex: 2,
  },
  modalWalletClosed: {
    alignItems: "center",
    width: "100%",
  },
  modalWalletCoverPressable: {
    width: 190,
    height: 260,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#444",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
    position: "relative",
  },
  modalWalletCoverImage: {
    width: "100%",
    height: "100%",
  },
  modalWalletElasticBandOverlay: {
    position: "absolute",
    right: 25,
    top: 0,
    bottom: 0,
    width: 14,
    backgroundColor: "#111",
    opacity: 0.85,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#333",
  },
  modalWalletClosedHint: {
    fontSize: 11,
    fontWeight: "700",
    marginVertical: Spacing.md,
    letterSpacing: 1.2,
  },
  modalWalletActionBtn: {
    width: "80%",
    height: 44,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  modalWalletActionBtnText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  modalWalletOpen: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: Spacing.xs,
  },
  modalWalletOpenTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: "#ECCFA8",
    letterSpacing: 1.2,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  modalWalletSlotsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.sm,
    width: "100%",
    marginBottom: Spacing.lg,
  },
  modalWalletSlotCard: {
    flex: 1,
    height: 120,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderStyle: "dashed",
    overflow: "hidden",
    backgroundColor: "#161616",
    justifyContent: "center",
    alignItems: "center",
  },
  modalWalletDocImage: {
    width: "100%",
    height: "100%",
  },
  modalWalletSlotPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    padding: 4,
  },
  modalWalletSlotText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  modalWalletSlotRequired: {
    fontSize: 7,
    color: "#EF4444",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  toastContainer: {
    position: "absolute",
    bottom: 50,
    left: "15%",
    right: "15%",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 100,
  },
  toastText: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  dropdownContainer: {
    position: "relative",
    zIndex: 200,
  },
  dropdownTriggerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 38,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
  },
  dropdownTriggerText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dropdownListContainer: {
    position: "absolute",
    top: 42,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    zIndex: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItemBtn: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
  },
  dropdownItemText: {
    fontSize: 12,
  },
});



