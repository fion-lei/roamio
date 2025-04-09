import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Modal,
} from "react-native";
import { Colors } from "@/constants/Colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import { useNavigation, useRouter, useLocalSearchParams } from "expo-router";
import { useUser } from "@/contexts/UserContext";
import { useFocusEffect } from "@react-navigation/native";

const pixelsForHour = 60; // Each hour block height in pixels

const DetailedItinerary = () => {
  // Route parameters and state management
  const params = useLocalSearchParams();
  const itineraryId = params.id as string;
  const itineraryTitle = (params.title as string) || "Itinerary";
  const navigation = useNavigation();
  const router = useRouter();
  const { user } = useUser();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [eventTimePickerVisible, setEventTimePickerVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [itineraryItems, setItineraryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editedStartTime, setEditedStartTime] = useState<Date | null>(null);
  const [editedEndTime, setEditedEndTime] = useState<Date | null>(null);
  
  // Helper: Format a time string (HH:MM, 24-hour) into AM/PM format.
  const formatTimeToAMPM = (time: string): string => {
    const [hours, minutes] = time.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  // Helper: Calculate the end time from a given start time (in HH:MM) and duration in hours.
  const calculateEndTime = (
    startTime: string,
    durationHours: number
  ): string => {
    const [hours, minutes] = startTime.split(":").map(Number);
    let totalMinutes = hours * 60 + minutes + durationHours * 60;
    totalMinutes = totalMinutes % (24 * 60);
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = Math.floor(totalMinutes % 60);
    return `${endHours}:${endMinutes.toString().padStart(2, "0")}`;
  };

  // Helper: Return a style object that positions an event block based on its start time and duration.
  const getEventStyle = (time: string, duration: number) => {
    const [hours, minutes] = time.split(":").map(Number);
    const topPosition = (hours + minutes / 60) * pixelsForHour;
    const height = duration * pixelsForHour;
    return {
      position: "absolute" as const,
      top: topPosition,
      left: 70, // leave space for time markers
      right: 10,
      height: height,
    };
  };

  // Render the content for an event block.
  const renderEventContent = (item: any) => (
    <View style={styles.eventContent}>
      <View style={styles.eventTextContainer}>
        <Text style={styles.activityText}>{item.activity}</Text>
        <Text style={styles.locationText}>
          {item.address || "No location provided"}
        </Text>
      </View>
      <View style={styles.dotsContainer}>
        <Text style={styles.menuDots}>
          {isEditMode ? (
            <FontAwesome
              name="pencil"
              size={20}
              color={Colors.coral}
              style={{ marginLeft: 20, marginBottom: 15 }}
            />
          ) : (
            "⋯"
          )}
        </Text>
      </View>
    </View>
  );

  // Fetch available dates from the backend (dates in "Month Day, Year" format).
  const fetchItineraryDates = async () => {
    try {
      const response = await fetch(
        `http://10.0.2.2:3000/itineraries?email=${encodeURIComponent(
          user.email
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        const currentItinerary = data.itineraries.find(
          (itinerary: any) => String(itinerary.itinerary_id) === itineraryId
        );
        if (
          currentItinerary &&
          currentItinerary.start_date &&
          currentItinerary.end_date
        ) {
          const startParts = currentItinerary.start_date.split("/").map(Number);
          const endParts = currentItinerary.end_date.split("/").map(Number);
          const startDate = new Date(
            startParts[2],
            startParts[0] - 1,
            startParts[1]
          );
          const endDate = new Date(endParts[2], endParts[0] - 1, endParts[1]);
          const dates: string[] = [];
          const currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            dates.push(
              currentDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            );
            currentDate.setDate(currentDate.getDate() + 1);
          }
          setAvailableDates(dates);
          if (dates.length > 0 && !selectedDate) {
            setSelectedDate(dates[0]);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching itinerary dates:", error);
    }
  };

  // Fetch events for the selected date.
  const fetchItineraryItems = async (date: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://10.0.2.2:3000/events/${itineraryId}`
      );
      if (!response.ok) {
        console.error(
          `Failed to fetch events: ${response.status} ${response.statusText}`
        );
        setItineraryItems([]);
        setLoading(false);
        return;
      }
      const data = await response.json();
      const events = data.events || [];
      if (events.length === 0) {
        setItineraryItems([]);
        setLoading(false);
        return;
      }
      // Parse the selected date from "Month Day, Year" format.
      const selectedDateParts = date.match(/(\w+)\s+(\d+),\s+(\d+)/);
      let selectedDateObj: Date | null = null;
      if (selectedDateParts) {
        const month = selectedDateParts[1];
        const day = parseInt(selectedDateParts[2]);
        const year = parseInt(selectedDateParts[3]);
        const months = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        const monthIndex = months.findIndex((m) => m === month);
        if (monthIndex !== -1) {
          selectedDateObj = new Date(year, monthIndex, day);
        }
      }
      if (selectedDateObj === null || isNaN(selectedDateObj.getTime())) {
        setItineraryItems([]);
        setLoading(false);
        return;
      }
      // Filter events that occur on the selected date.
      const eventsOnSelectedDate = events.filter(
        (event: {
          start_date: string;
          end_date?: string;
          event_id: any;
          title: any;
        }) => {
          if (!event.start_date) {
            console.log(`Event ${event.event_id} has no start_date`);
            return false;
          }
          let eventStartDate: Date, eventEndDate: Date;
          if (
            typeof event.start_date === "string" &&
            event.start_date.includes("/")
          ) {
            const [month, day, year] = event.start_date.split("/").map(Number);
            eventStartDate = new Date(year, month - 1, day);
          } else {
            eventStartDate = new Date(event.start_date);
          }
          if (event.end_date) {
            if (
              typeof event.end_date === "string" &&
              event.end_date.includes("/")
            ) {
              const [month, day, year] = event.end_date.split("/").map(Number);
              eventEndDate = new Date(year, month - 1, day);
            } else {
              eventEndDate = new Date(event.end_date);
            }
          } else {
            eventEndDate = eventStartDate;
          }
          return (
            selectedDateObj >= eventStartDate && selectedDateObj <= eventEndDate
          );
        }
      );
      // Format events for display.
      const formattedEvents = eventsOnSelectedDate.map((event: any) => {
        let duration = 1;
        let formattedStartTime = "00:00";
        if (event.start_time) {
          const timeRegex = /(\d+):(\d+)\s*(AM|PM)/i;
          const match = event.start_time.match(timeRegex);
          if (match) {
            let hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            const ampm = match[3].toUpperCase();
            if (ampm === "PM" && hours < 12) {
              hours += 12;
            } else if (ampm === "AM" && hours === 12) {
              hours = 0;
            }
            formattedStartTime = `${hours}:${minutes
              .toString()
              .padStart(2, "0")}`;
            if (event.end_time) {
              const endMatch = event.end_time.match(timeRegex);
              if (endMatch) {
                let endHours = parseInt(endMatch[1]);
                const endMinutes = parseInt(endMatch[2]);
                const endAmpm = endMatch[3].toUpperCase();
                if (endAmpm === "PM" && endHours < 12) {
                  endHours += 12;
                } else if (endAmpm === "AM" && endHours === 12) {
                  endHours = 0;
                }
                duration = endHours - hours + (endMinutes - minutes) / 60;
              }
            }
          }
        }
        return {
          eventId: event.event_id,
          activity: event.title,
          description: event.description,
          address: event.address,
          contact: event.contact,
          hours: event.hours,
          price: event.price,
          rating: event.rating,
          ratingCount: event.rating_count,
          time: formattedStartTime,
          duration: duration,
          imagePath: event.image_path,
          tags: event.tags,
        };
      });
      // Sort events by start time.
      formattedEvents.sort((a: any, b: any) => {
        const [aHours, aMinutes] = a.time.split(":").map(Number);
        const [bHours, bMinutes] = b.time.split(":").map(Number);
        return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
      });
      setItineraryItems(formattedEvents);
    } catch (error) {
      console.error("Error fetching itinerary items:", error);
      setItineraryItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItineraryDates();
  }, [itineraryId]);

  useEffect(() => {
    if (selectedDate) {
      fetchItineraryItems(selectedDate);
    }
  }, [selectedDate, itineraryId]);

  useFocusEffect(
    React.useCallback(() => {
      if (selectedDate) {
        fetchItineraryItems(selectedDate);
      }
    }, [selectedDate, itineraryId])
  );

  // Extract day name, day number, and month/year from a formatted date string.
  const getDayInfo = (dateStr: string) => {
    const match = dateStr.match(/(\w+)\s+(\d+),\s+(\d+)/);
    if (!match) return { dayName: "", dayNumber: "", monthYear: "" };
    const monthName = match[1];
    const day = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    const months: { [key: string]: number } = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11,
    };
    const monthIndex = months[monthName];
    if (monthIndex === undefined)
      return { dayName: "", dayNumber: "", monthYear: "" };
    const dateObj = new Date(year, monthIndex, day);
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
    return { dayName, dayNumber: day, monthYear: `${monthName} ${year}` };
  };

  const getMonthYearHeader = (dateStr: string) => {
    const info = getDayInfo(dateStr);
    return info.monthYear;
  };

  // Helper: Format an hour (0-23) into an hourly interval string.
  const formatHour = (hour: number): string => {
    if (hour === 0) return "12:00 AM";
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return "12:00 PM";
    return `${hour - 12}:00 PM`;
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      {/* Top Header and Weekly Calendar */}
      <View style={styles.headerContainer}>
        <Entypo name="location-pin" size={18} color={Colors.primary} />
        <Text style={styles.itineraryTitle}>{itineraryTitle}</Text>
        <Pressable onPress={() => setIsEditMode(!isEditMode)}>
          <Text style={styles.editButtonText}>
            {isEditMode ? "Done" : "Edit"}
          </Text>
        </Pressable>
      </View>
      <View
        style={{
          borderRadius: 10,
          borderWidth: 3,
          borderColor: Colors.palePink,
          marginHorizontal: 5,
        }}
      >
        {selectedDate && (
          <View style={styles.monthYearContainer}>
            <Text style={styles.monthYearText}>
              {getMonthYearHeader(selectedDate)}
            </Text>
          </View>
        )}
        <View style={styles.weeklyCalendarContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {availableDates.map((date, index) => {
              const { dayName, dayNumber } = getDayInfo(date);
              const isSelected = date === selectedDate;
              return (
                <Pressable key={index} onPress={() => setSelectedDate(date)}>
                  <View
                    style={[
                      styles.calendarDateItem,
                      isSelected && styles.selectedCalendarDateItem,
                    ]}
                  >
                    <Text
                      style={[
                        styles.calendarDayName,
                        isSelected && styles.selectedCalendarDayName,
                      ]}
                    >
                      {dayName}
                    </Text>
                    <Text
                      style={[
                        styles.calendarDayNumber,
                        isSelected && styles.selectedCalendarDayNumber,
                      ]}
                    >
                      {dayNumber}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
      {/* Timeline Header (Time & Event labels) */}
      <View style={styles.timelineHeader}>
        <View style={styles.timeHeaderCell}>
          <Text style={styles.headerText}>Time</Text>
        </View>
        <View style={styles.eventHeaderCell}>
          <Text style={styles.headerText}>Event</Text>
        </View>
      </View>

      {/* Timeline Container */}
      <ScrollView style={styles.timelineWrapper}>
        <View style={styles.timelineContainer}>
          {/* Time Markers */}
          <View style={styles.timeMarkers}>
            {Array.from({ length: 24 }, (_, i) => (
              <View key={i} style={styles.timeSlot}>
                <Text style={styles.timeText}>{formatHour(i)}</Text>
              </View>
            ))}
          </View>
          {/* Events Container (with absolute positioning) */}
          <View style={styles.eventsContainer}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color={Colors.primary}
                style={{ marginTop: 100 }}
              />
            ) : itineraryItems.length === 0 ? (
              <View style={styles.noEventsContainer}>
                <Text style={styles.noEventsText}>
                  No events scheduled for this day.
                </Text>
              </View>
            ) : (
              itineraryItems.map((item, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.eventBubble,
                    getEventStyle(item.time, item.duration),
                  ]}
                  onPress={() => {
                    if (isEditMode) {
                      setSelectedEvent(item);
                      // Initialize editedStartTime from item's time (assume "HH:MM" format)
                      const [startHour, startMin] = item.time.split(":").map(Number);
                      setEditedStartTime(new Date(new Date().setHours(startHour, startMin, 0, 0)));
                      // Calculate the end time using your existing helper then initialize editedEndTime
                      const endTimeStr = calculateEndTime(item.time, item.duration); // e.g. "HH:MM"
                      const [endHour, endMin] = endTimeStr.split(":").map(Number);
                      setEditedEndTime(new Date(new Date().setHours(endHour, endMin, 0, 0)));
                      setEventModalVisible(true);
                    } else {
                      // Navigate normally
                      router.push({
                        pathname: "/screens/EventDetails",
                        params: {
                          activity: item.activity,
                          time: item.time,
                          duration: item.duration,
                          description: item.description || "",
                          address: item.address || "",
                          contact: item.contact || "",
                          hours: item.hours || "",
                          price: item.price || "",
                          rating: item.rating || "",
                          ratingCount: item.ratingCount || "",
                          image: item.imagePath || "",
                          eventId: item.eventId || "",
                          tags:
                            item.tags ? (Array.isArray(item.tags) ? item.tags.join(",") : item.tags) : "",
                        },
                      });
                    }
                  }}
                  
                  // Remove any disabled prop if present for edit mode
                >
                  {renderEventContent(item)}
                </Pressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {eventModalVisible && selectedEvent && (
        <Modal visible={eventModalVisible} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.eventModalView}>
              <Text style={styles.modalTitle}>{selectedEvent.activity}</Text>
              <Text style={styles.modalSubtitle}>
                {`Current Time: ${formatTimeToAMPM(selectedEvent.time)}`}
              </Text>
              {isEditingTime && (
                <DateTimePicker
                  value={
                    // Convert the event's current time (assumed "HH:MM") to a Date object on today's date.
                    new Date(
                      new Date().setHours(
                        parseInt(selectedEvent.time.split(":")[0], 10),
                        parseInt(selectedEvent.time.split(":")[1], 10)
                      )
                    )
                  }
                  mode="time"
                  display="spinner"
                  onChange={async (event, date) => {
                    if (date) {
                      try {
                        const newTime = `${date.getHours()}:${date
                          .getMinutes()
                          .toString()
                          .padStart(2, "0")}`;
                        const response = await fetch(
                          `http://10.0.2.2:3000/events/${selectedEvent.eventId}`,
                          {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ time: newTime }),
                          }
                        );
                        if (response.ok) {
                          setItineraryItems((currentItems) =>
                            currentItems.map((ev) =>
                              ev.eventId === selectedEvent.eventId
                                ? { ...ev, time: newTime }
                                : ev
                            )
                          );
                          Alert.alert("Success", "Event time updated.");
                        } else {
                          Alert.alert("Error", "Failed to update event time.");
                        }
                      } catch (error) {
                        console.error(error);
                      }
                    }
                    setIsEditingTime(false);
                    setEventModalVisible(false);
                    setSelectedEvent(null);
                  }}
                />
              )}
              <View style={styles.modalButtonContainer}>
                <Pressable
                  style={[styles.button, styles.modalButton]}
                  onPress={() => {
                    Alert.alert(
                      "Confirm Removal",
                      "Are you sure you want to remove this event?",
                      [
                        {
                          text: "Cancel",
                          style: "cancel",
                        },
                        {
                          text: "Remove",
                          onPress: async () => {
                            try {
                              setLoading(true);
                              const response = await fetch(
                                `http://10.0.2.2:3000/events/${selectedEvent.eventId}`,
                                { method: "DELETE" }
                              );
                              if (!response.ok) {
                                const errorData = await response.json();
                                throw new Error(
                                  errorData.error || "Failed to delete event"
                                );
                              }
                              setItineraryItems((currentItems) =>
                                currentItems.filter(
                                  (ev) => ev.eventId !== selectedEvent.eventId
                                )
                              );
                              Alert.alert("Success", "Event has been removed.");
                            } catch (error) {
                              console.error("Error deleting event:", error);
                              Alert.alert("Error", "Failed to remove event.");
                            } finally {
                              setLoading(false);
                              setEventModalVisible(false);
                              setSelectedEvent(null);
                            }
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Text style={styles.buttonText}>Remove Event</Text>
                </Pressable>
                {!isEditingTime && (
                  <Pressable
                    style={[styles.button, styles.modalButton]}
                    onPress={() => {
                      setIsEditingTime(true);
                    }}
                  >
                    <Text style={styles.buttonText}>Change Time</Text>
                  </Pressable>
                )}
              </View>
              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setEventModalVisible(false);
                  setSelectedEvent(null);
                  setIsEditingTime(false);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: Colors.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itineraryTitle: {
    fontSize: 24,
    fontFamily: "quicksand-bold",
    color: Colors.primary,
  },
  editButtonText: {
    fontSize: 16,
    fontFamily: "quicksand-semibold",
    color: Colors.coral,
  },
  monthYearContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    backgroundColor: Colors.palestPink,
    borderRadius: 10,
  },
  monthYearText: {
    fontSize: 18,
    fontFamily: "quicksand-semibold",
    color: Colors.primary,
  },
  weeklyCalendarContainer: {
    paddingVertical: 10,
    backgroundColor: Colors.palestPink,
    borderRadius: 10,
  },
  calendarDateItem: {
    width: 60, // Fixed width
    height: 60, // Fixed height
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: Colors.palePink,
    marginHorizontal: 10,
  },
  selectedCalendarDateItem: {
    backgroundColor: Colors.peachySalmon,
  },
  calendarDayName: {
    fontSize: 12,
    fontFamily: "quicksand-semibold",
    color: Colors.grey,
  },
  calendarDayNumber: {
    fontSize: 16,
    fontFamily: "quicksand-bold",
    color: Colors.primary,
  },
  selectedCalendarDayName: {
    color: Colors.white,
  },
  selectedCalendarDayNumber: {
    color: Colors.white,
  },
  timelineHeader: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  timeHeaderCell: {
    width: 70,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.palePink,
    borderRadius: 10,
  },
  eventHeaderCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.palePink,
    borderRadius: 10,
    marginLeft: 10,
    marginRight: 5,
  },
  headerText: {
    fontSize: 16,
    fontFamily: "quicksand-semibold",
    color: Colors.primary,
  },
  timelineWrapper: {
    flex: 1,
  },
  timelineContainer: {
    height: 24 * pixelsForHour,
    position: "relative",
    marginHorizontal: 20,
  },
  timeMarkers: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 70,
  },
  timeSlot: {
    height: pixelsForHour,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "lightgrey",
  },
  timeText: {
    fontSize: 14,
    fontFamily: "quicksand-semibold",
    color: Colors.grey,
  },
  eventsContainer: {
    flex: 1,
    marginLeft: 20,
  },
  eventBubble: {
    backgroundColor: Colors.palestPink,
    borderRadius: 8,
    padding: 10,
    borderWidth: 2,
    borderColor: Colors.palePink,
  },
  eventContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },
  eventTextContainer: {
    flex: 1,
  },
  activityText: {
    fontSize: 16,
    fontFamily: "quicksand-bold",
    color: Colors.primary,
  },
  durationText: {
    fontSize: 13,
    fontFamily: "quicksand-regular",
    color: Colors.primary,
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  dotsContainer: {
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  noEventsContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  noEventsText: {
    fontSize: 16,
    fontFamily: "quicksand-semibold",
    color: Colors.grey,
    textAlign: "center",
  },
  menuDots: {
    fontSize: 20,
    color: "#888",
    paddingLeft: 10,
  },
  locationText: {
    fontSize: 13,
    fontFamily: "quicksand-regular",
    color: Colors.primary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  eventModalView: {
    width: "80%",
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  timePickerModalView: {
    width: "80%",
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "quicksand-bold",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: "quicksand-regular",
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
  },
  modalButton: {
    backgroundColor: Colors.coral,
  },
  cancelButton: {
    backgroundColor: Colors.grey,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "quicksand-bold",
  },
});

export default DetailedItinerary;
