import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WardrobeScreen from "@/screens/WardrobeScreen";
import ItemDetailScreen from "@/screens/ItemDetailScreen";
import { useCommonScreenOptions } from "@/navigation/screenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";

export type WardrobeStackParamList = {
  Wardrobe: undefined;
  ItemDetail: { itemId: string };
};

const Stack = createNativeStackNavigator<WardrobeStackParamList>();

export default function WardrobeStackNavigator() {
  const screenOptions = useCommonScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Wardrobe"
        component={WardrobeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ItemDetail"
        component={ItemDetailScreen}
        options={{
          title: "Item Details",
          presentation: "card",
        }}
      />
    </Stack.Navigator>
  );
}
