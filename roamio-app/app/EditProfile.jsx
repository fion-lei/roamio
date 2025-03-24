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
        { label: "Solo Traveler", value: "solo" },
        { label: "Group Traveler", value: "group" },
        { label: "Local Traveler", value: "local" },
        { label: "International Traveler", value: "international" },
        { label: "Business Traveler", value: "business" },
        { label: "Retiree Traveler", value: "retiree" },
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
            {/* Header */}
            <View style={styles.profileHeader}>
                <Text style={styles.editTitle}>Edit Profile</Text>
            </View>

            {/* Profile Image Picker */}
            <Pressable onPress={pickImage} style={styles.profileImageContainer}>
                <Image
                    source={
                        profileImage
                            ? { uri: profileImage }
                            : require("../assets/images/profilePicture.png")
                    }
                    style={styles.profileImage}
                />
                <Text style={styles.changePhotoText}>Change Photo</Text>
            </Pressable>

            {/* Full Name Input */}
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Full Name"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                />
            </View>

            {/* Email Input with Icon */}
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    keyboardType="email-address"
                />
                <FontAwesome
                    name="envelope"
                    size={20}
                    color={Colors.coral}
                    style={styles.icon}
                />
            </View>

            {/* Phone Input with Icon */}
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Phone Number"
                    value={phone}
                    onChangeText={setPhone}
                    style={styles.input}
                    keyboardType="phone-pad"
                />
                <FontAwesome
                    name="phone"
                    size={20}
                    color={Colors.coral}
                    style={styles.icon}
                />
            </View>

            {/* Bio Input with Character Counter */}
            <View style={styles.bioContainer}>
                <TextInput
                    placeholder="Bio"
                    value={bio}
                    onChangeText={(text) =>
                        text.length <= BIO_CHAR_LIMIT && setBio(text)
                    }
                    style={styles.bioInput}
                    multiline
                />
                <Text
                    style={[
                        styles.charCounter,
                        bio.length >= 180 ? styles.charCounterWarning : {},
                    ]}
                >
                    {bio.length}/{BIO_CHAR_LIMIT}
                </Text>
                {bio.length === BIO_CHAR_LIMIT && (
                    <Text style={styles.warningText}>
                        Maximum character limit reached
                    </Text>
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
            <Pressable onPress={saveProfileData} style={styles.saveButton}>
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
        marginBottom: 15,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: Colors.coral,
    },
    changePhotoText: {
        marginTop: 6,
        color: Colors.coral,
        fontSize: 14,
        fontFamily: "quicksand-bold",
    },
    inputContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.white,
        borderWidth: 2,
        borderColor: Colors.peachySalmon,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 12,
        marginBottom: 15,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.black,
        fontFamily: "quicksand-semibold",
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
        paddingHorizontal: 10,
        paddingVertical: 12,
        marginBottom: 15,
    },
    bioInput: {
        fontSize: 16,
        color: Colors.black,
        fontFamily: "quicksand-semibold",
        textAlignVertical: "top",
    },
    charCounter: {
        fontFamily: "quicksand-semibold",
        textAlign: "right",
        fontSize: 12,
        color: Colors.grey,
    },
    charCounterWarning: {
        color: "red",
        fontWeight: "bold",
    },
    warningText: {
        color: "red",
        fontSize: 14,
        textAlign: "center",
        fontWeight: "bold",
    },
    pickerContainer: {
        width: "100%",
        backgroundColor: Colors.white,
        borderWidth: 2,
        borderColor: Colors.peachySalmon,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 12,
        marginBottom: 15,
        overflow: "hidden",
    },
    dropdown: {
        padding: 10,
        borderWidth: 0,
        borderRadius: 10,
        backgroundColor: Colors.white,
    },
    dropdownStyle: {
        maxHeight: 200,
        alignSelf: "center",
    },
    placeholderText: {
        fontSize: 16,
        fontFamily: "quicksand-semibold",
        color: Colors.grey,
    },
    selectedText: {
        fontSize: 16,
        fontFamily: "quicksand-bold",
        color: Colors.black,
    },
    itemText: {
        fontSize: 16,
        fontFamily: "quicksand-semibold",
        color: Colors.black,
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
});
