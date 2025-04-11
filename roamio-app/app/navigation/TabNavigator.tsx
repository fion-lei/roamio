// Botttom tab navigation
// Reference: https://reactnavigation.org/docs/bottom-tab-navigator/

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Discover from "../(tabs)/Discover";
import { FontAwesome } from "@expo/vector-icons";
// import FriendsStackNavigator from "../navigation/FriendsStackNavigator";
import Itinerary from "../(tabs)/Itinerary";
import Friends from "../(tabs)/Friends";

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
        name="Discover"
        component={Discover}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="map" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Itinerary"
        component={Itinerary}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Friends"
        component={Friends}
        options={{
          title: "Friends",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="users" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
