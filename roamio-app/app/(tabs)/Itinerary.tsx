import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";

interface ItineraryItem {
  id: string;
  title: string;
  date: string;
  description: string;
}

const itineraryData: ItineraryItem[] = 
[
  { id: "1", title: "Arrival & Check-in", date: "March 20, 2025", description: "Check-in at the hotel and explore the surrounding areas." },
  { id: "2", title: "City Tour", date: "March 21, 2025", description: "Guided tour of historical landmarks and local markets of the city." },
  { id: "3", title: "Beach Day", date: "March 22, 2025", description: "Relax at the beach and enjoy water sports." },
  { id: "4", title: "Departure", date: "March 23, 2025", description: "Check-out from the hotel and return home." },
];

const Itinerary = () => 
{
  return (
    
    <View>
      
      <Text>My Itinerary</Text>
      
      <FlatList
        
        data={itineraryData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.title}</Text>
            <Text>{item.date}</Text>
            <Text>{item.description}</Text>

            {/* Button - This feature has not yet been implemented. */}
            <TouchableOpacity>
              <Text>View Details</Text>
            </TouchableOpacity>

          </View>
        )}
      />
    </View>
  );
};

export default Itinerary;
