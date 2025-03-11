import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "@/constants/Colors"; // Make sure Colors file exists

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏠 Welcome to Home</Text>
      
      <Pressable 
        style={styles.button} 
        onPress={() => navigation.navigate("Profile")}
      >
        <Text style={styles.buttonText}>Go to Profile</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.coral,
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.coral,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
