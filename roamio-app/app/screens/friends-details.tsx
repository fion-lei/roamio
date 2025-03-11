import React, {useState} from 'react';
import { useFonts } from 'expo-font';


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
  Feather,
  Ionicons,
} from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';

// Props type for route params
interface RouteParams {
  name: string;
  phone: string;
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
  const { name, phone, avatar } = route.params as RouteParams;
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    setSent(true);
    console.log("Itinerary sent!");
  
    // Optional: reset the icon after 2 seconds
    setTimeout(() => setSent(false), 2000);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top Illustration */}
      <Image
        source={require('../../assets/images/friend-illustrations.jpg')}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Friend Name */}
      <InfoItem
          icon={<Feather name="bookmark" size={20} />}
        />
      <Text 

        style={styles.title}>{name}
      </Text>
      <TouchableOpacity style={styles.unfriendButton} onPress={() => console.log('Unfriended!')}>
  <Text style={styles.unfriendText}>Unfriend</Text>
</TouchableOpacity>


      {/* Info List */}
      <View style={styles.infoList}>
        <InfoItem
          icon={<Entypo name="phone" size={20} />}
          text={phone}
        />
         <InfoItem
          icon={<Feather name="mail" size={20} />}
          text="abc123@gmail.com"
        />
        <InfoItem
          icon={<FontAwesome name="plane" size={20} />}
          text="Travel Enthusiast"
        />
        <InfoItem
          icon={<Ionicons name="heart" size={20} />}
          text="Loves to explore"
        />
        <InfoItem
          icon={<Feather name="camera" size={20} />}
          text="Captures moments"
        />
        <InfoItem
          icon={<MaterialCommunityIcons name="account-circle" size={20} />}
          text="Social Butterfly"
        />
      </View>

      <View style={styles.sendCard}>
        <Image source={avatar} style={styles.avatar} />
        <View style={styles.musicInfo}>
          <Text style={styles.musicTitle}>Share Itinerary</Text>
        </View>
        <TouchableOpacity onPress={handleSend}>
  {sent ? (
    <Ionicons name="checkmark" size={24}  style={styles.sendIcon} />
  ) : (
    <Ionicons name="send" size={24} color="black" style={styles.sendIcon} />
  )}
</TouchableOpacity>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fffff',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'Quicksand-Bold'
  },
  infoList: {
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'Quicksand-Regular'

  },
  sendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0f0',
    borderRadius: 12,
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  musicInfo: {
    flex: 1,
  },
  musicTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'Quicksand-Bold'

  },
  unfriendButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#ffe5e5', // soft pinkish red
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
    color: '#d9534f', // soft red (like Bootstrap danger)
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Quicksand-SemiBold'

  },
  musicLabel: {
    fontSize: 14,
    color: '#555',

  },
  sendIcon: {
    marginHorizontal: 10,
  },
});

export default DetailScreen;
