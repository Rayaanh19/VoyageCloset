import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OutfitsScreen from "@/screens/OutfitsScreen";
import { useCommonScreenOptions } from "@/navigation/screenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";

export type OutfitsStackParamList = {
  Outfits: undefined;
};

const Stack = createNativeStackNavigator<OutfitsStackParamList>();

export default function OutfitsStackNavigator() {
  const screenOptions = useCommonScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Outfits"
        component={OutfitsScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
