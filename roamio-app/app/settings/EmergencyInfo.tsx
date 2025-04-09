import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";

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

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: Colors.white, 
    paddingHorizontal: 16, 
  },
  header: {
    fontSize: 28,
    fontFamily:"quicksand-bold",
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
    textAlign: "center",
    color: Colors.coral,
    backgroundColor: Colors.palePink,
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
});
