import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { CabinetSize, CabinetDesign, CABINET_LIMITS } from "@/types/ClothingItem";

export default function CabinetCustomizerScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { cabinetPreferences, updateCabinetPreferences, items } = useWardrobe();

  const [selectedSize, setSelectedSize] = useState<CabinetSize>(cabinetPreferences.size);
  const [selectedDesign, setSelectedDesign] = useState<CabinetDesign>(cabinetPreferences.design);

  const sizes: { size: CabinetSize; label: string; desc: string }[] = [
    { size: "small", label: "SMALL COMPACT", desc: "Perfect starter size. Holds up to 6 items." },
    { size: "medium", label: "MEDIUM CABINET", desc: "Standard wardrobe capacity. Holds up to 15 items." },
    { size: "large", label: "LARGE WARDROBE", desc: "For styling enthusiasts. Holds up to 40 items." },
    { size: "walk-in", label: "WALK-IN CLOSET", desc: "Maximum capacity. Holds up to 150 items." },
  ];

  const designs: { design: CabinetDesign; label: string; primaryColor: string; bgColor: string }[] = [
    { design: "classic_wood", label: "Classic Oak Wood", primaryColor: "#8E7A65", bgColor: "#EBE3D5" },
    { design: "modern_obsidian", label: "Modern Obsidian Glass", primaryColor: "#434A59", bgColor: "#1F222B" },
    { design: "futuristic_neon", label: "Futuristic Cyber Neon", primaryColor: "#FF007F", bgColor: "#0B0E17" },
  ];

  const handleSave = async () => {
    const activeLimit = CABINET_LIMITS[selectedSize];
    if (items.length > activeLimit) {
      Alert.alert(
        "Invalid Size",
        `You currently have ${items.length} items in your closet. You cannot downgrade to ${selectedSize} (limit ${activeLimit} items) without removing some items first.`,
        [{ text: "OK" }]
      );
      return;
    }

    try {
      await updateCabinetPreferences({
        size: selectedSize,
        design: selectedDesign,
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error Saving", e.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundRoot }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            WARDROBE UPGRADES
          </ThemedText>
          <ThemedText style={[styles.headerTitle, { color: colors.text }]}>
            Closet Customizer
          </ThemedText>
          <ThemedText style={[styles.headerDesc, { color: colors.textSecondary }]}>
            Configure your virtual cabinet size to expand storage capacity, and change styling designs to match your aesthetic.
          </ThemedText>
        </View>

        {/* SECTION 1: CABINET SIZE */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            1. Select Cabinet Size
          </ThemedText>
          <View style={styles.cardsContainer}>
            {sizes.map((s) => {
              const active = selectedSize === s.size;
              const limit = CABINET_LIMITS[s.size];
              
              return (
                <Pressable
                  key={s.size}
                  onPress={() => setSelectedSize(s.size)}
                  style={[
                    styles.sizeCard,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: active ? colors.primary : colors.border,
                      borderWidth: active ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.cardHeaderRow}>
                    <ThemedText style={[styles.sizeLabel, { color: active ? colors.primary : colors.text }]}>
                      {s.label}
                    </ThemedText>
                    {active && <Feather name="check-circle" size={16} color={colors.primary} />}
                  </View>
                  <ThemedText style={[styles.sizeDesc, { color: colors.textSecondary }]}>
                    {s.desc}
                  </ThemedText>
                  <View style={[styles.limitBadge, { backgroundColor: active ? colors.primary : colors.border }]}>
                    <ThemedText style={[styles.limitBadgeText, { color: active ? colors.buttonText : colors.textSecondary }]}>
                      {limit} SLOTS
                    </ThemedText>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* SECTION 2: CABINET THEME DESIGN */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            2. Select Design Style
          </ThemedText>
          <View style={styles.cardsContainer}>
            {designs.map((d) => {
              const active = selectedDesign === d.design;
              
              return (
                <Pressable
                  key={d.design}
                  onPress={() => setSelectedDesign(d.design)}
                  style={[
                    styles.designCard,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: active ? colors.primary : colors.border,
                      borderWidth: active ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.designHeaderRow}>
                    <View style={styles.designSwatchRow}>
                      <View style={[styles.colorSwatch, { backgroundColor: d.bgColor, borderColor: d.primaryColor }]} />
                      <ThemedText style={[styles.designLabel, { color: colors.text }]}>
                        {d.label}
                      </ThemedText>
                    </View>
                    {active && <Feather name="check-circle" size={16} color={colors.primary} />}
                  </View>
                  
                  {/* Live Style Preview Card */}
                  <View style={[styles.livePreviewCard, { backgroundColor: d.bgColor, borderColor: d.primaryColor }]}>
                    <View style={[styles.previewBay, { borderRightWidth: 2, borderColor: d.primaryColor }]}>
                      <View style={[styles.previewShelf, { borderColor: d.primaryColor }]} />
                      <View style={styles.previewRod} />
                    </View>
                    <View style={styles.previewBay}>
                      <View style={[styles.previewShelf, { borderColor: d.primaryColor }]} />
                      <View style={[styles.previewShelf, { borderColor: d.primaryColor }]} />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* SAVE BUTTON */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Pressable
          onPress={handleSave}
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
        >
          <ThemedText style={[styles.saveButtonText, { color: colors.buttonText }]}>
            Apply Wardrobe Changes
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  headerBlock: {
    marginBottom: Spacing.xl,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: Spacing.xs,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  headerDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  cardsContainer: {
    gap: Spacing.md,
  },
  sizeCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  sizeLabel: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  sizeDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  limitBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  limitBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  designCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  designHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  designSwatchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  designLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  livePreviewCard: {
    height: 60,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    flexDirection: "row",
  },
  previewBay: {
    flex: 1,
    justifyContent: "space-between",
  },
  previewShelf: {
    height: 4,
    borderBottomWidth: 2,
    width: "100%",
  },
  previewRod: {
    height: 2,
    backgroundColor: "#ccc",
    width: "80%",
    alignSelf: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    borderTopWidth: 1,
    backgroundColor: "transparent",
  },
  saveButton: {
    height: 50,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
