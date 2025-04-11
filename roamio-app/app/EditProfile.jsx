import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Dropdown } from "react-native-element-dropdown";
import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUser } from "@/contexts/UserContext";
import { useNavigation } from "@react-navigation/native";
import { Snackbar } from "react-native-paper";

export default function EditProfile() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, setUser } = useUser();

  // Local state for profile data
  const [profileImage, setProfileImage] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(""); // Optionally read-only
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [travellerType, setTravellerType] = useState("");
  // State to store the initially loaded profile data for unsaved change checks
  const [initialData, setInitialData] = useState(null);
  // Use a ref to track if a save action has occurred
  const isNavigatingRef = useRef(false);
  // State for Snackbar
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");


  const BIO_CHAR_LIMIT = 200;

  const travellerOptions = [
    { label: "Solo Traveler", value: "Solo Traveler" },
    { label: "Group Traveler", value: "Group Traveler" },
    { label: "Local Traveler", value: "Local Traveler" },
    { label: "International Traveler", value: "International Traveler" },
    { label: "Business Traveler", value: "Business Traveler" },
    { label: "Retiree Traveler", value: "Retiree Traveler" },
  ];

  useEffect(() => {
    // Ensure the global user email is available; otherwise, redirect to login.
    if (!user.email) {
      Alert.alert("Error", "No user email found. Please log in.");
      router.replace("../Login");
      return;
    }
    const fetchProfileData = async () => {
      try {
        const response = await fetch(
          "http://10.0.2.2:3000/profile?email=" + encodeURIComponent(user.email)
        );
        const data = await response.json();
        if (response.ok) {
          // Populate local state with data from your backend
          setFirstName(data.first_name);
          setLastName(data.last_name);
          setEmail(data.email);
          setPhone(data.phone_number);
          setBio(data.bio || "");
          setTravellerType(data.traveller_type);
          if (data.profileImage) {
            setProfileImage(data.profileImage);
          }
          // Store the initial state to detect unsaved changes
          setInitialData({
            firstName: data.first_name,
            lastName: data.last_name,
            phone: data.phone_number,
            bio: data.bio || "",
            travellerType: data.traveller_type,
            profileImage: data.profileImage || null,
          });
        } else {
          Alert.alert("Error", data.error || "Failed to load profile data.");
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
        Alert.alert("Error", "Failed to load profile data.");
      }
    };

    fetchProfileData();
  }, [user.email]);

  // Function to determine if there are unsaved changes
  const hasUnsavedChanges = () => {
    if (!initialData) return false;
    return (
      firstName !== initialData.firstName ||
      lastName !== initialData.lastName ||
      phone !== initialData.phone ||
      bio !== initialData.bio ||
      travellerType !== initialData.travellerType ||
      profileImage !== initialData.profileImage
    );
  };

  // Listen for navigation events (back button, etc.) to warn about unsaved changes
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // Bypass the alert if a save action has already been triggered
      if (isNavigatingRef.current) {
        return;
      }
      if (!hasUnsavedChanges()) {
        return;
      }
      // Prevent the default behavior of leaving the screen
      e.preventDefault();
      Alert.alert(
        "Discard changes?",
        "You have unsaved changes. Are you sure you want to discard them and leave?",
        [
          { text: "Cancel", style: "cancel", onPress: () => { } },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });
    return unsubscribe;
  }, [
    navigation,
    firstName,
    lastName,
    phone,
    bio,
    travellerType,
    profileImage,
    initialData,
  ]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;
      setProfileImage(selectedImageUri);
    }
  };

  const saveProfileData = async () => {
    if (!hasUnsavedChanges()) {
      setSnackMessage("No changes detected.");
      setSnackVisible(true);
      return;
    }
    // Build payload using the current field values
    const payload = {
      email,
      first_name: firstName,
      last_name: lastName,
      phone_number: phone,
      bio: bio,
      traveller_type: travellerType,
      profileImage: profileImage,
    };

    try {
      const response = await fetch("http://10.0.2.2:3000/updateUserDetails", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok) {
        // Optionally update global user state with changed details
        setUser({
          ...user,
          email: email,
          first_name: firstName,
          last_name: lastName,
          phone_number: phone,
          traveller_type: travellerType,
        });
        // Update initialData to reflect saved changes
        setInitialData({
          firstName,
          lastName,
          phone,
          bio,
          travellerType,
          profileImage,
        });
        setSnackMessage("Profile updated successfully!");
        setSnackVisible(true);
        // Set the ref flag to bypass unsaved changes prompt
        isNavigatingRef.current = true;
        setTimeout(() => { router.replace("/Profile"); }, 1000); // Delay to allow Snackbar to show

      } else {
        Alert.alert(
          "Update Failed",
          result.error || "An error occurred while updating the profile."
        );
      }
    } catch (error) {
      console.error("Error saving profile data:", error);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Page Title */}
        <View style={styles.profileHeader}>
          <Text style={styles.editTitle}>Edit Profile</Text>
        </View>

        {/* Profile Image + "Change Photo" */}
        <Pressable onPress={pickImage} style={styles.profileImageContainer}>
          <Image
            source={
              profileImage
                ? { uri: profileImage }
                : require("../assets/images/avatar1.png")
            }
            style={styles.profileImage}
          />
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </Pressable>

        {/* First Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>First Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Full Name"
              value={firstName}
              onChangeText={setFirstName}
              style={styles.input}
            />
          </View>
        </View>

        {/* Last Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Last Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              style={styles.input}
            />
          </View>
        </View>

        {/* Email (read-only) */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              editable={false}
            />
            <FontAwesome
              name="envelope"
              size={20}
              color={Colors.coral}
              style={styles.icon}
            />
          </View>
        </View>

        {/* Phone Number */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              keyboardType="phone-pad"
            />
            <FontAwesome
              name="phone"
              size={20}
              color={Colors.coral}
              style={styles.icon}
            />
          </View>
        </View>

        {/* Bio + Character Counter */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Bio</Text>
          <View style={styles.bioContainer}>
            <TextInput
              placeholder="Bio"
              value={bio}
              onChangeText={(text) =>
                text.length <= BIO_CHAR_LIMIT && setBio(text)
              }
              style={styles.bioInput}
              multiline
            />
            <Text
              style={[
                styles.charCounter,
                bio.length >= 180 ? styles.charCounterWarning : {},
              ]}
            >
              {bio.length}/{BIO_CHAR_LIMIT}
            </Text>
            {bio.length === BIO_CHAR_LIMIT && (
              <Text style={styles.warningText}>
                Maximum character limit reached
              </Text>
            )}
          </View>
        </View>

        {/* Traveller Type Dropdown */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Traveller Type</Text>
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
        </View>

        {/* Save Button */}
        <Pressable onPress={saveProfileData} style={styles.saveButton}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </Pressable>
      </ScrollView>
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
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    padding: 20,
    alignItems: "center",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  editTitle: {
    fontSize: 22,
    fontFamily: "quicksand-bold",
    color: Colors.primary,
    marginTop: 10,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.coral,
  },
  changePhotoText: {
    marginTop: 6,
    color: Colors.coral,
    fontSize: 14,
    fontFamily: "quicksand-bold",
  },
  fieldContainer: {
    width: "100%",
    marginBottom: 15,
  },
  label: {
    fontSize: 15,
    fontFamily: "quicksand-bold",
    color: Colors.coral,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.peachySalmon,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
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
  bioContainer: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.peachySalmon,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  bioInput: {
    fontSize: 16,
    color: Colors.black,
    fontFamily: "quicksand-semibold",
    textAlignVertical: "top",
    minHeight: 80,
  },
  charCounter: {
    fontFamily: "quicksand-semibold",
    textAlign: "right",
    fontSize: 12,
    color: Colors.grey,
  },
  charCounterWarning: {
    color: "red",
    fontWeight: "bold",
  },
  warningText: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
  },
  pickerContainer: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.peachySalmon,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
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
  saveButton: {
    width: "100%",
    backgroundColor: Colors.palePink,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    color: Colors.coral,
    fontSize: 18,
    fontFamily: "quicksand-bold",
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
