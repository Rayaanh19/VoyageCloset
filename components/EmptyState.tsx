import { View, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface EmptyStateProps {
  image: any;
  title: string;
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function EmptyState({
  image,
  title,
  message,
  actionLabel,
  onActionPress,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Image source={image} style={styles.image} contentFit="contain" />
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </ThemedText>
      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <ThemedText style={[styles.buttonText, { color: colors.buttonText }]}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["3xl"],
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: Spacing["2xl"],
    opacity: 0.6,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: Spacing["3xl"],
    borderRadius: BorderRadius.sm,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
