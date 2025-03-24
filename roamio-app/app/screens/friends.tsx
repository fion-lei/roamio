import React, { useState } from "react";
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
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { Colors } from "@/constants/Colors";

// Types
type RootStackParamList = {
  FriendsScreen: undefined;
  Detail: { name: string; phone: string; avatar: any };
};
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'FriendsScreen'>;

// Mock friend search data
const mockUsers = [
  { name: "Jessica Pearson", phone: "+1 403-555-1234", email: "jessica@pearson.com" },
  { name: "Mike Ross", phone: "+1 587-333-9999", email: "mike@ross.com" },
  { name: "Harvey Specter", phone: "+1 587-000-8888", email: "harvey@zane.com" },
];

// Default friends list
const defaultFriends = [
  { id: "1", name: "Courtney Smith", phone: "+1 403-888-0000", avatar: require("../../assets/images/avatar1.png"), favorited: false },
  { id: "2", name: "Gary Wilson", phone: "+84 91 234 5678", avatar: require("../../assets/images/avatar4.png"), favorited: false },
  { id: "3", name: "Brooklyn Simmons", phone: "+66 96 876 5432", avatar: require("../../assets/images/avatar3.png"), favorited: true },
];

// Trip data
const trips = [
  { id: "1", name: "Courtney", price: "Stampede", image: require("../../assets/images/avatar1.png") },
  { id: "2", name: "Gary", price: "Seniores-Pizza", image: require("../../assets/images/avatar4.png") },
  { id: "3", name: "Anna", price: "Stampede", image: require("../../assets/images/avatar3.png") },
];

// Mock friend request data
const mockFriendRequests = [
  { id: "req1", name: "John Zane", phone: "+1 123-456-7890", avatar: require("../../assets/images/avatar2.png") },
  { id: "req2", name: "Louis Litt", phone: "+1 987-654-3210", avatar: require("../../assets/images/avatar3.png") },
];

const FriendsScreen = () => {
  const [fontsLoaded] = useFonts({
    'quicksand-regular': require('../../assets/fonts/Quicksand-Regular.ttf'),
    'quicksand-bold': require('../../assets/fonts/Quicksand-Bold.ttf'),
  });

  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<'default' | 'alphabetical' | 'reverse' | 'favorites'>('default');
  const [showDropdown, setShowDropdown] = useState(false);

  const [friendsList, setFriendsList] = useState(defaultFriends);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFriendRequestModal, setShowFriendRequestModal] = useState(false);
  const [searchType, setSearchType] = useState<'phone' | 'email'>('phone');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailSearch, setEmailSearch] = useState('');
  const [friendRequests, setFriendRequests] = useState(mockFriendRequests);

  const navigation = useNavigation<NavigationProp>();

  if (!fontsLoaded) return null;

  const filteredFriends = [...friendsList]
    .filter(friend => {
      const matchesSearch = friend.name.toLowerCase().includes(searchText.toLowerCase());
      if (filterType === 'favorites') {
        return matchesSearch && friend.favorited;
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      if (filterType === 'alphabetical') return a.name.localeCompare(b.name);
      if (filterType === 'reverse') return b.name.localeCompare(a.name);
      return 0;
    });

  const handleAddFriend = () => {
    let match = null;

    if (searchType === 'phone') {
      const fullPhone = `${countryCode} ${phoneNumber}`.trim();
      match = mockUsers.find(user => user.phone === fullPhone);
    } else {
      match = mockUsers.find(user =>
        user.email?.toLowerCase() === emailSearch.toLowerCase()
      );
    }

    if (match) {
      const newFriend = {
        id: Date.now().toString(),
        name: match.name,
        phone: match.phone,
        avatar: require("../../assets/images/avatar1.png"),
        favorited: false,
      };
      setFriendsList([newFriend, ...friendsList]);
      setCountryCode('+1');
      setPhoneNumber('');
      setEmailSearch('');
      setShowAddModal(false);
    } else {
      Alert.alert("Friend not found", "Check the info and try again.");
    }
  };

  const handleAcceptFriendRequest = (requestId: string) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (request) {
      const newFriend = {
        id: Date.now().toString(),
        name: request.name,
        phone: request.phone,
        avatar: request.avatar,
        favorited: false,
      };
      setFriendsList([newFriend, ...friendsList]);
      setFriendRequests(friendRequests.filter(r => r.id !== requestId));
    }
  };

  const handleDeclineFriendRequest = (requestId: string) => {
    setFriendRequests(friendRequests.filter(r => r.id !== requestId));
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <Feather name="search" size={18} color="#888" />
        <TextInput
          placeholder="Search friends..."
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
              {filterType === 'default' ? 'Filter' : filterType}
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
            {['Favorites', 'A-Z', 'Z-A'].map(option => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  if (option === 'A-Z') setFilterType('alphabetical');
                  else if (option === 'Z-A') setFilterType('reverse');
                  else setFilterType('favorites');
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
                  searchType === 'phone' && styles.toggleButtonActive,
                ]}
                onPress={() => setSearchType('phone')}
              >
                <Text style={styles.toggleText}>Phone</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  searchType === 'email' && styles.toggleButtonActive,
                ]}
                onPress={() => setSearchType('email')}
              >
                <Text style={styles.toggleText}>Email</Text>
              </TouchableOpacity>
            </View>

            {searchType === 'phone' ? (
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
              <Text style={styles.addButtonText}>Add Friend</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowAddModal(false)} style={{ marginTop: 10 }}>
              <Text style={{ color: '#888' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Friend Requests Modal */}
      <Modal visible={showFriendRequestModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          {/* Increased modal size by adjusting width */}
          <View style={[styles.modalContent, { width: 340 }]}>
            <Text style={styles.modalTitle}>Friend Requests</Text>
            {friendRequests.length === 0 ? (
              <Text style={{ fontFamily: 'quicksand-regular', marginBottom: 10 }}>
                No friend requests at the moment.
              </Text>
            ) : (
              friendRequests.map(request => (
                <View key={request.id} style={styles.requestItem}>
                  <Image
                    source={request.avatar}
                    style={{ width: 40, height: 40, borderRadius: 20, marginBottom: 5 }}
                  />
                  <Text style={{ fontFamily: 'quicksand-bold', marginBottom: 5 }}>
                    {request.name}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      style={{ backgroundColor: '#ff8080', padding: 8, borderRadius: 8 }}
                      onPress={() => handleAcceptFriendRequest(request.id)}
                    >
                      <Text style={{ color: '#fff', fontFamily: 'quicksand-bold' }}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ backgroundColor: '#ccc', padding: 8, borderRadius: 8 }}
                      onPress={() => handleDeclineFriendRequest(request.id)}
                    >
                      <Text style={{ color: '#333', fontFamily: 'quicksand-bold' }}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
            <TouchableOpacity onPress={() => setShowFriendRequestModal(false)} style={{ marginTop: 10 }}>
              <Text style={{ color: '#888', fontFamily: 'quicksand-regular' }}>Close</Text>
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
                {item.name} {item.favorited && <Feather name="star" size={16} color="#BCCDB1" />}
              </Text>
              <Text style={styles.friendPhone}>{item.phone}</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Detail", {
                  name: item.name,
                  phone: item.phone,
                  avatar: item.avatar,
                })
              }
            >
              <Text style={styles.menuDots}>⋯</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Trips Section */}
      <Text style={styles.sectionTitle}>Trips With Friends</Text>
      <FlatList
        horizontal
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tripCard}>
            <Image source={item.image} style={styles.tripImage} />
            <Text style={styles.friendName}>{item.name}</Text>
            <Text style={styles.friendTripName}>{item.price}</Text>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 25, paddingHorizontal: 20, backgroundColor: "#ffffff" },
  searchBarContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff0f0',
    borderRadius: 25, paddingHorizontal: 16, paddingVertical: 10,
    marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 16, fontFamily: 'quicksand-regular', color: '#333' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'quicksand-bold',
    marginBottom: 10,
  },
  dropdownToggleMini: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dropdownText: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    marginRight: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#ffcccc',
  },
  toggleText: {
    fontFamily: 'quicksand-bold',
    fontSize: 14,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: '#fff', borderRadius: 12, width: 280, padding: 20, alignItems: 'center'
  },
  modalItem: { paddingVertical: 12, paddingHorizontal: 20 },
  modalText: { fontSize: 16, fontFamily: 'quicksand-regular' },
  modalTitle: { fontSize: 20, fontFamily: 'quicksand-bold', marginBottom: 15 },
  modalInput: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10,
    width: '100%', fontFamily: 'quicksand-regular'
  },
  addButton: {
    backgroundColor: '#ff8080', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8,
  },
  addButtonText: {
    color: '#fff', fontSize: 16, fontFamily: 'quicksand-bold',
  },
  friendItem: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    padding: 20, borderRadius: 12, marginBottom: 6, shadowColor: "#000",
    shadowOpacity: 0.10, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2, borderWidth: 0.5,
    borderColor: Colors.coral,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 15 },
  friendInfo: { flex: 1 },
  friendName: { fontWeight: "600", fontSize: 16, fontFamily: 'quicksand-semibold' },
  friendPhone: { color: "#888", marginTop: 2, fontFamily: 'quicksand-regular' },
  menuDots: { fontSize: 20, color: "#888", paddingLeft: 10 },
  tripCard: {
    width: 180, height: 150, backgroundColor: "#fff", borderRadius: 16,
    padding: 10, alignItems: "center", marginRight: 15, shadowColor: "#000",
    shadowOpacity: 0.10, shadowOffset: { width: 2, height: 2 }, borderWidth: 0.5,
    borderColor: Colors.coral,
  },
  tripImage: { width: 50, height: 50, borderRadius: 25, marginBottom: 6 },
  friendName: { fontSize: 16, fontFamily: 'quicksand-bold' },
  friendTripName: { color: Colors.grey, fontFamily: 'quicksand-semibold' },
  // New style for friend request items
  requestItem: {
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.coral,
    borderRadius: 8,
    padding: 10,
    width: '100%',
  },
});

export default FriendsScreen;
