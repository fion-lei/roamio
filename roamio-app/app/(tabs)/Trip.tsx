import React from "react"; 
import { View, Text, Image, TextInput, SafeAreaView, StyleSheet, Pressable, ScrollView } from "react-native";
import { Colors } from "@/constants/Colors"; 
import { FontAwesome } from "@expo/vector-icons"; // For the search and category icons **for now** 
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter(); // ✅ Get router instance for navigation
  
  return (
    
    <SafeAreaView style={styles.safeContainer}> 
    
    {/* Search Bar Section */}
    <View style={styles.searchContainer}>
      <FontAwesome name="search" size={18} color="grey" style={styles.searchIcon}/>
      <TextInput placeholder="Search Activity..." style={styles.searchInput} />
    </View>

    {/* Header */}
    <Text style={styles.header}>Activity Categories</Text>

    {/* Activity Categories Section */}
    <View style={styles.categoriesContainer}>
      <Pressable style={[styles.categoryIcon, {backgroundColor: Colors.palePink}]}> 
      <FontAwesome name="tree" size={24} color={Colors.peachySalmon}/>
      </Pressable>
      <Pressable style={[styles.categoryIcon, {backgroundColor: Colors.peachySalmon}]}>
        <FontAwesome name="heart" size={24} color={Colors.palePink} /> 
      </Pressable>
      <Pressable style={[styles.categoryIcon, {backgroundColor: Colors.palePink}]}>
        <FontAwesome name="fire" size={24} color={Colors.peachySalmon}/> 
      </Pressable>
      <Pressable style={[styles.categoryIcon, {backgroundColor: Colors.peachySalmon}]}>
        <FontAwesome name="camera" size={24} color={Colors.palePink}/> 
      </Pressable>
      </View>

      {/* Activity Cards Section */}
      <ScrollView style={styles.cardsContainer}>
        
        {/* [1st]. Elgin Hill */}
        <Pressable style={styles.tripCard}
          onPress = {() => router.push("/Add-Itinerary-1")}> 
          {/* Placeholder Image */}
          <Image source={require("@/assets/images/camp.png")}
          style={styles.cardImage}/> 
        <View style={styles.cardInfo}>
          <Text style={styles.cardDetails}>180 McKenzie Towne Dr SE</Text>
          <Text style={styles.cardTitle}>Elgin Hill</Text>
          </View>
          </Pressable> 
        
        {/* [2nd]. OEB Restaurant */}
        <Pressable style={styles.tripCard}
          onPress = {() => router.push("/Add-Itinerary-2")}> 
          {/* Placeholder Image */}
          <Image source={require("@/assets/images/food.png")}
          style={styles.cardImage}/> 
        <View style={styles.cardInfo}>
          <Text style={styles.cardDetails}>2207 4 St SW</Text>
          <Text style={styles.cardTitle}>OEB Breakfast Co.</Text>
          </View>
          </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1, 
    backgroundColor: Colors.white, 
    paddingHorizontal: 16,
  },
  searchContainer: {
    width: "100%",  
    flexDirection: "row",
    alignItems: "center", 
    paddingVertical: 5, 
    paddingHorizontal: 20, 
    borderRadius: 15,
    borderWidth: 1.5, 
    backgroundColor: "#F9F9F9", // Off-white 
    borderColor: Colors.grey,
    marginTop: 20, 
  },
  searchIcon: {
    marginRight: 10, 
  },
  searchInput: {
    flex: 1,
    color: Colors.grey,
    fontSize: 16, 
    fontFamily: "quicksand-semibold", 
  }, 
  header: {
    fontSize: 24,  
    fontFamily: "quicksand-bold",
    marginTop: 20,
  },
  categoriesContainer: {
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 15, 
  },
  categoryIcon: {
    width: 70,
    height: 60,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center", 
    elevation: 2, 
  },
  cardsContainer: {
    flex: 1, 
    marginTop: 25,
  }, 
  tripCard: {
    backgroundColor: Colors.white, 
    borderRadius: 15,
    elevation: 5, 
    overflow: "hidden", 
    // Box Shadow Generator: https://ethercreative.github.io/react-native-shadow-generator/
    shadowColor: Colors.primary,    
    shadowOffset: {
      width: 0,
      height: 2,
    }, 
    shadowOpacity: 0.30,
    shadowRadius: 3.84,
    marginBottom: 25, 
  },
  cardImage: {
    width: "100%", 
    height: 160,
    resizeMode: "cover", 
  },
  cardInfo: {
    padding: 10,
    marginLeft: 10,
  }, 
  cardTitle: {
    fontSize: 18,
    fontFamily: "quicksand-bold",  
  }, 
  cardDetails: {
    fontSize: 14, 
    fontFamily: "quicksand-regular",
    fontStyle: "italic", 
    color: Colors.grey,
  }, 
})