import { Alert as RNAlert, Platform } from "react-native";

/**
 * Custom alert handler that polyfills React Native Web's Alert.alert
 * which natively ignores button onPress callbacks.
 */
export function setupWebAlertPolyfill() {
  if (Platform.OS === "web") {
    RNAlert.alert = (title?: string, message?: string, buttons?: any[], options?: any) => {
      const displayTitle = title || "";
      const displayMessage = message || "";
      const fullMessage = [displayTitle, displayMessage].filter(Boolean).join("\n\n");

      if (!buttons || buttons.length === 0) {
        window.alert(fullMessage);
        return;
      }

      if (buttons.length === 1) {
        window.alert(fullMessage);
        if (typeof buttons[0].onPress === "function") {
          buttons[0].onPress();
        }
        return;
      }

      // For multiple buttons (e.g. Cancel vs Reset / Delete)
      const cancelBtn = buttons.find((b) => b.style === "cancel");
      const confirmBtn = buttons.find((b) => b.style !== "cancel") || buttons[buttons.length - 1];

      const confirmed = window.confirm(fullMessage);
      if (confirmed) {
        if (typeof confirmBtn?.onPress === "function") {
          confirmBtn.onPress();
        }
      } else {
        if (typeof cancelBtn?.onPress === "function") {
          cancelBtn.onPress();
        }
      }
    };
  }
}

// Run polyfill setup immediately upon import
setupWebAlertPolyfill();
