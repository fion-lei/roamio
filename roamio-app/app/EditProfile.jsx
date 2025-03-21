import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Dropdown } from "react-native-element-dropdown";
import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function EditProfile() {
    const router = useRouter();
    
    // State for profile details
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [bio, setBio] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [travellerType, setTravellerType] = useState("");

    const BIO_CHAR_LIMIT = 200;
    
    const travellerOptions = [
        { label: "Solo Traveler", value: "solo traveler" },
        { label: "Group Traveler", value: "group traveler" },
        { label: "Local Traveler", value: "local traveler" },
        { label: "International Traveler", value: "international traveler" },
        { label: "Business Traveler", value: "business traveler" },
        { label: "Retiree Traveler", value: "retiree traveler" },
    ];
    
    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const storedImage = await AsyncStorage.getItem("profileImage");
                const storedName = await AsyncStorage.getItem("profileName");
                const storedEmail = await AsyncStorage.getItem("profileEmail");
                const storedPhone = await AsyncStorage.getItem("profilePhone");
                const storedBio = await AsyncStorage.getItem("profileBio");
                const storedTravellerType = await AsyncStorage.getItem("profileTravellerType");

                if (storedImage) setProfileImage(storedImage);
                if (storedName) setName(storedName);
                if (storedEmail) setEmail(storedEmail);
                if (storedPhone) setPhone(storedPhone);
                if (storedBio) setBio(storedBio);
                if (storedTravellerType) setTravellerType(storedTravellerType);
            } catch (error) {
                console.log("Error loading profile data: ", error);
            }
        };
        loadProfileData();
    }, []);
    
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        
        if (!result.canceled && result.assets.length > 0) {
            const selectedImageUri = result.assets[0].uri;
            setProfileImage(selectedImageUri);
        }
    };
    
    const saveProfileData = async () => {
        try {
            await AsyncStorage.setItem("profileName", name);
            await AsyncStorage.setItem("profileEmail", email);
            await AsyncStorage.setItem("profilePhone", phone);
            await AsyncStorage.setItem("profileBio", bio);
            await AsyncStorage.setItem("profileTravellerType", travellerType);
            if (profileImage) await AsyncStorage.setItem("profileImage", profileImage);
            
            router.replace("../Profile");
        } catch (error) {
            console.log("Error saving profile data: ", error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.profileHeader}>
                <Text style={styles.editTitle}>Edit Profile</Text>
            </View>

            {/* Profile Image */}
            <Pressable onPress={pickImage} style={styles.profileImageContainer}>
                <Image 
                    source={profileImage ? { uri: profileImage } : require("../assets/images/profilePicture.png")} 
                    style={styles.profileImage} 
                />
                <Text style={styles.changePhotoText}>Change Photo</Text>
            </Pressable>

            {/* Full Name */}
            <View style={styles.inputContainer}>
                <TextInput placeholder="Full Name" value={name} onChangeText={setName} style={styles.input} />
            </View>

            {/* Email Input with Icon */}
            <View style={styles.inputContainer}>
                <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
                <FontAwesome name="envelope" size={20} color={Colors.coral} style={styles.icon} />
            </View>

            {/* Phone Input with Icon */}
            <View style={styles.inputContainer}>
                <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
                <FontAwesome name="phone" size={20} color={Colors.coral} style={styles.icon} />
            </View>

            {/* Bio Input */}
            <View style={styles.bioContainer}>
                <TextInput
                    placeholder="Bio"
                    value={bio}
                    onChangeText={(text) => text.length <= BIO_CHAR_LIMIT && setBio(text)}
                    style={styles.bioInput}
                    multiline
                />
                <Text style={[styles.charCounter, bio.length >= 180 ? styles.charCounterWarning : {}]}>
                    {bio.length}/{BIO_CHAR_LIMIT}
                </Text>
                {bio.length === BIO_CHAR_LIMIT && (
                    <Text style={styles.warningText}>Maximum character limit reached</Text>
                )}
            </View>

            {/* Traveler Type Dropdown */}
            <View style={styles.inputContainer}>
                <Dropdown
                    data={travellerOptions}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Traveller Type"
                    value={travellerType}
                    onChange={(item) => setTravellerType(item.value)}
                    style={styles.dropdown} 
                    dropdownPosition="top"
                    selectedTextStyle={styles.dropdownText}  // Ensures selected text has the correct font
                    itemTextStyle={styles.dropdownText}  // Ensures dropdown options follow the same font
                />

            </View>


            {/* Save Button */}
            <Pressable onPress={saveProfileData} style={styles.saveButton}>
                <Text style={styles.buttonText}>Save Changes</Text>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: 
    { 
        flex: 1, padding: 20, alignItems: "center", backgroundColor: Colors.white 
    },
    profileHeader: 
    { 
        alignItems: "center", marginBottom: 15 
    },
    editTitle: 
    { 
        fontSize: 22, fontFamily: "quicksand-bold", color: Colors.primary 
    },
    profileImageContainer: 
    { 
        alignItems: "center", marginBottom: 15 
    },
    profileImage: 
    { 
        width: 170, height: 170, borderRadius: 200, borderWidth: 3, borderColor: Colors.peachySalmon 
    },
    changePhotoText: 
    { 
        marginTop: 6, color: Colors.coral, fontSize: 14, fontFamily: "quicksand-semibold" 
    },
    inputContainer: 
    { 
        width: "100%", borderWidth: 2, borderColor: Colors.peachySalmon, borderRadius: 8, padding: 6, marginBottom: 10, flexDirection: "row", alignItems: "center" 
    },
    input: 
    { 
        flex: 1, fontSize: 16, color: Colors.black, fontFamily: "quicksand-semibold" 
    },
    icon: 
    { 
        marginLeft: 8 
    },
    bioContainer: 
    { 
        width: "100%", borderWidth: 2, borderColor: Colors.peachySalmon, borderRadius: 8, padding: 8, marginBottom: 10 
    },
    charCounter: 
    {
        textAlign: "right",
        fontSize: 12,
        color: Colors.grey,
    },
    charCounterWarning: 
    { 
        color: "red", fontWeight: "bold" 
    },
    warningText: 
    {
        color: "red",
        fontSize: 14,
        textAlign: "center",
        fontWeight: "bold",
    },
    saveButton: 
    { 
        backgroundColor: Colors.coral, padding: 12, borderRadius: 8, alignItems: "center", width: "80%" 
    },
    buttonText: 
    { 
        color: Colors.white, fontSize: 18, fontFamily: "quicksand-bold" 
    },
    bioInput: 
    {
        fontSize: 16,
        color: Colors.black,
        fontFamily: "quicksand-semibold",
        textAlignVertical: "top",
        paddingVertical: 4,
        paddingBottom: 0,  
    },
    dropdown: 
    {
        width: "100%",  // Ensures it matches other input fields
        borderWidth: 0,  // Removes default dropdown border to avoid double borders
        fontSize: 16,  // Match input text size
        color: Colors.black,
        fontFamily: "quicksand-semibold",
        paddingVertical: 12,  // Keep padding consistent with other inputs
    },
    
});
