import { Platform } from "react-native";

const primaryColor = "#1A1A1A";
const secondaryColor = "#8E7A65";

export const Colors = {
  light: {
    primary: primaryColor,
    secondary: secondaryColor,
    text: "#1A1A1A",
    textSecondary: "#7C7A77",
    buttonText: "#FFFFFF",
    tabIconDefault: "#A3A19D",
    tabIconSelected: primaryColor,
    link: primaryColor,
    border: "#EBE8E3",
    error: "#D9383A",
    success: "#2D8A5E",
    backgroundRoot: "#FAF9F6",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F4F2EE",
    backgroundTertiary: "#EBE8E3",
  },
  dark: {
    primary: "#FAF9F6",
    secondary: "#B8A38E",
    text: "#FAF9F6",
    textSecondary: "#A8A6A2",
    buttonText: "#1A1A1A",
    tabIconDefault: "#5E5C58",
    tabIconSelected: "#FAF9F6",
    link: "#FAF9F6",
    border: "#2E2E2C",
    error: "#E05C5E",
    success: "#4DB380",
    backgroundRoot: "#0F0F0F",
    backgroundDefault: "#1A1A1A",
    backgroundSecondary: "#242422",
    backgroundTertiary: "#2E2E2C",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  body: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  label: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
