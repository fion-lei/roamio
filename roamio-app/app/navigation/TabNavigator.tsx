// Botttom tab navigation
// Reference: https://reactnavigation.org/docs/bottom-tab-navigator/

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Trip from "../(tabs)/Trip";
import { FontAwesome } from "@expo/vector-icons";
import FriendsStackNavigator from "../navigation/FriendsStackNavigator"; 
import Itinerary from "../(tabs)/Itinerary"

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
      {/* <Tab.Screen
        name="Itinerary"
        component={Itinerary}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="calendar" color={color} size={size} />
          ),
        }}
      /> */}
      <Tab.Screen
        name="Friends"
        component={FriendsStackNavigator}
        options={{ headerShown: false }} // Hides the hot pink bar
      />

    </Tab.Navigator>
  );
}
