import React, { useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  SafeAreaView, 
  Alert 
} from "react-native";
import { Colors } from "@/constants/Colors"; // Your color constants
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function SignUp() {
  const router = useRouter();

  // State for form inputs (now using email instead of username)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Handle the signup action
  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    // Prepare user data with email as the key
    const userData = {
      email: email,
      password: password,
    };

    try {
      const response = await fetch("http://10.0.2.2:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Account created successfully!");
        // Navigate to the next screen, such as SignUpDetails or Login
        router.replace("../SignUpDetails?email=" + encodeURIComponent(email));
      } else {
        Alert.alert("Signup Failed", result.error || "An error occurred during signup.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Network Error", "Unable to connect to the server.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Image 
          source={require("../assets/images/logo_white.png")} 
          style={styles.logo} 
        />
      </View>

      {/* Sign Up Form */}
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpTitle}>Sign up</Text>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Confirm Password"
            style={styles.input}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <FontAwesome name="lock" size={20} color={Colors.coral} style={styles.icon} />
        </View>

        <Pressable onPress={handleSignUp} style={styles.signUpButton}>
          <Text style={styles.buttonText}>Sign up</Text>
          <FontAwesome name="arrow-right" size={18} color="white" style={styles.arrowIcon} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.coral,
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
  signUpContainer: {
    width: "100%",
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 30,
    borderColor: Colors.peachySalmon,
    borderWidth: 10,
  },
  signUpTitle: {
    fontSize: 25,
    fontFamily: "quicksand-bold",
    color: Colors.coral,
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
  signUpButton: {
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
});
