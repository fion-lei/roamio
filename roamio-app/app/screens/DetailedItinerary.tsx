import React, { useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Pressable } from 'react-native';
import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";

import { useNavigation, useRouter } from 'expo-router';

// for ensuring timeslot sizes/positions are consistent. E.g. each hour chunk = 60px in height
const pixelsForHour = 60;

const DetailedItinerary = () => {

  const navigation = useNavigation();
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // for top nav bar
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <Pressable 
            onPress={() => setShowCalendar(!showCalendar)} 
            style={{ alignItems: 'center' }}
          >
            <FontAwesome
              name="calendar"
              size={24}
              color={Colors.coral}
            />
          </Pressable>
          <Text style={{ color: Colors.coral, marginLeft: 8, fontSize: 20 }}>
            Nov. 3, 2025 {/* placeholder date */}
          </Text>
        </View>
      ),
      headerRight: () => (
        <Pressable onPress={() => setIsEditMode(!isEditMode)}>
          <Text style={{ color: Colors.coral, marginRight: 15, fontSize: 20 }}>
            {isEditMode ? "Done" : "Edit"}
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, isEditMode]);

  // making time slots for 24 hours in AM and PM format
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const ampm = hour >= 12 ? 'PM' : 'AM';

    let displayHour;
    if (hour === 0) {
      displayHour = 12; // 0 = 12am
    } else if (hour > 12) {
      displayHour = hour - 12;  // PM
    } else {
      displayHour = hour;  // AM
    }
    return `${displayHour}:00 ${ampm}`;
  });

  // so that itinerary items will be in AM and PM format
  const formatTimeToAMPM = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';

    let displayHour;
    if (hours === 0) {
      displayHour = 12;
    } else if (hours > 12) {
      displayHour = hours - 12;  
    } else {
      displayHour = hours;
    }
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const itineraryItems = [
    {
      time: '09:00',
      duration: 1, // in hours
      activity: 'Breakfast at Hotel'
    },
    {
      time: '13:00',
      duration: 1.5,
      activity: 'Lunch at Restaurant'
    },
    {
      time: '15:00',
      duration: 2,
      activity: 'Art gallery Visit'
    },
    {
      time: '19:30',
      duration: 1.5,
      activity: 'Dinner at Restaurant'

    },

    {
      // activity going into the next day test
      time: '23:30',
      duration: 1,
      activity: 'test'

    }
  ];

  // for calculating position and height of an event based on time
  const getEventStyle = (time: string, duration: number) => {
    const [hours, minutes] = time.split(':').map(Number);
    const topPosition = (hours + (minutes / 60)) * pixelsForHour;
    const height = duration * pixelsForHour;

    return {
      position: 'absolute' as const,
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
      {isEditMode ? (
        <Pressable 
          style={styles.deleteButton}
          onPress={() => {/* delete functionality here */}}
        >
          <View style={styles.iconContainer}>
            <FontAwesome
              name="minus"
              size={16}
              color={Colors.peachySalmon}
            />
          </View>
        </Pressable>
      ) : (
      
        // If not in edit mode, show dots on events to see the details
        <Pressable 
          style={styles.dotsContainer}
          onPress={() => router.push({
            pathname: "/screens/EventDetails",
            params: { 
              activity: item.activity,
              time: item.time,
              duration: item.duration
            }
          })}
        >
          <View style={styles.dot} />
          <View style={styles.dot} />
        </Pressable>
      )}
    </View>
  );

  return (
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
          {itineraryItems.map((item, index) => (
            <View
              key={index}
              style={[
                styles.eventBubble,
                getEventStyle(item.time, item.duration)
              ]}
            >
              {renderEventContent(item, index)}
            </View>
          ))}
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
    flexDirection: 'row',
    paddingTop: 0,
    height: 24 * pixelsForHour, // shows full 24 hours in the timeline
  },
  timeMarkers: {
    width: 60,
    position: 'absolute',
    left: 0,
  },
  timeSlot: {
    height: pixelsForHour,
    justifyContent: 'center',
    paddingLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey,
  },
  eventsContainer: {
    flex: 1,
    position: 'relative',
  },
  eventBubble: {
    backgroundColor: Colors.white,
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
    fontSize: 12,
    fontFamily: "quicksand-semibold",
    color: Colors.primary,
  },
  activityText: {
    fontSize: 14,
    fontFamily: "quicksand-semibold",
    color: Colors.coral,
  },
  durationText: {
    fontSize: 12,
    fontFamily: "quicksand-semibold",
    color: Colors.grey,
    marginTop: 4,
  },
  eventContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventTextContainer: {
    flex: 1,
  },
  dotsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 5,
    height: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.grey,
    marginVertical: 2,
  },
  deleteButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.peachySalmon,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DetailedItinerary;