import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";

export default function Settings() {
  const router = useRouter();

  // Handle the sign-out action
  const handleSignOut = async () => {
    try {
      router.replace("../Intro"); 
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      {/* Emergency Information Option */}
      <Pressable
        style={styles.option}
        onPress={() => router.push("./EmergencyInfo")}
      >
        <Text style={styles.optionText}>Emergency Information</Text>
      </Pressable>

      {/* Help & FAQs Option */}
      <Pressable
        style={styles.option}
        onPress={() => router.push("./HelpFAQ")}
      >
        <Text style={styles.optionText}>Help & FAQs</Text>
      </Pressable>

      {/* Sign Out Option placed at the bottom */}
      <Pressable style={[styles.signOutButton, { marginTop: "auto" }]} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: Colors.white, 
    paddingHorizontal: 16, 
  },
  title: {
    fontSize: 28,
    fontFamily: "quicksand-bold",
    marginBottom: 30,
    textAlign: "center",
  },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 10,
  },
  optionText: {
    fontSize: 18,
    color: "#333",
    fontFamily: "quicksand-semibold",
  },
  signOutButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  signOutButtonText: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "quicksand-bold",
  },
});
