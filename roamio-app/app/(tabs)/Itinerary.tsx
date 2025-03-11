import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Colors } from "../../constants/Colors";

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
    title: "Arrival & Check-in",
    date: "March 20, 2025",
    description: "Check-in at the hotel and explore the surrounding areas.",
  },
  {
    id: "2",
    title: "City Tour",
    date: "March 21, 2025",
    description:
      "Guided tour of historical landmarks and local markets of the city.",
  },
  {
    id: "3",
    title: "Beach Day",
    date: "March 22, 2025",
    description: "Relax at the beach and enjoy water sports.",
  },
  {
    id: "4",
    title: "Cultural Performances",
    date: "March 22, 2025",
    description:
      "Enjoy a traditional cultural performance with music and dance.",
  },
  {
    id: "5",
    title: "Hiking Adventure",
    date: "March 23, 2025",
    description:
      "Hike to a scenic viewpoint and experience breathtaking views.",
  },
  {
    id: "6",
    title: "Departure",
    date: "March 24, 2025",
    description: "Check-out from the hotel and return home.",
  },
];

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingTop: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  scrollContent: {
    paddingBottom: 80,
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
