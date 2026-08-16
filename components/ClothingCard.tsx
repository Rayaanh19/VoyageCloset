import { ThemedText } from "@/components/ThemedText";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { ClothingItem } from "@/types/ClothingItem";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ClothingCardProps {
  item: ClothingItem;
  onPress: () => void;
}

export function ClothingCard({ item, onPress }: ClothingCardProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.card, animatedStyle]}
    >
      <View
        style={[
          styles.imageContainer,
          { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
        ]}
      >
        <Image source={{ uri: item.imageUri }} style={styles.image} contentFit="cover" />
      </View>
      <View style={styles.categoryTag}>
        <ThemedText
          style={[
            styles.categoryText,
            {
              backgroundColor: colors.backgroundDefault,
              color: colors.text,
              borderColor: colors.border,
              borderWidth: 1,
            },
          ]}
        >
          {item.category.toUpperCase()}
        </ThemedText>
      </View>
      {item.name ? (
        <ThemedText style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </ThemedText>
      ) : (
        <ThemedText style={[styles.itemName, { color: colors.textSecondary, fontStyle: "italic" }]} numberOfLines={1}>
          Unnamed {item.category}
        </ThemedText>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  imageContainer: {
    aspectRatio: 3 / 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  categoryTag: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
  },
  categoryText: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.xs,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  itemName: {
    marginTop: Spacing.xs,
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
});
