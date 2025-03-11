import React from "react";
import { View, Text, Image, StyleSheet, TextInput, Pressable, SafeAreaView, } from "react-native";
import { Colors } from "@/constants/Colors"; // Ensure Colors file exists
import { FontAwesome } from "@expo/vector-icons"; // For password icon

export default function Login() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image 
        source={require("../assets/images/logo_coral.png")} 
        style={styles.logo} />
      </View>

      {/* Login Section */}
      <View style={styles.loginContainer}>
        {/* Login Title */}
        <Text style={styles.loginTitle}>Login</Text>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <TextInput placeholder="Login" style={styles.input} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput placeholder="Password" style={styles.input} secureTextEntry />
          <FontAwesome name="lock" size={20} color={Colors.peachySalmon} style={styles.icon} />
        </View>

        {/* Login Button */}
        <Pressable style={styles.loginButton}>
          <Text style={styles.buttonText}>Login</Text>
          <FontAwesome name="arrow-right" size={18} color="white" style={styles.arrowIcon} />
        </Pressable>

        {/* Forgot Password & Create Account */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            Forgot password? <Text style={styles.boldText}>Get new</Text>
          </Text>
          <Text style={styles.footerText}>
            Don't have an account? <Text style={styles.boldText}>Create new</Text>
          </Text>
        </View>
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
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: "100%",
    height: 350,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "80%",
    height: "80%",
    resizeMode: "contain",
  },
  loginContainer: {
    width: "100%",
    backgroundColor: Colors.coral, // Optional: Can change for contrast
    padding: 20,
    borderRadius: 30,
    elevation: 0,
  },
  loginTitle: {
    fontSize: 25,
    fontFamily: "quicksand-bold",
    color: Colors.white,
    alignSelf: "flex-start",
    marginBottom: 15,
  },
  inputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.peachySalmon,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
    fontFamily: "quicksand-semibold",
  },
  icon: {
    marginLeft: 10,
  },
  loginButton: {
    width: "100%",
    backgroundColor: Colors.palePink,
    paddingVertical: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,

  },
  buttonText: {
    color: Colors.coral,
    fontSize: 18,
    fontFamily: "quicksand-bold",
  },
  arrowIcon: {
    marginLeft: 8,
    color: Colors.coral,
  },
  footerContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: Colors.white,
    marginBottom: 5,
    fontFamily: "quicksand-semibold",
  },
  boldText: {
    fontWeight: "bold",
    color: Colors.black,
  },
});
