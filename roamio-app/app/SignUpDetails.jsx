import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Alert
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUser } from "@/contexts/UserContext"; // Adjust path if needed
import { Snackbar } from "react-native-paper";

export default function SignUpDetails() {
  const router = useRouter();
  const { user, setUser } = useUser(); // Access global user state

  // Local state for additional profile details
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [travellerType, setTravellerType] = useState(null);
  // State for Snackbar
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");

  // Traveller options
  const travellerOptions = [
    { label: "Solo Traveler", value: "Solo Traveler" },
    { label: "Group Traveler", value: "Group Traveler" },
    { label: "Local Traveler", value: "Local Traveler" },
    { label: "International Traveler", value: "International Traveler" },
    { label: "Business Traveler", value: "Business Traveler" },
    { label: "Retiree Traveler", value: "Retiree Traveler" },
  ];

  const handleContinue = async () => {
    // Validate required fields
    if (!firstName || !lastName) {
      setSnackMessage("Please fill in all required fields.");
      setSnackVisible(true);
      return;
    }

    // Validate that names don't contain numbers (allows letters and spaces)
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
      setSnackMessage("Names can only contain letters and spaces.");
      setSnackVisible(true);
      return;
    }

    // Validate phone number field is not empty
    if (!phoneNumber) {
      setSnackMessage("Please enter a phone number.");
      setSnackVisible(true);
      return;
    }

    // This regex matches the format XXX-XXX-XXXX, where X is a digit
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert("Error", "Enter a valid phone number in the format XXX-XXX-XXXX.");
      return;
    }

    // Prepare details using the global user's email
    const userDetails = {
      email: user.email,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      traveller_type: travellerType || "",
    };

    try {
      const response = await fetch("http://10.0.2.2:3000/updateUserDetails", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userDetails),
      });
      const result = await response.json();
      if (response.ok) {
        setSnackMessage("Account created successfully!");
        setSnackVisible(true);

        setUser((prev) => ({
          ...prev,
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          traveller_type: travellerType || "",
        }));
        // Update global user state with new details
        setTimeout(() => {
          router.push("../(tabs)/Discover");
        }, 2000); // Delay for Snackbar to show

      } else {
        Alert.alert("Update Failed", result.error || "An error occurred while updating details.");
      }
    } catch (error) {
      console.error("Error updating details:", error);
      Alert.alert("Network Error", "Unable to connect to the server.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpTitle}>Sign Up Details</Text>

        {/* First Name
        <View style={styles.inputContainer}>
          <TextInput

            placeholder="First Name"
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
          />
        </View> */}
        <View style={styles.inputFieldContainer}>
          <Text style={styles.fieldLabel}>
            First Name <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Enter your first name"
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
        </View>
        {/* Last Name */}

        <View style={styles.inputFieldContainer}>
          <Text style={styles.fieldLabel}>
            Last Name <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Enter your last name" style={styles.input}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
        </View>

        {/* Phone Number */}
        <View style={styles.inputFieldContainer}>
          <Text style={styles.fieldLabel}>
            Phone Number <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="XXX-XXX-XXXX"
              style={styles.input}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            <FontAwesome name="phone" size={20} color={Colors.coral} style={styles.icon} />
          </View>
        </View>


        {/* Traveller Type Dropdown */}

          <Text style={styles.fieldLabel}>
            Traveller Type
          </Text>
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
              dropdownStyle={styles.dropdownStyle}
              dropdownPosition="top"
            />
          </View>

{/* 
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
            dropdownStyle={styles.dropdownStyle}
            dropdownPosition="top"
          />
        </View> */}

        {/* Invisible Spacer */}
        <View style={styles.bottomSpacer} />

        {/* Continue Button */}
        <Pressable onPress={handleContinue} style={styles.continueButton}>
          <Text style={styles.buttonText}>Continue</Text>
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
  inputFieldContainer: {
    width: "100%",
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: "quicksand-semibold",
    color: Colors.black,
    marginBottom: 5,
    marginLeft: 5,
  },
  required: {
    color: "red",
    fontFamily: "quicksand-bold",
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
    marginBottom: 10,
    overflow: "hidden",
  },
  dropdown: {
    padding: 10,
    borderWidth: 0,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  dropdownStyle: {
    maxHeight: 200,
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
  snackbarWrapper: {
    position: "absolute",
    justifyContent: "top",
    alignItems: "center",
    top: "2%",

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
