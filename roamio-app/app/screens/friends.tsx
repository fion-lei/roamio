import React from "react";
import { useFonts } from 'expo-font';
import { TextInput } from "react-native";
import { useState } from "react";
import { Feather } from '@expo/vector-icons';
import { Colors } from "@/constants/Colors"; 



import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define the route param list
type RootStackParamList = {
  FriendsScreen: undefined;
  Detail: { name: string; phone: string; avatar: any };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'FriendsScreen'>;



const friends = [
  {
    id: "1",
    name: "Courtney",
    phone: "+1 403-888-0000",
    avatar: require("../../assets/images/avatar1.png"),
  },
  {
    id: "2",
    name: "Jenny Wilson",
    phone: "+84 91 234 5678",
    avatar: require("../../assets/images/avatar1.png"),
  },
  {
    id: "3",
    name: "Brooklyn Simmons",
    phone: "+66 96 876 5432",
    avatar: require("../../assets/images/avatar1.png"),
  },
];

const trips = [
  {
    id: "1",
    name: "Gar",
    price: "Seniores-Pizza",
    image: require("../../assets/images/avatar1.png"),
  },
  {
    id: "2",
    name: "Sassa",
    price: "Calgary Tower",
    image: require("../../assets/images/avatar1.png"),
  },
];

const FriendsScreen = () => {

  const [fontsLoaded] = useFonts({
    'quicksand-regular': require('../../assets/fonts/Quicksand-Regular.ttf'),
    'quicksand-bold': require('../../assets/fonts/Quicksand-Bold.ttf'),
  });

  const [searchText, setSearchText] = useState('');

  if (!fontsLoaded) {
    return null; // or a loading indicator
  }
  
  const navigation = useNavigation<NavigationProp>();

  const handleAddFriend = () => {
    console.log("Add Friend Pressed!");
  };

  return (
    
    <View style={styles.container}>
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

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Your Friends</Text>
        <TouchableOpacity onPress={handleAddFriend}>
  <Feather name="plus-circle" size={25} />
</TouchableOpacity>

      </View>

      {/* Friends List */}
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <Image source={item.avatar} style={styles.avatar} />
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{item.name}</Text>
              <Text style={styles.friendphone}>{item.phone}</Text>
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

      {/* Trips List */}
      <Text style={styles.sectionTitle}>Trips With Friends</Text>
      <FlatList
        horizontal
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tripCard}>
            <Image source={item.image} style={styles.tripImage} />
            <Text style={styles.tripName}>{item.name}</Text>
            <Text style={styles.tripPrice}>{item.price}</Text>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Quicksand-bold',
    paddingBottom: 20
  },
  addButton: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.coral,
  },
  menuDots: {
    fontSize: 20,
    color: "#888",
    paddingLeft: 10,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 6,
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
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
    fontWeight: "600",
    fontSize: 16,
    fontFamily: 'Quicksand-regular'
  },
  friendphone: {
    color: "#888",
    marginTop: 2,
    fontFamily: 'Quicksand-regular'
  },
  tripCard: {
    width: 180,
    height: 170,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
    marginRight: 15,
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowOffset: { width: 2, height: 2 },
  },
  tripImage: {
    width: 50,      // smaller
    height: 50,     // smaller
    borderRadius: 25,
    marginBottom: 6, // less spacing
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0f0', // soft pink aesthetic
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Quicksand-regular',
    color: '#333',
  },  
  tripName: {
    fontWeight: "600",
    fontSize: 16,
    fontFamily: 'Quicksand-bold',
  },
  tripPrice: {
    color: "#888",
  },
});

export default FriendsScreen;
