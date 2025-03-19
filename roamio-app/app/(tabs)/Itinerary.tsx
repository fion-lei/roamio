import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Colors } from "../../constants/Colors";

const { height } = Dimensions.get("window"); // ✅ Get screen height dynamically

export default function Itinerary() {
  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>Trip Itineraries</Text>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          {itineraryData.map((item) => (
            <View key={item.id} style={styles.box}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Pressable
                style={styles.button}
                onPress={() => console.log("Button Clicked!")}
              >
                <Text style={styles.buttonText}>View Details</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const itineraryData = [
  {
    id: "1",
    title: "Calgary",
    date: "March 20 - March 23, 2025",
    description: "Explore downtown Calgary, visit the Calgary Tower, and walk along Stephen Avenue. Enjoy a day at the Calgary Zoo and relax at Prince’s Island Park.",
  },
  {
    id: "2",
    title: "Banff",
    date: "March 24 - March 27, 2025",
    description: "Take the Banff Gondola for stunning mountain views and soak in the Banff Hot Springs. Hike through Johnston Canyon and spot wildlife along the scenic trails.",
  },
  {
    id: "3",
    title: "Canmore",
    date: "March 28 - March 30, 2025",
    description: "Enjoy breathtaking views at Grassi Lakes and explore Quarry Lake. Discover local cafés, art galleries, and scenic biking trails around the town.",
  },
  {
    id: "4",
    title: "Lake Louise",
    date: "March 31 - April 2, 2025",
    description: "Canoe on the stunning turquoise waters of Lake Louise and hike to the Lake Agnes Tea House. Stay at the Fairmont Chateau for an unforgettable experience.",
  },
  {
    id: "5",
    title: "Kananaskis",
    date: "April 3 - April 6, 2025",
    description: "Go horseback riding through Kananaskis Valley and take a scenic hike at Ptarmigan Cirque. Unwind at the Kananaskis Nordic Spa under the night sky.",
  },
  {
    id: "6",
    title: "Cochrane",
    date: "April 7 - April 9, 2025",
    description: "Stroll through historic downtown Cochrane and enjoy homemade ice cream at MacKay’s. Relax with a picnic at Cochrane Ranche and take in the peaceful surroundings.",
  },
];

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 80,
    flexGrow: 1, // ✅ Ensures ScrollView items fit dynamically
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "quicksand-bold",
  },
  box: {
    backgroundColor: Colors.palestPink,
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: Colors.white,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    minHeight: 120, // ✅ Ensures all boxes have the same size
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontFamily: "quicksand-bold",
  },
  date: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 5,
    fontFamily: "quicksand-semibold",
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
    fontFamily: "quicksand-semibold",
  },
  button: {
    backgroundColor: Colors.coral,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "quicksand-bold",
  },
});
