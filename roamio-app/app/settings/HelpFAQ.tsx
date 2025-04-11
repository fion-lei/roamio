import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";

export default function HelpFAQ() {
  const router = useRouter();
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");

  const handleSendSupport = () => {
    if (!supportMessage.trim()) {
      Alert.alert("Error", "Please enter your message.");
      return;
    }
    // Replace the alert with your support API integration if needed.
    Alert.alert("Support", "Your message has been sent to support!");
    setSupportModalVisible(false);
    setSupportMessage("");
  };

  return (
    <>
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
          <Text style={styles.question}>
            Q: What's the difference between "Viewer" and "Trip Mate" when sharing itineraries?
          </Text>
          <Text style={styles.answer}>
            A: "Viewer" can only see your itinerary, while "Trip Mate" can edit and add to it. Choose the option that best suits your needs.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.question}>Q: What do I do if I encounter an emergency?</Text>
          <Text style={styles.answer}>
            A: Please refer to the Emergency Information page for essential contacts and procedures.
          </Text>
        </View>

        <Pressable
          style={styles.supportButton}
          onPress={() => setSupportModalVisible(true)}
        >
          <Text style={styles.supportButtonText}>Contact Support</Text>
        </Pressable>
      </ScrollView>

      {/* Contact Support Modal */}
      <Modal
        visible={supportModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSupportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Contact Support</Text>
            <Text style={styles.inputLabel}>Your Message</Text>
            <TextInput
              placeholder="Type your message here..."
              value={supportMessage}
              onChangeText={setSupportMessage}
              style={[styles.input, styles.textArea]}
              multiline
            />
            <View style={styles.modalButtonContainer}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setSupportModalVisible(false);
                  setSupportMessage("");
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.sendButton]}
                onPress={handleSendSupport}
              >
                <Text style={styles.buttonText}>Send</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
    padding: 10,
    borderRadius: 8,
    textAlign: "center",
    color: Colors.coral,
    backgroundColor: Colors.palePink,

  },
  faqItem: {
    marginBottom: 20,
  },
  question: {
    fontSize: 18,
    fontFamily: "quicksand-bold",
  },
  answer: {
    fontSize: 16,
    marginTop: 5,
    fontFamily: "quicksand-medium",
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
    fontFamily: "quicksand-bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(52, 52, 52, 0.8)",
  },
  modalView: {
    width: "90%",
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: Colors.peachySalmon,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "quicksand-bold",
    textAlign: "center",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: "quicksand-semibold",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.grey,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "quicksand-semibold",
    marginBottom: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: "40%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: Colors.grey,
  },
  sendButton: {
    backgroundColor: Colors.coral,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "quicksand-bold",
  },
});
