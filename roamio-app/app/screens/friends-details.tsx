import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUser } from "@/contexts/UserContext";


import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  FontAwesome,
  Entypo,
  MaterialCommunityIcons,
  Feather,
  Ionicons,
} from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';


interface RouteParams {
  name: string;
  phone: string;
  first_name:string;
  email_friend: string;
  avatar: any;
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


const DetailScreen = () => {
  const route = useRoute();
  const { name, phone, avatar, email_friend,first_name } = route.params as RouteParams;
  const { user } = useUser();
  const navigation = useNavigation();
  const [sent, setSent] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState<any | null>(null);
  const [accessType, setAccessType] = useState<'trip-mate' | 'viewer'>('viewer');
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [trips, setTrips] = useState<Itinerary[]>([]);


  const SERVER_IP = 'http://10.0.2.2:3000';
  const currentUserEmail = user.email;


const [favorited, setFavorited] = useState(false); // NEW

// NEW: Toggle favorite and sync with backend
const handleToggleFavorite = async () => {
  try {
    const res = await fetch(`${SERVER_IP}/favorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_email: currentUserEmail,
        friend_email: email_friend,
        favorited: !favorited,
      }),
    });

    if (res.ok) {
      setFavorited(!favorited);
    } else {
      Alert.alert('Oops!', 'Could not update favorite status.');
    }
  } catch (error) {
    console.error('Favorite toggle error:', error);
    Alert.alert('Error', 'Something went wrong.');
  }
};

interface Itinerary {
  itinerary_id: string;
  user_email: string;
  trip_title: string;
  trip_description: string;
  start_date: string; // Expected to be in a parsable date format (e.g., "MM/DD/YYYY")
  end_date: string;   // Expected to be in a parsable date format (e.g., "MM/DD/YYYY")
  shared_with?: string;   // This should be a JSON string representing an array of shared friend objects
}

useEffect(() => {
  const fetchItineraries = async () => {
    try {
      const res = await fetch(
        `${SERVER_IP}/itineraries?email=${encodeURIComponent(currentUserEmail)}`
      );
      const data = await res.json();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Map data to your Itinerary interface and filter out past trips.
      const formattedItineraries = (data.itineraries || []).map((trip: any) => ({
        ...trip,
        // We leave dates as strings for now, but you could also convert them.
      }));

      const filteredItineraries = formattedItineraries.filter((trip: Itinerary) => {
        const endDate = new Date(trip.end_date);
        return endDate >= today;
      });

      setItineraries(filteredItineraries);
    } catch (err) {
      console.error("Error fetching itineraries:", err);
    }
  };

  fetchItineraries();
}, [currentUserEmail]);




  // Add this just below your existing useEffect(() => { fetchItineraries(); })
useEffect(() => {
  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${SERVER_IP}/friends?email=${encodeURIComponent(currentUserEmail)}`);
      const data = await res.json();
      const friend = data.find((f: any) => f.email === email_friend);
      if (friend) {
        setFavorited(!!friend.favorite);
      }
    } catch (error) {
      console.error('Error fetching favorite status:', error);
    }
  };

  fetchFavorites();
}, [currentUserEmail, email_friend]);



  const handleUnfriend = async () => {
    try {
      const res = await fetch(`${SERVER_IP}/unfriend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: currentUserEmail,
          friend_email: email_friend,
        }),
      });


      if (res.ok) {
        Alert.alert('Unfriended!', `${name} has been removed from your friends list.`);
        navigation.goBack();
      } else {
        Alert.alert('Oops!', 'Could not unfriend. Try again.');
      }
    } catch (error) {
      console.error('Unfriend error:', error);
      Alert.alert('Error', 'Something went wrong while unfriending.');
    }
  };


  const handleSend = async () => {
    if (!selectedItinerary) return alert("Please select an itinerary.");
  
    try {
      const res = await fetch(`${SERVER_IP}/shareItinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itinerary_id: selectedItinerary.itinerary_id, 
          friend_email: email_friend,
          access_type: accessType,
          friend_name: first_name,
          owner_name:user.first_name,
        }),
      });
  
      if (res.ok) {
        Alert.alert("Shared!", "Itinerary successfully shared.");
        setSent(true);
      } else {
        Alert.alert("Error", "Failed to share itinerary.");
      }
    } catch (error) {
      console.error("Share itinerary error:", error);
      Alert.alert("Error", "Something went wrong.");
    }
  
    setModalVisible(false);
  };
  
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../../assets/images/friend-illustrations.jpg')}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.nameRow}>
        <Text style={styles.title}>{name}</Text>
        <TouchableOpacity onPress={handleToggleFavorite}>
  {favorited ? (
    <FontAwesome name="star" size={25} color="#FFD700" style={{ marginLeft: 20, marginBottom: 15 }} />
  ) : (
    <Feather name="star" size={25} color="#999" style={{ marginLeft: 20, marginBottom: 15 }} />
  )}
</TouchableOpacity>
      </View>


      <TouchableOpacity
        style={styles.unfriendButton}
        onPress={handleUnfriend}
      >
        <Text style={styles.unfriendText}>Unfriend</Text>
      </TouchableOpacity>


      <View style={styles.infoList}>
        <InfoItem icon={<Entypo name="phone" size={20} />} text={phone} />
        <InfoItem icon={<Feather name="mail" size={20} />} text={email_friend} />
        <InfoItem icon={<FontAwesome name="plane" size={20} />} text="Travel Enthusiast" />
        <InfoItem icon={<Ionicons name="heart" size={20} />} text="Loves to explore" />
        <InfoItem icon={<Feather name="camera" size={20} />} text="Captures moments" />
        <InfoItem icon={<MaterialCommunityIcons name="account-circle" size={20} />} text="Social Butterfly" />
      </View>


      <View style={styles.sendCard}>
        <Image source={avatar} style={styles.avatar} />
        <View style={styles.musicInfo}>
          <Text style={styles.musicTitle}>Share Itinerary</Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          {sent ? (
            <Ionicons name="checkmark" size={24} style={styles.sendIcon} />
          ) : (
            <Ionicons name="send" size={24} color="black" style={styles.sendIcon} />
          )}
        </TouchableOpacity>
      </View>


      {modalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Share Itinerary</Text>

            {itineraries.map((itinerary) => (
                <TouchableOpacity
                  key={itinerary.itinerary_id}
                  onPress={() => setSelectedItinerary(itinerary)}
                  style={[
                    styles.itineraryOption,
                    selectedItinerary?.itinerary_id === itinerary.itinerary_id && styles.itinerarySelected,
                  ]}
                >
                  <Text style={styles.itineraryText}>{itinerary.trip_title}</Text>
                </TouchableOpacity>
              ))}



            <View style={styles.accessButtons}>
              <TouchableOpacity
                onPress={() => setAccessType('viewer')}
                style={[
                  styles.accessButton,
                  accessType === 'viewer' && styles.viewerSelected,
                ]}
              >
                <Text style={styles.accessText}>Viewer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAccessType('trip-mate')}
                style={[
                  styles.accessButton,
                  accessType === 'trip-mate' && styles.tripMateSelected,
                ]}
              >
                <Text style={styles.accessText}>Trip-mate</Text>
              </TouchableOpacity>
            </View>


            <TouchableOpacity style={styles.shareButton} onPress={handleSend}>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>


            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 10 }}>
              <Text style={{ textAlign: 'center', color: '#6b7280', fontFamily: 'Quicksand-SemiBold' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fffff' },
  image: { width: '100%', height: 200, borderRadius: 16, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, fontFamily: 'Quicksand-Bold' },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  infoList: { marginBottom: 32 },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoText: { marginLeft: 10, fontSize: 16, fontFamily: 'Quicksand-Regular' },
  sendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0f0',
    borderRadius: 12,
    padding: 12,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  musicInfo: { flex: 1 },
  musicTitle: { fontWeight: 'bold', fontSize: 18, fontFamily: 'Quicksand-Bold' },
  itineraryText: { fontFamily: 'Quicksand-Regular', fontSize: 14 },
  unfriendButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#ffe5e5',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  unfriendText: {
    color: '#d9534f',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Quicksand-SemiBold',
  },
  sendIcon: { marginHorizontal: 10 },
  modalOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Quicksand-Bold',
  },
  itineraryOption: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginBottom: 8,
  },
  itinerarySelected: { backgroundColor: Colors.palePink },
  accessButtons: { flexDirection: 'row', marginVertical: 10 },
  accessButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  viewerSelected: { backgroundColor: Colors.palePink },
  tripMateSelected: { backgroundColor: Colors.palePink },
  accessText: { textAlign: 'center', fontFamily: 'Quicksand-SemiBold' },
  shareButton: {
    backgroundColor: Colors.coral,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  shareButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'Quicksand-Bold',
  },
});


export default DetailScreen;
