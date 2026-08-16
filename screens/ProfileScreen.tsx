import React from "react";
import { Alert, Pressable, StyleSheet, View, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { useTheme } from "@/hooks/useTheme";

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { items, outfits, deleteItem, updateItem } = useWardrobe();
  const [cleaning, setCleaning] = React.useState(false);
  const insets = useSafeAreaInsets();

  // Dynamically calculate the user's most added category
  const getFavoriteCategory = (): string => {
    if (items.length === 0) return "Empty Closet";
    const counts = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    return topCategory ?? "None";
  };

  const handleResetCloset = () => {
    if (items.length === 0) {
      Alert.alert("Closet Empty", "You don't have any items to reset.");
      return;
    }

    Alert.alert(
      "Reset Closet",
      "Are you sure you want to delete all clothing items? This action is irreversible.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete each item using context
              for (const item of items) {
                await deleteItem(item.id);
              }
              Alert.alert("Success", "Your virtual closet has been reset.");
            } catch (err) {
              Alert.alert("Error", "Failed to reset closet.");
            }
          },
        },
      ]
    );
  };

  const handleMigrateBackgrounds = async () => {
    const removeBgKey = process.env.EXPO_PUBLIC_REMOVE_BG_API_KEY?.trim();
    if (!removeBgKey) {
      Alert.alert(
        "Restart Required",
        "Please stop your Expo server (Ctrl + C) and run 'npm start -- --clear' (or 'npx expo start -c') to load the new API key."
      );
      return;
    }

    const itemsToMigrate = items.filter(
      (item) => item.imageUri && !item.imageUri.includes("_transparent.png")
    );

    if (itemsToMigrate.length === 0) {
      Alert.alert("Closet Clean", "All clothes in your cabinet already have transparent backgrounds!");
      return;
    }

    setCleaning(true);
    let successCount = 0;

    const { removeBackground } = require("@/utils/aiClassifier");

    for (const item of itemsToMigrate) {
      try {
        console.log(`[MANUAL MIGRATION] Removing background for item: ${item.name || item.id}`);
        const transparentUri = await removeBackground(item.imageUri);
        if (transparentUri) {
          await updateItem({ ...item, imageUri: transparentUri });
          successCount++;
        }
      } catch (err) {
        console.error(`[MANUAL MIGRATION] Failed for ${item.id}:`, err);
      }
    }

    setCleaning(false);
    Alert.alert(
      "Process Complete",
      `Successfully removed background from ${successCount} clothes items!`
    );
  };

  return (
    <ScreenScrollView
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + Spacing.md },
      ]}
    >
      {/* Header Title Block */}
      <View style={styles.headerBlock}>
        <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          USER PORTAL
        </ThemedText>
        <ThemedText style={[styles.headerTitle, { color: colors.text }]}>
          My Profile
        </ThemedText>
      </View>

      {/* Stylized Avatar Card */}
      <View style={styles.profileHeaderCard}>
        <View
          style={[
            styles.avatarContainer,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <Feather name="user" size={32} color={colors.secondary} />
        </View>
        <ThemedText style={[styles.userName, { color: colors.text }]}>
          Rayan H.
        </ThemedText>
        <ThemedText style={[styles.userBio, { color: colors.textSecondary }]}>
          Style Curator • Joined July 2026
        </ThemedText>
      </View>

      {/* Wardrobe Insight Stats Card */}
      <View
        style={[
          styles.statsCard,
          {
            backgroundColor: colors.backgroundDefault,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.statColumn}>
          <ThemedText style={[styles.statValue, { color: colors.text }]}>
            {items.length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
            PIECES
          </ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statColumn}>
          <ThemedText
            style={[styles.statValue, { color: colors.text, fontSize: 14, height: 33, lineHeight: 33 }]}
            numberOfLines={1}
          >
            {getFavoriteCategory()}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
            CORE TYPE
          </ThemedText>
        </View>
      </View>

      {/* Settings Options Section */}
      <View style={styles.menuSection}>
        <ThemedText style={[styles.menuSectionHeader, { color: colors.textSecondary }]}>
          CLOSET PREFERENCES
        </ThemedText>

        <Pressable
          onPress={() => {
            Alert.alert(
              "About VoyageCloset",
              "VoyageCloset is a luxury AI-powered personal stylist and travel suitcase packaging assistant. Seamlessly organize your wardrobe and get custom-tailored packing lists for any trip destination worldwide.",
              [{ text: "Awesome" }]
            );
          }}
          style={({ pressed }) => [
            styles.menuItem,
            {
              backgroundColor: colors.backgroundDefault,
              borderColor: colors.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Feather name="info" size={16} color={colors.text} />
          <ThemedText style={[styles.menuItemText, { color: colors.text }]}>
            About VoyageCloset
          </ThemedText>
          <Feather name="chevron-right" size={16} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          onPress={handleMigrateBackgrounds}
          disabled={cleaning}
          style={({ pressed }) => [
            styles.menuItem,
            {
              backgroundColor: colors.backgroundDefault,
              borderColor: colors.border,
              opacity: (pressed || cleaning) ? 0.85 : 1,
              marginTop: Spacing.md,
            },
          ]}
        >
          {cleaning ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 6 }} />
          ) : (
            <Feather name="image" size={16} color={colors.primary} />
          )}
          <ThemedText style={[styles.menuItemText, { color: colors.text }]}>
            {cleaning ? "Removing backgrounds..." : "Clean Closet Backgrounds"}
          </ThemedText>
          <Feather name="chevron-right" size={16} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          onPress={handleResetCloset}
          style={({ pressed }) => [
            styles.menuItem,
            {
              backgroundColor: colors.backgroundDefault,
              borderColor: colors.border,
              opacity: pressed ? 0.85 : 1,
              marginTop: Spacing.md,
            },
          ]}
        >
          <Feather name="trash-2" size={16} color={colors.error} />
          <ThemedText style={[styles.menuItemText, { color: colors.error }]}>
            Reset Closet Items
          </ThemedText>
          <Feather name="chevron-right" size={16} color={colors.error} />
        </Pressable>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing["4xl"],
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
  },
  profileHeaderCard: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  userBio: {
    fontSize: 13,
    fontWeight: "500",
  },
  statsCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  statColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  statDivider: {
    width: 1,
    height: "80%",
    alignSelf: "center",
  },
  menuSection: {
    width: "100%",
  },
  menuSectionHeader: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.md,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
});
