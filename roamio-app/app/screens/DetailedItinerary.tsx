import React, { useLayoutEffect, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  ActivityIndicator,
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

  // event content
  const renderEventContent = (item: any, index: number) => (
    <View style={styles.eventContent}>
      <View style={styles.eventTextContainer}>
        <Text style={styles.activityText}>{item.activity}</Text>
        <Text style={styles.durationText}>
          {`${formatTimeToAMPM(item.time)} (${item.duration}h)`}
        </Text>
      </View>
      {/* If in edit mode, show delete button */}
      {isEditMode && (
        <Pressable
          style={styles.deleteButton}
          onPress={() => {
            /* delete functionality here */
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

  // Function to fetch events for the current itinerary
  const fetchItineraryItems = async (date = selectedDate) => {
    try {
      setLoading(true);
      const response = await fetch(`http://10.0.2.2:3000/events/${itineraryId}?date=${encodeURIComponent(date)}`);

      if (response.ok) {
        const data = await response.json();

        if (data.events && data.events.length > 0) {
          // Format the events for the timeline display
          const formattedEvents = data.events.map((event: any) => {
            // Extract time from start_time
            const timeMatch = event.start_time ? event.start_time.match(/(\d+):(\d+)/) : null;
            let time = "00:00";
            if (timeMatch && timeMatch.length >= 3) {
              time = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2].padStart(2, '0')}`;
            }

            // Calculate duration - if end_time exists, calculate difference
            // Otherwise default to 1 hour
            let duration = 1;
            if (event.end_time && event.start_time) {
              const startTimeMatch = event.start_time.match(/(\d+):(\d+)/);
              const endTimeMatch = event.end_time.match(/(\d+):(\d+)/);

              if (startTimeMatch && endTimeMatch) {
                const startHours = parseInt(startTimeMatch[1]);
                const startMinutes = parseInt(startTimeMatch[2]);
                const endHours = parseInt(endTimeMatch[1]);
                const endMinutes = parseInt(endTimeMatch[2]);

                // Calculate duration in hours
                duration = (endHours - startHours) + (endMinutes - startMinutes) / 60;
                // If duration is negative (like overnight), add 24 hours
                if (duration <= 0) {
                  duration += 24;
                }
              }
            }

            return {
              time,
              duration,
              activity: event.title,
              description: event.description,
              address: event.address,
              contact: event.contact,
              hours: event.hours,
              price: event.price,
              rating: event.rating,
              ratingCount: event.rating_count,
              imagePath: event.image_path,
              eventId: event.event_id,
              tags: event.tags
            };
          });

          setItineraryItems(formattedEvents);
        } else {
          setItineraryItems([]);
        }
      } else {
        console.error('Failed to fetch events');
        setItineraryItems([]);
      }
    } catch (error) {
      console.error('Error fetching itinerary items:', error);
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
    <ScrollView style={styles.container}>
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
  );
};

const styles = StyleSheet.create({
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
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    backgroundColor: Colors.white,
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
