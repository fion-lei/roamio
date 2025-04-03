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
  Detail: { name: string; phone: string; avatar: any; email_friend:string;first_name:string ; owner_name:string};
};
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "FriendsScreen"
>;


const SERVER_IP = "http://10.0.2.2:3000"; // Replace with your actual backend address


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
  const [unshareModalVisible, setUnshareModalVisible] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);

  const [searchType, setSearchType] = useState<"phone" | "email">("phone");
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [showFriendRequestModal, setShowFriendRequestModal] = useState(false);

  const [activeTripTab, setActiveTripTab] = useState<"my" | "shared">("my");



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
      shared_with?: string;
      first_name:String;  // optional if some rows have empty data
    }

    interface SharedFriend {
      email: string;
      access?: string; 
      friend_name:string;// optional, if you have more properties add them here
      owner_name:string;
    }
    



  const fetchFriendsList = async () => {
    try {
      const res = await fetch(`${SERVER_IP}/friends?email=${encodeURIComponent(currentUserEmail)}`);
      const data = await res.json();
      console.log("DEBUG: /friends endpoint returned:", data);
 
      const mappedFriends = data.map((friend: any, idx: number) => ({
        id: friend.id ? friend.id.toString() : String(idx),
        first_name:friend.first_name.trim(),
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

    const handleUnadd = async (itineraryId: string) => {
      try {
        const response = await fetch(`${SERVER_IP}/unadd`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itinerary_id: itineraryId, friend_email: currentUserEmail }),
        });
        if (response.ok) {
          await fetchTrips(); // refresh trips list
          Alert.alert("Success", "You have been removed from this itinerary.");
        } else {
          Alert.alert("Error", "Failed to remove you from the itinerary.");
        }
      } catch (error) {
        console.error("Error in unadd:", error);
        Alert.alert("Error", "Something went wrong while processing your request.");
      }
    };

    const handleUnshare = async (itineraryId: string, friendEmail: string) => {
      try {
        const response = await fetch(`${SERVER_IP}/unshare`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itinerary_id: itineraryId, friend_email: friendEmail }),
        });
        if (response.ok) {
          await fetchTrips(); // refresh trips list
          Alert.alert("Success", "Friend removed from the itinerary.");
        } else {
          Alert.alert("Error", "Failed to unshare itinerary.");
        }
      } catch (error) {
        console.error("Error unsharing itinerary:", error);
        Alert.alert("Error", "Something went wrong.");
      }
    };
    
    const handleAddFriend = async () => {
      try {
        let friendEmail = "";
    
        if (searchType === "phone") {
          // Build the full phone string
          const fullPhone = `${phoneNumber}`.trim();
          if (!fullPhone) {
            Alert.alert("Error", "Please enter a valid phone number.");
            return;
          }
    
          // Look up the user by phone.
          const lookupRes = await fetch(
            `${SERVER_IP}/findUserByPhone?phone=${encodeURIComponent(fullPhone)}`
          );
    
          if (!lookupRes.ok) {
            Alert.alert("Error", "Failed to lookup phone number.");
            return;
          }
          const lookupData = await lookupRes.json();
    
          // Assume the endpoint returns an object with an 'email' field.
          if (!lookupData.email) {
            Alert.alert("Error", "No user found for that phone number.");
            return;
          }
          friendEmail = lookupData.email;
        } else {
          friendEmail = emailSearch.trim();
          if (!friendEmail) {
            Alert.alert("Error", "Please enter a valid email address.");
            return;
          }
        }
    
        // Send the friend request using the resolved email.
        const requestRes = await fetch(`${SERVER_IP}/sendFriendRequest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            from_email: currentUserEmail,
            to_email: friendEmail,
          }),
        });
    
        if (requestRes.ok) {
          Alert.alert("Success", "Friend request sent");
          setShowAddModal(false);
        } else {
          Alert.alert("Error", "Failed to send friend request.");
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
            <Text style={styles.modalTitle}>Add a Friend</Text>
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

      {unshareModalVisible && selectedItinerary && (
  <Modal
    visible={unshareModalVisible}
    transparent
    animationType="slide"
    onRequestClose={() => setUnshareModalVisible(false)}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Unshare Itinerary</Text>
        <Text style={styles.modalSubtitle}>Select a friend to unshare with</Text>
        {(() => {
          // Parse shared_with again for the selected itinerary (or reuse from state if available)
          let sharedWith: SharedFriend[] = [];
          if (
            selectedItinerary.shared_with &&
            selectedItinerary.shared_with.trim() !== ""
          ) {
            try {
              sharedWith = JSON.parse(selectedItinerary.shared_with) as SharedFriend[];
            } catch (error) {
              console.error("Error parsing shared_with:", error);
            }
          }
          return sharedWith.map((friend) => (
            <TouchableOpacity
              key={friend.email}
              style={styles.friendUnshareOption}
              onPress={async () => {
                await handleUnshare(selectedItinerary.itinerary_id, friend.email);
                setUnshareModalVisible(false);
              }}
            >
              <Text style={styles.requestUnshareText}>{friend.friend_name}</Text>
            </TouchableOpacity>
          ));
        })()}
        <TouchableOpacity onPress={() => setUnshareModalVisible(false)} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
)}



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
                  email_friend: item.email_friend,
                  first_name: item.first_name,
                  owner_name: user.first_name //to do fix this logic here, maybe if shared_with empty then this?
                })
              }
            >
              <Text style={styles.menuDots}>⋯</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Segmented Control for Trips */}
    <View style={styles.segmentedControlContainer}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          activeTripTab === "my" && styles.segmentButtonActive,
        ]}
        onPress={() => setActiveTripTab("my")}
      >
        <Text
          style={[
            styles.segmentButtonText,
            activeTripTab === "my" && styles.segmentButtonTextActive,
          ]}
        >
          My Trips Shared
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          activeTripTab === "shared" && styles.segmentButtonActive,
        ]}
        onPress={() => setActiveTripTab("shared")}
      >
        <Text
          style={[
            styles.segmentButtonText,
            activeTripTab === "shared" && styles.segmentButtonTextActive,
          ]}
        >
          Shared With Me
        </Text>
      </TouchableOpacity>
    </View>


      {/* Dynamic Trips With Friends Section */}
   <Text style={styles.sectionTitle}></Text>
    <FlatList
      horizontal
      // Filter trips based on the active tab:
      data={trips.filter((trip) => {
        // For "My Trips", only include trips where the current user is the owner.
        if (activeTripTab === "my") {
          return (
            trip.user_email === currentUserEmail &&
            trip.shared_with &&
            trip.shared_with.trim() !== "" &&
            trip.shared_with.trim() !== "[]"
          );        }
        // For "Shared With Me", include trips where the current user is not the owner
        // and shared_with is not empty (also filtering out empty array strings).
        return (
          trip.user_email !== currentUserEmail &&
          trip.shared_with &&
          trip.shared_with.trim() !== "" &&
          trip.shared_with.trim() !== "[]"
        );
      })}
      keyExtractor={(item) => item.itinerary_id.toString()}
      renderItem={({ item }) => {
        // Parse the shared_with JSON field
        let sharedWith: SharedFriend[] = [];
        if (item.shared_with && item.shared_with.trim() !== "") {
          try {
            sharedWith = JSON.parse(item.shared_with) as SharedFriend[];
          } catch (error) {
            console.error("Error parsing shared_with:", error);
          }
        }

        // Check if current user is the owner
        const isOwner = item.user_email === currentUserEmail;

        // For non-owners, get the friend mapping for current user
        const friendMapping = sharedWith.find(friend => friend.email === currentUserEmail);

        // Determine display name
        const displayName = isOwner
          ? (sharedWith.length > 0
              ? sharedWith.map(friend => friend.friend_name).join(", ")
              : "Not shared")
          : `Shared by: ${friendMapping?.owner_name || item.user_email}`;

        return (
          <View style={styles.tripCard}>
            <Image source={require("../../assets/images/avatar1.png")} style={styles.tripImage} />
            <Text style={styles.friendTripName}>{item.trip_title}</Text>
            <Text style={styles.friendName}>{displayName}</Text>
            {isOwner ? (
              // Owner: Unshare button to open modal for selective removal
              <TouchableOpacity
                style={styles.unshareButton}
                onPress={() => {
                  setSelectedItinerary(item);
                  setUnshareModalVisible(true);
                }}
              >
                <Feather name="trash-2" size={20} color="red" />
              </TouchableOpacity>
            ) : (
              // Non-owner: Unadd button to remove self
              <TouchableOpacity
                style={styles.unaddButton}
                onPress={() => handleUnadd(item.itinerary_id)}
              >
                <Feather name="x-circle" size={20} color="red" />
              </TouchableOpacity>
            )}
          </View>
        );
      }}
      ListEmptyComponent={
        <Text style={styles.emptyMessage}>
          {activeTripTab === "my"
            ? "You haven't shared any trips yet."
            : "No trips have been shared with you."}
        </Text>
      }
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
  unshareButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    padding: 4,
    borderRadius: 20,
    elevation: 2,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#888",
    fontFamily: "quicksand-bold",
  },
  unaddButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    padding: 4,
    borderRadius: 20,
    elevation: 2,
  },friendOption: {
    padding: 10,
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  friendOptionText: {
    fontSize: 16,
    fontFamily: "quicksand-regular",
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
    fontFamily: "quicksand-semibold",
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
  emptyMessage: {
    color: "#FF4444", 
    fontFamily: "quicksand-semibold",
    fontSize: 16,
    marginHorizontal: 10,
    marginVertical: 20,
  },  
  toggleButtonActive: {
    backgroundColor: "#ffcccc",
  },
  toggleText: {
    fontFamily: "quicksand-bold",
    fontSize: 14,
  },
  cancelButton: {
    marginTop: 10,
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
  requestUnshareItem: {
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center", // Centers content vertically
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.coral,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 15,
    width: "100%",
  },
  friendUnshareOption: {
    width: "100%",
    padding: 10,
    marginVertical: 8,        // Adds space above and below each option
    alignItems: "center",     // Centers children horizontally
    borderWidth: 1,
    borderColor: Colors.coral,
    borderRadius: 10,
  },
  
  requestUnshareText: {
    textAlign: "center",
    fontFamily: "quicksand-semibold",
    fontSize: 16,
    color: "#333",
    padding: 10,
  },
  
  modalSubtitle: {
    fontFamily: "quicksand-regular",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },

  segmentedControlContainer: {
    flexDirection: "row",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  segmentButtonActive: {
    backgroundColor: Colors.palePink,
  },
  segmentButtonText: {
    fontFamily: "quicksand-regular",
    fontSize: 16,
    color: Colors.dark.text,
  },
  segmentButtonTextActive: {
    fontFamily: "quicksand-bold",
    fontSize: 16,
    color: "#000",
  },
  
});


//export default FriendsScreen;
