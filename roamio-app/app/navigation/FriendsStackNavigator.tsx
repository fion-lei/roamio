import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FriendsScreen from "../screens/friends";
import DetailScreen from "../screens/friends-details";

const Stack = createNativeStackNavigator();

export default function FriendsStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FriendsScreen"
        component={FriendsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
