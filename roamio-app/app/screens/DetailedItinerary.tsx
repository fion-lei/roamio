import React from 'react';
   import { View, Text, StyleSheet } from 'react-native';

   const DetailedItinerary = () => {
     return (
       <View style={styles.container}>
         <Text>Detailed Itinerary screen is here</Text>
       </View>
     );
   };

   const styles = StyleSheet.create({
     container: {
       flex: 1,
       justifyContent: 'center',
       alignItems: 'center',
     },
   });

   export default DetailedItinerary;