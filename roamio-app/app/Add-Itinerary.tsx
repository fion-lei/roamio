import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, SafeAreaView, Pressable, ScrollView, Modal, Alert } from "react-native";
import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "expo-router";

export default function AddItinerary() {
  
  // Gets the appropriate image filename based on activity
  const getImageForActivity = (title: string): string => {
    // Map activity titles to specific images
    const activityImageMap: Record<string, string> = {
      "Elgin Hill": "camp.png",
      "OEB Breakfast Co.": "food.png",
      "Pages Bookstore": "books.png",
      "Fish Creek Park": "hiking.png",
      "Analog Coffee": "coffee.png",
      "Crossroads Market": "farmers.png",
      "TELUS Spark": "space.png",
      "Calaway Park": "rides.png",
      "GRETA Bar": "beer.png",
      "Studio Bell": "music.png",
    };
    
    // Returns the mapped image or default image if no match found (brand logo)
    return activityImageMap[title] || "logo_coral.png"; 
  };
  
  // Get the user context
  const { user } = useUser();
  
  // Retrieve activity card Data passed as params 
  const params = useLocalSearchParams();

  // Get values from activity cards 
  const activity = {
    title: params.title as string,
    address: params.address as string,
    contact: params.contact as string,
    hours: params.hours as string,
    description: params.description as string,
    tags: params.tags as string,
    imagePath: params.image as any, // Images usually loaded as "any" type
    price: params.price as string, 
    rating: params.rating as string, 
    ratingCount: params.ratingCount as string,
  };

  // Convert tags string back into an array if needed
  const tagsArray = activity.tags ? activity.tags.split(",") : [];

  // Modal state 
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Itinerary states 
  const [selectedItinerary, setSelectedItinerary] = useState("--Itinerary Name--");
  const [showItineraryDropdown, setShowItineraryDropdown] = useState(false);
  const [itineraryOptions, setItineraryOptions] = useState<string[]>([]);
  const [itineraryDateRanges, setItineraryDateRanges] = useState<Record<string, { startDate: Date, endDate: Date }>>({});
  const [selectedItineraryDateRange, setSelectedItineraryDateRange] = useState<{ startDate: Date, endDate: Date } | null>(null);

  // Date/time states 
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const router = useRouter();
  // Fetch itinerary options from backend when modal opens 
  useEffect(() => {
    if (isModalVisible) {
      fetchItineraryOptions();
    }
  }, [isModalVisible]);

  // Fetch available itineraries from backend 
  const fetchItineraryOptions = async () => {
    try {
      if (!user.email) {
        Alert.alert("Error", "User email not found. Please log in.");
        return;
      }
      
      const response = await fetch(
        `http://10.0.2.2:3000/active-itineraries?email=${encodeURIComponent(user.email)}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );
      const data = await response.json();
      
      if (response.ok && data.itineraries && data.itineraries.length > 0) {
        const options = data.itineraries.map((itinerary: any) => itinerary.trip_title);
        setItineraryOptions(options);
        
        // Store date ranges for each itinerary
        const dateRanges: Record<string, { startDate: Date, endDate: Date }> = {};
        data.itineraries.forEach((itinerary: any) => {
          if (itinerary.start_date && itinerary.end_date) {
            const [startMonth, startDay, startYear] = itinerary.start_date.split('/').map(Number);
            const [endMonth, endDay, endYear] = itinerary.end_date.split('/').map(Number);
            
            dateRanges[itinerary.trip_title] = {
              startDate: new Date(startYear, startMonth - 1, startDay),
              endDate: new Date(endYear, endMonth - 1, endDay)
            };
          }
        });
        setItineraryDateRanges(dateRanges);
      } else {
        // No active itineraries found 
        setItineraryOptions([]);
        setItineraryDateRanges({});
        Alert.alert("No Active Trips", "You don't have any currently active trips to add to. Please create a new trip first."); 
      }
    } catch (error) {
      setItineraryOptions([]);
      setItineraryDateRanges({});
      Alert.alert("Error", "Failed to load your active itineraries.");
    }
  };

  // Formats date with default placeholder "MM/DD/YYYY" 
  const formatDate = (date: Date | null) => {
    if (!date) return "MM/DD/YYYY";
    // Format date to match the expected format in DetailedItinerary
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Formats time with default placeholder "--:-- (MST)" 
  const formatTime = (date: Date | null) => {
    if (!date) return "--:-- (MST)";
    // Format time to match the expected format in DetailedItinerary
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm} (MST)`;
  };

  // Reset all selections to default
  const resetSelections = () => {
    setSelectedItinerary("--Itinerary Name--");
    setShowItineraryDropdown(false);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setShowStartTimePicker(false);
    setShowEndTimePicker(false);
    setStartDate(null);
    setEndDate(null);
    setStartTime(null);
    setEndTime(null);
    setSelectedItineraryDateRange(null);
  };

  // Handles date/time changes, if picker is cancelled then no updates 
  const handleDateChange = (event: any, selectedDate?: Date, type?: string) => {
    if (event.type === "dismissed") {
      switch (type) {
        case "startDate": 
          setShowStartDatePicker(false); break;
        case "endDate": 
          setShowEndDatePicker(false); break;
        case "startTime": 
          setShowStartTimePicker(false); break;
        case "endTime": 
          setShowEndTimePicker(false); break;
      }
      return;
    }
    // Set to selected date/time 
    if (selectedDate) {
      switch (type) {
        case "startDate": 
          setStartDate(selectedDate); setShowStartDatePicker(false); break;
        case "endDate": 
          setEndDate(selectedDate); setShowEndDatePicker(false); break;
        case "startTime": 
          setStartTime(selectedDate); setShowStartTimePicker(false); break;
        case "endTime": 
          setEndTime(selectedDate); setShowEndTimePicker(false); break;
      }
    }
  };

  // Handles adding itinerary items 
  const handleAddItem = async () => {
    
    if (selectedItinerary === "--Itinerary Name--") {
      Alert.alert("Error", "Please select a valid itinerary from your list");
      return;
    }

    if (!startDate || !endDate || !startTime || !endTime) {
      Alert.alert("Error", "Please fill in all missing date and time fields for this item");
      return;
    }
    
    // Full datetime objects for form validation - handles AM/PM 
    const startDateTime = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      startTime.getHours(),
      startTime.getMinutes()
    );

    const endDateTime = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
      endTime.getHours(),
      endTime.getMinutes()
    );

    if (endDateTime <= startDateTime) {
      Alert.alert("Error", "Please enter an end time slot that is after the start time slot for this item");
      return;
    }
    
    try {
      
      if (!user.email) {
        Alert.alert("Error", "User email not found. Please log in.");
        return;
      }
      
      // Fetch the selected itinerary data
      const response = await fetch(`http://10.0.2.2:3000/active-itineraries?email=${encodeURIComponent(user.email)}`);
      const data = await response.json();
      
      if (!response.ok) {
        Alert.alert("Error", data.error || "Failed to get active itineraries");
        return;
      }
      
      const selectedItineraryObj = data.itineraries.find((it: any) => it.trip_title === selectedItinerary);
      
      if (!selectedItineraryObj) {
        Alert.alert("Error", "Failed to find the selected itinerary");
        return;
      }
      
      // Convert itinerary_id to string to ensure consistent type
      const itineraryId = String(selectedItineraryObj.itinerary_id);

      // Check for time conflicts with existing events
      const hasTimeConflict = await checkForTimeConflicts(
        itineraryId,
        startDate,
        endDate,
        startTime,
        endTime
      );

      if (hasTimeConflict) {
        // Warning message for time conflicts for overlapping events 
        Alert.alert(
          "Warning",
          "This selected time slot overlaps with another event in your itinerary. Would you like to add it anyway?",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            {
              text: "Add Anyway",
              onPress: () => proceedWithAddingEvent(itineraryId)
            }
          ]
        );
        return;
      }
      
      // If no conflicts detected, proceed with adding the event
      proceedWithAddingEvent(itineraryId);
    } catch (error) {
      Alert.alert("Error", "Failed to add event.");
    }
  };

  // Helper function to proceed with adding the event
  const proceedWithAddingEvent = async (itineraryId: string) => {
    try {
      // Prepare the event data with properly formatted dates and times
      const eventData = {
        event_id: Date.now().toString(),
        itinerary_id: itineraryId,
        title: activity.title || "",
        description: activity.description || "",
        address: activity.address || "",
        contact: activity.contact || "",
        hours: activity.hours || "",
        price: activity.price || "",
        rating: activity.rating || "",
        rating_count: activity.ratingCount || "",
        tags: activity.tags || "",
        image_path: getImageForActivity(activity.title), // Descriptive image path for the activity 
        start_date: formatDate(startDate),
        start_time: formatTime(startTime),
        end_date: formatDate(endDate),
        end_time: formatTime(endTime)
      };
      
      // API call to add the event 
      const eventResponse = await fetch("http://10.0.2.2:3000/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(eventData)
      });
      
      const eventResult = await eventResponse.json();
      
      if (!eventResponse.ok) {
        Alert.alert("Error", eventResult.error || "Failed to add event to itinerary");
        return;
      }
      
      Alert.alert(
        "Success!",
        `${activity.title} has been added to: ${selectedItinerary}`,
        [
          {
            text: "Cancel",
            onPress: () => {
              setIsModalVisible(false);
              resetSelections();
            },
            style: "cancel"
          },
          {
            // Fast way for user to view itineraries if they choose so after adding an event 
            text: "View Trips",
            onPress: () => {
              setIsModalVisible(false);
              resetSelections();
              router.push("/(tabs)/Itinerary");
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to add event.");
    }
  };

  // Checks for time overlapping with existing events 
  const checkForTimeConflicts = async (
    itineraryId: string,
    startDate: Date,
    endDate: Date,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> => {
    try {
      // Fetch all events for this itinerary
      const response = await fetch(`http://10.0.2.2:3000/events/${itineraryId}`);
      if (!response.ok) {
        console.error("Failed to fetch events for conflict check");
        return false; // Assume no conflict if we can't check
      }

      const data = await response.json();
      const events = data.events || [];

      if (events.length === 0) {
        return false; // No events, so no conflicts
      }

      // Convert the new event's start and end times to Date objects
      const newEventStart = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        startTime.getHours(),
        startTime.getMinutes()
      );

      const newEventEnd = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
        endTime.getHours(),
        endTime.getMinutes()
      );

      // Check each existing event for conflicts
      for (const event of events) {
        // Skip events that don't have start/end times
        if (!event.start_date || !event.start_time || !event.end_date || !event.end_time) {
          continue;
        }

        // Parse the existing event's dates and times
        const [startMonth, startDay, startYear] = event.start_date.split('/').map(Number);
        const [endMonth, endDay, endYear] = event.end_date.split('/').map(Number);
        
        // Parse the time strings (format: "HH:MM AM/PM (MST)")
        const startTimeMatch = event.start_time.match(/(\d+):(\d+)\s*(AM|PM)/i);
        const endTimeMatch = event.end_time.match(/(\d+):(\d+)\s*(AM|PM)/i);
        
        if (!startTimeMatch || !endTimeMatch) {
          continue; // Skip if time format is unexpected
        }
        
        // Convert to 24-hour format
        let startHours = parseInt(startTimeMatch[1]);
        const startMinutes = parseInt(startTimeMatch[2]);
        const startAmPm = startTimeMatch[3].toUpperCase();
        
        let endHours = parseInt(endTimeMatch[1]);
        const endMinutes = parseInt(endTimeMatch[2]);
        const endAmPm = endTimeMatch[3].toUpperCase();
        
        // Convert to 24-hour format
        if (startAmPm === 'PM' && startHours < 12) {
          startHours += 12;
        } else if (startAmPm === 'AM' && startHours === 12) {
          startHours = 0;
        }
        
        if (endAmPm === 'PM' && endHours < 12) {
          endHours += 12;
        } else if (endAmPm === 'AM' && endHours === 12) {
          endHours = 0;
        }
        
        // Create Date objects for the existing event
        const existingEventStart = new Date(startYear, startMonth - 1, startDay, startHours, startMinutes);
        const existingEventEnd = new Date(endYear, endMonth - 1, endDay, endHours, endMinutes);
        
        // Check for overlap conditions 
        if (
          (newEventStart >= existingEventStart && newEventStart < existingEventEnd) ||
          (newEventEnd > existingEventStart && newEventEnd <= existingEventEnd) ||
          (newEventStart <= existingEventStart && newEventEnd >= existingEventEnd)
        ) {
          return true; // Overlap found 
        }
      }
      
      return false; // No overlaps found
    } catch (error) {
      return false;
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Itinerary Activity Image */}
      <Image 
        source={activity.imagePath} 
        style={styles.activityImage} 
      />

      {/* Itinerary Activity Info Section */}
      <View style={styles.activityContainer}>
        <View style={styles.headerWrapper}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <View style={styles.priceRatingContainer}>
            <View style={styles.priceRatingTags}>
              <Text style={styles.priceRatingText}>{activity.price}</Text>
            </View>
            <View style={styles.priceRatingTags}>
              <FontAwesome name="star" size={12} color="#FFD700" />
              <Text style={styles.priceRatingText}>
                {activity.rating}
                {activity.ratingCount && ` (${activity.ratingCount})`}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.activityDetails}><FontAwesome name="map-pin" size={14} color={Colors.coral}></FontAwesome>{" "}{activity.address}</Text>
          <Text style={styles.activityDetails}><FontAwesome name="calendar-check-o" size={14} color={Colors.coral}></FontAwesome>{" "}{activity.hours}</Text>
          <Text style={styles.activityDetails}><FontAwesome name="phone" size={14} color={Colors.coral}></FontAwesome>{" "}{activity.contact}</Text>
        </View>
        <Text style={styles.activityDescription}>{activity.description}</Text>
      </View>

      {/* Tags Section */}
      <View style={styles.tagsContainer}>
        <Text style={styles.tagsTitle}>Tags</Text>
      </View>

      {/* Horizontal Scroll for tags */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
        <View style={styles.tagsScrollContainer}>
          {/* Pass in each tag in the tags array to display */}
          {tagsArray.map((tag, index) => (
            <View key={index} style={styles.tagArea}>
              <Text style={styles.tagTitle}>{tag}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Select Date Button */}
      <Pressable 
        style={styles.selectDateButton} 
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.selectDateButtonText}>Select Date</Text>
      </Pressable>
      
      {/* Date Selection Popup */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add To Itinerary</Text>
            
            {/* Select Itinerary Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Select Itinerary</Text>
              <Pressable 
                style={styles.selectFieldContainer}
                onPress={() => setShowItineraryDropdown(!showItineraryDropdown)}
              >
                <Text style={styles.selectText}>{selectedItinerary}</Text>
                <FontAwesome name="chevron-down" size={14} color={Colors.peachySalmon} top={5}/>
              </Pressable>
              
              {showItineraryDropdown && (
                <View style={styles.dropdownMenu}>
                  <ScrollView nestedScrollEnabled={true}>
                    {itineraryOptions.map((option, index) => (
                      <Pressable 
                        key={index} 
                        style={styles.dropdownOption} 
                        onPress={() => {
                          setSelectedItinerary(option);
                          setShowItineraryDropdown(false);
                          // Set the date range for the selected itinerary
                          setSelectedItineraryDateRange(itineraryDateRanges[option] || null);
                          // Reset date selections when changing itinerary
                          setStartDate(null);
                          setEndDate(null);
                        }}
                      >
                        <Text style={styles.dropdownOptionText}>{option}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            
            {/* Date Selection Section */}
            <View style={styles.dateContainer}>
              <View style={styles.dateInputContainer}>
                <Text style={styles.inputLabel}>Start Date</Text>
                <Pressable 
                  style={styles.selectFieldContainer}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={styles.selectText}>
                    {formatDate(startDate)}
                  </Text>
                  <FontAwesome name="calendar-o" style={styles.dateTimeIcon} />
                </Pressable>
                
                {showStartDatePicker && (
                  <View style={styles.pickerContainer}>
                    <DateTimePicker 
                      value={startDate || new Date()}
                      mode="date"
                      display="spinner"
                      onChange={(event, date) => handleDateChange(event, date, "startDate")}
                      // Restrict date selection to be within the selected itinerary's date range
                      minimumDate={selectedItineraryDateRange ? selectedItineraryDateRange.startDate : new Date()}
                      maximumDate={selectedItineraryDateRange ? selectedItineraryDateRange.endDate : undefined}
                    />
                  </View>
                )}
              </View>
              
              <View style={styles.dateInputContainer}>
                <Text style={styles.inputLabel}>End Date</Text>
                <Pressable 
                  style={styles.selectFieldContainer}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.selectText}>
                    {formatDate(endDate)}
                  </Text>
                  <FontAwesome name="calendar-o" style={styles.dateTimeIcon} />
                </Pressable>
                
                {showEndDatePicker && (
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={endDate || new Date()}
                      mode="date"
                      display="spinner"
                      onChange={(event, date) => handleDateChange(event, date, "endDate")}
                      // Restrict date selection to start at minimum start date of the selected itinerary 
                      minimumDate={startDate || (selectedItineraryDateRange ? selectedItineraryDateRange.startDate : new Date())}
                      maximumDate={selectedItineraryDateRange ? selectedItineraryDateRange.endDate : undefined}
                    />
                  </View>
                )}
              </View>
            </View>
            
            {/* Time Selection Section */}
            <View style={styles.dateContainer}>
              <View style={styles.dateInputContainer}>
                <Text style={styles.inputLabel}>Start Time</Text>
                <Pressable 
                  style={styles.selectFieldContainer}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <Text style={styles.selectText}>
                    {formatTime(startTime)}
                  </Text>
                  <FontAwesome name="clock-o" size={14} style={styles.dateTimeIcon} />
                </Pressable>
                
                {showStartTimePicker && (
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={startTime || new Date()}
                      mode="time"
                      display="spinner"
                      onChange={(event, date) => handleDateChange(event, date, "startTime")}
                    />
                  </View>
                )}
              </View>
              
              <View style={styles.dateInputContainer}>
                <Text style={styles.inputLabel}>End Time</Text>
                <Pressable 
                  style={styles.selectFieldContainer}
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <Text style={styles.selectText}>
                    {formatTime(endTime)}
                  </Text>
                  <FontAwesome name="clock-o" size={14} style={styles.dateTimeIcon} />
                </Pressable>
                
                {showEndTimePicker && (
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={endTime || new Date()}
                      mode="time"
                      display="spinner"
                      onChange={(event, date) => handleDateChange(event, date, "endTime")}
                    />
                  </View>
                )}
              </View>
            </View>
            
            {/* Buttons section */}
            <View style={styles.buttonsContainer}>
              <Pressable
                style={[styles.modalButtons, styles.cancelButton]}
                onPress={() => {
                  setIsModalVisible(false);
                  resetSelections();
                }}
              >
                <Text style={styles.modalButtonsText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButtons, styles.addButton]}
                onPress={handleAddItem}
              >
                <Text style={styles.modalButtonsText}>Add Item</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  activityImage: {
    width: "100%",
    height: 260,
    resizeMode: "cover",
  },
  activityContainer: {
    padding: 16,
    gap: 8,
  },
  headerWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },  
  priceRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceRatingTags: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF9B8D", // Between peachySalmon and coral
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
    height: 30,
    shadowColor: "#E0877D", // Darker shadow effect
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  priceRatingText: {
    fontSize: 13,
    fontFamily: "quicksand-bold",
    color: Colors.white,
    lineHeight: 16,
  },
  activityTitle: {
    fontSize: 24,
    fontFamily: "quicksand-bold",
  },
  detailsContainer: {
    gap: 8,
    marginBottom: 6,
  },
  activityDetails: {
    fontSize: 14,
    fontFamily: "quicksand-semibold",
    color: Colors.grey,
  },
  activityDescription: {
    fontSize: 14,
    fontFamily: "quicksand-regular",
    lineHeight: 24,
  },
  tagsContainer: {
    paddingHorizontal: 16,
  },
  tagsTitle: {
    fontSize: 18,
    marginBottom: 20,
    fontFamily: "quicksand-bold",
  },
  tagsScroll: {
    paddingHorizontal: 10,
  },
  tagsScrollContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  tagArea: {
    borderWidth: 1,
    borderColor: Colors.coral,
    borderRadius: 15,
    backgroundColor: Colors.palePink,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
  },
  tagTitle: {
    color: Colors.coral,
    fontSize: 14,
    fontFamily: "quicksand-bold",
  },
  selectDateButton: {
    alignItems: "center",
    marginVertical: 28,
    backgroundColor: Colors.coral,
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 20,
  },
  selectDateButtonText: {
    color: Colors.white,
    fontSize: 16,
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
  inputContainer: {
    marginBottom: 15,
    position: "relative",
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: "quicksand-semibold",
    marginBottom: 5,
  },
  selectFieldContainer: {
    borderWidth: 1,
    borderColor: Colors.grey,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    justifyContent: "center",
    flexDirection: "row",
  },
  dateTimeIcon: {
    position: "absolute",
    right: 10,
    top: 18,
    color: Colors.peachySalmon,
  },
  selectText: {
    fontSize: 16,
    fontFamily: "quicksand-medium",
    flex: 1,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  dateInputContainer: {
    width: "48%",
    position: "relative",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: Colors.grey,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    justifyContent: "center",
  },
  dropdownMenu: {
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.grey,
    borderRadius: 10,
    maxHeight: 150,
    zIndex: 10,
    marginTop: 2,
  },
  dropdownOption: {
    padding: 10,
  },
  dropdownOptionText: {
    fontSize: 16,
    fontFamily: "quicksand-medium",
  },
  pickerContainer: {
    position: "absolute",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.grey,
    borderRadius: 10,
    zIndex: 20,
    top: "100%",
    marginTop: 2,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  modalButtons: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: "48%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: Colors.grey,
  },
  addButton: {
    backgroundColor: Colors.coral,
  },
  modalButtonsText: {
    color: Colors.white,
    fontFamily: "quicksand-bold",
    fontSize: 14,
  },
});