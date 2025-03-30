// Populate with more activity cards of different categories 
import React, { useState } from "react"; 
import { View, Text, Image, TextInput, SafeAreaView, StyleSheet, Pressable, ScrollView } from "react-native"; // Images reference: https://undraw.co/
import { Colors } from "@/constants/Colors"; 
import { FontAwesome } from "@expo/vector-icons"; // For the search and category icons **for now**: https://oblador.github.io/react-native-vector-icons/
import { useRouter } from "expo-router";

export default function Home() {

// Define data types used 
type CategoryId = "outdoors" | "hotspot" | "dining" | "culture" | "local";
type IconName = "tree" | "heart" | "fire" | "paint-brush" | "map-signs";
type SortOption = "relevance" | "price-low-high" | "price-high-low" | "rating-high-low" | "rating-low-high";

// Activity categories 
interface ActivityCategory {
  id: CategoryId;
  icon: IconName;
  color: string;
  iconColor: string;
  label: string;
};

// Activity cards 
interface ActivityCard {
  id: string;
  title: string;
  address: string;
  hours: string; 
  contact: string; 
  description: string;
  image: any; // Image usually set as "any" type 
  category: CategoryId[]; // Activity can belong to multiple categories 
  tags: string[];
  price: string; 
  rating: number;
  ratingCount: number; 
};

// Holds all activity categories 
// Muted pastel color palette for category icons - follows darker background lighter icon color convention
// Consider more vibrant palette instead? 
const activityCategories: ActivityCategory[] = [
  { 
    id: "outdoors", 
    icon: "tree", 
    color: "#6B8E85",  // Sage
    iconColor: "#E8EDEB",
    label: "Outdoors"
  }, 
  { 
    id: "hotspot", 
    icon: "heart", 
    color: "#D17A6F", // Coral 
    iconColor: "#F9E8E6",
    label: "Hotspot"
  },
  { 
    id: "dining", 
    icon: "fire", 
    color: "#8B7D9F", // Lavender
    iconColor: "#EDE9F2", 
    label: "Dining"
  }, 
  { 
    id: "culture", 
    icon: "paint-brush", 
    color: "#D4B499", // Beige
    iconColor: "#F7F0E8",
    label: "Culture"
  },
  { 
    id: "local", 
    icon: "map-signs", 
    color: "#6B8FA3", // Blue
    iconColor: "#E8EEF2", 
    label: "Local"
  },
];

// Holds all activity cards 
// Add more cards for filtering through all different categories
const activityCards: ActivityCard[] = [ 
  { 
    id: "elgin", 
    title: "Elgin Hill", 
    address: "180 McKenzie Town Dr SE", 
    hours: "Monday - Friday, 12:00PM - 5:00PM", 
    contact: "(403) - 111 - 1111", 
    description: `Elgin Hill is a park located in Calgary, Alberta, Canada. It is part of the City of Calgary's extensive network of parks, which includes notable locations such as Nose Hill Park, Poppy Plaza, Ranchlands Park, and many others. While specific details about Elgin Hill are limited, it is likely to offer recreational activities and green spaces typical of Calgary's parks, such as walking trails, picnic areas, and natural landscapes.`,
    image: require("@/assets/images/camp.png"),
    category: ["outdoors"], 
    tags: ["#Nature", "#Relax", "#Park", "#Pet-Friendly", "#Leisure"],
    price: "$",
    rating: 4.6,
    ratingCount: 45, 
  },
  
  { 
    id: "oeb", 
    title: "OEB Breakfast Co.", 
    address: "2207 4 St SW",  
    hours: "Monday - Sunday, 9:00AM - 7:00PM", 
    contact: "(403) - 222 - 3333", 
    description: `OEB was established in 2009; in Calgary – a Canadian city with big potential and small-town values. The people at OEB possess a deep love of food, giving staff the confidence to excite and welcome guests. The OEB menu is purposeful, filled with items that simply can't be made at home, balanced by lighter fare and vegan options. The people at OEB possess a deep love of food, giving staff the confidence to excite and welcome guests.`,
    image: require("@/assets/images/food.png"),
    category: ["dining", "hotspot"],
    tags: ["#Vegan", "#Brunch", "#CozyVibes", "#Family-Friendly", "#PhotoReady"],
    price: "$$",
    rating: 4.8,
    ratingCount: 120, 
  },
]; 
  
  // Holds all sort options (relevance, price, rating)
  const sortOptions: {id: SortOption; label: string}[] = [
    { id: "relevance", label: "Relevance" },
    { id: "price-low-high", label: "Price: Low - High" },
    { id: "price-high-low", label: "Price: High - Low" },
    { id: "rating-high-low", label: "Rating: High - Low" },
    { id: "rating-low-high", label: "Rating: Low - High" },
  ];

  // ✅ Get router instance for navigation
  const router = useRouter(); 
  
  // States 
  const [searchText, setSearchText] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("relevance");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Convert price string to number for sorting
  const getPriceValue = (price: string): number => {
    return price.length;
  };

  // Filter activities based on search, category, and price/rating 
  const filteredActivities = activityCards
    .filter(activity => {
      const matchesSearch = searchText === "" || 
        activity.title.toLowerCase().includes(searchText.toLowerCase()) ||  
        activity.address.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesCategory = selectedCategory.length === 0 || 
        selectedCategory.some(categoryId =>
          activity.category.includes(categoryId)
      );
      
      return matchesSearch && matchesCategory;
    })
    .sort((optionA, optionB) => {
      switch (sortOption) {
        case "price-low-high":
          return getPriceValue(optionA.price) - getPriceValue(optionB.price);
        case "price-high-low":
          return getPriceValue(optionB.price) - getPriceValue(optionA.price);
        case "rating-high-low":
          return optionB.rating - optionA.rating;
        case "rating-low-high":
          return optionA.rating - optionB.rating;
        default:
          return 0; // Relevance
      }
    });

  // Handle category selection 
  const handleCategoryPress = (categoryId: CategoryId) => {
    // If already selected, clear the filter
    // Otherwise, set the filter
    setSelectedCategory(prevCategory => {
      if (prevCategory.includes(categoryId)) {
        return prevCategory.filter(id => id !== categoryId); 
      }
      return [...prevCategory, categoryId]; 
    }); 
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

      {/* Header and Sort Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Activity Categories</Text>
        <Pressable 
          style={styles.sortButton}
          onPress={() => setShowSortDropdown(!showSortDropdown)}
        >
          <FontAwesome name="sort-amount-desc" size={16} color={Colors.peachySalmon} />
          <Text style={styles.sortText}>Sort</Text>
        </Pressable>
      </View>

      {/* Sort Options Dropdown */}
      {showSortDropdown && (
        <>
          <Pressable style={styles.dropdownBackdrop}
            onPress={() => setShowSortDropdown(false)} />
          
          <View style={styles.sortDropdown}>
            {sortOptions.map((option) => (
              <Pressable 
                key={option.id}
                style={styles.sortOption}
                onPress={() => {
                  setSortOption(option.id);
                  setShowSortDropdown(false);
                }}
              >
                <Text style={[
                  styles.sortOptionText,
                  sortOption === option.id && styles.selectedSortOption
                ]}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

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
                  selectedCategory.includes(category.id) && styles.selectedCategory
                ]} 
                onPress={() => handleCategoryPress(category.id)}
              >
                <FontAwesome 
                  name={category.icon} 
                  size={24} 
                  color={category.iconColor}
                />
              
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
                  price: activity.price,
                  rating: activity.rating,
                  ratingCount: activity.ratingCount, 
                } 
              })}
            > 
              <Image 
                source={activity.image}
                style={styles.cardImage}
              /> 
              
              <View style={styles.cardInfo}>
                <View style={styles.cardHeader}>
                  <View style={styles.addressContainer}>
                    <FontAwesome name="map-pin" size={12} color={Colors.coral} />
                    <Text style={styles.cardDetails}>{activity.address}</Text>
                  </View>
                  <View style={styles.priceRatingContainer}>
                    <View style={styles.priceRatingTags}>
                      <Text style={styles.priceRatingText}>{activity.price}</Text>
                    </View>
                    <View style={styles.priceRatingTags}>
                      <FontAwesome name="star" size={12} color="#FFD700" />
                      <Text style={styles.priceRatingText}>
                        {activity.rating}
                        {activity.ratingCount && ` (${activity.ratingCount})`}
                      </Text>
                    </View>
                  </View>
                </View>
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
};

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
    paddingVertical: 8, 
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
    fontSize: 28,  
    fontFamily: "quicksand-bold",
    color: Colors.primary,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 5,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.palePink,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 3,
    marginRight: 5,
  },
  sortText: {
    fontSize: 14,
    fontFamily: "quicksand-bold",
    color: Colors.coral,
  },
  dropdownBackdrop: {
    position: "absolute",
    zIndex: 100, 
    top: 0, 
    left: 0,
    right: 0, 
    bottom: 0, 
  },
  sortDropdown: {
    position: "absolute",
    top: 100,
    right: 18,
    backgroundColor: Colors.white,
    borderRadius: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000, // Dropdown takes priority 
    minWidth: 160,
  },
  sortOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.2,
    borderBottomColor: Colors.grey,
  },
  sortOptionText: {
    fontSize: 14,
    fontFamily: "quicksand-semibold",
    color: Colors.primary,
  },
  selectedSortOption: {
    color: Colors.coral,
    fontFamily: "quicksand-bold",
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
    fontSize: 11,
    fontFamily: "quicksand-semibold",
  },
  selectedCategory: {
    borderColor: "#FF9B8D",
    borderWidth: 3,
  },
  cardsContainer: {
    flexGrow: 1,
  },
  tripCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    // Box shadow generator: https://ethercreative.github.io/react-native-shadow-generator/
    elevation: 4,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    marginBottom: 22,
  },
  cardImage: {
    width: "100%", 
    height: 160,
    resizeMode: "cover", 
  },
  cardInfo: {
    padding: 12,
    marginLeft: 10,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "quicksand-bold",
    marginTop: -1,
    color: Colors.primary,
  },
  cardDetails: {
    fontSize: 14, 
    fontFamily: "quicksand-semibold",
    marginBottom: 2,
    color: Colors.grey,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  addressContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceRatingTags: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF9B8D", // Between peachySalmon and coral
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
    height: 30,
    shadowColor: "#E0877D", // Darker shadow effect 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  priceRatingText: {
    fontSize: 13,
    fontFamily: "quicksand-bold",
    color: Colors.white,    
    lineHeight: 16,
  },
});