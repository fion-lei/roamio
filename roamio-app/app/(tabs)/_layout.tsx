import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Discover from "./Discover";
import Itinerary from "./Itinerary";
import Friends from "./Friends";
import { FontAwesome } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { 
          backgroundColor: Colors.palePink, 
          height: 65, 
          position: "absolute",
          marginHorizontal: 10, 
          marginBottom: 15, 
          borderRadius: 15, 
          shadowColor: "grey", 
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 3, 
          paddingTop: 5,
          paddingBottom: 5, 
        },
        tabBarActiveTintColor: Colors.coral,
        tabBarLabelStyle: {
          fontFamily: "quicksand-bold",
          fontSize: 14,
        },
        tabBarAllowFontScaling: true,
        headerShown: false,
        
      }}
    >
      <Tab.Screen
        name="Discover"
        component={Discover}
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="map" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Itinerary"
        component={Itinerary}
        options={{
          title: "Itinerary",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="calendar" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Friends"
        component={Friends}
        options={{
          title: "Friends",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="users" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
