import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { useTheme } from "@/hooks/useTheme";
import { Feather } from "@expo/vector-icons";
import { classifyClothingItem, removeBackground } from "@/utils/aiClassifier";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Category, ClothingItem, Gender, Occasion, Season } from "@/types/ClothingItem";
import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, "ItemDetailsForm">;

const CATEGORIES: Category[] = ["Tops", "Bottoms", "Shoes", "Accessories", "Outerwear"];
const SEASONS: Season[] = ["Spring", "Summer", "Fall", "Winter"];
const OCCASIONS: Occasion[] = ["Casual", "Work", "Formal", "Sport"];
const COLORS = ["Red", "Blue", "Green", "Yellow", "Black", "White", "Gray", "Brown", "Pink", "Purple"];
const GENDERS: Gender[] = ["men", "women", "unisex"];

export default function ItemDetailsFormScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { addItem } = useWardrobe();

  const [imageUri, setImageUri] = useState(route.params.imageUri);
  const [scanMessage, setScanMessage] = useState("AURA Scanning Item...");
  const [name, setName] = useState("");
  const [nameManuallyEdited, setNameManuallyEdited] = useState(false);
  const [category, setCategory] = useState<Category>(route.params?.initialCategory || "Tops");
  const [gender, setGender] = useState<Gender>("unisex");
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<Occasion[]>([]);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [scanSource, setScanSource] = useState<"cloud" | "local">("local");
  const [containerHeight, setContainerHeight] = useState(250);
  const scanAnim = useRef(new Animated.Value(0)).current;

  const performScan = async () => {
    setScanning(true);
    setNameManuallyEdited(false);
    try {
      let activeUri = route.params.imageUri;

      // Check if Remove.bg key is present and perform background removal
      if (process.env.EXPO_PUBLIC_REMOVE_BG_API_KEY?.trim()) {
        setScanMessage("Removing background...");
        const transparentUri = await removeBackground(activeUri);
        if (transparentUri) {
          activeUri = transparentUri;
          setImageUri(transparentUri);
        }
      }

      setScanMessage("AURA Scanning Item...");
      const result = await classifyClothingItem(activeUri, route.params.initialCategory);
      setName(result.name);
      setCategory(result.category);
      setGender(result.gender);
      setSelectedColors(result.colors);
      setSelectedSeasons(result.seasons);
      setSelectedOccasions(result.occasions);
      setScanSource(result.source);
    } catch (err: any) {
      console.error("AI classification error:", err);
      if (err?.message?.includes("429")) {
        Alert.alert(
          "API Limit Reached",
          "You have reached your daily Google Gemini API quota (or requests per minute limit). Please fill details manually or try again later.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Classification Failed", "AI could not identify this item. You can fill in the details manually.");
      }
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    // Loop the scanning bar up and down
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    performScan();
  }, []);

  const handleCategoryChange = (newCat: Category) => {
    setCategory(newCat);
    if (!nameManuallyEdited) {
      const primaryColor = selectedColors[0] || "White";
      const colorDisplayToPremium: { [key: string]: string } = {
        Black: "Obsidian",
        White: "Alabaster",
        Gray: "Charcoal",
        Brown: "Espresso",
        Blue: "Midnight Blue",
        Red: "Burgundy",
        Green: "Olive",
        Yellow: "Gold",
      };
      const premColor = colorDisplayToPremium[primaryColor] || "Alabaster";
      let singularCat = "Item";
      if (newCat === "Tops") {
        singularCat = "Structured Shirt";
      } else if (newCat === "Bottoms") {
        singularCat = "Slim Chinos";
      } else if (newCat === "Outerwear") {
        singularCat = "Modern Overcoat";
      } else if (newCat === "Shoes") {
        singularCat = "Classic Loafers";
      } else if (newCat === "Accessories") {
        const lowerName = imageUri.toLowerCase();
        if (lowerName.includes("watch") || lowerName.includes("clock")) {
          singularCat = "Chronograph Watch";
        } else {
          singularCat = "Fine Accessory";
        }
      }
      setName(`${premColor} ${singularCat}`);
    }
  };

  const toggleSeason = (season: Season) => {
    setSelectedSeasons((prev) =>
      prev.includes(season) ? prev.filter((s) => s !== season) : [...prev, season]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) => {
      const next = prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color];
      if (!nameManuallyEdited) {
        const primaryColor = next[0] || "White";
        const colorDisplayToPremium: { [key: string]: string } = {
          Black: "Obsidian",
          White: "Alabaster",
          Gray: "Charcoal",
          Brown: "Espresso",
          Blue: "Midnight Blue",
          Red: "Burgundy",
          Green: "Olive",
          Yellow: "Gold",
        };
        const premColor = colorDisplayToPremium[primaryColor] || "Alabaster";
        let singularCat = "Item";
        if (category === "Tops") {
          singularCat = "Structured Shirt";
        } else if (category === "Bottoms") {
          singularCat = "Slim Chinos";
        } else if (category === "Outerwear") {
          singularCat = "Modern Overcoat";
        } else if (category === "Shoes") {
          singularCat = "Classic Loafers";
        } else if (category === "Accessories") {
          const lowerName = imageUri.toLowerCase();
          if (lowerName.includes("watch") || lowerName.includes("clock")) {
            singularCat = "Chronograph Watch";
          } else {
            singularCat = "Fine Accessory";
          }
        }
        setName(`${premColor} ${singularCat}`);
      }
      return next;
    });
  };

  const toggleOccasion = (occasion: Occasion) => {
    setSelectedOccasions((prev) =>
      prev.includes(occasion) ? prev.filter((o) => o !== occasion) : [...prev, occasion]
    );
  };

  const handleSave = async () => {
    if (selectedSeasons.length === 0) {
      Alert.alert("Missing Information", "Please select at least one season");
      return;
    }
    if (selectedOccasions.length === 0) {
      Alert.alert("Missing Information", "Please select at least one occasion");
      return;
    }

    setSaving(true);
    const newItem: ClothingItem = {
      id: Date.now().toString(),
      imageUri: imageUri,
      name: name.trim() || undefined,
      category,
      gender,
      seasons: selectedSeasons,
      colors: selectedColors,
      occasions: selectedOccasions,
      dateAdded: new Date().toISOString(),
    };

    await addItem(newItem);
    setSaving(false);
    navigation.navigate("MainTabs");
  };

  return (
    <ScreenKeyboardAwareScrollView
      contentContainerStyle={[
        styles.container,
        { paddingBottom: Spacing["3xl"] },
      ]}
    >
      <View
        onLayout={(e) => {
          const { height } = e.nativeEvent.layout;
          if (height) setContainerHeight(height);
        }}
        style={[styles.imagePreview, { borderColor: colors.border }]}
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="cover"
        />
        {scanning && (
          <View style={styles.scannerOverlay}>
            <Animated.View
              style={[
                styles.scannerBar,
                {
                  transform: [
                    {
                      translateY: scanAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, containerHeight],
                      }),
                    },
                  ],
                },
              ]}
            />
            <ThemedText style={styles.scannerText}>{scanMessage}</ThemedText>
          </View>
        )}
      </View>

      {!scanning && (
        <View style={{ alignItems: "center", width: "100%", marginBottom: Spacing.lg }}>
          <View
            style={[
              styles.aiBadge,
              {
                borderColor: scanSource === "cloud" ? colors.success : colors.textSecondary,
                backgroundColor: colors.backgroundSecondary,
                alignSelf: "center",
                marginBottom: 4,
              },
            ]}
          >
            <Feather
              name={scanSource === "cloud" ? "check-circle" : "info"}
              size={12}
              color={scanSource === "cloud" ? colors.success : colors.textSecondary}
            />
            <ThemedText
              style={[
                styles.aiBadgeText,
                { color: scanSource === "cloud" ? colors.success : colors.textSecondary },
              ]}
            >
              {scanSource === "cloud" ? "AURA AI (Cloud Optimized)" : "AURA Offline (Smart Local)"}
            </ThemedText>
          </View>
          {scanSource === "local" && (
            <>
              <ThemedText
                style={{
                  fontSize: 11,
                  color: colors.textSecondary,
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                💡 Tap category or color below to auto-fill suggestions.
              </ThemedText>
              <Pressable
                onPress={performScan}
                style={({ pressed }) => [
                  {
                    marginTop: 10,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 15,
                    borderWidth: 1,
                    borderColor: colors.primary,
                    backgroundColor: pressed ? "rgba(229,194,153,0.15)" : "transparent",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  },
                ]}
              >
                <Feather name="refresh-cw" size={10} color={colors.primary} />
                <ThemedText
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: colors.primary,
                    letterSpacing: 0.5,
                  }}
                >
                  Retry AURA AI Cloud Scan
                </ThemedText>
              </Pressable>
            </>
          )}
        </View>
      )}

      <View style={styles.section}>
        <ThemedText style={styles.label}>GENDER</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {GENDERS.map((value) => (
            <Pressable
              key={value}
              onPress={() => setGender(value)}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    gender === value ? colors.primary : colors.backgroundDefault,
                  borderColor: gender === value ? colors.primary : colors.border,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.chipText,
                  {
                    color:
                      gender === value ? colors.buttonText : colors.text,
                  },
                ]}
              >
                {value === "men" ? "Men" : value === "women" ? "Women" : "Unisex"}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.label}>NAME (OPTIONAL)</ThemedText>
        <TextInput
          value={name}
          onChangeText={(text) => {
            setName(text);
            setNameManuallyEdited(true);
          }}
          placeholder="e.g., Blue denim jacket"
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            {
              backgroundColor: colors.backgroundDefault,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
        />
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.label}>CATEGORY</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => handleCategoryChange(cat)}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    category === cat ? colors.primary : colors.backgroundDefault,
                  borderColor: category === cat ? colors.primary : colors.border,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.chipText,
                  { color: category === cat ? colors.buttonText : colors.text },
                ]}
              >
                {cat}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.label}>SEASON</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {SEASONS.map((season) => (
            <Pressable
              key={season}
              onPress={() => toggleSeason(season)}
              style={[
                styles.chip,
                {
                  backgroundColor: selectedSeasons.includes(season)
                    ? colors.primary
                    : colors.backgroundDefault,
                  borderColor: selectedSeasons.includes(season)
                    ? colors.primary
                    : colors.border,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.chipText,
                  {
                    color: selectedSeasons.includes(season)
                      ? colors.buttonText
                      : colors.text,
                  },
                ]}
              >
                {season}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.label}>COLORS (OPTIONAL)</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {COLORS.map((color) => (
            <Pressable
              key={color}
              onPress={() => toggleColor(color)}
              style={[
                styles.chip,
                {
                  backgroundColor: selectedColors.includes(color)
                    ? colors.secondary
                    : colors.backgroundDefault,
                  borderColor: selectedColors.includes(color)
                    ? colors.secondary
                    : colors.border,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.chipText,
                  {
                    color: selectedColors.includes(color)
                      ? colors.buttonText
                      : colors.text,
                  },
                ]}
              >
                {color}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.label}>OCCASION</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {OCCASIONS.map((occasion) => (
            <Pressable
              key={occasion}
              onPress={() => toggleOccasion(occasion)}
              style={[
                styles.chip,
                {
                  backgroundColor: selectedOccasions.includes(occasion)
                    ? colors.primary
                    : colors.backgroundDefault,
                  borderColor: selectedOccasions.includes(occasion)
                    ? colors.primary
                    : colors.border,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.chipText,
                  {
                    color: selectedOccasions.includes(occasion)
                      ? colors.buttonText
                      : colors.text,
                  },
                ]}
              >
                {occasion}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={({ pressed }) => [
          styles.saveButton,
          {
            backgroundColor: colors.primary,
            opacity: pressed || saving ? 0.8 : 1,
          },
        ]}
      >
        <ThemedText style={[styles.saveButtonText, { color: colors.buttonText }]}>
          {saving ? "Saving..." : "Save Item"}
        </ThemedText>
      </Pressable>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
  },
  imagePreview: {
    aspectRatio: 3 / 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: Spacing["2xl"],
  },
  image: {
    width: "100%",
    height: "100%",
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  scannerBar: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#E5C299",
  },
  scannerText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.xs,
    overflow: "hidden",
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    alignSelf: "flex-start",
    marginBottom: Spacing.lg,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  aiBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  saveButton: {
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
