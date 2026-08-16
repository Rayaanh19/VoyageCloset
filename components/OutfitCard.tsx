import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Outfit, ClothingItem } from "@/types/ClothingItem";

interface OutfitCardProps {
  outfit: Outfit;
  items: ClothingItem[];
}

export function OutfitCard({ outfit, items }: OutfitCardProps) {
  const { colors } = useTheme();

  const outfitItems = items.filter((item) => 
    outfit.items.map(String).includes(String(item.id))
  );

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.backgroundDefault, borderColor: colors.border },
      ]}
    >
      <ThemedText style={[styles.outfitName, { color: colors.text }]}>{outfit.name.toUpperCase()}</ThemedText>

      <View style={styles.itemsContainer}>
        {outfitItems.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.itemThumbnail,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.backgroundDefault,
                marginLeft: index === 0 ? 0 : -20,
                zIndex: outfitItems.length - index,
              },
            ]}
          >
            <Image source={{ uri: item.imageUri }} style={styles.itemImage} contentFit="cover" />
          </View>
        ))}
      </View>

      <ThemedText style={[styles.reasoning, { color: colors.textSecondary }]}>
        {outfit.reasoning}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  outfitName: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  itemsContainer: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  itemThumbnail: {
    width: 75,
    height: 100,
    borderRadius: BorderRadius.xs,
    borderWidth: 2,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  reasoning: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
});
