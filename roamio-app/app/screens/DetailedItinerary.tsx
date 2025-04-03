import React, { useLayoutEffect, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";

import { useNavigation, useRouter, useLocalSearchParams } from "expo-router";
import { useUser } from "@/contexts/UserContext";

// for ensuring timeslot sizes/positions are consistent. E.g. each hour chunk = 60px in height
const pixelsForHour = 60;

const DetailedItinerary = () => {
  // Get route parameters
  const params = useLocalSearchParams();
  const itineraryId = params.id as string;
  const itineraryTitle = params.title as string || "Couldn't find title";
  const itineraryDate = params.date as string || "Couldn't find date";

  const navigation = useNavigation();
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  // State for available dates that will be fetched from backend
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [itineraryItems, setItineraryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState("");

  // for top nav bar
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View
          style={{
            flexDirection: "column",
            flex: 0,
            marginLeft: 110,
          }}
        >
          <Text style={{ color: Colors.coral, fontSize: 20, fontFamily: "quicksand-bold" }}>
            {itineraryTitle}
          </Text>

          <Pressable onPress={() => setShowCalendar(!showCalendar)}>
            <View style={{ flexDirection: "row", marginTop: 0, alignItems: "center", marginLeft: -30 }}>
              <FontAwesome name="calendar" size={20} color={Colors.primary} />

              <Text style={{ color: Colors.primary, marginLeft: 4, fontSize: 14, fontFamily: "quicksand-semibold" }}>
                {selectedDate}
              </Text>
            </View>
          </Pressable>

        </View>
      ),
      headerRight: () => (
        <Pressable onPress={() => setIsEditMode(!isEditMode)}>
          <Text style={{ color: Colors.coral, marginRight: 15, fontSize: 20, fontFamily: "quicksand-bold" }}>
            {isEditMode ? "Done" : "Edit"}
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, isEditMode, itineraryTitle, showCalendar, selectedDate]);

  // making time slots for 24 hours in AM and PM format
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const ampm = hour >= 12 ? "PM" : "AM";

    let displayHour;
    if (hour === 0) {
      displayHour = 12; // 0 = 12am
    } else if (hour > 12) {
      displayHour = hour - 12; // PM
    } else {
      displayHour = hour; // AM
    }
    return `${displayHour}:00 ${ampm}`;
  });

  // so that itinerary items will be in AM and PM format
  const formatTimeToAMPM = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";

    let displayHour;
    if (hours === 0) {
      displayHour = 12;
    } else if (hours > 12) {
      displayHour = hours - 12;
    } else {
      displayHour = hours;
    }
    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  // for calculating position and height of an event based on time
  const getEventStyle = (time: string, duration: number) => {
    const [hours, minutes] = time.split(":").map(Number);
    const topPosition = (hours + minutes / 60) * pixelsForHour;
    const height = duration * pixelsForHour;

    return {
      position: "absolute" as const,
      top: topPosition,
      left: 70, // left padding so that we can see the time on the left
      right: 10,
      height: height,
    };
  };

  // function to calculate end time from start time and duration
  const calculateEndTime = (startTime: string, durationHours: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);

    // Calculate total minutes
    let totalMinutes = hours * 60 + minutes + durationHours * 60;

    // Handle overflow (more than 24 hours) by wrapping around
    totalMinutes = totalMinutes % (24 * 60);

    // Convert back to hours and minutes
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = Math.floor(totalMinutes % 60);

    // Format as HH:MM
    return `${endHours}:${endMinutes.toString().padStart(2, "0")}`;
  };

  // event content
  const renderEventContent = (item: any, index: number) => (
    <View style={styles.eventContent}>
      <View style={styles.eventTextContainer}>
        <Text style={styles.activityText}>{item.activity}</Text>
        <Text style={styles.durationText}>
          {`${formatTimeToAMPM(item.time)} - ${formatTimeToAMPM(calculateEndTime(item.time, item.duration))}`}
        </Text>
      </View>
      {/* If in edit mode, show delete button */}
      {isEditMode && (
        <Pressable
          style={styles.deleteButton}
          onPress={() => {
            console.log("trying to delete event with ID:", item.eventId);
            Alert.alert(
              "Confirm Removal",
              `Are you sure you want to remove ${item.activity} from your itinerary?`,
              [
                {
                  text: "Cancel",
                  style: "cancel"
                },
                {
                  text: "Remove",
                  onPress: async () => {
                    try {
                      setLoading(true);
                      
                      // getting backend info and deleting event
                      const response = await fetch(`http://10.0.2.2:3000/events/${item.eventId}`, {
                        method: 'DELETE',
                      });
                      
                      if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to delete event');
                      }
                      
                      // Remove the event from local state
                      setItineraryItems(currentItems => 
                        currentItems.filter(event => event.eventId !== item.eventId)
                      );
                      
                      // Show success message
                      Alert.alert("Success", `${item.activity} has been removed from your itinerary.`);
                    } catch (error) {
                      // Show error message
                      console.error('Error deleting event:', error);
                      Alert.alert("Error", `Failed to remove ${item.activity}. Please try again.`);
                    } finally {
                      setLoading(false);
                    }
                  }
                }
              ]
            );
          }}
        >
          <View style={styles.iconContainer}>
            <FontAwesome name="minus" size={16} color={Colors.primary} />
          </View>
        </Pressable>
      )}
    </View>
  );

  // Function to fetch the date range for the current itinerary
  const fetchItineraryDates = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:3000/itineraries?email=${encodeURIComponent(user.email)}`);

      if (response.ok) {
        const data = await response.json();
        const currentItinerary = data.itineraries.find(
          (itinerary: any) => String(itinerary.itinerary_id) === itineraryId
        );

        if (currentItinerary && currentItinerary.start_date && currentItinerary.end_date) {
          // Parse start and end dates
          const startDate = new Date(currentItinerary.start_date.split('/').map(Number)[2],
            currentItinerary.start_date.split('/').map(Number)[0] - 1,
            currentItinerary.start_date.split('/').map(Number)[1]);

          const endDate = new Date(currentItinerary.end_date.split('/').map(Number)[2],
            currentItinerary.end_date.split('/').map(Number)[0] - 1,
            currentItinerary.end_date.split('/').map(Number)[1]);

          // Generate array of all dates between start and end dates
          const dates: string[] = [];
          const currentDate = new Date(startDate);

          while (currentDate <= endDate) {
            dates.push(currentDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            }));
            currentDate.setDate(currentDate.getDate() + 1);
          }

          setAvailableDates(dates);

          // Set the selected date to the first date in the range if not already set
          if (dates.length > 0 && !selectedDate) {
            setSelectedDate(dates[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching itinerary dates:', error);
    }
  };

  // Function to fetch events for a specific date within the itinerary
  const fetchItineraryItems = async (date: string) => {
    setLoading(true);
    try {
      //   console.log(`Fetching events for itinerary: ${itineraryId}, date: ${date}`);

      // get all events for this itinerary
      const response = await fetch(`http://10.0.2.2:3000/events/${itineraryId}`);

      if (!response.ok) {
        console.error(`Failed to fetch events: ${response.status} ${response.statusText}`);
        setItineraryItems([]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      const events = data.events || [];
      //    console.log(`Retrieved ${events.length} events for itinerary ${itineraryId}`);

      if (events.length === 0) {
        //      console.log("No events found for this itinerary");
        setItineraryItems([]);
        setLoading(false);
        return;
      }

      // console.log("First event start_date format:", events[0]?.start_date);
      // console.log("Selected date format:", date);

      // Parse the selected date from "Month Day, Year" format (e.g., "April 2, 2025")
      const selectedDateParts = date.match(/(\w+)\s+(\d+),\s+(\d+)/);
      let selectedDateObj;

      if (selectedDateParts) {
        const month = selectedDateParts[1];
        const day = parseInt(selectedDateParts[2]);
        const year = parseInt(selectedDateParts[3]);

        // Convert month name to month number (0-11)
        const months = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"];
        const monthIndex = months.findIndex(m => m === month);

        if (monthIndex !== -1) {
          selectedDateObj = new Date(year, monthIndex, day);
          //     console.log("Parsed selected date:", selectedDateObj.toDateString());
        }
      }

      if (!selectedDateObj || isNaN(selectedDateObj.getTime())) {
        //   console.error("Failed to parse selected date:", date);
        setItineraryItems([]);
        setLoading(false);
        return;
      }

      // Filter events that occur on the selected date
      const eventsOnSelectedDate = events.filter((event: { start_date: string | number | Date; end_date?: string | number | Date; event_id: any; title: any; }) => {
        if (!event.start_date) {
          console.log(`Event ${event.event_id} has no start_date`);
          return false;
        }

        let eventStartDate;
        let eventEndDate;

        // Parse start date
        if (typeof event.start_date === 'string' && event.start_date.includes('/')) {
          const [month, day, year] = event.start_date.split('/').map(Number);
          eventStartDate = new Date(year, month - 1, day);
        } else {
          eventStartDate = new Date(event.start_date);
        }

        // Parse end date (if available) or use start date
        if (event.end_date) {
          if (typeof event.end_date === 'string' && event.end_date.includes('/')) {
            const [month, day, year] = event.end_date.split('/').map(Number);
            eventEndDate = new Date(year, month - 1, day);
          } else {
            eventEndDate = new Date(event.end_date);
          }
        } else {
          eventEndDate = eventStartDate; // Single day event
        }

        //(`Event ${event.title} date range: ${eventStartDate.toDateString()} to ${eventEndDate.toDateString()}, Selected date: ${selectedDateObj.toDateString()}`);

        // Check if the selected date falls within the event's date range
        const isInDateRange =
          selectedDateObj >= eventStartDate &&
          selectedDateObj <= eventEndDate;

        //    console.log(`Event ${event.title} is in selected date range: ${isInDateRange}`);
        return isInDateRange;
      });

      //   console.log(`Found ${eventsOnSelectedDate.length} events for selected date ${date}`);

      // Format the events for display in the timeline
      const formattedEvents = eventsOnSelectedDate.map((event: any) => {
        //    console.log(`Processing event time: ${event.start_time}, ${event.end_time}`);
        // Calculate duration based on start and end times
        let duration = 1; // Default duration is 1 hour
        let formattedStartTime = "00:00"; // Default to midnight (beginning of day)
        let isMultiDayEvent = false;
        let isFirstDay = false;
        let isLastDay = false;

        // Parse dates to determine if this is a multi-day event
        let eventStartDate;
        let eventEndDate;

        if (typeof event.start_date === 'string' && event.start_date.includes('/')) {
          const [month, day, year] = event.start_date.split('/').map(Number);
          eventStartDate = new Date(year, month - 1, day);
        } else {
          eventStartDate = new Date(event.start_date);
        }

        if (event.end_date) {
          if (typeof event.end_date === 'string' && event.end_date.includes('/')) {
            const [month, day, year] = event.end_date.split('/').map(Number);
            eventEndDate = new Date(year, month - 1, day);
          } else {
            eventEndDate = new Date(event.end_date);
          }
        } else {
          eventEndDate = eventStartDate;
        }

        isMultiDayEvent = eventStartDate.getTime() !== eventEndDate.getTime();
        isFirstDay = selectedDateObj.getTime() === eventStartDate.getTime();
        isLastDay = selectedDateObj.getTime() === eventEndDate.getTime();

        // Handle time display differently based on which day of the multi-day event we're on
        if (isMultiDayEvent) {
          if (isFirstDay) {
            // for first day, use the start time and set duration to end of day
            if (event.start_time) {
              const timeRegex = /(\d+):(\d+)\s*(AM|PM)/i;
              const match = event.start_time.match(timeRegex);

              if (match) {
                let hours = parseInt(match[1]);
                const minutes = parseInt(match[2]);
                const ampm = match[3].toUpperCase();

                // Convert to 24-hour format
                if (ampm === "PM" && hours < 12) {
                  hours += 12;
                } else if (ampm === "AM" && hours === 12) {
                  hours = 0;
                }

                formattedStartTime = `${hours}:${minutes.toString().padStart(2, '0')}`;
                // Duration from start time to end of day (24:00)
                duration = 24 - hours - (minutes / 60);
                duration = Math.round(duration * 10) / 10; // round to nearest tenth
              } else {
                // If time format is not recognized, default to full day
                formattedStartTime = "00:00";
                duration = 24;
              }
            } else {
              // No start time specified, assume full day
              formattedStartTime = "00:00";
              duration = 24;
            }
          } else if (isLastDay) {
            // For the last day, start at beginning of day and use end time
            formattedStartTime = "00:00";

            if (event.end_time) {
              const timeRegex = /(\d+):(\d+)\s*(AM|PM)/i;
              const match = event.end_time.match(timeRegex);

              if (match) {
                let hours = parseInt(match[1]);
                const minutes = parseInt(match[2]);
                const ampm = match[3].toUpperCase();

                // Convert to 24-hour format
                if (ampm === "PM" && hours < 12) {
                  hours += 12;
                } else if (ampm === "AM" && hours === 12) {
                  hours = 0;
                }

                // Duration from beginning of day to end time
                duration = hours + (minutes / 60);
                duration = Math.round(duration * 10) / 10; // round to nearest tenth
              } else {
                // If time format is not recognized, default to full day
                duration = 24;
              }
            } else {
              // No end time specified, assume full day
              duration = 24;
            }
          } else {
            // For middle days, show full day
            formattedStartTime = "00:00";
            duration = 24;
          }
        } else {
          // Single day event - using existing time parsing logic
          if (event.start_time) {
            // Parse the start time which might be in various formats
            const timeRegex = /(\d+):(\d+)\s*(AM|PM)/i;
            const match = event.start_time.match(timeRegex);

            if (match) {
              let hours = parseInt(match[1]);
              const minutes = parseInt(match[2]);
              const ampm = match[3].toUpperCase();

              // Convert to 24-hour format
              if (ampm === "PM" && hours < 12) {
                hours += 12;
              } else if (ampm === "AM" && hours === 12) {
                hours = 0;
              }

              formattedStartTime = `${hours}:${minutes.toString().padStart(2, '0')}`;
              //     console.log(`Parsed start time: ${formattedStartTime}`);

              // If there's an end time, calculate duration
              if (event.end_time) {
                const endMatch = event.end_time.match(timeRegex);

                if (endMatch) {
                  let endHours = parseInt(endMatch[1]);
                  const endMinutes = parseInt(endMatch[2]);
                  const endAmpm = endMatch[3].toUpperCase();

                  // Convert end time to 24-hour format
                  if (endAmpm === "PM" && endHours < 12) {
                    endHours += 12;
                  } else if (endAmpm === "AM" && endHours === 12) {
                    endHours = 0;
                  }

                  // Calculate duration in hours
                  duration = (endHours - hours) + (endMinutes - minutes) / 60;
                  duration = Math.round(duration * 10) / 10; // Round to nearest tenth

                  //       console.log(`Calculated duration: ${duration}h`);

                  // Ensure minimum duration for display
                  duration = Math.max(duration, 0.5);
                }
              }
            } else {
              // Try a simpler time format HH:MM
              const simpleTimes = event.start_time.split(':').map(Number);
              if (simpleTimes.length >= 2) {
                formattedStartTime = `${simpleTimes[0]}:${simpleTimes[1].toString().padStart(2, '0')}`;
                console.log(`Using simple time format: ${formattedStartTime}`);
              }
            }
          }
        }

        //     console.log(`Formatted event: ${event.title}, time: ${formattedStartTime}, duration: ${duration}h, multiday: ${isMultiDayEvent ? 'yes' : 'no'}`);


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
          isMultiDay: isMultiDayEvent
        };
      });

      // Sort events by start time
      formattedEvents.sort((a: any, b: any) => {
        const [aHours, aMinutes] = a.time.split(':').map(Number);
        const [bHours, bMinutes] = b.time.split(':').map(Number);

        const aTime = aHours * 60 + aMinutes;
        const bTime = bHours * 60 + bMinutes;

        return aTime - bTime;
      });

      //      console.log(`Setting ${formattedEvents.length} formatted events`);
      setItineraryItems(formattedEvents);
    } catch (error) {
      console.error("Error fetching itinerary items:", error);
      setItineraryItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dates and events when component mounts
  useEffect(() => {
    fetchItineraryDates();
  }, [itineraryId]);

  // Separate useEffect for fetching itinerary items when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      fetchItineraryItems(selectedDate);
    }
  }, [selectedDate, itineraryId]);

  return (
    <SafeAreaView style={styles.mainContainer}>
      {/* Calendar dropdown */}
      {showCalendar && (
        <View style={styles.calendarDropdown}>
          {availableDates.map((date, index) => (
            <Pressable
              key={index}
              style={[
                styles.dateItem,
                date === selectedDate ? styles.selectedDateItem : null
              ]}
              onPress={() => {
                setSelectedDate(date);
                setShowCalendar(false);
                // Fetch events for the selected date
                fetchItineraryItems(date);
              }}
            >
              <Text style={[
                styles.dateItemText,
                date === selectedDate ? styles.selectedDateText : null
              ]}>
                {date}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <ScrollView style={styles.container}>
        <View style={styles.timelineContainer}>
          {/* Time markers */}
          <View style={styles.timeMarkers}>
            {timeSlots.map((time, index) => (
              <View key={index} style={styles.timeSlot}>
                <Text style={styles.timeText}>{time}</Text>
              </View>
            ))}
          </View>

          {/* Events container */}
          <View style={styles.eventsContainer}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color={Colors.primary}
                style={{ marginTop: 100 }}
              />
            ) : itineraryItems.length === 0 ? (
              <View style={styles.noEventsContainer}>
                <Text style={styles.noEventsText}>No events scheduled for this day.</Text>
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
                    if (!isEditMode) {
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
                          tags: item.tags ? (Array.isArray(item.tags) ? item.tags.join(',') : item.tags) : ""
                        },
                      });
                    }
                  }}
                  disabled={isEditMode}
                >
                  {renderEventContent(item, index)}
                </Pressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  timelineContainer: {
    flexDirection: "row",
    paddingTop: 0,
    height: 24 * pixelsForHour, // shows full 24 hours in the timeline
  },
  timeMarkers: {
    width: 60,
    position: "absolute",
    left: 0,
  },
  timeSlot: {
    height: pixelsForHour,
    justifyContent: "center",
    paddingLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
  },
  eventsContainer: {
    flex: 1,
    position: "relative",
  },
  eventBubble: {
    backgroundColor: Colors.palePink,
    borderRadius: 0,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    shadowColor: Colors.grey,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  timeText: {
    fontSize: 14,
    fontFamily: "quicksand-semibold",
    color: Colors.grey,
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
  eventContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eventTextContainer: {
    flex: 1,
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
  calendarDropdown: {
    width: '100%',
    backgroundColor: Colors.palestPink,
    zIndex: 10,
    elevation: 5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    shadowColor: Colors.grey,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dateItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary + '20', // lighter version of primary
  },
  dateItemText: {
    fontSize: 16,
    fontFamily: "quicksand-semibold",
    color: Colors.primary,
  },
  noEventsContainer: {
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  noEventsText: {
    fontSize: 16,
    fontFamily: "quicksand-semibold",
    color: Colors.grey,
    textAlign: 'center',
  },
  selectedDateItem: {
    backgroundColor: Colors.primary + '20',
  },
  selectedDateText: {
    fontWeight: 'bold',
  },
});

export default DetailedItinerary;
