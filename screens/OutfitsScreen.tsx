import React, { useState, useCallback, useRef, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { EmptyState } from "@/components/EmptyState";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { useTheme } from "@/hooks/useTheme";
import { ClothingItem } from "@/types/ClothingItem";
import { generateAIOutfits, AISuggestedOutfit } from "@/utils/aiClassifier";

const tabBarHeight = 49;

export default function OutfitsScreen() {
  const { colors } = useTheme();
  const { items } = useWardrobe();

  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestedOutfit[]>([]);
  const [statusMessage, setStatusMessage] = useState("Consulting fashion databases...");
  const [lastGeneratedCount, setLastGeneratedCount] = useState<number>(0);
  const [needsSync, setNeedsSync] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(15);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  useFocusEffect(
    useCallback(() => {
      // If the count of wardrobe items changed since we last generated, set needsSync to true
      if (items.length !== lastGeneratedCount) {
        setNeedsSync(true);
      } else {
        setNeedsSync(false);
      }
    }, [items, lastGeneratedCount])
  );

  const handleGenerateAIOutfits = async () => {
    const tops = items.filter((item) => item.category === "Tops");
    const bottoms = items.filter((item) => item.category === "Bottoms");

    if (tops.length === 0 || bottoms.length === 0) {
      Alert.alert(
        "Wardrobe Incomplete",
        "The AI Stylist needs at least one Top and one Bottom in your closet to suggest outfits.",
        [{ text: "OK" }]
      );
      return;
    }

    setLoading(true);
    setAiSuggestions([]);

    try {
      setStatusMessage("Reading closet items...");
      await sleep(650);
      setStatusMessage("Matching patterns and fabrics...");
      await sleep(650);
      setStatusMessage("Consulting Gemini AI designer...");
      
      const suggestions = await generateAIOutfits(items);
      setAiSuggestions(suggestions);
      setLastGeneratedCount(items.length);
      setNeedsSync(false);
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes("429")) {
        Alert.alert(
          "API Limit Reached",
          "You have reached your daily Google Gemini API quota (or requests per minute limit). Please try again in a few minutes.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Stylist Error", "Failed to generate outfit ideas: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const validSuggestions = Array.isArray(aiSuggestions)
    ? aiSuggestions.filter((suggestion) => {
        const outfitItems = suggestion.itemIds
          .map((id) => items.find((i) => String(i.id) === String(id)))
          .filter((i): i is ClothingItem => !!i);
        return outfitItems.length >= 2;
      })
    : [];

  const renderSuggestedOutfitCard = (suggestion: AISuggestedOutfit, index: number) => {
    // Resolve item objects from their IDs
    const outfitItems = suggestion.itemIds
      .map((id) => items.find((i) => String(i.id) === String(id)))
      .filter((i): i is ClothingItem => !!i);

    // If the outfit doesn't contain at least 2 items, skip rendering
    if (outfitItems.length < 2) return null;

    return (
      <View
        key={index}
        style={[
          styles.suggestionCard,
          {
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          },
        ]}
      >
        <ThemedText style={[styles.suggestionName, { color: colors.text }]}>
          {suggestion.name}
        </ThemedText>

        {/* Dynamic Side-by-Side Thumbnails */}
        <View style={styles.thumbnailRow}>
          {outfitItems.map((item) => (
            <View key={item.id} style={[styles.thumbnailWrapper, { borderColor: colors.border }]}>
              <Image source={{ uri: item.imageUri }} style={styles.thumbnailImage} contentFit="cover" />
              <View style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.categoryBadgeText}>
                  {item.category.slice(0, -1)}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        <ThemedText style={[styles.suggestionReasoning, { color: colors.textSecondary }]}>
          {suggestion.reasoning}
        </ThemedText>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundRoot }]}>
      {/* HEADER BLOCK */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + Spacing.sm }]}>
        <ThemedText style={[styles.headerTitleText, { color: colors.text }]}>AI Stylist</ThemedText>
      </View>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: tabBarHeight + Spacing.xl + 70,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {needsSync && !loading && (
            <View style={[styles.syncBanner, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "33" }]}>
              <Feather name="refresh-cw" size={14} color={colors.primary} style={{ marginRight: 6 }} />
              <ThemedText style={[styles.syncBannerText, { color: colors.text }]}>
                New items detected in your wardrobe!
              </ThemedText>
              <Pressable
                onPress={handleGenerateAIOutfits}
                style={[styles.syncBannerBtn, { backgroundColor: colors.primary }]}
              >
                <ThemedText style={[styles.syncBannerBtnText, { color: colors.buttonText }]}>
                  Sync Now
                </ThemedText>
              </Pressable>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <ThemedText style={[styles.loadingText, { color: colors.text }]}>
                {statusMessage}
              </ThemedText>
            </View>
          ) : validSuggestions.length > 0 ? (
            <View style={styles.suggestionsContainer}>
              <View style={styles.aiHeaderBlock}>
                <ThemedText style={[styles.aiHeaderTitle, { color: colors.text }]}>
                  AI Recommended Fits
                </ThemedText>
                <ThemedText style={[styles.aiHeaderDesc, { color: colors.textSecondary }]}>
                  Below are combinations curated by Gemini using your actual closet items.
                </ThemedText>
              </View>
              {validSuggestions.map((s, index) => renderSuggestedOutfitCard(s, index))}
              
              <Pressable
                onPress={handleGenerateAIOutfits}
                style={[styles.regenerateButton, { borderColor: colors.border }]}
              >
                <Feather name="refresh-cw" size={14} color={colors.text} style={{ marginRight: 6 }} />
                <ThemedText style={[styles.regenerateBtnText, { color: colors.text }]}>
                  Generate New Combinations
                </ThemedText>
              </Pressable>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <EmptyState
                image={require("@/assets/images/empty-outfits.png")}
                title="Gemini AI Stylist"
                message="Let artificial intelligence analyze the colors, categories, and patterns of your closet items to generate curated, stylish fits."
                actionLabel={items.length > 0 ? "Generate Outfits" : "Add clothes to start"}
                onActionPress={items.length > 0 ? handleGenerateAIOutfits : undefined}
              />
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    marginBottom: Spacing.md,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: "800",
    marginVertical: Spacing.sm,
  },
  tabSwitcher: {
    flexDirection: "row",
    height: 48,
    alignItems: "center",
  },
  tabBtn: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  emptyContainer: {
    paddingTop: Spacing.xl,
  },
  loadingContainer: {
    paddingVertical: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
    fontWeight: "600",
  },
  suggestionsContainer: {
    gap: Spacing.lg,
  },
  aiHeaderBlock: {
    marginVertical: Spacing.xs,
  },
  aiHeaderTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  aiHeaderDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  suggestionCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  thumbnailRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  thumbnailWrapper: {
    position: "relative",
    width: 60,
    height: 80,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    overflow: "hidden",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  categoryBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 1.5,
    alignItems: "center",
  },
  categoryBadgeText: {
    fontSize: 7,
    color: "#FFF",
    fontWeight: "800",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  suggestionReasoning: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  saveButton: {
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  regenerateButton: {
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: Spacing.xs,
  },
  regenerateBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  syncBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  syncBannerText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  syncBannerBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.xs,
  },
  syncBannerBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
