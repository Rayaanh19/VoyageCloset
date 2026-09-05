import { useTheme } from "@/hooks/useTheme";
import TravelPackStackNavigator from "@/navigation/TravelPackStackNavigator";
import OutfitsStackNavigator from "@/navigation/OutfitsStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import WardrobeStackNavigator from "@/navigation/WardrobeStackNavigator";
import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleSheet } from "react-native";

export type MainTabParamList = {
  WardrobeTab: undefined;
  OutfitsTab: undefined;
  TravelTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="WardrobeTab"
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.OS === "ios" ? "transparent" : theme.backgroundRoot,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="WardrobeTab"
        component={WardrobeStackNavigator}
        options={{
          title: "Wardrobe",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="OutfitsTab"
        component={OutfitsStackNavigator}
        options={{
          title: "Outfits",
          tabBarIcon: ({ color, size }) => (
            <Feather name="star" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TravelTab"
        component={TravelPackStackNavigator}
        options={{
          title: "Travel Pack",
          tabBarIcon: ({ color, size }) => (
            <Feather name="briefcase" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
