import React, { useState, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Modal,
  Alert,
} from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Colors } from "@/constants/Colors";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "expo-router";
import { TouchableWithoutFeedback } from "react-native";

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
    "default" | "A-Z" | "Z-A" | "Favorites"
  >("default");
  const [showDropdown, setShowDropdown] = useState(false);
  const [unshareModalVisible, setUnshareModalVisible] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(
    null
  );
  const [friendModalTab, setFriendModalTab] = useState<"add" | "requests">(
    "add"
  );

  const [searchType, setSearchType] = useState<"phone" | "email">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [showFriendRequestModal, setShowFriendRequestModal] = useState(false);
  const [activeTripTab, setActiveTripTab] = useState<"my" | "shared">("my");
  
  const router = useRouter();
  
  // Trips State
  const [trips, setTrips] = useState<Itinerary[]>([]);

  // For prototyping, we define the current user email.
  const currentUserEmail = user.email;

  // Example fields you might have
  // Adjust to match your actual CSV or database fields
  interface Itinerary {
    itinerary_id: string; // or number
    user_email: string;
    trip_title: string;
    shared_with?: string;
    first_name: String; // optional if some rows have empty data
  }

  interface SharedFriend {
    email: string;
    access?: string;
    friend_name: string; // optional, if you have more properties add them here
    owner_name: string;
  }

  const fetchFriendsList = async () => {
    try {
      const res = await fetch(
        `${SERVER_IP}/friends?email=${encodeURIComponent(currentUserEmail)}`
      );
      const data = await res.json();
      const mappedFriends = data.map((friend: any, idx: number) => ({
        id: friend.id ? friend.id.toString() : String(idx),
        first_name: friend.first_name.trim(),
        name: `${friend.first_name || ""} ${friend.last_name || ""}`.trim(),
        phone: friend.phone_number || "",
        avatar: require("../../assets/images/avatar1.png"),
        email_friend: friend.email || "",
        favorited: friend.favorite === true,
        bio: friend.bio, // add bio
        traveller_type: friend.traveller_type, // add traveller_type
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
        `${SERVER_IP}/friendRequests?email=${encodeURIComponent(
          currentUserEmail
        )}`
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
            name: `${senderProfile.first_name || ""} ${
              senderProfile.last_name || ""
            }`.trim(),
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
      const response = await fetch(
        `${SERVER_IP}/itineraries?email=${currentUserEmail}`
      );
      const data = await response.json();
      setTrips(data.itineraries);
    } catch (error) {
      console.error("Error fetching itineraries:", error);
    }
  };

  const filteredFriends = friendsList
    .filter(
      (friend) =>
        friend.name.toLowerCase().includes(searchText.toLowerCase()) ||
        friend.phone.toLowerCase().includes(searchText.toLowerCase()) ||
        friend.email_friend.toLowerCase().includes(searchText.toLowerCase()) // Added email search
    )
    .sort((a, b) => {
      if (filterType === "A-Z") return a.name.localeCompare(b.name);
      if (filterType === "Z-A") return b.name.localeCompare(a.name);
      if (filterType === "Favorites") {
        return a.favorited === b.favorited ? 0 : a.favorited ? -1 : 1;
      }
      return 0;
    });

  const handleUnadd = async (itineraryId: string) => {
    Alert.alert(
      "Confirm Removal",
      "Are you sure you want to remove yourself from this itinerary?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${SERVER_IP}/unadd`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  itinerary_id: itineraryId,
                  friend_email: currentUserEmail,
                }),
              });
              if (response.ok) {
                await fetchTrips(); // refresh trips list
                Alert.alert(
                  "Success",
                  "You have been removed from this itinerary."
                );
              } else {
                Alert.alert(
                  "Error",
                  "Failed to remove you from the itinerary."
                );
              }
            } catch (error) {
              console.error("Error in unadd:", error);
              Alert.alert(
                "Error",
                "Something went wrong while processing your request."
              );
            }
          },
        },
      ]
    );
  };

  const handleUnshare = async (itineraryId: string, friendEmail: string) => {
    Alert.alert(
      "Confirm Unshare",
      "Are you sure you want to remove this friend from the itinerary?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unshare",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${SERVER_IP}/unshare`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  itinerary_id: itineraryId,
                  friend_email: friendEmail,
                }),
              });
              if (response.ok) {
                await fetchTrips(); // refresh trips list
                setUnshareModalVisible(false); // close modal
                Alert.alert("Success", "Friend removed from the itinerary.");
              } else {
                Alert.alert("Error", "Failed to unshare itinerary.");
              }
            } catch (error) {
              console.error("Error unsharing itinerary:", error);
              Alert.alert("Error", "Something went wrong.");
            }
          },
        },
      ]
    );
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
        setPhoneNumber("");
        setEmailSearch("");
        setShowFriendRequestModal(false);
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
        <FontAwesome
          name="search"
          size={18}
          color="grey"
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search Friends..."
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
      </View>

      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Your Friends</Text>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <Pressable
            onPress={() => setShowDropdown(true)}
            style={styles.dropdownToggleMini}
          >
            <Text style={styles.dropdownText}>
              {filterType === "default" ? "Filter" : filterType}
            </Text>
            <FontAwesome name="filter" size={20} color="#d9534f" />
          </Pressable>
          <Pressable 
            onPress={() => setShowFriendRequestModal(true)}
          >
            <FontAwesome name="user-plus" size={24} color={Colors.coral} />
          </Pressable>
        </View>
      </View>

      {/* Filter Dropdown Modal */}
      <Modal visible={showDropdown} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.modalContent}>
            {["Favorites", "A-Z", "Z-A"].map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  if (option === "A-Z") setFilterType("A-Z");
                  else if (option === "Z-A") setFilterType("Z-A");
                  else setFilterType("Favorites");
                  setShowDropdown(false);
                }}
                style={styles.modalItem}
              >
                <Text style={styles.modalText}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showFriendRequestModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFriendRequestModal(false)}
      >
        <Pressable
          style={modalStyles.modalOverlay}
          onPress={() => setShowFriendRequestModal(false)}
        >
          <TouchableWithoutFeedback>
            <View style={[modalStyles.modalContent]}>
              {/* Modal Tab Header */}
              <View style={modalStyles.modalTabContainer}>
                <Pressable
                  style={[
                    modalStyles.modalTabButton,
                    friendModalTab === "add" && modalStyles.modalTabActive,
                  ]}
                  onPress={() => setFriendModalTab("add")}
                >
                  <Text
                    style={[
                      modalStyles.modalTabText,
                      friendModalTab === "add" &&
                        modalStyles.modalTabTextActive,
                    ]}
                  >
                    Add Friend
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    modalStyles.modalTabButton,
                    friendModalTab === "requests" && modalStyles.modalTabActive,
                  ]}
                  onPress={() => setFriendModalTab("requests")}
                >
                  <Text
                    style={[
                      modalStyles.modalTabText,
                      friendModalTab === "requests" &&
                        modalStyles.modalTabTextActive,
                    ]}
                  >
                    Friend Requests
                  </Text>
                </Pressable>
              </View>

              {friendModalTab === "add" ? (
                <>
                  <View style={modalStyles.toggleContainer}>
                    <Pressable
                      style={[
                        modalStyles.toggleButton,
                        searchType === "phone" &&
                          modalStyles.toggleButtonActive,
                      ]}
                      onPress={() => setSearchType("phone")}
                    >
                      <Text style={modalStyles.toggleText}>Phone</Text>
                    </Pressable>
                    <Pressable
                      style={[
                        modalStyles.toggleButton,
                        searchType === "email" &&
                          modalStyles.toggleButtonActive,
                      ]}
                      onPress={() => setSearchType("email")}
                    >
                      <Text style={modalStyles.toggleText}>Email</Text>
                    </Pressable>
                  </View>
                  {searchType === "phone" ? (
                    <View style={modalStyles.phoneInputRow}>
                      <TextInput
                        style={[
                          modalStyles.modalInput,
                          { flex: 1, fontSize: 20 },
                        ]}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        placeholder="--- --- ---"
                        placeholderTextColor="#4B5563"
                        keyboardType="phone-pad"
                      />
                    </View>
                  ) : (
                    <TextInput
                      style={modalStyles.modalInput}
                      value={emailSearch}
                      onChangeText={setEmailSearch}
                      placeholder="abc@email.com"
                      placeholderTextColor="#4B5563"
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  )}
                  <Pressable
                    style={modalStyles.addButton}
                    onPress={handleAddFriend}
                  >
                    <Text style={modalStyles.addButtonText}>
                      Send Friend Request
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  {friendRequests.length === 0 ? (
                    <Text
                      style={{
                        fontFamily: "quicksand-medium",
                        marginBottom: 10,
                      }}
                    >
                      No friend requests at the moment.
                    </Text>
                  ) : (
                    friendRequests.map((request) => (
                      <View key={request.id} style={modalStyles.requestItem}>
                        <Image
                          source={request.avatar}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            marginBottom: 5,
                          }}
                        />
                        <Text
                          style={{
                            fontFamily: "quicksand-bold",
                            marginBottom: 5,
                          }}
                        >
                          {request.name}
                        </Text>
                        <View style={{ flexDirection: "row", gap: 10 }}>
                          <Pressable
                            style={{
                              backgroundColor: "#ff8080",
                              padding: 8,
                              borderRadius: 8,
                            }}
                            onPress={() =>
                              handleAcceptFriendRequest(request.id)
                            }
                          >
                            <Text
                              style={{
                                color: "#fff",
                                fontFamily: "quicksand-bold",
                              }}
                            >
                              Accept
                            </Text>
                          </Pressable>
                          <Pressable
                            style={{
                              backgroundColor: "#ccc",
                              padding: 8,
                              borderRadius: 8,
                            }}
                            onPress={() =>
                              handleDeclineFriendRequest(request.id)
                            }
                          >
                            <Text
                              style={{
                                color: "#333",
                                fontFamily: "quicksand-bold",
                              }}
                            >
                              Decline
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    ))
                  )}
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </Modal>

      {unshareModalVisible && selectedItinerary && (
        <Modal
          visible={unshareModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setUnshareModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Unshare Itinerary</Text>
              <Text style={styles.modalSubtitle}>
                Select a friend to unshare with
              </Text>
              {(() => {
                // Parse shared_with again for the selected itinerary (or reuse from state if available)
                let sharedWith: SharedFriend[] = [];
                if (
                  selectedItinerary.shared_with &&
                  selectedItinerary.shared_with.trim() !== ""
                ) {
                  try {
                    sharedWith = JSON.parse(
                      selectedItinerary.shared_with
                    ) as SharedFriend[];
                  } catch (error) {
                    console.error("Error parsing shared_with:", error);
                  }
                }
                return sharedWith.map((friend) => (
                  <Pressable
                    key={friend.email}
                    style={styles.friendUnshareOption}
                    onPress={async () => {
                      await handleUnshare(
                        selectedItinerary.itinerary_id,
                        friend.email
                      );
                      setUnshareModalVisible(true);
                    }}
                  >
                    <Text style={styles.requestUnshareText}>
                      {friend.friend_name}
                    </Text>
                  </Pressable>
                ));
              })()}
              <Pressable
                onPress={() => setUnshareModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      {/* Friends List */}
      <View style={styles.friendListContainer}>
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
                    <FontAwesome name="star" size={16} color="#FFD700" />
                  )}
                </Text>
                <Text style={styles.friendPhone}>{item.phone}</Text>
              </View>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/screens/FriendsDetails",
                    params: {
                      name: item.name,
                      phone: item.phone,
                      email_friend: item.email_friend,
                      avatar: item.avatar,
                      first_name: item.first_name,
                      owner_name: user.first_name,
                      traveller_type: item.traveller_type,
                      bio: item.bio,
                    },
                  })
                }
              >
                <Text style={styles.menuDots}>⋯</Text>
              </Pressable>
            </View>
          )}
        />
      </View>
      {/* Segmented Control for Trips */}
      <View style={styles.segmentedControlContainer}>
        <Pressable
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
        </Pressable>
        <Pressable
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
        </Pressable>
      </View>

      {/* Dynamic Trips With Friends Section */}
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
            );
          }
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
          const friendMapping = sharedWith.find(
            (friend) => friend.email === currentUserEmail
          );

          const friendAccess =
            activeTripTab === "shared"
              ? "Owner"
              : (
                  sharedWith.find((friend) => friend.email === friend.email)
                    ?.access || "No access type"
                ).replace(/\b\w/g, (char) => char.toUpperCase());

          // Determine display name
          const displayName = isOwner
            ? sharedWith.length > 0
              ? sharedWith.map((friend) => friend.friend_name).join(", ")
              : "Not shared"
            : `${friendMapping?.owner_name || item.user_email}`;
          return (
            <View style={styles.tripCard}>
              <Image
                source={require("../../assets/images/avatar1.png")}
                style={styles.tripImage}
              />

              <View
                style={{
                  alignSelf: "center",
                  backgroundColor: "#ffe5e5",
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginBottom: 5,
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <Text style={styles.friendTripName}>{item.trip_title}</Text>
              </View>
              <Text style={styles.friendName}>{displayName}</Text>
              <Text style={styles.friendAccess}>{friendAccess}</Text>

              {isOwner ? (
                // Owner: Unshare button to open modal for selective removal
                <Pressable
                  style={styles.unshareButton}
                  onPress={() => {
                    setSelectedItinerary(item);
                    setUnshareModalVisible(true);
                  }}
                >
                  <FontAwesome name="trash-o" size={20} color="red" />
                </Pressable>
              ) : (
                // Non-owner: Unadd button to remove self
                <Pressable
                  style={styles.unaddButton}
                  onPress={() => handleUnadd(item.itinerary_id)}
                >
                  <Feather name="x-circle" size={20} color="red" />
                </Pressable>
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
        showsHorizontalScrollIndicator={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
  },
  searchBarContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1.5,
    backgroundColor: "#F9F9F9", // Off-white
    borderColor: Colors.grey,
    marginTop: 20,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: "#333",
    fontSize: 16,
    fontFamily: "quicksand-semibold",
  },
  searchIcon: {
    marginRight: 10,
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
  },
  friendOption: {
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
    alignContent: "space-between",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.palePink,
    elevation: 1,
  },
  dropdownText: {
    color: "#d9534f",
    fontSize: 16,
    fontFamily: "quicksand-semibold",
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
    fontSize: 16,
    color: Colors.primary,
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 280,
    padding: 20,
    alignItems: "center",
  },
  modalItem: { paddingVertical: 12, paddingHorizontal: 20 },
  modalText: {
    fontSize: 16,
    fontFamily: "quicksand-regular",
    color: Colors.primary,
  },
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
  friendListContainer: {
    height: 300,
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontFamily: "quicksand-semibold",
    color: Colors.primary,
  },
  friendAccess: {
    fontSize: 16,
    color: Colors.peachySalmon,
    fontFamily: "quicksand-semibold",
  },
  friendPhone: {
    color: "#333",
    marginTop: 2,
    fontFamily: "quicksand-regular",
    fontSize: 16,
  },
  menuDots: {
    fontSize: 22,
    color: "#333",
    paddingLeft: 10,
  },
  tripCard: {
    width: 180,
    height: 180,
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
  tripImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 6,
  },
  friendTripName: {
    fontSize: 16,
    color: "black",
    fontFamily: "quicksand-semibold",
  },
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
    marginVertical: 8, // Adds space above and below each option
    alignItems: "center", // Centers children horizontally
    borderWidth: 1,
    borderColor: Colors.coral,
    borderRadius: 10,
    backgroundColor: Colors.palestPink,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 1,
  },

  requestUnshareText: {
    textAlign: "center",
    fontFamily: "quicksand-semibold",
    fontSize: 16,
    color: Colors.primary,
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
    borderWidth: 2,
    borderColor: Colors.palePink,
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
    color: "#333",
  },
  segmentButtonTextActive: {
    fontFamily: "quicksand-bold",
    fontSize: 16,
    color: "#000",
  },
});

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    width: "80%",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    fontFamily: "quicksand-bold",
    color: "#888",
  },
  modalTabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    width: "100%",
  },
  modalTabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  modalTabActive: {
    borderColor: Colors.coral,
  },
  modalTabText: {
    fontSize: 16,
    fontFamily: "quicksand-bold",
    color: "#333",
  },
  modalTabTextActive: {
    color: Colors.coral,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "quicksand-bold",
    marginBottom: 15,
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
    fontSize: 16,
    color: Colors.primary,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
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
  modalCancelButton: {
    backgroundColor: Colors.grey,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "quicksand-bold",
  },
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