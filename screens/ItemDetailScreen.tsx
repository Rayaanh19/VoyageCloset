import { View, StyleSheet, Pressable, Alert } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { WardrobeStackParamList } from "@/navigation/WardrobeStackNavigator";
import { useWardrobe } from "@/contexts/WardrobeContext";

type NavigationProp = NativeStackNavigationProp<WardrobeStackParamList>;
type ScreenRouteProp = RouteProp<WardrobeStackParamList, "ItemDetail">;

export default function ItemDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { items, deleteItem } = useWardrobe();

  const item = items.find((i) => i.id === route.params.itemId);

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundRoot }]}>
        <ThemedText>Item not found</ThemedText>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteItem(item.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScreenScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.imageUri }} style={styles.image} contentFit="cover" />
      </View>

      {item.name ? (
        <ThemedText style={styles.itemName}>{item.name}</ThemedText>
      ) : null}

      <View style={[styles.card, { backgroundColor: colors.backgroundDefault, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>CATEGORY</ThemedText>
        <ThemedText style={styles.cardValue}>{item.category}</ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: colors.backgroundDefault, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>SEASONS</ThemedText>
        <View style={styles.tagsContainer}>
          {item.seasons.map((season) => (
            <View
              key={season}
              style={[styles.tag, { backgroundColor: colors.primary + "1A" }]}
            >
              <ThemedText style={[styles.tagText, { color: colors.primary }]}>
                {season}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      {item.colors.length > 0 ? (
        <View style={[styles.card, { backgroundColor: colors.backgroundDefault, borderColor: colors.border }]}>
          <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>COLORS</ThemedText>
          <View style={styles.tagsContainer}>
            {item.colors.map((color) => (
              <View
                key={color}
                style={[styles.tag, { backgroundColor: colors.secondary + "1A" }]}
              >
                <ThemedText style={[styles.tagText, { color: colors.secondary }]}>
                  {color}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={[styles.card, { backgroundColor: colors.backgroundDefault, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>OCCASIONS</ThemedText>
        <View style={styles.tagsContainer}>
          {item.occasions.map((occasion) => (
            <View
              key={occasion}
              style={[styles.tag, { backgroundColor: colors.primary + "1A" }]}
            >
              <ThemedText style={[styles.tagText, { color: colors.primary }]}>
                {occasion}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.backgroundDefault, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>DATE ADDED</ThemedText>
        <ThemedText style={styles.cardValue}>
          {new Date(item.dateAdded).toLocaleDateString()}
        </ThemedText>
      </View>

      <Pressable
        onPress={handleDelete}
        style={({ pressed }) => [
          styles.deleteButton,
          {
            borderColor: colors.error,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <ThemedText style={[styles.deleteButtonText, { color: colors.error }]}>
          Delete Item
        </ThemedText>
      </Pressable>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  itemName: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: Spacing.lg,
  },
  card: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.lg,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  deleteButton: {
    height: 48,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
