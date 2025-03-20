import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TextInput,
  Modal,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors } from "../../constants/Colors";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
const { height } = Dimensions.get("window");


// Function to format dates in "MMM DD, YYYY" format
const formatDate = (date: Date | null) => {
  if (!date) return "MM DD, YYYY"; // Default placeholder
  return date.toLocaleDateString("en-US", {
    month: "2-digit", 
    day: "2-digit",
    year: "numeric",
  });
};



// Initial Itinerary Data with Fixed Date Format
const itineraryData = [
  {
    id: "1",
    title: "Calgary",
    date: `${formatDate(new Date("2025-03-20"))} - ${formatDate(new Date("2025-03-23"))}`,
    description: "Explore downtown Calgary, visit the Calgary Tower, and walk along Stephen Avenue. Enjoy a day at the Calgary Zoo and relax at Prince’s Island Park.",
  },
  {
    id: "2",
    title: "Banff",
    date: `${formatDate(new Date("2025-03-24"))} - ${formatDate(new Date("2025-03-27"))}`,
    description: "Take the Banff Gondola for stunning mountain views and soak in the Banff Hot Springs. Hike through Johnston Canyon and spot wildlife along the scenic trails.",
  },
  {
    id: "3",
    title: "Canmore",
    date: `${formatDate(new Date("2025-03-28"))} - ${formatDate(new Date("2025-03-30"))}`,
    description: "Enjoy breathtaking views at Grassi Lakes and explore Quarry Lake. Discover local cafés, art galleries, and scenic biking trails around the town.",
  },
];

export default function Itinerary() {
  const [modalVisible, setModalVisible] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [itineraryList, setItineraryList] = useState(itineraryData);

  // Define initial state
  const [newTrip, setNewTrip] = useState<{
    title: string;
    fromDate: Date | null;
    toDate: Date | null;
    description: string;
  }>({
    title: "",
    fromDate: null,
    toDate: null,
    description: "",
  });

  // Handle date selection
  const handleDateChange = (event: unknown, selectedDate?: Date, type?: "from" | "to") => {
    if (selectedDate && type) {
      setNewTrip((prevTrip) => ({
        ...prevTrip,
        [type === "from" ? "fromDate" : "toDate"]: selectedDate,
      }));

      if (type === "from") {
        setShowFromDatePicker(false);
      } else {
        setShowToDatePicker(false);
      }
    }
  };

  // Handle adding a new trip
  const handleAddTrip = () => {
    if (newTrip.title && newTrip.fromDate && newTrip.toDate && newTrip.description) {
      setItineraryList([
        ...itineraryList,
        {
          id: Date.now().toString(),
          title: newTrip.title,
          date: `${formatDate(newTrip.fromDate)} - ${formatDate(newTrip.toDate)}`,
          description: newTrip.description,
        },
      ]);
      setModalVisible(false);
      setNewTrip({ title: "", fromDate: null, toDate: null, description: "" });
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Header with Plus Icon */}
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Trip Itineraries</Text>
          <Pressable onPress={() => setModalVisible(true)} style={styles.addButton}>
            <AntDesign name="pluscircle" size={28} color={Colors.coral} />
          </Pressable>
        </View>

        {/* Itinerary List */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {itineraryList.map((item) => (
            <View key={item.id} style={styles.box}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Pressable style={styles.button} 
              
              onPress={() => router.replace("../screens/DetailedItinerary")}>
                <Text style={styles.buttonText}>View Details</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>

        {/* Modal for Adding New Trip */}
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Trip</Text>
              <TextInput
                placeholder="Trip Name"
                style={styles.input}
                value={newTrip.title}
                onChangeText={(text) => setNewTrip({ ...newTrip, title: text })}
              />

              {/* Date Pickers */}
              <View style={styles.dateContainer}>
                {/* Start Date Picker */}
                <View>
                  <Text style={styles.dateLabel}>Start Date</Text>
                  <Pressable style={styles.dateInput} onPress={() => setShowFromDatePicker(true)}>
                  <Text style={styles.dateText}>{newTrip.fromDate ? formatDate(newTrip.fromDate) : "MM DD, YYYY"}</Text>
                  </Pressable>
                </View>

                {/* End Date Picker */}
                <View>
                  <Text style={styles.dateLabel}>End Date</Text>
                  <Pressable style={styles.dateInput} onPress={() => setShowToDatePicker(true)}>
                  <Text style={styles.dateText}>{newTrip.toDate ? formatDate(newTrip.toDate) : "MM DD, YYYY"}</Text>
                  </Pressable>
                </View>
              </View>

                {showFromDatePicker && (
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={newTrip.fromDate || new Date()}
                      mode="date"
                      display="spinner" // Ensures better styling
                      onChange={(event, date) => handleDateChange(event, date, "from")}
                      minimumDate={new Date()}
                    />
                  </View>
                )}

                {showToDatePicker && (
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={newTrip.toDate || new Date()}
                      mode="date"
                      display="spinner"
                      onChange={(event, date) => handleDateChange(event, date, "to")}
                      minimumDate={new Date()}
                    />
                  </View>
                )}


              <TextInput
                placeholder="Trip Description"
                style={[styles.input, styles.textArea]}
                value={newTrip.description}
                onChangeText={(text) => setNewTrip({ ...newTrip, description: text })}
                multiline
              />

              <View style={styles.modalButtonContainer}>
                <Pressable style={[styles.button, styles.modalButton]} onPress={handleAddTrip}>
                  <Text style={styles.buttonText}>Done</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.modalButtonCancel]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}


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
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontFamily: "quicksand-bold",
  },
  addButton: {
    padding: 5,
  },
  box: {
    backgroundColor: Colors.palestPink,
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    width: "80%",
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "quicksand-bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.grey,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontFamily: "quicksand-semibold",
  },
  textArea: {
    height: 60,
    textAlignVertical: "top",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  modalButtonCancel: {
    backgroundColor: Colors.grey,
    flex: 1,
    marginHorizontal: 5,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
    alignItems: "center", 
  },
  dateWrapper: {
    flex: 1,
    marginRight: 10, 
  },
  dateLabel: {
    fontSize: 14,
    fontFamily: "quicksand-semibold",
    marginBottom: 5,
  },
  dateInput: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: Colors.grey,
    backgroundColor: Colors.white,
  },
  dateText: {
    fontSize: 16,
    fontFamily: "quicksand-semibold",
    color: Colors.primary,
  },
  pickerContainer: {
    alignItems: "center",
  },
  

});
