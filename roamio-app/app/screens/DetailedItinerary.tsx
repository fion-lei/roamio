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
} from "react-native";
import { Colors } from "@/constants/Colors";
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

  const [isEditMode, setIsEditMode] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [itineraryItems, setItineraryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        <Text style={styles.durationText}>
          {`${formatTimeToAMPM(item.time)} - ${formatTimeToAMPM(
            calculateEndTime(item.time, item.duration)
          )}`}
        </Text>
      </View>
      {isEditMode ? (
        <Pressable
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              "Confirm Removal",
              `Are you sure you want to remove ${item.activity} from your itinerary?`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Remove",
                  onPress: async () => {
                    try {
                      setLoading(true);
                      const response = await fetch(
                        `http://10.0.2.2:3000/events/${item.eventId}`,
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
                          (event) => event.eventId !== item.eventId
                        )
                      );
                      Alert.alert(
                        "Success",
                        `${item.activity} has been removed from your itinerary.`
                      );
                    } catch (error) {
                      console.error("Error deleting event:", error);
                      Alert.alert(
                        "Error",
                        `Failed to remove ${item.activity}. Please try again.`
                      );
                    } finally {
                      setLoading(false);
                    }
                  },
                },
              ]
            );
          }}
        >
          <View style={styles.iconContainer}>
            <FontAwesome name="minus" size={16} color={Colors.primary} />
          </View>
        </Pressable>
      ) : (
        <View style={styles.dotsContainer}>
          <FontAwesome name="ellipsis-h" size={20} color={Colors.grey} />
        </View>
      )}
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
        {/* <Entypo name="location-pin" size={18} color={Colors.primary} /> */}
        <Text style={styles.itineraryTitle}>{itineraryTitle}</Text>

        <Pressable onPress={() => setIsEditMode(!isEditMode)}>
          <Text style={styles.editButtonText}>
            {isEditMode ? "Done" : "Edit"}
          </Text>
        </Pressable>
      </View>
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
                          tags: item.tags
                            ? Array.isArray(item.tags)
                              ? item.tags.join(",")
                              : item.tags
                            : "",
                        },
                      });
                    }
                  }}
                  disabled={isEditMode}
                >
                  {renderEventContent(item)}
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
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary + "20",
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
    paddingVertical: 5,
  },
  monthYearText: {
    fontSize: 18,
    fontFamily: "quicksand-semibold",
    color: Colors.primary,
  },
  weeklyCalendarContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary + "20",
  },
  calendarDateItem: {
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: Colors.palePink,
    alignItems: "center",
  },
  selectedCalendarDateItem: {
    backgroundColor: Colors.primary,
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
    backgroundColor: Colors.primary + "10",
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  timeHeaderCell: {
    width: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  eventHeaderCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary + "20",
    paddingLeft: 5,
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
    backgroundColor: Colors.palePink,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    shadowColor: Colors.grey,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
});

export default DetailedItinerary;
