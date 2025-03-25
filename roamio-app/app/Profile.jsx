import React, { useEffect, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { useUser } from "@/contexts/UserContext";

export default function Profile() {
  const router = useRouter();
  const { user } = useUser(); // Access global user data
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    travellerType: "",
    bio: "",
  });

  useEffect(() => {
    // Ensure that the user email is available
    if (!user.email) {
      console.error("No user email found in global state.");
      return;
    }

    const fetchProfileData = async () => {
      try {
        const response = await fetch(
          `http://10.0.2.2:3000/profile?email=${encodeURIComponent(user.email)}`
        );
        const data = await response.json();
        if (response.ok) {
          setProfileData({
            name: `${data.first_name} ${data.last_name}`,
            email: data.email,
            phone: data.phone_number,
            travellerType: data.traveller_type,
            bio: data.bio || "This is a default bio.",
          });
        } else {
          console.error("Error fetching profile:", data.error);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfileData();
  }, [user.email]);

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={
            require("../assets/images/profilePicture.png")
          }
          style={styles.avatar}
        />
        <Text style={styles.name}>{profileData.name}</Text>

        {/* Traveler Type */}
        <View style={styles.infoRow}>
          <FontAwesome name="globe" size={18} color={Colors.coral} />
          <Text style={styles.subtitle}>{profileData.travellerType}</Text>
        </View>

        {/* Email */}
        <View style={styles.infoRow}>
          <FontAwesome name="envelope" size={18} color={Colors.coral} />
          <Text style={styles.email}>{profileData.email}</Text>
        </View>

        {/* Phone Number */}
        <View style={styles.infoRow}>
          <FontAwesome name="phone" size={18} color={Colors.coral} />
          <Text style={styles.phoneNumber}>{profileData.phone}</Text>
        </View>
      </View>

      {/* Bio Section */}
      <View style={styles.bioContainer}>
        <Text style={styles.bio}>{profileData.bio}</Text>
      </View>

      {/* Edit Profile Button */}
      <Pressable
        style={styles.button}
        onPress={() => router.push("../EditProfile")}
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
      </Pressable>
    </View>
  );
}

// Styles remain the same as before
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
    marginBottom: 15,
    marginTop: -10,
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
