import React from "react";
import { View, Text, Image, StyleSheet, SafeAreaView, Pressable, ScrollView, Modal, Alert, } from "react-native";
import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import { useState } from "react"; 
import { useLocalSearchParams } from "expo-router";

export default function AddItinerary() {
 
  // Retrieve activity card data passed as params 
  const params = useLocalSearchParams();

  // Get values from activity cards 
  const title = params.title as string;
  const address = params.address as string;
  const contact = params.contact as string; 
  const hours = params.hours as string; 
  const description = params.description as string;
  const tags = params.tags as string; 
  const imagePath = params.image as any; // Images usually loaded as "any" type 

  // Convert tags string back into an array if needed
  const tagsArray = tags ? tags.split(",") : [];

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);

  // Dropdown default state values ** placeholder ** 

  // Itinerary selection default state
  const [selectedItinerary, setSelectedItinerary] = useState("--Itinerary Name--");
 
  // Start-end date selection default states
  const [startDate, setStartDate] = useState("MM DD, YYYY");
  const [endDate, setEndDate] = useState("MM DD, YYYY");
  
  // Start-end time selection default states
  const [startTime, setStartTime] = useState("--:-- (MST)");
  const [endTime, setEndTime] = useState("--:-- (MST)");

  // Dropdown options ** placeholder ** 

  // Itinerary options
  const itineraryOptions = ["Calgary Outdoors", "Calgary Food Tour", "Niche Spots", "Business Meet Trip", ];

  // Start-end date options
  const dateOptions = ["March 15, 2025", "March 16, 2025", "March 17, 2025", "March 18, 2025", "March 19, 2025", "March 20, 2025", ];
  
  // Start-end time options 
  const timeOptions = ["8:00 AM (MST)", "9:00 AM (MST)", "10:00 AM (MST)", "11:00 AM (MST)", "12:00 PM (MST)", "1:00 PM (MST)", ]; 

  // Dropdown visibility states
  const [showItineraryDropdown, setShowItineraryDropdown] = useState(false);
  const [showStartDateDropdown, setShowStartDateDropdown] = useState(false);
  const [showEndDateDropdown, setShowEndDateDropdown] = useState(false);
  const [showStartTimeDropdown, setShowStartTimeDropdown] = useState(false);
  const [showEndTimeDropdown, setShowEndTimeDropdown] = useState(false);

  // Handle add item with confirmation alert 
  const handleAddItem = () => {
   
   Alert.alert(
     "Success!",`${title} has been added to: ${selectedItinerary}.`,
     [{ text: "Ok", onPress: () => setModalVisible(false) }]
   );
 };

  return (
    
    <SafeAreaView style={styles.safeContainer}>
     
     {/* Itinerary Activity Image */}
     <Image 
       source={imagePath} 
       style={styles.activityImage} 
     />

     {/* Itinerary Activity Info Section */}
     <View style={styles.activityContainer}>
       <Text style={styles.activityTitle}>{title}</Text>
       <Text style={styles.activityDetails}><FontAwesome name="map-pin" size={14} color={Colors.coral}></FontAwesome>{" "}{address}</Text>
       <Text style={styles.activityDetails}><FontAwesome name="calendar-check-o" size={14} color={Colors.coral}></FontAwesome>{" "}{hours}</Text>
       <Text style={styles.activityDetails}><FontAwesome name="phone" size={14} color={Colors.coral}></FontAwesome>{" "}{contact}</Text>

       {/* Wrap description and tags into ScrollView? If for expansion of section, ex. adding reviews */}
       
       <Text style={styles.activityDescription}>{description}</Text>
     </View>

     {/* Tags Section */}
     <View style={styles.tagsContainer}>
       <Text style={styles.tagsTitle}>Tags</Text>
     </View>

     {/* Horizontal Scroll for tags */}
     <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
       <View style={styles.tagsScrollContainer}>
         {/* Pass in each tag in the tags array to display */}
         {tagsArray.map((tag, index) => (
           <View key={index} style={styles.tagArea}>
             <Text style={styles.tagTitle}>{tag}</Text>
           </View>
         ))}
       </View>
     </ScrollView>

     {/* Select Date Button */}
     <Pressable style={styles.selectDateButton} onPress={() => setModalVisible(true)}>
       <Text style={styles.selectDateButtonText}>Select Date</Text>
     </Pressable>
     
     {/* Date Selection Popup */}
     <Modal
      // Modal component for select date popup features: https://reactnative.dev/docs/modal
       animationType="fade"
       transparent={true}
       visible={modalVisible}
       onRequestClose={() => setModalVisible(false)}
     >
       <View style={styles.modalOverlay}>
         <View style={styles.modalView}>
           <Text style={styles.modalTitle}>Add To Itinerary</Text>
           
           {/* Select Itinerary Dropdown */}
           <View style={styles.inputContainer}>
             <Text style={styles.inputLabel}>Select Itinerary</Text>
             <Pressable 
               style={styles.selectFieldContainer}
               onPress={() => setShowItineraryDropdown(!showItineraryDropdown)}>
               <Text style={styles.selectText}>{selectedItinerary}</Text>
               <FontAwesome name="chevron-down" size={14} color={Colors.peachySalmon} position={"absolute"} left={300} />
             </Pressable>
             
             {showItineraryDropdown && (
               <View style={styles.dropdownMenu}>
                 <ScrollView nestedScrollEnabled={true}>
                   {itineraryOptions.map((option, index) => (
                     <Pressable 
                       key={index} 
                       style={styles.dropdownOption} 
                       onPress={() => {
                         setSelectedItinerary(option);
                         setShowItineraryDropdown(false);
                       }}
                     >
                       <Text style={styles.dropdownOptionText}>{option}</Text>
                     </Pressable>
                   ))}
                 </ScrollView>
               </View>
             )}
           </View>
           
           {/* Date Selection Dropdown */}
           <View style={styles.dateContainer}>
             <View style={styles.dateInputContainer}>
               <Text style={styles.inputLabel}>Start Date</Text>
               <Pressable 
                 style={styles.selectFieldContainer}
                 onPress={() => setShowStartDateDropdown(!showStartDateDropdown)}
               >
                 <Text style={styles.selectText}>{startDate}</Text>
                 <FontAwesome name="chevron-down" style={styles.dropdownIcon} />
               </Pressable>
               
               {showStartDateDropdown && (
                 <View style={styles.dropdownMenu}>
                   <ScrollView nestedScrollEnabled={true}>
                     {dateOptions.map((option, index) => (
                       <Pressable 
                         key={index} 
                         style={styles.dropdownOption} 
                         onPress={() => {
                           setStartDate(option);
                           setShowStartDateDropdown(false);
                         }}
                       >
                         <Text style={styles.dropdownOptionText}>{option}</Text>
                       </Pressable>
                     ))}
                   </ScrollView>
                 </View>
               )}
             </View>
             
             <View style={styles.dateInputContainer}>
               <Text style={styles.inputLabel}>End Date</Text>
               <Pressable 
                 style={styles.selectFieldContainer}
                 onPress={() => setShowEndDateDropdown(!showEndDateDropdown)}
               >
                 <Text style={styles.selectText}>{endDate}</Text>
                 <FontAwesome name="chevron-down" style={styles.dropdownIcon} />
               </Pressable>
               
               {showEndDateDropdown && (
                 <View style={styles.dropdownMenu}>
                   <ScrollView nestedScrollEnabled={true}>
                     {dateOptions.map((option, index) => (
                       <Pressable 
                         key={index} 
                         style={styles.dropdownOption} 
                         onPress={() => {
                           setEndDate(option);
                           setShowEndDateDropdown(false);
                         }}
                       >
                         <Text style={styles.dropdownOptionText}>{option}</Text>
                       </Pressable>
                     ))}
                   </ScrollView>
                 </View>
               )}
             </View>
           </View>
           
           {/* Time Selection Dropdown */}
           <View style={styles.dateContainer}>
             <View style={styles.dateInputContainer}>
               <Text style={styles.inputLabel}>Start Time</Text>
               <Pressable 
                 style={styles.selectFieldContainer}
                 onPress={() => setShowStartTimeDropdown(!showStartTimeDropdown)}
               >
                 <Text style={styles.selectText}>{startTime}</Text>
                 <FontAwesome name="chevron-down" style={styles.dropdownIcon} />
               </Pressable>
               
               {showStartTimeDropdown && (
                 <View style={styles.dropdownMenu}>
                   <ScrollView nestedScrollEnabled={true}>
                     {timeOptions.map((option, index) => (
                       <Pressable 
                         key={index} 
                         style={styles.dropdownOption} 
                         onPress={() => {
                           setStartTime(option);
                           setShowStartTimeDropdown(false);
                         }}
                       >
                         <Text style={styles.dropdownOptionText}>{option}</Text>
                       </Pressable>
                     ))}
                   </ScrollView>
                 </View>
               )}
             </View>
             
             <View style={styles.dateInputContainer}>
               <Text style={styles.inputLabel}>End Time</Text>
               <Pressable 
                 style={styles.selectFieldContainer}
                 onPress={() => setShowEndTimeDropdown(!showEndTimeDropdown)}
               >
                 <Text style={styles.selectText}>{endTime}</Text>
                 <FontAwesome name="chevron-down" style={styles.dropdownIcon} />
               </Pressable>
               
               {showEndTimeDropdown && (
                 <View style={styles.dropdownMenu}>
                   <ScrollView nestedScrollEnabled={true}>
                     {timeOptions.map((option, index) => (
                       <Pressable 
                         key={index} 
                         style={styles.dropdownOption} 
                         onPress={() => {
                           setEndTime(option);
                           setShowEndTimeDropdown(false);
                         }}
                       >
                         <Text style={styles.dropdownOptionText}>{option}</Text>
                       </Pressable>
                     ))}
                   </ScrollView>
                 </View>
               )}
             </View>
           </View>
           
           {/* Buttons section */}
           <View style={styles.buttonsContainer}>
             <Pressable
               style={[styles.modalButtons, styles.cancelButton]}
               onPress={() => setModalVisible(false)}
             >
               <Text style={styles.cancelButtonText}>Cancel</Text>
             </Pressable>
             <Pressable
               style={[styles.modalButtons, styles.addButton]}
               onPress={handleAddItem}
             >
               <Text style={styles.addButtonText}>Add Item</Text>
             </Pressable>
           </View>
         </View>
       </View>
     </Modal>
   </SafeAreaView>
 );
}

const styles = StyleSheet.create({
 safeContainer: {
   flex: 1,
   backgroundColor: Colors.white,
 },
 activityImage: {
   width: "100%",
   height: 260,
   resizeMode: "cover",
 },
 activityContainer: {
   padding: 16,
   gap: 8,
 },
 activityTitle: {
   fontSize: 24,
   fontFamily: "quicksand-bold",
   marginBottom: 5,
 },
 activityDetails: {
   fontSize: 14,
   fontFamily: "quicksand-medium",
   color: "Colors.white,"
 },
 activityDescription: {
   fontSize: 14,
   fontFamily: "quicksand-regular",
   lineHeight: 24,
 },
 tagsContainer: {
   paddingHorizontal: 16,
 },
 tagsTitle: {
   fontSize: 18,
   marginBottom: 20,
   fontFamily: "quicksand-bold",
 },
 tagsScroll: {
   paddingHorizontal: 10,
 },
 tagsScrollContainer: {
   flexDirection: "row",
   alignItems: "flex-start",
   gap: 8,
 },
 tagArea: {
   borderWidth: 1,
   borderColor: Colors.coral,
   borderRadius: 15,
   backgroundColor: Colors.palePink,
   paddingHorizontal: 10,
   paddingVertical: 5,
   marginRight: 5,
 },
 tagTitle: {
   color: Colors.coral,
   fontSize: 14,
   fontFamily: "quicksand-bold",
 },
 selectDateButton: {
   alignItems: "center",
   marginVertical: 30,
   backgroundColor: Colors.coral,
   borderRadius: 10,
   padding: 10,
   marginHorizontal: 20,
 },
 selectDateButtonText: {
   color: Colors.white,
   fontSize: 16,
   fontFamily: "quicksand-bold",
 },
 modalOverlay: {
   flex: 1,
   justifyContent: "center",
   alignItems: "center",
   backgroundColor: "rgba(52, 52, 52, 0.8)", // Background will blur when modal is open 
 },
 modalView: {
   width: "90%",
   backgroundColor: Colors.white,
   borderRadius: 20,
   borderWidth: 3,      
   borderColor: Colors.peachySalmon, 
   padding: 20,
   elevation: 5,
 },
 modalTitle: {
   fontSize: 24,
   fontFamily: "quicksand-bold",
   textAlign: "center",
   marginBottom: 20,
 },
 inputContainer: {
   marginBottom: 15,
   position: "relative",
 },
 inputLabel: {
   fontSize: 16,
   fontFamily: "quicksand-semibold",
   marginBottom: 5,
 },
 selectFieldContainer: {
   borderWidth: 1,
   borderColor: Colors.grey,
   borderRadius: 10,
   paddingHorizontal: 10,
   paddingVertical: 12,
   justifyContent: "center",
 },
 dropdownIcon: {
    left: 130,
    position: "absolute",
    color: Colors.peachySalmon,
 },
 selectText: {
   fontSize: 16,
   fontFamily: "quicksand-medium",
 },
 dateContainer: {
   flexDirection: "row",
   justifyContent: "space-between",
   marginBottom: 15,
 },
 dateInputContainer: {
   width: "48%",
   position: "relative",
 },
 dateInput: {
   borderWidth: 1,
   borderColor: Colors.grey,
   borderRadius: 10,
   paddingHorizontal: 10,
   paddingVertical: 12,
   justifyContent: "center",
 },
 dropdownMenu: {
   position: "absolute",
   top: "100%",
   left: 0,
   right: 0,
   backgroundColor: Colors.white,
   borderWidth: 1,
   borderColor: Colors.grey,
   borderRadius: 10,
   maxHeight: 150,
   zIndex: 10,
   marginTop: 2,
 },
 dropdownOption: {
   padding: 10,
 },
 dropdownOptionText: {
   fontSize: 16,
   fontFamily: "quicksand-medium",
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
 addButton: {
   backgroundColor: Colors.coral,
 },
 cancelButtonText: {
   color: Colors.white,
   fontFamily: "quicksand-bold",
   fontSize: 14,
 },
 addButtonText: {
   color: Colors.white,
   fontFamily: "quicksand-bold",
   fontSize: 14,
 }
});