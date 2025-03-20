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
    date: `${formatDate(new Date("2025-03-20"))} - ${formatDate(
      new Date("2025-03-23")
    )}`,
    description:
      "Explore downtown Calgary, visit the Calgary Tower, and walk along Stephen Avenue. Enjoy a day at the Calgary Zoo and relax at Prince’s Island Park.",
  },
  {
    id: "2",
    title: "Banff",
    date: `${formatDate(new Date("2025-03-24"))} - ${formatDate(
      new Date("2025-03-27")
    )}`,
    description:
      "Take the Banff Gondola for stunning mountain views and soak in the Banff Hot Springs. Hike through Johnston Canyon and spot wildlife along the scenic trails.",
  },
  {
    id: "3",
    title: "Canmore",
    date: `${formatDate(new Date("2025-03-28"))} - ${formatDate(
      new Date("2025-03-30")
    )}`,
    description:
      "Enjoy breathtaking views at Grassi Lakes and explore Quarry Lake. Discover local cafés, art galleries, and scenic biking trails around the town.",
  },
];

export default function Itinerary() {
  const [modalVisible, setModalVisible] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [itineraryList, setItineraryList] = useState(itineraryData);
  // Dropdown visibility states
  const [showStartDateDropdown, setShowStartDateDropdown] = useState(false);
  const [showEndDateDropdown, setShowEndDateDropdown] = useState(false);
  const [showStartTimeDropdown, setShowStartTimeDropdown] = useState(false);
  const [showEndTimeDropdown, setShowEndTimeDropdown] = useState(false);

  // Start-end date selection default states
  const [startDate, setStartDate] = useState("MM DD, YYYY");
  const [endDate, setEndDate] = useState("MM DD, YYYY");

  // Start-end time selection default states
  const [startTime, setStartTime] = useState("--:-- (MST)");
  const [endTime, setEndTime] = useState("--:-- (MST)");

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
  const handleDateChange = (
    event: unknown,
    selectedDate?: Date,
    type?: "from" | "to"
  ) => {
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
    if (
      newTrip.title &&
      newTrip.fromDate &&
      newTrip.toDate &&
      newTrip.description
    ) {
      setItineraryList([
        ...itineraryList,
        {
          id: Date.now().toString(),
          title: newTrip.title,
          date: `${formatDate(newTrip.fromDate)} - ${formatDate(
            newTrip.toDate
          )}`,
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
          <Pressable
            onPress={() => setModalVisible(true)}
            style={styles.addButton}
          >
            <AntDesign name="pluscircle" size={28} color={Colors.coral} />
          </Pressable>
        </View>

        {/* Itinerary List */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {itineraryList.map((item) => (
            <View key={item.id} style={styles.box}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.dateView}>
                <Text style={styles.date}>{item.date}</Text>
              </View>
              <View style={styles.descriptionView}>
                <Text style={styles.description}>{item.description}</Text>
              </View>
              <Pressable
                style={[styles.viewButton, styles.viewDetailsButton]}
                onPress={() => router.replace("../screens/DetailedItinerary")}
              >
                <Text style={styles.buttonText}>View Details</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>

        {/* Modal for Adding New Trip */}
        <Modal visible={modalVisible} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Add New Trip</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Enter Trip Name</Text>
                <TextInput
                  placeholder="Trip Name"
                  style={styles.input}
                  value={newTrip.title}
                  onChangeText={(text) =>
                    setNewTrip({ ...newTrip, title: text })
                  }
                />
              </View>
              /* TODO: Add Header for input fields */
              {/* Date Pickers */}
              <View style={styles.dateContainer}>
                <View style={styles.dateInputContainer}>
                  {/* Start Date Picker */}

                  <Text style={styles.inputLabel}>Start Date</Text>
                  <Pressable
                    style={styles.selectFieldContainer}
                    onPress={() => setShowFromDatePicker(true)}
                  >
                    <Text style={styles.dateText}>
                      {newTrip.fromDate
                        ? formatDate(newTrip.fromDate)
                        : "MM DD, YYYY"}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.dateInputContainer}>
                  {/* End Date Picker */}
                  <Text style={styles.inputLabel}>End Date</Text>
                  <Pressable
                    style={styles.selectFieldContainer}
                    onPress={() => setShowToDatePicker(true)}
                  >
                    <Text style={styles.dateText}>
                      {newTrip.toDate
                        ? formatDate(newTrip.toDate)
                        : "MM DD, YYYY"}
                    </Text>
                  </Pressable>
                </View>
              </View>
              {showFromDatePicker && (
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={newTrip.fromDate || new Date()}
                    mode="date"
                    display="spinner" // Ensures better styling
                    onChange={(event, date) =>
                      handleDateChange(event, date, "from")
                    }
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
                    onChange={(event, date) =>
                      handleDateChange(event, date, "to")
                    }
                    minimumDate={new Date()}
                  />
                </View>
              )}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Enter Trip Description</Text>
                <TextInput
                  placeholder="Trip Description"
                  style={[styles.input, styles.textArea]}
                  value={newTrip.description}
                  onChangeText={(text) =>
                    setNewTrip({ ...newTrip, description: text })
                  }
                  multiline
                />
              </View>
              <View style={styles.modalButtonContainer}>
                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.doneButton]}
                  onPress={handleAddTrip}
                >
                  <Text style={styles.buttonText}>Done</Text>
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
    marginBottom: 20,
    borderRadius: 12,
    elevation: 3,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontFamily: "quicksand-bold",
  },
  date: {
    fontSize: 14,
    color: Colors.grey,
    marginTop: 5,
    marginBottom: 5,
    fontFamily: "quicksand-semibold",
  },
  dateView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  description: {
    fontSize: 14,
    fontFamily: "quicksand-semibold",
  },
  descriptionView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  viewButton: {
    borderRadius: 10,
    justifyContent: "center",
    alignContent: "center",
    padding: 10,
    alignItems: "center",
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: "48%",
    alignItems: "center",
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "quicksand-bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(52, 52, 52, 0.8)", // Background will blur when modal is open
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
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.grey,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "quicksand-semibold",
  },
  textArea: {
    height: 60,
    textAlignVertical: "top",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  viewDetailsButton: {
    backgroundColor: Colors.coral,
  },
  doneButton: {
    backgroundColor: Colors.coral,
  },
  cancelButton: {
    backgroundColor: Colors.grey,
  },
  selectFieldContainer: {
    borderWidth: 1,
    borderColor: Colors.grey,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    justifyContent: "center",
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
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
    fontFamily: "quicksand-medium",
  },
  pickerContainer: {
    alignItems: "center",
  },
  dateInputContainer: {
    width: "48%",
    position: "relative",
  },
  inputContainer: {
    marginBottom: 15,
    position: "relative",
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: "quicksand-semibold",
    marginBottom: 5,
  },
  textInputLabel: {
    fontSize: 16,
    fontFamily: "quicksand-medium",
  },
});
