import { ThemedText } from "@/components/ThemedText";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { CABINET_LIMITS } from "@/types/ClothingItem";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, "AddItemModal">;

export default function AddItemModal() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { items, cabinetPreferences } = useWardrobe();

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Camera Permission",
        "Please allow camera access in settings to capture photos of your clothing items."
      );
      return false;
    }
    return true;
  };

  const getPersistentDirectory = () => {
    try {
      const { Paths } = require("expo-file-system");
      if (Paths && Paths.document && Paths.document.uri) {
        const base = Paths.document.uri;
        return base.endsWith("/") ? base : `${base}/`;
      }
    } catch (e) {
      console.warn("Paths API not available, falling back to legacy documentDirectory", e);
    }

    const dir = (FileSystem as any).documentDirectory as string | null | undefined;
    if (!dir) {
      throw new Error("No persistent file directory available");
    }
    return dir;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Photo Library Permission",
        "Please allow photo library access in settings to select images of your clothing items."
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const limit = CABINET_LIMITS[cabinetPreferences.size];
    if (items.length >= limit) {
      Alert.alert(
        "Cabinet Limit Reached",
        `Your ${cabinetPreferences.size} cabinet is currently full (${items.length}/${limit} slots). Please upgrade your cabinet space to store more items.`,
        [
          {
            text: "Upgrade Cabinet",
            onPress: () => {
              navigation.replace("CabinetCustomizer" as any);
            },
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
      return;
    }

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.3,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const originalUri = result.assets[0].uri;
      let finalUri = originalUri;

      try {
        const pickedAsset = result.assets[0];
        const filename =
          pickedAsset.fileName ||
          originalUri.split("/").pop() ||
          `item-${Date.now()}.jpg`;
        const destUri = getPersistentDirectory() + filename;
        await FileSystem.copyAsync({ from: originalUri, to: destUri });
        finalUri = destUri;
      } catch (error) {
        console.error("Failed to persist image", error);
        Alert.alert(
          "Image Error",
          "Could not save the image to storage, but you can still continue.",
        );
      }

      navigation.replace("ItemDetailsForm", {
        imageUri: finalUri,
        initialCategory: route.params?.initialCategory,
      });
    }
  };

  const handleChooseFromGallery = async () => {
    const limit = CABINET_LIMITS[cabinetPreferences.size];
    if (items.length >= limit) {
      Alert.alert(
        "Cabinet Limit Reached",
        `Your ${cabinetPreferences.size} cabinet is currently full (${items.length}/${limit} slots). Please upgrade your cabinet space to store more items.`,
        [
          {
            text: "Upgrade Cabinet",
            onPress: () => {
              navigation.replace("CabinetCustomizer" as any);
            },
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
      return;
    }

    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.3,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const originalUri = result.assets[0].uri;
      let finalUri = originalUri;

      try {
        const pickedAsset = result.assets[0];
        const filename =
          pickedAsset.fileName ||
          originalUri.split("/").pop() ||
          `item-${Date.now()}.jpg`;
        const destUri = getPersistentDirectory() + filename;
        await FileSystem.copyAsync({ from: originalUri, to: destUri });
        finalUri = destUri;
      } catch (error) {
        console.error("Failed to persist image", error);
        Alert.alert(
          "Image Error",
          "Could not save the image to storage, but you can still continue.",
        );
      }

      navigation.replace("ItemDetailsForm", {
        imageUri: finalUri,
        initialCategory: route.params?.initialCategory,
      });
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundRoot,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <Pressable
        onPress={handleTakePhoto}
        style={({ pressed }) => [
          styles.actionCard,
          {
            backgroundColor: colors.backgroundDefault,
            borderColor: colors.border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + "1A" }]}>
          <Feather name="camera" size={32} color={colors.primary} />
        </View>
        <ThemedText style={styles.actionTitle}>Take Photo</ThemedText>
        <ThemedText style={[styles.actionDescription, { color: colors.textSecondary }]}>
          Capture a new photo of your clothing item
        </ThemedText>
      </Pressable>

      <Pressable
        onPress={handleChooseFromGallery}
        style={({ pressed }) => [
          styles.actionCard,
          {
            backgroundColor: colors.backgroundDefault,
            borderColor: colors.border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: colors.secondary + "1A" }]}>
          <Feather name="image" size={32} color={colors.secondary} />
        </View>
        <ThemedText style={styles.actionTitle}>Choose from Gallery</ThemedText>
        <ThemedText style={[styles.actionDescription, { color: colors.textSecondary }]}>
          Select an existing photo from your library
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing["2xl"],
    gap: Spacing.lg,
  },
  actionCard: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing["3xl"],
    alignItems: "center",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  actionDescription: {
    fontSize: 14,
    textAlign: "center",
  },
});
