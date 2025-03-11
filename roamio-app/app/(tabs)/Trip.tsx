import React from "react"; 
import { View, Text, Image, TextInput, SafeAreaView, StyleSheet, Pressable, ScrollView } from "react-native";
import { Colors } from "@/constants/Colors"; 
import { FontAwesome } from "@expo/vector-icons"; // For the search and category icons **for now** 

export default function Home() {
  return (
    <SafeAreaView style={styles.safeContainer}> 
    
    {/* Search Bar Section */}
    <View style={styles.searchContainer}>
      <FontAwesome name="search" size={18} color="grey" style={styles.searchIcon}/>
      <TextInput placeholder="Search..." style={styles.searchInput} />
    </View>

    {/* Header */}
    <Text style={styles.header}>Upcoming Trips</Text>

    {/* Activity Categories Section */}
    <View style={styles.categoriesContainer}>
      <Pressable style={[styles.categoryIcon, {backgroundColor: Colors.palePink}]}> 
      <FontAwesome name="tree" size={24} color={Colors.peachySalmon}/>
      </Pressable>
      <Pressable style={[styles.categoryIcon, {backgroundColor: Colors.peachySalmon}]}>
        <FontAwesome name="skyatlas" size={24} color={Colors.palePink} /> 
      </Pressable>
      <Pressable style={[styles.categoryIcon, {backgroundColor: Colors.palePink}]}>
        <FontAwesome name="fire" size={24} color={Colors.peachySalmon}/> 
      </Pressable>
      <Pressable style={[styles.categoryIcon, {backgroundColor: Colors.peachySalmon}]}>
        <FontAwesome name="camera" size={24} color={Colors.palePink}/> 
      </Pressable>
      </View>

      {/* Trip Cards Section */}
      <ScrollView style={styles.cardsContainer}>
        
        {/* [1st]. Calgary Outdoors */}
        <Pressable style={styles.tripCard}>
          {/* Placeholder Image */}
          <Image source={require("@/assets/images/camp.png")}
          style={styles.cardImage}/> 
        <View style={styles.cardInfo}>
          <Text style={styles.cardDetails}>Alberta, Calgary - 2 Weeks</Text>
          <Text style={styles.cardTitle}>Calgary Outdoors</Text>
          </View>
          </Pressable> 
        
        {/* [2nd]. Calgary Food Tour */}
        <Pressable style={styles.tripCard}>
          {/* Placeholder Image */}
          <Image source={require("@/assets/images/food.png")}
          style={styles.cardImage}/> 
        <View style={styles.cardInfo}>
          <Text style={styles.cardDetails}>Alberta, Calgary - 1 Week</Text>
          <Text style={styles.cardTitle}>Calgary Food Tour</Text>
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