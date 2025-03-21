import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";


export default function Profile() {
  const router = useRouter();
  const params = useLocalSearchParams();


  // Get updated profile data from params (fallback to default values if missing)
  const profileImage = params.profileImage && params.profileImage !== "null"
  ? { uri: params.profileImage }
  : require("../assets/images/profilePicture.png");


  const name = params.name || "Wendy Wanderer";
  const email = params.email || "wendy.wanderer@email.com";
  const phone = params.phone || "123-456-7890";
  const bio = params.bio || "Hi, I’m Wendy! I’m 28, a digital nomad from Los Angeles. Whether it’s a hidden café or an offbeat hiking trail, I’m all about budget-friendly experiences and soaking in local vibes.";
  const travellerType = params.travellerType || "Solo Traveler";

  
   return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image key={profileImage.uri} source={profileImage} style={styles.avatar} />
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
      <Pressable style={styles.button} onPress={() => router.replace("../EditProfile")}>
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
    marginBottom: 20,
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
    fontSize: 18,
    fontFamily: "quicksand-bold",
  },
});