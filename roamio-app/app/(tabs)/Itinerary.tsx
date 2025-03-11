import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, SafeAreaView } from "react-native";
import { useFonts } from "expo-font";
import { Colors } from "../../constants/Colors";

interface ItineraryItem {
  id: string;
  title: string;
  date: string;
  description: string;
}

// Sample Data
const itineraryData: ItineraryItem[] = [
  { id: "1", title: "Arrival & Check-in", date: "March 20, 2025", description: "Check-in at the hotel and explore the surrounding areas." },
  { id: "2", title: "City Tour", date: "March 21, 2025", description: "Guided tour of historical landmarks and local markets of the city." },
  { id: "3", title: "Beach Day", date: "March 22, 2025", description: "Relax at the beach and enjoy water sports." },
  { id: "4", title: "Cultural Performances", date: "March 22, 2025", description: "Enjoy a traditional cultural performance with music and dance." },
  { id: "5", title: "Hiking Adventure", date: "March 23, 2025", description: "Hike to a scenic viewpoint and experience breathtaking views." },
  { id: "6", title: "Departure", date: "March 24, 2025", description: "Check-out from the hotel and return home." },
];

// Itinerary Item Component
const ItineraryItemComponent = ({ item }: { item: ItineraryItem }) => (
  <View style={styles.box}>
    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.date}>{item.date}</Text>
    <Text style={styles.description}>{item.description}</Text>
    <Pressable style={styles.button} onPress={() => console.log("Button Clicked!")}>
      <Text style={styles.buttonText}>View Details</Text>
    </Pressable>
  </View>
);

const Itinerary = () => {
  const [fontsLoaded] = useFonts({
    "Quicksand-Bold": require("../../assets/fonts/Quicksand-Bold.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>My Itinerary</Text>
        {itineraryData.map((item) => (
          <ItineraryItemComponent key={item.id} item={item} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // Adds padding to ensure smooth scrolling
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Quicksand-Bold",
  },
  box: {
    backgroundColor: Colors.white,
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: Colors.white,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Quicksand-Bold",
  },
  date: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    backgroundColor: Colors.peachySalmon,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default Itinerary;
