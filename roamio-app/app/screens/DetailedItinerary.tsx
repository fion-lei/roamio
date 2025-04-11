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
import { FontAwesome } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useUser } from "@/contexts/UserContext";
import { useFocusEffect } from "@react-navigation/native";

const pixelsForHour = 60; // Each hour block height in pixels

const DetailedItinerary = () => {
  // Route parameters and state management
  const params = useLocalSearchParams();
  const itineraryId = params.id as string;
  const itineraryTitle = (params.title as string) || "Itinerary";
  const userRole = params.userRole as string;
  const router = useRouter();
  const { user } = useUser();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [itineraryItems, setItineraryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editedStartTime, setEditedStartTime] = useState<Date | null>(null);
  const [editedEndTime, setEditedEndTime] = useState<Date | null>(null);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

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

  // Helper function to check if two events overlap
  const eventsOverlap = (event1: any, event2: any) => {
    const [hours1, minutes1] = event1.time.split(":").map(Number);
    const [hours2, minutes2] = event2.time.split(":").map(Number);

    const event1Start = hours1 * 60 + minutes1;
    const event1End = event1Start + event1.duration * 60;
    const event2Start = hours2 * 60 + minutes2;
    const event2End = event2Start + event2.duration * 60;

    return event1Start < event2End && event1End > event2Start;
  };

  // Helper function to check if an event is part of any overlap
  const hasOverlap = (currentEvent: any, allEvents: any[]) => {
    return allEvents.some(
      (event) =>
        event.eventId !== currentEvent.eventId &&
        eventsOverlap(currentEvent, event)
    );
  };

  // Helper: Return a style object that positions an event block based on its start time and duration.
  const getEventStyle = (
    time: string,
    duration: number,
    isOverlapping: boolean
  ) => {
    const [hours, minutes] = time.split(":").map(Number);
    const topPosition = (hours + minutes / 60) * pixelsForHour;
    const height = Math.max(duration * pixelsForHour, 50);

    return {
      position: "absolute" as const,
      top: topPosition,
      left: 70,
      right: 10,
      height,
      minWidth: 150,
      borderWidth: 2,
      borderColor: isOverlapping ? Colors.coral : Colors.palePink,
      backgroundColor: Colors.palestPink,
      opacity: 0.85,
    };
  };

  // Format time function for the modal
  const formatTime = (date: Date | null) => {
    if (!date) return "--:-- AM";
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Function to handle time changes in the picker
  const handleTimeChange = (event: any, selectedDate?: Date, type?: string) => {
    if (event.type === "dismissed") {
      switch (type) {
        case "startTime":
          setShowStartTimePicker(false);
          break;
        case "endTime":
          setShowEndTimePicker(false);
          break;
      }
      return;
    }

    if (selectedDate) {
      switch (type) {
        case "startTime":
          setEditedStartTime(selectedDate);
          setShowStartTimePicker(false);
          break;
        case "endTime":
          setEditedEndTime(selectedDate);
          setShowEndTimePicker(false);
          break;
      }
    }
  };

  // Function to save the time changes
  const handleSaveTime = async () => {
    if (!editedStartTime || !editedEndTime) {
      Alert.alert("Error", "Please select both start and end times");
      return;
    }

    if (editedEndTime <= editedStartTime) {
      Alert.alert("Please try again", "End time must be after start time");
      return;
    }

    // Format the times for the API in AM/PM format
    const formatTimeForAPI = (date: Date) => {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    // Format the times for display (12-hour format)
    const newStartTime = formatTimeForAPI(editedStartTime);
    const newEndTime = formatTimeForAPI(editedEndTime);

    // Calculate the new duration in hours
    const startMs = editedStartTime.getTime();
    const endMs = editedEndTime.getTime();
    const durationHours = (endMs - startMs) / (1000 * 60 * 60);

    try {
      setEventModalVisible(false);

      // Check if eventId exists
      if (!selectedEvent?.eventId) {
        Alert.alert("Error", "Event ID not found");
        return;
      }

      // Create the update payload
      const updateData = {
        start_time: newStartTime,
        end_time: newEndTime,
      };

      // Call the API to update the event
      const response = await fetch(
        `http://10.0.2.2:3000/events/${selectedEvent.eventId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update event time");
      }

      // Convert time objects to format that component can use
      const formatTimesForComponent = (date: Date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${hours}:${minutes.toString().padStart(2, "0")}`;
      };

      // Update the event in the local state
      setItineraryItems((currentItems) =>
        currentItems.map((item) =>
          item.eventId === selectedEvent.eventId
            ? {
                ...item,
                time: formatTimesForComponent(editedStartTime),
                duration: durationHours,
              }
            : item
        )
      );

      // Show success message
      Alert.alert("Success", "Event time has been updated.");
    } catch (error) {
      console.error("Error updating event time:", error);
      Alert.alert("Error", "Failed to update event time.");
    }
  };

  // Render the content for an event block.
  const renderEventContent = (item: any) => (
    <View style={styles.eventContent}>
      <View style={styles.eventTextContainer}>
        <Text style={styles.activityText} numberOfLines={1}>
          {item.activity}
        </Text>
        <Text style={styles.locationText} numberOfLines={1}>
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
              onPress={() => {
                setSelectedEvent(item);
                const [startHour, startMin] = item.time.split(":").map(Number);
                setEditedStartTime(
                  new Date(new Date().setHours(startHour, startMin, 0, 0))
                );
                const endTimeStr = calculateEndTime(item.time, item.duration);
                const [endHour, endMin] = endTimeStr.split(":").map(Number);
                setEditedEndTime(
                  new Date(new Date().setHours(endHour, endMin, 0, 0))
                );
                setEventModalVisible(true);
              }}
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
    if (userRole === "viewer") {
      setIsEditMode(false);
    }
    if (selectedDate) {
      fetchItineraryItems(selectedDate);
    }
  }, [itineraryId, userRole, selectedDate]);
  //   useEffect(() => {
  //   fetchItineraryDates();
  //   if (userRole === "viewer") {
  //     setIsEditMode(false);
  //   }
  // }, [itineraryId, userRole]);

  // useEffect(() => {
  //   if (selectedDate) {
  //     fetchItineraryItems(selectedDate);
  //   }
  // }, [selectedDate, itineraryId]);

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
    <SafeAreaView style={styles.safeContainer}>
      {/* Top Header and Weekly Calendar */}
      <View style={styles.headerContainer}>
        <View style={styles.headerLeftSection}>
          <View style={styles.mapPinContainer}>
            <FontAwesome name="map-pin" size={18} color={Colors.coral} />
          </View>
        </View>
        <Text style={styles.itineraryTitle}>{itineraryTitle}</Text>
        <View style={styles.editButtonContainer}>
          {userRole !== "viewer" ? (
            <Pressable
              onPress={() => setIsEditMode(!isEditMode)}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>
                {isEditMode ? "Done" : "Edit"}
              </Text>
            </Pressable>
          ) : (
            // Invisible placeholder to maintain layout consistency
            <View style={styles.editButtonPlaceholder} />
          )}
        </View>
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
                  No events scheduled today.
                </Text>
              </View>
            ) : (
              itineraryItems.map((item, index) => {
                const isOverlapping = hasOverlap(item, itineraryItems);
                return (
                  <Pressable
                    key={index}
                    style={[
                      styles.eventBubble,
                      getEventStyle(item.time, item.duration, isOverlapping),
                    ]}
                    onPress={() => {
                      if (isEditMode) {
                        setSelectedEvent(item);
                        const [startHour, startMin] = item.time
                          .split(":")
                          .map(Number);
                        setEditedStartTime(
                          new Date(
                            new Date().setHours(startHour, startMin, 0, 0)
                          )
                        );
                        const endTimeStr = calculateEndTime(
                          item.time,
                          item.duration
                        );
                        const [endHour, endMin] = endTimeStr
                          .split(":")
                          .map(Number);
                        setEditedEndTime(
                          new Date(new Date().setHours(endHour, endMin, 0, 0))
                        );
                        setEventModalVisible(true);
                      } else {
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
                            tags: item.tags
                              ? Array.isArray(item.tags)
                                ? item.tags.join(",")
                                : item.tags
                              : "",
                          },
                        });
                      }
                    }}
                  >
                    {renderEventContent(item)}
                  </Pressable>
                );
              })
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

              {/* Time Selection Section */}
              <View style={styles.timeContainer}>
                <View style={styles.timeInputContainer}>
                  <Text style={styles.inputLabel}>Start Time</Text>
                  <Pressable
                    style={styles.selectFieldContainer}
                    onPress={() => setShowStartTimePicker(true)}
                  >
                    <Text style={styles.selectText}>
                      {formatTime(editedStartTime)}
                    </Text>
                    <FontAwesome
                      name="clock-o"
                      size={14}
                      style={styles.timeIcon}
                    />
                  </Pressable>

                  {showStartTimePicker && (
                    <View style={styles.pickerContainer}>
                      <DateTimePicker
                        value={editedStartTime || new Date()}
                        mode="time"
                        display="spinner"
                        onChange={(event, date) =>
                          handleTimeChange(event, date, "startTime")
                        }
                      />
                    </View>
                  )}
                </View>

                <View style={styles.timeInputContainer}>
                  <Text style={styles.inputLabel}>End Time</Text>
                  <Pressable
                    style={styles.selectFieldContainer}
                    onPress={() => setShowEndTimePicker(true)}
                  >
                    <Text style={styles.selectText}>
                      {formatTime(editedEndTime)}
                    </Text>
                    <FontAwesome
                      name="clock-o"
                      size={14}
                      style={styles.timeIcon}
                    />
                  </Pressable>

                  {showEndTimePicker && (
                    <View style={styles.pickerContainer}>
                      <DateTimePicker
                        value={editedEndTime || new Date()}
                        mode="time"
                        display="spinner"
                        onChange={(event, date) =>
                          handleTimeChange(event, date, "endTime")
                        }
                      />
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.modalButtonContainer}>
                <Pressable
                  style={[styles.button, styles.modalButton]}
                  onPress={() => {
                    Alert.alert(
                      "Confirm Removal",
                      "Are you sure you want to remove this event? This action cannot be undone.",
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
                  <Text style={styles.buttonText}>Remove</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.modalButton]}
                  onPress={handleSaveTime}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </Pressable>
              </View>
              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setEventModalVisible(false);
                  setSelectedEvent(null);
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
  safeContainer: {
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
  headerLeftSection: {
    width: 60,
    alignItems: "flex-start",
  },
  mapPinContainer: {
    width: 35,
    height: 35,
    borderRadius: "50%",
    backgroundColor: Colors.palePink,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  itineraryTitle: {
    fontSize: 24,
    fontFamily: "quicksand-bold",
    color: Colors.primary,
    flex: 1,
    textAlign: "center",
  },
  editButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  editButtonPlaceholder: {
    width: 60, // Fixed width for the button container
  },
  editButton: {
    padding: 4,
    width: 60, // Fixed width for the button container
    borderWidth: 1,
    borderColor: Colors.peachySalmon,
    borderRadius: 10,
  },
  editButtonText: {
    fontSize: 16,
    fontFamily: "quicksand-semibold",
    color: Colors.coral,
    width: 50,
    textAlign: "center",
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
    marginTop: 3,
  },
  timeHeaderCell: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.palePink,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  eventHeaderCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.palePink,
    borderRadius: 8,
    marginLeft: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  headerText: {
    fontSize: 15,
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
    fontSize: 12,
    fontFamily: "quicksand-regular",
    color: Colors.primary,
    marginTop: 2,
  },
  eventsContainer: {
    flex: 1,
    marginLeft: 20,
  },
  eventBubble: {
    borderRadius: 8,
    padding: 10,
    overflow: "hidden",
  },
  eventContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    minHeight: 30,
  },
  eventTextContainer: {
    flex: 1,
    marginRight: 5,
  },
  activityText: {
    fontSize: 14,
    fontFamily: "quicksand-bold",
    color: Colors.primary,
  },
  locationText: {
    fontSize: 12,
    fontFamily: "quicksand-regular",
    color: Colors.primary,
    marginTop: 2,
  },
  dotsContainer: {
    paddingHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
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
  noEventsContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  noEventsText: {
    fontSize: 16,
    fontFamily: "quicksand-semibold",
    color: Colors.grey,
    textAlign: "center",
    marginLeft: 60,
  },
  menuDots: {
    fontSize: 20,
    color: "#333",
    paddingLeft: 10,
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
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    flex: 1,
    alignItems: "center",
    height: 40,
    justifyContent: "center",
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "quicksand-bold",
    textAlign: "center",
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
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    width: "100%",
  },
  timeInputContainer: {
    width: "48%",
    position: "relative",
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: "quicksand-semibold",
    marginBottom: 5,
    color: Colors.primary,
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
  selectText: {
    fontSize: 16,
    fontFamily: "quicksand-medium",
    flex: 1,
    color: Colors.primary,
  },
  timeIcon: {
    position: "absolute",
    right: 10,
    top: 18,
    color: Colors.coral,
  },
  pickerContainer: {
    position: "absolute",
    backgroundColor: Colors.white,
    borderRadius: 10,
    zIndex: 20,
    top: "100%",
    marginTop: 2,
    width: "100%",
  },
});

export default DetailedItinerary;
