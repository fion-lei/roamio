// Botttom tab navigation
// Reference: https://reactnavigation.org/docs/bottom-tab-navigator/

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Trip from "../(tabs)/Trip";
import Friends from "../(tabs)/Friends";
import { FontAwesome } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "white", height: 60 },
        tabBarActiveTintColor: "#FF6F61",
      }}
    >
      <Tab.Screen
        name="Home"
        component={Trip}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Friends}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
