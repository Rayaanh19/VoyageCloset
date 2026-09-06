import { ThemedText } from "@/components/ThemedText";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
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

  const preparePersistentImage = async (uri: string): Promise<string> => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 600 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      if (manipResult.base64) {
        return `data:image/jpeg;base64,${manipResult.base64}`;
      }
    } catch (error) {
      console.warn("Failed to compress image into Base64 data URL:", error);
    }
    return uri;
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
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const originalUri = result.assets[0].uri;
      const finalUri = await preparePersistentImage(originalUri);

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
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const originalUri = result.assets[0].uri;
      const finalUri = await preparePersistentImage(originalUri);

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
