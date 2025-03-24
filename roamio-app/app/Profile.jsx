import React, { useEffect, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../constants/Colors";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

export default function Profile() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState("Wendy Wanderer");
  const [email, setEmail] = useState("wendy.wanderer@email.com");
  const [phone, setPhone] = useState("123-456-7890");
  const [bio, setBio] = useState("");
  const [travellerType, setTravellerType] = useState("");

  useEffect(() => {
    // Load profile details from AsyncStorage when screen opens
    const loadProfileData = async () => {
      try {
        const storedImage = await AsyncStorage.getItem("profileImage");
        const storedName = await AsyncStorage.getItem("profileName");
        const storedEmail = await AsyncStorage.getItem("profileEmail");
        const storedPhone = await AsyncStorage.getItem("profilePhone");
        const storedBio = await AsyncStorage.getItem("profileBio");
        const storedTravellerType = await AsyncStorage.getItem("profileTravellerType");

        if (storedImage) setProfileImage(storedImage);
        if (storedName) setName(storedName);
        if (storedEmail) setEmail(storedEmail);
        if (storedPhone) setPhone(storedPhone);
        if (storedBio) setBio(storedBio);
        if (storedTravellerType) setTravellerType(storedTravellerType);
      } catch (error) {
        console.log("Error loading profile data: ", error);
      }
    };

    loadProfileData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={profileImage ? { uri: profileImage } : require("../assets/images/profilePicture.png")}
          style={styles.avatar}
        />
        <Text style={styles.name}>{name}</Text>

        {/* Traveler Type */}
        <View style={styles.infoRow}>
          <FontAwesome name="globe" size={18} color={Colors.coral} />
          <Text style={styles.subtitle}>{travellerType}</Text>
        </View>

        {/* Email */}
        <View style={styles.infoRow}>
          <FontAwesome name="envelope" size={18} color={Colors.coral} />
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* Phone Number */}
        <View style={styles.infoRow}>
          <FontAwesome name="phone" size={18} color={Colors.coral} />
          <Text style={styles.phoneNumber}>{phone}</Text>
        </View>
      </View>

      {/* Bio Section */}
      <View style={styles.bioContainer}>
        <Text style={styles.bio}>{bio}</Text>
      </View>

      {/* Edit Profile Button */}
      <Pressable style={styles.button} onPress={() => router.push("../EditProfile")}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </Pressable>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    padding: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 15,  // Reduced from 20 to move everything up
    marginTop: -10,  // Moves the whole section slightly higher
  },
  avatar: {
    width: 200,
    height: 280,
    borderRadius: 90,
    marginBottom: 15,
    borderWidth: 4,
    borderColor: Colors.coral,
    shadowColor: Colors.coral,
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  name: {
    fontSize: 28,
    fontFamily: "quicksand-bold",
    color: Colors.primary,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "quicksand-semibold",
    color: Colors.grey,
  },
  email: {
    fontSize: 14,
    fontFamily: "quicksand-semibold",
    color: Colors.grey,
  },
  phoneNumber: {
    fontSize: 14,
    fontFamily: "quicksand-semibold",
    color: Colors.grey,
  },
  bioContainer: {
    width: "90%",
    backgroundColor: Colors.palestPink,
    padding: 15,
    borderRadius: 10,
    borderColor: Colors.peachySalmon,
    borderWidth: 5,
    marginBottom: 20,
  },
  bio: {
    fontSize: 14,
    fontFamily: "quicksand-semibold",
    color: Colors.primary,
    textAlign: "center",
  },
  button: {
    backgroundColor: Colors.coral,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "60%",
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "quicksand-bold",
  },
});
