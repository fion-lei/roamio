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
import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUser } from "@/contexts/UserContext";
import { Snackbar } from "react-native-paper";

export default function SignUp() {
  const router = useRouter();
  const { setUser } = useUser(); // Access global user setter

  // Local state for sign-up form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  // State for Snackbar
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");

  const handleSignUp = async () => {
    // General error check
    if (!email || !password || !confirmPassword) {
      setSnackMessage("Please fill in all fields.");
      setSnackVisible(true);
      return;
    }

    // Email format validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSnackMessage("Enter a valid email address.");
      setSnackVisible(true);
      return;
    }

    // Password validation
    if (password !== confirmPassword) {
      setSnackMessage("Passwords do not match.");
      setSnackVisible(true);  
      return;
    }

    // Password format validation using regex
    // This regex requires:
    // - Minimum eight characters
    // - At least one uppercase letter
    // - At least one lowercase letter
    // - At least one number
    // - At least one special character from @$!%*?&
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Error",
        "Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    // Prepare payload for signup endpoint
    const userData = { email, password };

    try {
      const response = await fetch("http://10.0.2.2:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const result = await response.json();

      if (response.ok) {
        // Save the email (and any other returned user data) in global context
        setUser({ email, ...result.user });
        // Navigate to SignUpDetails screen
        router.replace("../SignUpDetails");
      } else {
        Alert.alert("Signup Failed", result.error || "An error occurred during signup.");
      }
    } catch (error) {
      console.error("Signup error:", error);
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
      {/* Sign up Section */}
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpTitle}>Sign up</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>
        {/* Render password requirements above the password input */}
        {showPasswordRequirements && (
          <Text style={styles.passwordRequirements}>
            Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).
          </Text>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            onFocus={() => setShowPasswordRequirements(true)}
            onBlur={() => setShowPasswordRequirements(false)}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <FontAwesome
              name={showPassword ? "eye-slash" : "eye"}
              size={20}
              color={Colors.coral}
            />
          </Pressable>
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
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={3000}
        wrapperStyle={styles.snackbarWrapper}
        style={styles.snackbar}
      >
        <Text style={styles.snackbarText}>
          {snackMessage}
        </Text>
      </Snackbar>
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
  passwordRequirements: {
    color: Colors.grey,
    fontSize: 12,
    marginBottom: 10,
    fontFamily: "quicksand-semibold",
    textAlign: "left",
    paddingHorizontal: 5,
  },
  snackbarWrapper: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    bottom: "2%",
  },
  snackbar: {
    width: "90%",
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
  snackbarText: {
    color: Colors.coral,
    fontFamily: "quicksand-bold",
    fontSize: 15,
  },
});
