
/* ===============================================================
this file is added just so detailed itinerary is the default screen for testing in
the detailed-itinerary branch.
=============================================================== */
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/screens/DetailedItinerary" />;
} 