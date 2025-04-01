import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import {
    FontAwesome,
    Entypo,
    MaterialCommunityIcons,
    Ionicons,
} from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';


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
}

const InfoItem = ({ icon, text }: InfoItemProps) => (
    <View style={styles.infoItem}>
        {icon}
        <Text style={styles.infoText}>{text}</Text>
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

const EventDetails = () => {
    const route = useRoute();
    const navigation = useNavigation();

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


    useEffect(() => {
        navigation.setOptions({
            headerTitle: '',
        });
    }, [navigation]);

    const handleShare = () => {
        // do something when share button is pressed
    };

    // Format duration to include one decimal place if it's not a whole number
    const formattedDuration = Number.isInteger(duration) ? 
        `${duration} hour${duration !== 1 ? 's' : ''}` : 
        `${duration} hour${duration !== 1 ? 's' : ''}`;

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
                    text={formatTimeToAMPM(time)}
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
});

export default EventDetails;
