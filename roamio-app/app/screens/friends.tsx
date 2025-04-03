import React, { useState, useEffect } from "react";
import { useIsFocused } from '@react-navigation/native';


import {
  TextInput,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import { Colors } from "@/constants/Colors";
import { useUser } from "@/contexts/UserContext";




type RootStackParamList = {
  FriendsScreen: undefined;
  Detail: { name: string; phone: string; avatar: any; email_friend:string };
};
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "FriendsScreen"
>;


const SERVER_IP = "http://10.0.0.197:3000"; // Replace with your actual backend address


export default function FriendsScreen() {
  const { user } = useUser();
  const isFocused = useIsFocused(); // 👈 TRACK FOCUS


  const [fontsLoaded] = useFonts({
    "quicksand-regular": require("../../assets/fonts/Quicksand-Regular.ttf"),
    "quicksand-bold": require("../../assets/fonts/Quicksand-Bold.ttf"),
  });


  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<
    "default" | "alphabetical" | "reverse" | "favorites"
  >("default");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchType, setSearchType] = useState<"phone" | "email">("phone");
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [showFriendRequestModal, setShowFriendRequestModal] = useState(false);


  const navigation = useNavigation<NavigationProp>();
    // Trips State
    const [trips, setTrips] = useState<Itinerary[]>([]);


  // For prototyping, we define the current user email.
  const currentUserEmail = user.email;

  // Example fields you might have
// Adjust to match your actual CSV or database fields
    interface Itinerary {
      itinerary_id: string;   // or number
      user_email: string;
      trip_title: string;
      shared_with?: string;  // optional if some rows have empty data
    }

    interface SharedFriend {
      email: string;
      access?: string; // optional, if you have more properties add them here
    }
    



  const fetchFriendsList = async () => {
    try {
      const res = await fetch(`${SERVER_IP}/friends?email=${encodeURIComponent(currentUserEmail)}`);
      const data = await res.json();
      console.log("DEBUG: /friends endpoint returned:", data);
 
      const mappedFriends = data.map((friend: any, idx: number) => ({
        id: friend.id ? friend.id.toString() : String(idx),
        name: `${friend.first_name || ""} ${friend.last_name || ""}`.trim(),
        phone: friend.phone_number || "",
        avatar: require("../../assets/images/avatar1.png"),
        email_friend: friend.email || "",
        favorited: friend.favorite === true,
      }));
 
      setFriendsList(mappedFriends);
    } catch (error) {
      console.error("Error fetching friends list:", error);
    }
  };
  // Fetch user profile, friends list, and friend requests from backend
  //useEffect(() => {


    //fetchFriendsList();


    const fetchFriendRequests = async () => {
      try {
        const res = await fetch(
          `${SERVER_IP}/friendRequests?email=${encodeURIComponent(currentUserEmail)}`
        );
        const requests = await res.json();
        const mappedRequests = await Promise.all(
          requests.map(async (req: any) => {
            const res = await fetch(
              `${SERVER_IP}/profile?email=${encodeURIComponent(req.from_email)}`
            );
            const senderProfile = await res.json();
            return {
              id: req.id,
              name: `${senderProfile.first_name || ""} ${senderProfile.last_name || ""}`.trim(),
              phone: senderProfile.phone_number || "",
              avatar: require("../../assets/images/avatar1.png"),
              email: req.from_email,
            };
          })
        );
        setFriendRequests(mappedRequests);
      } catch (error) {
        console.error("Error fetching friend requests:", error);
      }
    };
 
    useEffect(() => {
      if (isFocused) {
        fetchFriendsList();
        fetchFriendRequests();
        fetchTrips();
      }
    }, [isFocused, currentUserEmail]);
 
    const fetchTrips = async () => {
      try {
        const response = await fetch(`${SERVER_IP}/itineraries?email=${currentUserEmail}`);
        const data = await response.json();
        setTrips(data.itineraries);
      } catch (error) {
        console.error("Error fetching itineraries:", error);
      }
    };

  const filteredFriends = friendsList
    .filter((friend) =>
      friend.name.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => {
      if (filterType === "alphabetical") return a.name.localeCompare(b.name);
      if (filterType === "reverse") return b.name.localeCompare(a.name);
      if (filterType === "favorites") {
        return a.favorited === b.favorited ? 0 : a.favorited ? -1 : 1;
      }
      return 0;
    });

    

  // Handle sending friend request
  const handleAddFriend = async () => {
    try {
      let queryParam = "";
      if (searchType === "phone") {
        const fullPhone = `${countryCode} ${phoneNumber}`.trim();
        queryParam = `phone=${encodeURIComponent(fullPhone)}`;
      } else {
        queryParam = `email=${encodeURIComponent(emailSearch)}`;
      }
      // Assumes an endpoint to search users exists, e.g., GET /users?search=...
      const res = await fetch(`${SERVER_IP}/users?${queryParam}`);
      const users = await res.json();
      const match = users[0]; // Take the first match
      if (match) {
        const requestRes = await fetch(`${SERVER_IP}/sendFriendRequest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            from_email: currentUserEmail,
            to_email: match.email,
          }),
        });
        if (requestRes.ok) {
          Alert.alert("Success", "Friend request sent");
          setShowAddModal(false);
        } else {
          Alert.alert("Error", "Failed to send friend request.");
        }
      } else {
        Alert.alert("Friend not found", "Check the info and try again.");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      Alert.alert("Error", "Something went wrong while sending the request.");
    }
  };


  const handleAcceptFriendRequest = async (requestId: string) => {
    try {
      const request = friendRequests.find((r) => r.id === requestId);
      if (!request) {
        console.error("No matching request found for ID:", requestId);
        return;
      }
 
      const reqRes = await fetch(`${SERVER_IP}/acceptFriendRequest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: requestId,
          from_email: request.email,
          to_email: currentUserEmail,
        }),
      });
 
      if (reqRes.ok) {
        setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
        await fetchFriendsList();
      } else {
        console.error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };
 
 


  // Handle declining a friend request
  const handleDeclineFriendRequest = async (requestId: string) => {
    try {
      const res = await fetch(`${SERVER_IP}/declineFriendRequest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: requestId }),
      });
      if (res.ok) {
        setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
      }
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  };


  if (!fontsLoaded) return null;


  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <Feather name="search" size={18} color="#888" />
        <TextInput
          placeholder="   Search friends (first name last name)"
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#aaa"
          style={styles.searchInput}
        />
      </View>


      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Your Friends</Text>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => setShowDropdown(true)}
            style={styles.dropdownToggleMini}
          >
            <Text style={styles.dropdownText}>
              {filterType === "default" ? "Filter" : filterType}
            </Text>
            <Feather name="chevron-down" size={16} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowAddModal(true)}>
            <Feather name="plus-circle" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowFriendRequestModal(true)}>
            <Feather name="user-plus" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>


      {/* Filter Dropdown Modal */}
      <Modal visible={showDropdown} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowDropdown(false)}
          activeOpacity={1}
        >
          <View style={styles.modalContent}>
            {["Favorites", "A-Z", "Z-A"].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  if (option === "A-Z") setFilterType("alphabetical");
                  else if (option === "Z-A") setFilterType("reverse");
                  else setFilterType("favorites");
                  setShowDropdown(false);
                }}
                style={styles.modalItem}
              >
                <Text style={styles.modalText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>


      {/* Add Friend Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Find a Friend</Text>
            {/* Toggle between phone/email */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  searchType === "phone" && styles.toggleButtonActive,
                ]}
                onPress={() => setSearchType("phone")}
              >
                <Text style={styles.toggleText}>Phone</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  searchType === "email" && styles.toggleButtonActive,
                ]}
                onPress={() => setSearchType("email")}
              >
                <Text style={styles.toggleText}>Email</Text>
              </TouchableOpacity>
            </View>
            {searchType === "phone" ? (
              <View style={styles.phoneInputRow}>
                <TextInput
                  style={[styles.modalInput, { width: 60, marginRight: 10 }]}
                  value={countryCode}
                  onChangeText={setCountryCode}
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={[styles.modalInput, { flex: 1, fontSize: 20 }]}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="--- --- ---"
                  placeholderTextColor="#4B5563"
                  keyboardType="phone-pad"
                />
              </View>
            ) : (
              <TextInput
                style={styles.modalInput}
                value={emailSearch}
                onChangeText={setEmailSearch}
                placeholder="abc@email.com"
                placeholderTextColor="#4B5563"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            )}
            <TouchableOpacity style={styles.addButton} onPress={handleAddFriend}>
              <Text style={styles.addButtonText}>Send Friend Request</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAddModal(false)} style={{ marginTop: 10 }}>
              <Text style={{ color: "#888" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      {/* Friend Requests Modal */}
      <Modal visible={showFriendRequestModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: 340 }]}>
            <Text style={styles.modalTitle}>Friend Requests</Text>
            {friendRequests.length === 0 ? (
              <Text style={{ fontFamily: "quicksand-regular", marginBottom: 10 }}>
                No friend requests at the moment.
              </Text>
            ) : (
              friendRequests.map((request) => (
                <View key={request.id} style={styles.requestItem}>
                  <Image
                    source={request.avatar}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      marginBottom: 5,
                    }}
                  />
                  <Text style={{ fontFamily: "quicksand-bold", marginBottom: 5 }}>
                    {request.name}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#ff8080",
                        padding: 8,
                        borderRadius: 8,
                      }}
                      onPress={() => handleAcceptFriendRequest(request.id)}
                    >
                      <Text style={{ color: "#fff", fontFamily: "quicksand-bold" }}>
                        Accept
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#ccc",
                        padding: 8,
                        borderRadius: 8,
                      }}
                      onPress={() => handleDeclineFriendRequest(request.id)}
                    >
                      <Text style={{ color: "#333", fontFamily: "quicksand-bold" }}>
                        Decline
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
            <TouchableOpacity onPress={() => setShowFriendRequestModal(false)} style={{ marginTop: 10 }}>
              <Text style={{ color: "#888", fontFamily: "quicksand-regular" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      {/* Friends List */}
      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <Image source={item.avatar} style={styles.avatar} />
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>
                {item.name}{" "}
                {item.favorited && (
                  <Feather name="star" size={16} color="#FFD700" />
                )}
              </Text>
              <Text style={styles.friendPhone}>{item.phone}</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Detail", {
                  name: item.name,
                  phone: item.phone,
                  avatar: item.avatar,
                  email_friend: item.email_friend
                })
              }
            >
              <Text style={styles.menuDots}>⋯</Text>
            </TouchableOpacity>
          </View>
        )}
      />


      {/* Trips Section (static for now) */}
      {/* Dynamic Trips With Friends Section */}
<Text style={styles.sectionTitle}>Trips With Friends</Text>
<FlatList
  horizontal
  data={trips}  // dynamic trips data from state
  keyExtractor={(item) => item.itinerary_id.toString()}
  renderItem={({ item }) => {
    // Parse the shared_with JSON field and cast it to SharedFriend[]
    let sharedWith: SharedFriend[] = [];
    if (item.shared_with && item.shared_with.trim() !== "") {
      try {
        sharedWith = JSON.parse(item.shared_with) as SharedFriend[];
      } catch (error) {
        console.error("Error parsing shared_with:", error);
      }
    }

    // Check if the current user is the owner of the trip
    const isOwner = item.user_email === currentUserEmail;

    // Determine what name(s) to display:
    // - If owner: show the names (or emails) of the friends with whom the trip is shared.
    // - If not: display the owner's email as "Shared by: ..."
    const displayName = isOwner
      ? (sharedWith.length > 0
          ? sharedWith.map((friend) => friend.email).join(", ")
          : "Not shared")
      : `Shared by: ${item.user_email}`;

    return (
      <View style={styles.tripCard}>
        {/* Optionally, you can use a dynamic image if provided in your data */}
        <Image source={require("../../assets/images/avatar1.png")} style={styles.tripImage} />
        <Text style={styles.friendTripName}>{item.trip_title}</Text>
        <Text style={styles.friendName}>{displayName}</Text>
      </View>
    );
  }}
  showsHorizontalScrollIndicator={false}
/>

      
      
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff0f0",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "quicksand-regular",
    color: "#333",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: "quicksand-bold",
    marginBottom: 10,
  },
  dropdownToggleMini: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#fff0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dropdownText: {
    fontFamily: "Quicksand-Regular",
    fontSize: 16,
    marginRight: 5,
  },
  toggleContainer: {
    flexDirection: "row",
    marginBottom: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    overflow: "hidden",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#ffcccc",
  },
  toggleText: {
    fontFamily: "quicksand-bold",
    fontSize: 14,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 280,
    padding: 20,
    alignItems: "center",
  },
  modalItem: { paddingVertical: 12, paddingHorizontal: 20 },
  modalText: { fontSize: 16, fontFamily: "quicksand-regular" },
  modalTitle: { fontSize: 20, fontFamily: "quicksand-bold", marginBottom: 15 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    width: "100%",
    fontFamily: "quicksand-regular",
  },
  addButton: {
    backgroundColor: "#ff8080",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "quicksand-bold",
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.coral,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 15 },
  friendInfo: { flex: 1 },
  friendName: {
    fontWeight: "600",
    fontSize: 16,
    fontFamily: "quicksand-semibold",
  },
  friendPhone: { color: "#888", marginTop: 2, fontFamily: "quicksand-regular" },
  menuDots: { fontSize: 20, color: "#888", paddingLeft: 10 },
  tripCard: {
    width: 180,
    height: 150,
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 2, height: 2 },
    borderWidth: 1,
    borderColor: Colors.coral,
  },
  tripImage: { width: 50, height: 50, borderRadius: 25, marginBottom: 6 },
  friendTripName: { color: Colors.grey, fontFamily: "quicksand-semibold" },
  requestItem: {
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.coral,
    borderRadius: 8,
    padding: 10,
    width: "100%",
  },
});


//export default FriendsScreen;
