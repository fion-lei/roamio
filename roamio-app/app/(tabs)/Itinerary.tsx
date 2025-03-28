import React, { useState, useEffect } from "react";
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
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors } from "../../constants/Colors";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import { Entypo } from "@expo/vector-icons";

import { useUser } from "@/contexts/UserContext";

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
const defaultItineraryData = [
  {
    id: "0",
    title: "No itineraries available",
    date: "",
    description: "You have not created any trip itineraries yet.",
  },
];


export default function Itinerary() {
  const { user } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [itineraryList, setItineraryList] = useState<any[]>([]);
  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  const ongoingTrips = itineraryList.filter(
    (trip) => trip.fromDate <= today && trip.toDate >= today
  );
  
  const upcomingTrips = itineraryList.filter(
    (trip) => trip.fromDate > today
  );
  
  const pastTrips = itineraryList.filter(
    (trip) => trip.toDate < today
  );


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


  const parseDate = (dateStr: string) => {
    const [month, day, year] = dateStr.split("/");
    return new Date(Number(year), Number(month) - 1, Number(day)); 
  };
  
  
  // Fetch itineraries from backend 
  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        if (!user.email) {
          Alert.alert("Error", "User email not found. Please log in.");
          return;
        }
        const response = await fetch(
          `http://10.0.2.2:3000/itineraries?email=${encodeURIComponent(user.email)}`
        );
        const data = await response.json();
        if (response.ok) {
              const formattedItineraries = (data.itineraries || []).map((trip: any) => ({
                ...trip,
                fromDate: parseDate(trip.start_date),
                toDate: parseDate(trip.end_date),

                title: trip.trip_title,
                description: trip.trip_description,
                id: trip.itinerary_id,
              }));
              
              setItineraryList(
                formattedItineraries.length > 0
                  ? formattedItineraries
                  : defaultItineraryData
              );
              
        } else {
          Alert.alert("Error", data.error || "Failed to load itineraries.");
          setItineraryList(defaultItineraryData);
        }
      } catch (error) {
        console.error("Error fetching itineraries:", error);
        Alert.alert("Error", "Failed to load itineraries.");
        setItineraryList(defaultItineraryData);
      }
    };

    fetchItineraries();
  }, [user.email]);

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
  const handleAddTrip = async () => {
    if (
      newTrip.title &&
      newTrip.fromDate &&
      newTrip.toDate &&
      newTrip.description
    ) {
      if (!user.email) {
        Alert.alert("Error", "User email not found. Please log in.");
        return;
      }
      // Build payload to pass into backend
      const payload = {
        user_email: user.email,
        trip_title: newTrip.title,
        trip_description: newTrip.description,
        start_date: formatDate(newTrip.fromDate),
        end_date: formatDate(newTrip.toDate),
      };
      try {
        const response = await fetch("http://10.0.2.2:3000/itineraries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        console.log("POST response:", result); // Log POST response
        if (response.ok) {
          // Re-fetch itinerary list from backend after adding trip
          const updatedResponse = await fetch(
            `http://10.0.2.2:3000/itineraries?email=${encodeURIComponent(user.email)}`
          );
          const updatedData = await updatedResponse.json();
          console.log("GET response:", updatedData); // Log GET response
          if (updatedResponse.ok) {
            const formattedUpdatedItineraries = (updatedData.itineraries || []).map((trip: any) => ({
              ...trip,
              fromDate: parseDate(trip.start_date),
              toDate: parseDate(trip.end_date),
              title: trip.trip_title,
              description: trip.trip_description,
              id: trip.itinerary_id,
            }));
            setItineraryList(
              formattedUpdatedItineraries.length > 0
                ? formattedUpdatedItineraries
                : defaultItineraryData
            );
          }
          
          setModalVisible(false);
          setNewTrip({ title: "", fromDate: null, toDate: null, description: "" });
        } else {
          Alert.alert("Error", result.error || "Failed to add trip.");
        }
      } catch (error) {
        console.error("Error adding trip:", error);
        Alert.alert("Error", "Failed to add trip.");
      }
    } else {
      Alert.alert("Error", "Please fill in all fields.");
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
            <AntDesign name="pluscircle" size={30} color={Colors.coral} />
          </Pressable>
        </View>

        {/* Itinerary List */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Ongoing Trips */}
            {ongoingTrips.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, styles.ongoingTitle]}>Ongoing Trips</Text>
                {ongoingTrips.map((item) => (
                  <View key={item.id} style={[styles.box, styles.ongoingBox]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Entypo name="location-pin" size={18} color={Colors.primary} />
                      <Text style={styles.title}>{item.title}</Text>
                    </View>
                    <Text style={styles.date}>
                      {`${formatDate(item.fromDate)} - ${formatDate(item.toDate)}`}
                    </Text>
                    <Text style={styles.description}>{item.description}</Text>
                    <Pressable style={styles.viewButtonOngoing} onPress={() => router.push('/screens/DetailedItinerary')}>
                      <Text style={styles.buttonText}>View Details</Text>
                    </Pressable>
                  </View>
                ))}
              </>
            )}

            {/* Upcoming Trips */}
            {upcomingTrips.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, styles.upcomingTitle]}>Upcoming Trips</Text>
                {upcomingTrips.map((item) => (
                  <View key={item.id} style={[styles.box, styles.upcomingBox]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Entypo name="location-pin" size={18} color={Colors.primary} />
                      <Text style={styles.title}>{item.title}</Text>
                    </View>
                    <Text style={styles.date}>
                      {`${formatDate(item.fromDate)} - ${formatDate(item.toDate)}`}
                    </Text>
                    <Text style={styles.description}>{item.description}</Text>
                    <Pressable style={styles.viewButtonUpcoming} onPress={() => console.log("View Details Clicked!")}>
                      <Text style={styles.buttonText}>View Details</Text>
                    </Pressable>
                  </View>
                ))}
              </>
            )}

            {/* Past Trips */}
            {pastTrips.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, styles.pastTitle]}>Past Trips</Text>
                {pastTrips.map((item) => (
                  <View key={item.id} style={[styles.box, styles.pastBox]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Entypo name="location-pin" size={18} color={Colors.primary} />
                      <Text style={styles.title}>{item.title}</Text>
                    </View>
                    <Text style={styles.date}>
                      {`${formatDate(item.fromDate)} - ${formatDate(item.toDate)}`}
                    </Text>
                    <Text style={styles.description}>{item.description}</Text>
                    <Pressable style={styles.viewButtonPast} onPress={() => console.log("View Details Clicked!")}>
                      <Text style={styles.buttonText}>View Details</Text>
                    </Pressable>
                  </View>
                ))}
              </>
            )}
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

  // Section Titles
sectionTitle: {
  fontSize: 20,
  fontFamily: "quicksand-bold",
  marginVertical: 10,
},

ongoingTitle: {
  color: Colors.coral
},
upcomingTitle: {
  color: Colors.peachySalmon, 
},
pastTitle: {
  color: Colors.grey, 
},

ongoingBox: {
  borderLeftWidth: 4,
  borderLeftColor: Colors.coral, 
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,
},

upcomingBox: { 
  borderLeftWidth: 4,
  borderLeftColor: Colors.peachySalmon, 
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,
},

pastBox: {
  borderLeftWidth: 4,
  borderLeftColor: Colors.grey,
},

// Past Button Styling
pastButton: {
  backgroundColor: Colors.grey,
},
inputContainer: {
  marginBottom: 15,
},

inputLabel: {
  fontSize: 14,
  fontFamily: "quicksand-semibold",
  marginBottom: 5,
},

dateInputContainer: {
  flex: 1,
  marginHorizontal: 5,
},

viewButtonOngoing: {
  backgroundColor: Colors.coral, 
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
  marginTop: 10,
},
viewButtonUpcoming: {
  backgroundColor: Colors.peachySalmon, 
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
  marginTop: 10,
},
viewButtonPast: {
  backgroundColor: Colors.grey, 
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
  marginTop: 10,
},
});