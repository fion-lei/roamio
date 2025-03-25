import React from "react"; 
import { View, Text, Image, TextInput, SafeAreaView, StyleSheet, Pressable, ScrollView } from "react-native"; // Images reference: https://undraw.co/
import { Colors } from "@/constants/Colors"; 
import { FontAwesome } from "@expo/vector-icons"; // For the search and category icons **for now**: https://oblador.github.io/react-native-vector-icons/
import { useRouter } from "expo-router";
import { useState } from "react"; 

export default function Home() {

// Define data type used 
type CategoryId = "outdoors" | "hotspot" | "dining" | "culture";
type IconName = "tree" | "heart" | "fire" | "paint-brush"; // Include category icons used only 

// Include activity category labels? 
interface ActivityCategory {
  id: CategoryId;
  icon: IconName;
  color: string;
  iconColor: string;
  label: string;
}

// Category array? card can belong to multiple categories 
// Add reviews for activity cards? 
// Add ratings for activity cards? 
interface ActivityCard {
  id: string;
  title: string;
  address: string;
  hours: string; 
  contact: string; 
  description: string;
  image: any; // Image usually set as "any" type 
  category: CategoryId;
  tags: string[];
}

// Holds all activity categories 
// Include activity category labels or just have the icons? 
// Make "hotspot" categories stand out from the rest of the categories? - Have different colors for the category icons 
const activityCategories: ActivityCategory[] = [
  { 
    id: "outdoors", 
    icon: "tree", 
    color: Colors.palePink, 
    iconColor: Colors.peachySalmon,
    label: "Outdoors"
  }, 
  { 
    id: "hotspot", 
    icon: "heart", 
    color: Colors.peachySalmon, 
    iconColor: Colors.palePink,
    label: "Hotspot"
  },
  { 
    id: "dining", 
    icon: "fire", 
    color: Colors.palePink, 
    iconColor: Colors.peachySalmon,
    label: "Dining"
  }, 
  { 
    id: "culture", 
    icon: "paint-brush", 
    color: Colors.peachySalmon, 
    iconColor: Colors.palePink,
    label: "Culture"
  },
];

// Holds all activity cards
// Category array? card can belong to multiple categories 
// Add reviews to activity cards? 
// Add ratings to activity cards? 
const activityCards: ActivityCard[] = [ 
  { 
    id: "elgin", 
    title: "Elgin Hill", 
    address: "180 McKenzie Town Dr SE", 
    hours: "Monday - Friday, 12:00PM - 5:00PM", 
    contact: "(403) - 111 - 1111", 
    description: `Elgin Hill is a park located in Calgary, Alberta, Canada. It is part of the City of Calgary's extensive network of parks, which includes notable locations such as Nose Hill Park, Poppy Plaza, Ranchlands Park, and many others. While specific details about Elgin Hill are limited, it is likely to offer recreational activities and green spaces typical of Calgary's parks, such as walking trails, picnic areas, and natural landscapes.`,
    image: require("@/assets/images/camp.png"),
    category: "outdoors", 
    tags: ["#Nature", "#Relax", "#Park", "#Pet-Friendly", "#Leisure"],
  },
  
  { 
    id: "oeb", 
    title: "OEB Breakfast Co.", 
    address: "2207 4 St SW",  
    hours: "Monday - Sunday, 9:00AM - 7:00PM", 
    contact: "(403) - 222 - 3333", 
    description: `OEB was established in 2009; in Calgary – a Canadian city with big potential and small-town values. The people at OEB possess a deep love of food, giving staff the confidence to excite and welcome guests. The OEB menu is purposeful, filled with items that simply can't be made at home, balanced by lighter fare and vegan options. The people at OEB possess a deep love of food, giving staff the confidence to excite and welcome guests.`,
    image: require("@/assets/images/food.png"),
    category: "dining",
    tags: ["#Brunch", "#CozyVibes", "#Family-Friendly", "#PhotoReady"],
  },
]; 
  
  const router = useRouter(); // ✅ Get router instance for navigation
  const [searchText, setSearchText] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "">("");

  // Filter activities based on search text and selected category
  const filteredActivities = activityCards.filter(activity => {
    // Search based on activity title or address 
    const matchesSearch = searchText === "" || 
      activity.title.toLowerCase().includes(searchText.toLowerCase()) ||  
      activity.address.toLowerCase().includes(searchText.toLowerCase()); 
    
    const matchesCategory = selectedCategory === "" || 
      activity.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle category selection 
  const handleCategoryPress = (categoryId: CategoryId) => {
    // If already selected, clear the filter
    // Otherwise, set the filter
    // If category array, filter for multiple category presses?
    setSelectedCategory(prevCategory => 
      prevCategory === categoryId ? "" : categoryId
    );
  };
  
  return (
    
    <SafeAreaView style={styles.safeContainer}> 
    
      {/* Search Bar Section */}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={18} color="grey" style={styles.searchIcon}/>
        <TextInput 
          placeholder="Search Activity..." 
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Header */}
      <Text style={styles.header}>Activity Categories</Text>

      {/* Activity Categories Section */}
      <View style={styles.categoriesWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScrollView}>
          <View style={styles.categoriesContainer}>
            {activityCategories.map((category) => (
              <Pressable 
                key={category.id}
                style={[
                  styles.categoryItem,
                  { backgroundColor: category.color },
                  // Selected category should be indicated when selected 
                  selectedCategory === category.id && styles.selectedCategory
                ]} 
                onPress={() => handleCategoryPress(category.id)}
              >
                <FontAwesome 
                  name={category.icon} 
                  size={24} 
                  color={category.iconColor}
                />
              
                {/* Keep category label on category icons? */}
                <Text style={styles.categoryLabel}>{category.label}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
        </View>

      {/* Activity Cards Section */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cardsContainer}>
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <Pressable 
              key={activity.id}
              style={styles.tripCard}
              onPress={() => router.push({
                // Route dynamically to add itinerary screen 
                pathname: "/Add-Itinerary",
                // Set params for routing purposes for activity cards 
                params: {
                  title: activity.title, 
                  address: activity.address,
                  contact: activity.contact, 
                  hours: activity.hours, 
                  description: activity.description,
                  image: activity.image, 
                  tags: activity.tags.join(","),
                } 
              })}
            > 
              <Image 
                source={activity.image}
                style={styles.cardImage}
              /> 
              <View style={styles.cardInfo}>
                <Text style={styles.cardDetails}><FontAwesome name="map-pin" size={12} color={Colors.coral}></FontAwesome> {activity.address}</Text>
                <Text style={styles.cardTitle}>{activity.title}</Text>
              </View>
            </Pressable>
          ))
        ) : (
          // In the case search does not yield activity results 
          <View style={styles.invalidSearchContainer}>
            <Text style={styles.invalidSearchText}>No activities found...</Text>
          </View>
        )}
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
  invalidSearchContainer: {
    flex: 1,
    alignItems: "center", 
    marginTop: 16,  
  },
  invalidSearchText: {
    fontSize: 16,
    fontFamily: "quicksand-semibold",
    color: Colors.grey, 
  },
  header: {
    fontSize: 24,  
    fontFamily: "quicksand-bold",
    marginTop: 20,
  },
  categoriesWrapper: {
    minHeight: 85, 
    marginTop: 16,  
  },
  categoriesContainer: {
    flexDirection: "row", 
    marginRight: 15,
  },
  categoriesScrollView: {
    flex: 1, 
  },
  categoryItem: {
    width: 80,
    height: 60,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center", 
    elevation: 3,
    marginRight: 20,
    paddingHorizontal: 10,
  },
  categoryLabel: {
    marginTop: 5,
    fontSize: 10,
    fontFamily: "quicksand-semibold",
    color: Colors.primary,
  },
  selectedCategory: {
    borderWidth: 3,
    borderColor: Colors.coral,
  },
  cardsContainer: {
    flexGrow: 1,
  },
  tripCard: {
    backgroundColor: Colors.white, 
    borderRadius: 15,
    elevation: 3, 
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
  },
});