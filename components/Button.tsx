import { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: boolean;
  loading?: boolean;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const getVariantStyles = (
  variant: ButtonVariant,
  theme: any,
  disabled: boolean,
): ViewStyle => {
  const base: ViewStyle = {
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    opacity: disabled ? 0.5 : 1,
  };

  switch (variant) {
    case "secondary":
      return {
        ...base,
        backgroundColor: theme.backgroundSecondary,
        borderWidth: 1,
        borderColor: theme.border,
      };
    case "outline":
      return {
        ...base,
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: theme.link,
      };
    case "ghost":
      return {
        ...base,
        backgroundColor: "transparent",
      };
    case "primary":
    default:
      return {
        ...base,
        backgroundColor: theme.link,
      };
  }
};

const getSizeStyles = (size: ButtonSize): ViewStyle => {
  switch (size) {
    case "sm":
      return {
        height: Spacing.buttonHeight - 8,
        paddingHorizontal: Spacing.lg,
      };
    case "lg":
      return {
        height: Spacing.buttonHeight + 8,
        paddingHorizontal: Spacing["3xl"],
      };
    case "md":
    default:
      return {
        height: Spacing.buttonHeight,
        paddingHorizontal: Spacing["2xl"],
      };
  }
};

export function Button({
  onPress,
  children,
  style,
  disabled = false,
  variant = "primary",
  size = "md",
  icon,
  iconRight = false,
  loading = false,
}: ButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.98, springConfig);
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, springConfig);
    }
  };

  return (
    <AnimatedPressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.button,
        getVariantStyles(variant, theme, disabled || loading),
        getSizeStyles(size),
        animatedStyle,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={theme.buttonText} />
        ) : (
          <>
            {!iconRight && icon ? <View style={styles.icon}>{icon}</View> : null}
            <ThemedText
              type="body"
              style={[styles.buttonText, { color: theme.buttonText }]}
            >
              {children}
            </ThemedText>
            {iconRight && icon ? <View style={styles.icon}>{icon}</View> : null}
          </>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "600",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
});
