import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function EmergencyInfo() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Emergency Information</Text>
      
      <Text style={styles.subHeader}>Emergency Contacts</Text>
      <View style={styles.item}>
        <Text style={styles.itemTitle}>Local Emergency Services</Text>
        <Text style={styles.itemDescription}>
          Dial 911 (or your local emergency number) in case of an emergency.
        </Text>
      </View>
      
      <Text style={styles.subHeader}>Travel Insurance</Text>
      <View style={styles.item}>
        <Text style={styles.itemTitle}>Insurance Provider</Text>
        <Text style={styles.itemDescription}>
          Your travel insurance details and policy number can be displayed here.
        </Text>
      </View>
      
      <Text style={styles.subHeader}>Consulate Information</Text>
      <View style={styles.item}>
        <Text style={styles.itemTitle}>Nearest Consulate</Text>
        <Text style={styles.itemDescription}>
          Display consulate details such as address, phone number, and office hours.
        </Text>
      </View>

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
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
  subHeader: {
    fontSize: 22,
    fontFamily:"quicksand-bold",
    marginTop: 15,
  },
  item: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontFamily:"quicksand-semibold",
  },
  itemDescription: {
    fontSize: 16,
    marginTop: 5,
    fontFamily:"quicksand-medium",
  },
  backButton: {
    marginTop: 30,
    backgroundColor: "#007BFF",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 18,
    color: "#fff",
  },
});
