import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Pressable,
    TouchableWithoutFeedback,
    Alert,
    Share,
} from 'react-native';
import {
    FontAwesome,
    Entypo,
    MaterialCommunityIcons,
    Ionicons,
} from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';

interface RouteParams {
    activity: string;
    time: string;
    duration: number;
    description?: string;
    address?: string;
    contact?: string;
    hours?: string;
    price?: string;
    rating?: string;
    ratingCount?: string;
    image?: string;
    eventId?: string;
    tags?: string;
    isMultiDay?: boolean;
    date?: string;
}

interface InfoItemProps {
    icon: React.ReactNode;
    text: string;
    showEditButton?: boolean;
    onEditPress?: () => void;
}

const InfoItem = ({ icon, text, showEditButton, onEditPress }: InfoItemProps) => (
    <View style={styles.infoItem}>
        {icon}
        <Text style={styles.infoText}>{text}</Text>
        {showEditButton && (
            <TouchableOpacity onPress={onEditPress} style={styles.editButton}>
                <FontAwesome name="pencil" size={16} color={Colors.coral} />
            </TouchableOpacity>
        )}
    </View>
);

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

// Function to calculate end time from start time and duration
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

// TimeSelector component
interface TimeSelectorProps {
    label: string;
    time: Date | null;
    showPicker: boolean;
    onPress: () => void;
    onTimeChange: (event: any, selectedDate?: Date) => void;
    formatTime: (date: Date | null) => string;
}

const TimeSelector = ({ label, time, showPicker, onPress, onTimeChange, formatTime }: TimeSelectorProps) => (
    <View style={styles.timeInputContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        <Pressable 
            style={styles.selectFieldContainer}
            onPress={onPress}
        >
            <Text style={styles.selectText}>
                {formatTime(time)}
            </Text>
            <FontAwesome name="clock-o" size={14} style={styles.timeIcon} />
        </Pressable>
        
        {showPicker && (
            <View style={styles.pickerContainer}>
                <DateTimePicker
                    value={time || new Date()}
                    mode="time"
                    display="spinner"
                    onChange={onTimeChange}
                />
            </View>
        )}
    </View>
);

const EventDetails = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const router = useRouter();
    // Get all parameters from the route
    const { 
        activity,
        time, 
        duration, 
        description, 
        address, 
        contact, 
        hours, 
        price, 
        rating, 
        ratingCount,
        image,
        eventId,
        tags,
        isMultiDay,
        date
    } = route.params as RouteParams; 

    // for editing time of event
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    
    // state variables to track display times
    const [displayStartTime, setDisplayStartTime] = useState(time);
    const [displayEndTime, setDisplayEndTime] = useState(calculateEndTime(time, duration));
    const [displayDuration, setDisplayDuration] = useState(duration);

    // initialize time values based on the current time and duration
    useEffect(() => {
        if (time) {
            const [hours, minutes] = time.split(':').map(Number);
            const startDate = new Date();
            startDate.setHours(hours, minutes, 0, 0);
            setStartTime(startDate);
            
            const endDate = new Date(startDate);
            endDate.setTime(startDate.getTime() + duration * 60 * 60 * 1000);
            setEndTime(endDate);
        }
    }, [time, duration]);

    useEffect(() => {
        navigation.setOptions({
            headerTitle: '',
        });
    }, [navigation]);

    const handleShare = async () => {
        try {
            const shareMessage = `Check out this event: ${activity}`;
            
            // build the details string with available information
            let details = `Time: ${formatTimeToAMPM(displayStartTime)} - ${formatTimeToAMPM(displayEndTime)}`;
            
            // Add address
            if (address) {
                details += `\nLocation: ${address}`;
            }
            
            // Add description
            const descriptionText = description ? `\n\n${description}` : '';
            
            const shareDetails = {
                message: `${shareMessage}\n\n${details}${descriptionText}`,
                title: activity,
            };
            
            const result = await Share.share(shareDetails);
            
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                    console.log(`Shared via ${result.activityType}`);
                } 
            }
        } catch (error) {
            console.error('Error sharing:', error);
            Alert.alert('Error', 'Could not share this event');
        }
    };

    // Format time function for the modal
    const formatTime = (date: Date | null) => {
        if (!date) return "--:-- AM";
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    };

    // Update the handleEditTime function to show the modal
    const handleEditTime = () => {
        setIsModalVisible(true);
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
                    setStartTime(selectedDate); 
                    setShowStartTimePicker(false); 
                    break;
                case "endTime": 
                    setEndTime(selectedDate); 
                    setShowEndTimePicker(false); 
                    break;
            }
        }
    };

    // Function to save the time changes
    const handleSaveTime = async () => {
        if (!startTime || !endTime) {
            Alert.alert("Error", "Please select both start and end times");
            return;
        }

        if (endTime <= startTime) {
            Alert.alert("Please try again", "End time must be after start time");
            return;
        }

        // Format the times for the API in AM/PM format
        const formatTimeForAPI = (date: Date) => {
            return date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            });
        };

        // Format the times for display (12-hour format)
        const newStartTime = formatTimeForAPI(startTime);
        const newEndTime = formatTimeForAPI(endTime);

        // Calculate the new duration in hours
        const startMs = startTime.getTime();
        const endMs = endTime.getTime();
        const durationHours = (endMs - startMs) / (1000 * 60 * 60);

        try {
            setIsModalVisible(false);
            
            // Check if eventId exists
            if (!eventId) {
                Alert.alert("Error", "Event ID not found");
                return;
            }

            // Create the update payload
            const updateData = {
                start_time: newStartTime,
                end_time: newEndTime
            };

            // Call the API to update the event
            const response = await fetch(`http://10.0.2.2:3000/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update event time');
            }

            // Convert time objects to format that component can use
            const formatTimesForComponent = (date: Date) => {
                const hours = date.getHours();
                const minutes = date.getMinutes();
                return `${hours}:${minutes.toString().padStart(2, '0')}`;
            };
            
            // Update display times
            setDisplayStartTime(formatTimesForComponent(startTime));
            setDisplayEndTime(formatTimesForComponent(endTime));
            setDisplayDuration(durationHours);

            // Show success message
            Alert.alert(
                "Success", 
                "Event time has been updated.",
            );
            router.back();
        } catch (error) {
            console.error('Error updating event time:', error);
            Alert.alert("Error", "Failed to update event time.");
        }
    };

    // Format duration to include one decimal place if it's not a whole number
    const formattedDuration = Number.isInteger(displayDuration) ? 
        `${displayDuration} hour(s)` : 
        `${displayDuration} hour(s)`;

    // Handle image source (very basic, doesn't take into account if other activities are added)
    const getImageSource = () => {
        // Simple mapping of activities to images
        if (activity === "Elgin Hill") {
            return require('../../assets/images/camp.png');
        } else if (activity === "OEB Breakfast Co.") {
            return require('../../assets/images/food.png');
        }
        
        // Default fallback image
        return require('../../assets/images/logo_coral.png');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* image at the top */}
            <Image
                source={getImageSource()}
                style={styles.image}
                resizeMode="cover"
            />

            {/* event name */}
            <Text style={styles.title}>{activity}</Text>

            {/* info */}
            <View style={styles.infoList}>
                <InfoItem
                    icon={<FontAwesome name="clock-o" size={20} color={Colors.coral} />}
                    text={`${formatTimeToAMPM(displayStartTime)} - ${formatTimeToAMPM(displayEndTime)}`}
                    showEditButton={true}
                    onEditPress={handleEditTime}
                />
                <InfoItem
                    icon={<MaterialCommunityIcons name="timer-outline" size={20} color={Colors.coral} />}
                    text={formattedDuration}
                />
                {address && (
                    <InfoItem
                        icon={<Entypo name="location-pin" size={20} color={Colors.coral} />}
                        text={address}
                    />
                )}
                {date && (
                    <InfoItem
                        icon={<FontAwesome name="calendar" size={20} color={Colors.coral} />}
                        text={date}
                    />
                )}
            </View>


            {description && (
                <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionHeader}>About</Text>
                    <Text style={styles.descriptionText}>
                        {description}
                    </Text>
                </View>
            )}

            <View style={styles.shareCard}>
                <View style={styles.avatarContainer}>
                    <FontAwesome name="calendar-check-o" size={24} color={Colors.coral} style={styles.avatar} />
                </View>
                <View style={styles.shareInfo}>
                    <Text style={styles.shareTitle}>Share Event</Text>
                </View>
                <TouchableOpacity onPress={handleShare}>
                    <Ionicons name="share-outline" size={24} color={Colors.coral} style={styles.shareIcon} />
                </TouchableOpacity>
            </View>

            {/* Time Editing Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                            <View style={styles.modalView}>
                                <Text style={styles.modalTitle}>Edit Time</Text>
                                
                                {/* Time Selection Section */}
                                <View style={styles.timeContainer}>
                                    <TimeSelector 
                                        label="Start Time"
                                        time={startTime}
                                        showPicker={showStartTimePicker}
                                        onPress={() => setShowStartTimePicker(true)}
                                        onTimeChange={(event, date) => handleTimeChange(event, date, "startTime")}
                                        formatTime={formatTime}
                                    />
                                    
                                    <TimeSelector 
                                        label="End Time"
                                        time={endTime}
                                        showPicker={showEndTimePicker}
                                        onPress={() => setShowEndTimePicker(true)}
                                        onTimeChange={(event, date) => handleTimeChange(event, date, "endTime")}
                                        formatTime={formatTime}
                                    />
                                </View>
                                
                                {/* Buttons section */}
                                <View style={styles.buttonsContainer}>
                                    <Pressable
                                        style={[styles.modalButtons, styles.cancelButton]}
                                        onPress={() => setIsModalVisible(false)}
                                    >
                                        <Text style={styles.modalButtonsText}>Cancel</Text>
                                    </Pressable>
                                    <Pressable
                                        style={[styles.modalButtons, styles.saveButton]}
                                        onPress={handleSaveTime}
                                    >
                                        <Text style={styles.modalButtonsText}>Save</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: Colors.white,
        paddingTop: 40,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        marginBottom: 24,
        fontFamily: 'quicksand-bold',
        color: Colors.primary,
    },
    infoList: {
        marginBottom: 30,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        marginLeft: 10,
        fontSize: 18,
        fontFamily: 'quicksand-semibold',
        color: Colors.primary,
        flex: 1,
    },
    editButton: {
        marginRight: 160,
    },
    descriptionContainer: {
        marginTop: 20,
        marginBottom: 30,
    },
    descriptionHeader: {
        fontSize: 22,
        fontFamily: 'quicksand-bold',
        color: Colors.primary,
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 18,
        fontFamily: 'quicksand-regular',
        color: Colors.primary,
    },
    shareCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.palePink,
        borderRadius: 12,
        padding: 12,
        marginTop: 30,
        marginBottom: 40,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatar: {
        alignSelf: 'center',
    },
    shareInfo: {
        flex: 1,
    },
    shareTitle: {
        fontSize: 18,
        fontFamily: 'quicksand-bold',
        color: Colors.coral,
    },
    shareIcon: {
        marginHorizontal: 10,
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
        borderColor: Colors.coral, 
        padding: 20,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 24,
        fontFamily: "quicksand-bold",
        textAlign: "center",
        marginBottom: 20,
        color: Colors.primary,
    },
    timeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
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
        top: 12,
        color: Colors.coral,
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
        width: "100%",
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
    saveButton: {
        backgroundColor: Colors.coral,
    },
    modalButtonsText: {
        color: Colors.white,
        fontFamily: "quicksand-bold",
        fontSize: 14,
    },
});

export default EventDetails;
