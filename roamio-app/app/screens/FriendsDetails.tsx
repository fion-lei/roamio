import React, { useState, useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useUser } from "@/contexts/UserContext";

import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import {
  FontAwesome,
  Entypo,
  Feather,
  Ionicons,
} from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

interface RouteParams {
  name: string;
  phone: string;
  first_name: string;
  email_friend: string;
  avatar: any;
  traveller_type: string;
  bio: string;
}

interface InfoItemProps {
  icon: React.ReactNode;
  text: string;
}

const InfoItem = ({ icon, text }: InfoItemProps) => (
  <View style={styles.infoItem}>
    <View style={styles.infoContainer}>{icon}</View>
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

const DetailScreen = () => {
  const router = useRouter();
  const route = useRoute();
  const { name, phone, avatar, email_friend, first_name, traveller_type, bio } =
    route.params as RouteParams;
  const { user } = useUser();
  const [sent, setSent] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState<any | null>(null);
  const [accessType, setAccessType] = useState<"trip-mate" | "viewer">(
    "viewer"
  );
  const [itineraries, setItineraries] = useState<any[]>([]);

  const SERVER_IP = "http://10.0.2.2:3000";
  const currentUserEmail = user.email;

  const [favorited, setFavorited] = useState(false); // NEW

  // NEW: Toggle favorite and sync with backend
  const handleToggleFavorite = async () => {
    try {
      const res = await fetch(`${SERVER_IP}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: currentUserEmail,
          friend_email: email_friend,
          favorited: !favorited,
        }),
      });

      if (res.ok) {
        setFavorited(!favorited);
      } else {
        Alert.alert("Oops!", "Could not update favorite status.");
      }
    } catch (error) {
      console.error("Favorite toggle error:", error);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  interface Itinerary {
    itinerary_id: string;
    user_email: string;
    trip_title: string;
    trip_description: string;
    start_date: string; // Expected to be in a parsable date format (e.g., "MM/DD/YYYY")
    end_date: string; // Expected to be in a parsable date format (e.g., "MM/DD/YYYY")
    shared_with?: string; // This should be a JSON string representing an array of shared friend objects
  }

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch(
          `${SERVER_IP}/friends?email=${encodeURIComponent(currentUserEmail)}`
        );
        const data = await res.json();
        const friend = data.find((f: any) => f.email === email_friend);
        if (friend) {
          setFavorited(!!friend.favorite);
        }
      } catch (error) {
        console.error("Error fetching favorite status:", error);
      }
    };

    fetchFavorites();
  }, [currentUserEmail, email_friend]);

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const res = await fetch(
          `${SERVER_IP}/itineraries?email=${encodeURIComponent(user.email)}`
        );
        const data = await res.json();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log("Current date:", today);
        // Map data to your Itinerary interface and filter out past trips.
        const formattedItineraries = (data.itineraries || []).map(
          (trip: any) => ({
            ...trip,
          })
        );

        const parseDate = (dateStr: string) => {
          // dateStr expected to be in "MM/DD/YYYY" format
          const [month, day, year] = dateStr.split("/");
          return new Date(Number(year), Number(month) - 1, Number(day));
        };

        const filteredItineraries = formattedItineraries.filter(
          (trip: Itinerary) => {
            if (!trip.end_date) return false;
            const endDate = parseDate(trip.end_date);
            return endDate >= today && trip.user_email !== email_friend;
          }
        );
        console.log("filtered itineraries:", filteredItineraries);
        setItineraries(filteredItineraries);
      } catch (err) {
        console.error("Error fetching itineraries:", err);
      }
    };
    fetchItineraries();
  }, [currentUserEmail]);

  const handleUnfriend = async () => {
    Alert.alert(
      "Confirm Unfriend",
      `Are you sure you want to unfriend ${name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Unfriend",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${SERVER_IP}/unfriend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  user_email: currentUserEmail,
                  friend_email: email_friend,
                }),
              });

              if (res.ok) {
                Alert.alert(
                  "Unfriended",
                  `${name} has been removed from your friends list.`
                );
                router.back();
              } else {
                Alert.alert("Oops!", "Could not unfriend. Try again.");
              }
            } catch (error) {
              console.error("Unfriend error:", error);
              Alert.alert("Error", "Something went wrong while unfriending.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleSend = async () => {
    if (!selectedItinerary) return alert("Please select an itinerary.");

    try {
      const res = await fetch(`${SERVER_IP}/shareItinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itinerary_id: selectedItinerary.itinerary_id,
          friend_email: email_friend,
          access_type: accessType,
          friend_name: first_name,
          owner_name: user.first_name,
        }),
      });
      if (res.ok) {
        Alert.alert("Shared!", "Itinerary successfully shared.");
        setSent(true);
        router.back();
      } else {
        Alert.alert("Error", "Failed to share itinerary.");
      }
    } catch (error) {
      console.error("Share itinerary error:", error);
      Alert.alert("Error", "Something went wrong.");
    }

    setModalVisible(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={true}>
      <Image
        source={require("../../assets/images/friend-illustrations.jpg")}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.nameRow}>
        <View style={{ 
          flexDirection: "row", 
          alignItems: "center", 
          }}>
          <Text style={styles.title}>{name}</Text>
          <Pressable onPress={handleToggleFavorite}>
            {favorited ? (
              <FontAwesome
                name="star"
                size={25}
                color="#FFD700"
                style={{ marginLeft: 20, marginBottom: 15 }}
              />
            ) : (
              <Feather
                name="star"
                size={25}
                color="#999"
                style={{ marginLeft: 20, marginBottom: 15 }}
              />
            )}
          </Pressable>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Pressable
            style={styles.unfriendButton}
            onPress={handleUnfriend}
          >
            <Text style={styles.unfriendText}>Unfriend</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.infoList}>
        <InfoItem icon={<Entypo name="phone" size={20} color={Colors.coral} />} text={phone} />
        <InfoItem
          icon={<Feather name="mail" size={20} color={Colors.coral} />}
          text={email_friend}
        />
        <InfoItem
          icon={<FontAwesome name="plane" size={20} color={Colors.coral} />}
          text={traveller_type}
        />
      </View>

      <View style={styles.bioSection}>
        <View style={styles.bioHeader}>
          <Text style={styles.bioTitle}>Bio</Text>
          <View style={[styles.infoContainer, { marginTop: 2 }]}>
            <FontAwesome name="bars" size={20} color={Colors.coral} />
          </View>
        </View>
        <Text style={styles.bioText}>{bio}</Text>
      </View>

      <View style={styles.sendCard}>
        <Image source={avatar} style={styles.avatar} />
        <View style={styles.musicInfo}>
          <Text style={styles.musicTitle}>Share Itinerary</Text>
        </View>
        <Pressable onPress={() => setModalVisible(true)}>
          {sent ? (
            <Ionicons name="checkmark" size={22} color={Colors.coral} style={styles.sendIcon} />
          ) : (
            <Ionicons
              name="send"
              size={22}
              color={Colors.coral}
              style={styles.sendIcon}
            />
          )}
        </Pressable>
      </View>

      {modalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Share Itinerary</Text>

            {itineraries.map((itinerary) => (
              <Pressable
                key={itinerary.itinerary_id}
                onPress={() => setSelectedItinerary(itinerary)}
                style={[
                  styles.itineraryOption,
                  selectedItinerary?.itinerary_id === itinerary.itinerary_id &&
                    styles.itinerarySelected,
                ]}
              >
                <Text style={styles.itineraryText}>{itinerary.trip_title}</Text>
              </Pressable>
            ))}

            <View style={styles.accessButtons}>
              <Pressable
                onPress={() => setAccessType("viewer")}
                style={[
                  styles.accessButton,
                  accessType === "viewer" && styles.viewerSelected,
                ]}
              >
                <Text style={styles.accessText}>Viewer</Text>
              </Pressable>
              <Pressable
                onPress={() => setAccessType("trip-mate")}
                style={[
                  styles.accessButton,
                  accessType === "trip-mate" && styles.tripMateSelected,
                ]}
              >
                <Text style={styles.accessText}>Trip-mate</Text>
              </Pressable>
            </View>

            <Pressable style={styles.shareButton} onPress={handleSend}>
              <Text style={styles.shareButtonText}>Share</Text>
            </Pressable>

            <Pressable
              onPress={() => setModalVisible(false)}
              style={{ marginTop: 10 }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "#6b7280",
                  fontFamily: "quicksand-semibold",
                }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: "#fffff",
  },
  image: { width: "100%", height: 200, borderRadius: 16, marginBottom: 20 },
  title: {
    fontSize: 24,
    marginBottom: 16,
    fontFamily: "quicksand-bold",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  infoList: {
    marginBottom: 24,
    backgroundColor: Colors.palestPink,
    borderRadius: 12,
    padding: 14,
    paddingTop: 16,
  },
  infoItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 10,
    paddingVertical: 4,
  },
  infoContainer: { 
    width: 30, 
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: { 
    marginLeft: 12, 
    marginBottom: 4,
    fontSize: 18, 
    fontFamily: "quicksand-semibold", 
    color: Colors.primary,
    flex: 1,
  },
  bioSection: {
    marginBottom: 24,
    backgroundColor: Colors.palestPink,
    borderRadius: 12,
    padding: 16,
    flexGrow: 1,
  },
  bioHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  bioTitle: {
    fontSize: 18,
    fontFamily: "quicksand-bold",
    color: Colors.primary,
    marginRight: 4, 
  },
  bioText: {
    fontSize: 16,
    fontFamily: "quicksand-regular",
    color: Colors.primary,
    lineHeight: 22,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  sendCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.palePink,
    borderRadius: 12,
    padding: 16,
    marginTop: 30,
    marginBottom: 40,
  },
  avatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    marginRight: 12,
  },
  musicInfo: { flex: 1 },
  musicTitle: { 
    fontSize: 18, 
    fontFamily: "quicksand-bold", 
    color: Colors.coral, 
    marginLeft: 8,},
  itineraryText: { fontFamily: "quicksand-semibold", fontSize: 16 },
  unfriendButton: {
    alignSelf: "flex-end",
    backgroundColor: "#ffe5e5",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  unfriendText: {
    color: "#d9534f",
    fontSize: 14,
    fontFamily: "quicksand-semibold",
  },
  sendIcon: { 
    marginHorizontal: 10,
    marginTop: 4,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontFamily: "quicksand-bold",
  },
  itineraryOption: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    marginBottom: 8,
  },
  itinerarySelected: { backgroundColor: Colors.palePink },
  accessButtons: { flexDirection: "row", marginVertical: 10 },
  accessButton: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    marginHorizontal: 5,
  },
  viewerSelected: { backgroundColor: Colors.palePink },
  tripMateSelected: { backgroundColor: Colors.palePink },
  accessText: { textAlign: "center", fontFamily: "quicksand-semibold" },
  shareButton: {
    backgroundColor: Colors.coral,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  shareButtonText: {
    color: Colors.white,
    textAlign: "center",
    fontFamily: "quicksand-bold",
  },
});

export default DetailScreen;
