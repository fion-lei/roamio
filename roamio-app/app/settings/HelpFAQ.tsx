import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";

export default function HelpFAQ() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Help & FAQs</Text>

      <View style={styles.faqItem}>
        <Text style={styles.question}>Q: How do I update my profile?</Text>
        <Text style={styles.answer}>
          A: Go to your profile page and tap on the "Edit Profile" button to update your details.
        </Text>
      </View>

      <View style={styles.faqItem}>
        <Text style={styles.question}>Q: How can I change my travel itinerary?</Text>
        <Text style={styles.answer}>
          A: Access the itinerary section from your dashboard to modify your plans.
        </Text>
      </View>

      <View style={styles.faqItem}>
        <Text style={styles.question}>Q: How do I share my travel itinerary?</Text>
        <Text style={styles.answer}>
          A: Go to the Friends section in the app, select the friend, and press the "Share Itinerary" option to send it to your friends or family.
        </Text>
      </View>

      <View style={styles.faqItem}>
        <Text style={styles.question}>Q: What's the difference between 'Viewer' and 'Trip Mate' when sharing itineraries?</Text>
        <Text style={styles.answer}>
          A: 'Viewer' can only see your itinerary, while 'Trip Mate' can edit and add to it. Choose the option that best suits your needs.
        </Text>
      </View>

      <View style={styles.faqItem}>
        <Text style={styles.question}>Q: What do I do if I encounter an emergency?</Text>
        <Text style={styles.answer}>
          A: Please refer to the Emergency Information page for essential contacts and procedures.
        </Text>
      </View>

      <Pressable style={styles.supportButton} onPress={() => {/* Add contact support logic here */}}>
        <Text style={styles.supportButtonText}>Contact Support</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontFamily:"quicksand-bold",
    marginBottom: 20,
    textAlign: "center",
  },
  faqItem: {
    marginBottom: 20,
    
  },
  question: {
    fontSize: 18,
    fontFamily:"quicksand-bold",
  },
  answer: {
    fontSize: 16,
    marginTop: 5,
    fontFamily:"quicksand-medium",
  },
  supportButton: {
    backgroundColor: Colors.coral,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  supportButtonText: {
    fontSize: 18,
    color: "#fff",
    fontFamily:"quicksand-bold",

  },

});