import React from "react";
import { View, Text, Image, StyleSheet, Pressable, SafeAreaView } from "react-native";
import { Colors } from "@/constants/Colors"; // Ensure Colors file exists

export default function Intro() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Logo Container */}
      <View style={styles.logoContainer}>
        <Image 
          source={require("../assets/images/1.png")} 
          style={styles.logo} 
        />
      </View>

      {/* Separator Line */}
      <View style={styles.separator} />

      {/* Title & Subtitle */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Get started!</Text>
        <Text style={styles.subtitle}>Start your stress-free travel journey!</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable style={styles.signUpButton}>
          <Text style={styles.buttonText}>Sign up</Text>
        </Pressable>
        <Pressable style={styles.loginButton}>
          <Text style={styles.loginText}>Log in ⌄</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,  
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: "100%",  
    height: 500,  
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "90%",  
    height: "90%",
    resizeMode: "contain",
  },
  separator: {
    width: "50%",  // 🔥 Adjust width as needed
    height: 2, // 🔥 Controls line thickness
    backgroundColor: Colors.coral, // 🔥 Line color matches theme
    marginVertical: 20, // 🔥 Spacing between logo & text
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 25,
    fontFamily: "quicksand-bold",
    textAlign: "center",
    color: Colors.coral,
  },
  subtitle: {
    fontFamily: "quicksand-semibold",
    fontSize: 17,
    textAlign: "center",
    color: Colors.grey,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 30,
    justifyContent: "space-between",
    width: "80%",
  },
  signUpButton: {
    backgroundColor: Colors.coral,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginRight: 10,
  },
  loginButton: {
    borderWidth: 2,
    borderColor: Colors.coral,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: "quicksand-semibold",
  },
  loginText: {
    color: Colors.coral,
    fontSize: 18,
    fontFamily: "quicksand-semibold",
  },
});
