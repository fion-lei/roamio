import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TextInput, Pressable, SafeAreaView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Colors } from "@/constants/Colors"; // Ensure Colors file exists
import { FontAwesome } from "@expo/vector-icons"; // For icons
import { useRouter } from "expo-router";

export default function SignUpDetails() {
  const router = useRouter();
  const [travellerType, setTravellerType] = useState(""); // State for dropdown selection

  return (
    <SafeAreaView style={styles.container}>

      {/* Sign Up Details Section */}
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpTitle}>Sign Up Details</Text>

        {/* First Name */}
        <View style={styles.inputContainer}>
          <TextInput placeholder="First Name" style={styles.input} />
        </View>

        {/* Last Name */}
        <View style={styles.inputContainer}>
          <TextInput placeholder="Last Name" style={styles.input} />
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <TextInput placeholder="Email" style={styles.input} keyboardType="email-address" />
          <FontAwesome name="envelope" size={20} color={Colors.coral} style={styles.icon} />
        </View>

        {/* Phone Number */}
        <View style={styles.inputContainer}>
          <TextInput placeholder="Phone Number" style={styles.input} keyboardType="phone-pad" />
          <FontAwesome name="phone" size={20} color={Colors.coral} style={styles.icon} />
        </View>

        {/* Traveller Type Dropdown */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={travellerType}
            onValueChange={(itemValue) => setTravellerType(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Traveller Type" value="" />
            <Picker.Item label="Solo Traveler" value="solo" />
            <Picker.Item label="Family" value="family" />
            <Picker.Item label="Business Traveler" value="business" />
            <Picker.Item label="Backpacker" value="backpacker" />
            <Picker.Item label="Luxury Traveler" value="luxury" />
          </Picker>
        </View>

        {/* Continue Button */}
        <Pressable onPress={() => router.replace("../Home")} style={styles.continueButton}>
          <Text style={styles.buttonText}>Continue</Text>
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
  signUpContainer: {
    width: "100%",
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 30,
    elevation: 0,
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
  pickerContainer: {
    width: "100%",
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.peachySalmon,
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden", // Keeps the rounded edges of the Picker
  },
  picker: {
    fontSize: 16,
    fontFamily: "quicksand-semibold",
    color: Colors.black,
  },
  continueButton: {
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

