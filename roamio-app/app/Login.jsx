import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  Pressable,
  SafeAreaView,
  Alert,
  Modal
} from "react-native";
import { Colors } from "@/constants/Colors"; // Ensure Colors file exists
import { FontAwesome } from "@expo/vector-icons"; // For icons
import { useRouter } from "expo-router";
import { useUser } from "@/contexts/UserContext";
import { Snackbar } from "react-native-paper";

export default function Login() {
  const router = useRouter();
  const { setUser } = useUser(); // Access the global user setter

  // State for main login screen inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State for the forgot password modal and its inputs
  const [modalVisible, setModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [showNewPasswordRegex, setShowNewPasswordRegex] = useState(false);

  // State for Snackbar
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  // Handle main login action
  const handleLogin = async () => {

    if (!email || !password) {
      setSnackMessage("Please fill in both email and password.");
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

    try {
      //const response = await fetch("http://10.0.2.2:3000/login", {
      const response = await fetch("http://10.0.2.2:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json();
      if (response.ok) {
        setSnackMessage("Login successful!");
        setSnackVisible(true);
        // Update global user state with the email and any other data returned from backend.
        setUser({ email, ...result.user });
        setTimeout(() => { router.replace("../(tabs)/Trip"); }, 600); // Delay for Snackbar to show

      } else {
        setSnackMessage(result.error || "Login failed. An error occurred during login.");
        setSnackVisible(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Network Error", "Unable to connect to the server.");
    }
  };

  // Handle password reset submission from the modal
  const handleResetPassword = async () => {
    if (!resetEmail || !currentPassword || !newPassword) {
      Alert.alert("Error", "Please fill in your email, current password, and new password.");
      return;
    }
    if (currentPassword === newPassword) {
      Alert.alert("Error", "New password cannot be the same as the current password.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      Alert.alert(
        "Error",
        "Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    try {
      const response = await fetch("http://10.0.2.2:3000/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, newPassword })
      });
      const result = await response.json();
      if (response.ok) {
        setSnackMessage("Password reset successful!");
        setSnackVisible(true);
        setModalVisible(false);
        // Optionally clear the password fields after success:
        setCurrentPassword("");
        setNewPassword("");
        setResetEmail("");
      } else {
        Alert.alert("Reset Failed", result.error || "An error occurred during reset.");
      }
    } catch (error) {
      console.error("Reset error:", error);
      Alert.alert("Network Error", "Unable to connect to the server.");
    }
  };

  // Navigate to Signup page
  const handleCreateAccount = () => {
    router.replace("../SignUp");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Forgot Password Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <View style={styles.modalInputContainer}>
              <TextInput
                placeholder="Email"
                style={styles.modalInputField}
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
              />
            </View>
            <View style={styles.modalInputContainer}>
              <TextInput
                placeholder="Current Password"
                style={styles.modalInputField}
                secureTextEntry={true}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
            </View>
            {showNewPasswordRegex && (
              <Text style={styles.passwordRegexText}>
                Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).
              </Text>
            )}
            <View style={styles.modalInputContainer}>
              <TextInput
                placeholder="New Password"
                style={styles.modalInputField}
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
                onFocus={() => setShowNewPasswordRegex(true)}
                onBlur={() => setShowNewPasswordRegex(false)}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <FontAwesome
                  name={showPassword ? "eye-slash" : "eye"}
                  size={20}
                  color={Colors.peachySalmon}
                  style={styles.icon}
                />
              </Pressable>
            </View>
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalButton, styles.modalCancel]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalButton} onPress={handleResetPassword}>
                <Text style={styles.modalButtonText}>Reset Password</Text>
              </Pressable>

            </View>
          </View>
        </View>
      </Modal>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/logo_coral.png")}
          style={styles.logo}
        />
      </View>

      {/* Login Section */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginTitle}>Login</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
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
          <FontAwesome name="lock" size={20} color={Colors.peachySalmon} style={styles.icon} />
        </View>
        <Pressable onPress={handleLogin} style={styles.loginButton}>
          <Text style={styles.buttonText}>Login</Text>
          <FontAwesome name="arrow-right" size={18} color="white" style={styles.arrowIcon} />
        </Pressable>
        <View style={styles.footerContainer}>
          <Pressable onPress={() => setModalVisible(true)}>
            <Text style={styles.footerText}>
              Forgot password? <Text style={styles.boldText}>Get new</Text>
            </Text>
          </Pressable>
          <Pressable onPress={handleCreateAccount}>
            <Text style={styles.footerText}>
              Don't have an account? <Text style={styles.boldText}>Create new</Text>
            </Text>
          </Pressable>
        </View>
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
    backgroundColor: Colors.coral,
    padding: 20,
    borderRadius: 30,
    borderColor: Colors.peachySalmon,
    borderWidth: 10,
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
    color: Colors.black,
    fontFamily: "quicksand-bold",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 15,
    fontFamily: "quicksand-bold",
    color: Colors.coral,
  },
  modalInput: {
    width: "100%",
    borderWidth: 2,
    borderColor: Colors.peachySalmon,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: "quicksand-semibold",
    color: Colors.black,
  },
  modalInputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.peachySalmon,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    backgroundColor: Colors.white,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    backgroundColor: Colors.coral,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  modalCancel: {
    backgroundColor: Colors.grey,
  },
  modalButtonText: {
    fontSize: 16,
    color: Colors.white,
    fontFamily: "quicksand-bold",
  },
  modalInputField: {
    flex: 1,
    fontSize: 16,
    fontFamily: "quicksand-semibold",
    color: Colors.black,
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
  passwordRegexText: {
    color: Colors.grey,
    fontSize: 12,
    marginBottom: 10,
    fontFamily: "quicksand-semibold",
    textAlign: "left",
    paddingHorizontal: 5,
  }
  ,
});
