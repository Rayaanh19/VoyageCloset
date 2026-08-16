import React from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";

import RootStackNavigator from "@/navigation/RootStackNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WardrobeProvider } from "@/contexts/WardrobeContext";

import { useEffect } from "react";

// Prevent the native splash screen from auto-hiding on mount
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore */
});

export default function App() {
  useEffect(() => {
    // Hide splash screen after a short delay (2 seconds)
    const splashTimer = setTimeout(async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        // ignore
      }
    }, 2000);

    // If Gemini is active, we do not need to warm up the Salesforce BLIP model
    if (process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim()) {
      console.log("AURA Gemini AI mode active. Skipping Salesforce BLIP warm-up.");
      return () => clearTimeout(splashTimer);
    }

    // Only attempt to warm up the cloud model if a token is configured
    if (!process.env.EXPO_PUBLIC_HF_TOKEN) {
      console.log("AURA Salesforce BLIP model warm-up skipped (EXPO_PUBLIC_HF_TOKEN is not set). Using offline mode.");
      return () => clearTimeout(splashTimer);
    }

    // Trigger background warm-up for Salesforce BLIP model to eliminate cold starts
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.EXPO_PUBLIC_HF_TOKEN}`,
    };

    fetch(
      "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
      {
        method: "POST",
        body: JSON.stringify({ inputs: "warmup" }),
        headers,
      }
    )
      .then(() => console.log("AURA Salesforce BLIP model warm-up triggered."))
      .catch((err) => console.log("Background AURA model warm-up status (offline/timed out):", err.message));

    return () => clearTimeout(splashTimer);
  }, []);

  return (
  <ErrorBoundary>
    <SafeAreaProvider>
        <GestureHandlerRootView style={styles.root}>
          <KeyboardProvider>
            <WardrobeProvider>
              <NavigationContainer>
                <RootStackNavigator />
              </NavigationContainer>
              <StatusBar style="auto" />
            </WardrobeProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
  </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
