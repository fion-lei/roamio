import React from "react";
import { View, Text, Image, StyleSheet, Pressable, SafeAreaView } from "react-native";
import { Colors } from "@/constants/Colors"; // Ensure Colors file exists
import { useRouter } from "expo-router"; 

export default function Intro() {
  const router = useRouter(); // ✅ Get router instance for navigation

  return (
    
    <SafeAreaView style={styles.container}>
      {/* Logo Container */}
      <View style={styles.logoContainer}>
        <Image 
          source={require("../assets/images/logo_coral.png")} 
          style={styles.logo} 
        />
      </View>

      {/* Separator Line */}
      <View style={styles.separator} />

      {/* Title & Subtitle */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Get Started</Text>
        <Text style={styles.subtitle}>Start your stress-free travel journey!</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        
        <Pressable style={styles.signUpButton} onPress={() => router.push("/SignUp")}>
          <Text style={styles.buttonText}>Sign up</Text>
        </Pressable>
        <Pressable style={styles.loginButton} onPress={() => router.push("Login")}>
          <Text style={styles.loginText}>Login</Text>
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
    width: "80%",  
    height: "80%",
    resizeMode: "contain",
  },
  separator: {
    width: "50%",  
    height: 4, 
    backgroundColor: Colors.coral, 
    marginVertical: 20, 
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
