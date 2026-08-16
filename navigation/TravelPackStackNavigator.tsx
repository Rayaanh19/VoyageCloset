import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TravelPackScreen from "@/screens/TravelPackScreen";
import ItemDetailScreen from "@/screens/ItemDetailScreen";
import { useCommonScreenOptions } from "@/navigation/screenOptions";

export type TravelPackStackParamList = {
  TravelPack: undefined;
  ItemDetail: { itemId: string };
};

const Stack = createNativeStackNavigator<TravelPackStackParamList>();

export default function TravelPackStackNavigator() {
  const screenOptions = useCommonScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="TravelPack"
        component={TravelPackScreen}
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
