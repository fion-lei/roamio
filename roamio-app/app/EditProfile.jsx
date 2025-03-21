import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // Import ImagePicker
import { Dropdown } from "react-native-element-dropdown";
import { Colors } from "@/constants/Colors"; // Ensure Colors file exists
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function EditProfile() {
    const router = useRouter();

    // Existing user data
    const [name, setName] = useState("Wendy Wanderer");
    const [email, setEmail] = useState("wendy.wanderer@email.com");
    const [phone, setPhone] = useState("123-456-7890");
    const [bio, setBio] = useState("Hi, I’m Wendy! I’m 28, a digital nomad from Los Angeles. Whether it’s a hidden café or an offbeat hiking trail, I’m all about budget-friendly experiences and soaking in local vibes.");
    const [profileImage, setProfileImage] = useState(null); // For profile picture
    const [travellerType, setTravellerType] = useState("solo");

    const BIO_CHAR_LIMIT = 200; // Bio character limit

    // Traveler options dropdown
    const travellerOptions = [
        { label: "Solo Traveler", value: "solo" },
        { label: "Group Traveler", value: "group" },
        { label: "Local Traveler", value: "local" },
        { label: "International Traveler", value: "international" },
        { label: "Business Traveler", value: "business" },
        { label: "Retiree Traveler", value: "retiree" },
    ];

    // Function to pick image
const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
    }
};


    return (
        <SafeAreaView style={styles.container}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <Text style={styles.editTitle}>Edit Profile</Text>
            </View>

            {/* Profile Picture Section */}
            <Pressable onPress={pickImage} style={styles.profileImageContainer}>
                <Image 
                    source={
                        profileImage ? { uri: profileImage } : require("../assets/images/profilePicture.png")
                    } 
                    style={styles.profileImage} 
                />

                <Text style={styles.changePhotoText}>Change Photo</Text>
            </Pressable>


            {/* Editable Fields */}
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Full Name"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                />
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    keyboardType="email-address"
                />
                <FontAwesome name="envelope" size={20} color={Colors.coral} style={styles.icon} />
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Phone Number"
                    value={phone}
                    onChangeText={setPhone}
                    style={styles.input}
                    keyboardType="phone-pad"
                />
                <FontAwesome name="phone" size={20} color={Colors.coral} style={styles.icon} />
            </View>

            <View style={styles.bioContainer}>
                <TextInput
                    placeholder="Bio"
                    value={bio}
                    onChangeText={(text) => {
                        if (text.length <= BIO_CHAR_LIMIT) {
                            setBio(text);
                        }
                    }}
                    style={styles.bioInput}
                    multiline
                />
                <Text style={[styles.charCounter, bio.length >= 180 ? styles.charCounterWarning : {}]}>
                    {bio.length}/{BIO_CHAR_LIMIT}
                </Text>
                {bio.length === BIO_CHAR_LIMIT && (
                    <Text style={styles.warningText}>You have reached the maximum limit!</Text>
                )}
            </View>


            {/* Traveler Type Dropdown */}
            <View style={styles.pickerContainer}>
                <Dropdown
                    data={travellerOptions}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Traveller Type"
                    value={travellerType}
                    onChange={(item) => setTravellerType(item.value)}
                    style={styles.dropdown}
                    selectedTextStyle={styles.selectedText}
                    placeholderStyle={styles.placeholderText}
                    itemTextStyle={styles.itemText}
                    dropdownStyle={styles.dropdownStyle}
                    dropdownPosition="auto"
                />
            </View>

            {/* Save Button */}

            <Pressable
                onPress={() => 
                {
                    router.replace({
                    pathname: "../Profile",
                    params: {
                        name,
                        email,
                        phone,
                        bio,
                        profileImage,
                        travellerType: travellerOptions.find(opt => opt.value === travellerType)?.label,
                    },
                    });
                }}
                style={styles.saveButton}
                >
                <Text style={styles.buttonText}>Save Changes</Text>
            </Pressable>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    profileHeader: {
        alignItems: "center",
        marginBottom: 20,
    },
    editTitle: {
        fontSize: 22,
        fontFamily: "quicksand-bold",
        color: Colors.primary,
        marginTop: 10,
    },
    profileImageContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: Colors.peachySalmon,
    },
    changePhotoText: {
        marginTop: 8,
        color: Colors.coral,
        fontSize: 14,
        fontFamily: "quicksand-semibold",
    },
    inputContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.white,
        borderWidth: 2,
        borderColor: Colors.peachySalmon,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 10,
        marginBottom: 15,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.black,
        fontFamily: "quicksand-semibold",
        paddingVertical: 4,
    },
    icon: {
        marginLeft: 10,
    },
    bioContainer: {
        width: "100%",
        backgroundColor: Colors.white,
        borderWidth: 2,
        borderColor: Colors.peachySalmon,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 10,
        marginBottom: 10,
    },
    bioInput: {
        fontSize: 16,
        color: Colors.black,
        fontFamily: "quicksand-semibold",
        textAlignVertical: "top",
        paddingVertical: 4,
    },
    charCounter: {
        textAlign: "right",
        fontSize: 12,
        color: Colors.grey,
        marginTop: 4,
    },
    pickerContainer: {
        width: "100%",
        backgroundColor: Colors.white,
        borderWidth: 2,
        borderColor: Colors.peachySalmon,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 10,
        marginBottom: 15,
        overflow: "hidden",
    },
    dropdown: {
        padding: 10,
        borderWidth: 0,
        borderRadius: 10,
        backgroundColor: Colors.white,
    },
    saveButton: {
        width: "100%",
        backgroundColor: Colors.palePink,
        paddingVertical: 15,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
    },
    buttonText: {
        color: Colors.coral,
        fontSize: 18,
        fontFamily: "quicksand-bold",
    },
    charCounter: {
        textAlign: "right",
        fontSize: 12,
        color: Colors.grey,
        marginTop: 4,
    },
    
    charCounterWarning: {
        color: "red", // Turns red when near limit
        fontWeight: "bold",
    },
    
    warningText: {
        color: "red",
        fontSize: 12,
        textAlign: "center",
        marginTop: 5,
        fontWeight: "bold",
    },
    
});