

// import { Text, View } from "react-native";
// import StackNavigator from "@/app/navigation/StackNavigator";

// // Entry point in app

// export default function Index() {
//   return <StackNavigator />;
// }


/* ===============================================================
this is added just so detailed itinerary is the default screen for testing in
the detailed-itinerary branch.
=============================================================== */
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/screens/DetailedItinerary" />;
} 

