import React, { useState } from "react";
import { View, Text, TextInput, Pressable, SafeAreaView, StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Colors } from "@/constants/Colors"; // Ensure Colors file exists
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function SignUpDetails() {
  const router = useRouter();
  const [travellerType, setTravellerType] = useState(null);

  // Traveller options with Quicksand font
  const travellerOptions = [
    { label: "Solo Traveler", value: "solo" },
    { label: "Group Traveler", value: "group" },
    { label: "Local Traveler", value: "local" },
    { label: "International Traveler", value: "international" },
    { label: "Business Traveler", value: "business" },
    { label: "Retiree Traveler", value: "retiree" },
  ];

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
          <Dropdown
            data={travellerOptions}
            labelField="label"
            valueField="value"
            placeholder="Select Traveller Type"
            value={travellerType}
            onChange={(item) => setTravellerType(item.value)}
            style={styles.dropdown}
            selectedTextStyle={styles.selectedText}
            placeholderStyle={styles.placeholderText}
            itemTextStyle={styles.itemText}
            dropdownStyle={styles.dropdownStyle} // ✅ Prevents dropdown from exceeding the screen
            dropdownPosition="top" // ✅ Forces it to open upwards when close to the bottom
          />
        </View>

        {/* Invisible Spacer to Limit Dropdown */}
        <View style={styles.bottomSpacer} />

        {/* Continue Button */}
        <Pressable onPress={() => router.replace("../(tabs)/Trip")} style={styles.continueButton}>
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
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 10, // ✅ Creates spacing above the dropdown
    overflow: "hidden",
  },
  dropdown: {
    padding: 10,
    borderWidth: 0,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  dropdownStyle: {
    maxHeight: 200, // ✅ Limits dropdown height
    alignSelf: "center",
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: "quicksand-semibold",
    color: Colors.grey,
  },
  selectedText: {
    fontSize: 16,
    fontFamily: "quicksand-bold",
    color: Colors.black,
  },
  itemText: {
    fontSize: 16,
    fontFamily: "quicksand-semibold",
    color: Colors.black,
  },
  bottomSpacer: {
    height: 0, 
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

