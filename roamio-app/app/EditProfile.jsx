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
import { Dropdown } from "react-native-element-dropdown";
import { Colors } from "@/constants/Colors"; // Ensure Colors file exists
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function EditProfile() {
    const router = useRouter();

    // Existing user data from Profile.jsx (prefilled values)
    const [name, setName] = useState("Wendy Wanderer");
    const [email, setEmail] = useState("wendy.wanderer@email.com");
    const [phone, setPhone] = useState("123-456-7890");
    const [bio, setBio] = useState(
        "Hey, I’m Wendy! I’m 28, a digital nomad from Los Angeles who thrives on spontaneous adventures. Whether it’s a hidden café or an offbeat hiking trail, I’m all about budget-friendly experiences and soaking in local vibes."
    );
    const [travellerType, setTravellerType] = useState("solo");

    // Traveler options dropdown (from SignUpDetails.jsx)
    const travellerOptions = [
        { label: "Solo Traveler", value: "solo" },
        { label: "Group Traveler", value: "group" },
        { label: "Local Traveler", value: "local" },
        { label: "International Traveler", value: "international" },
        { label: "Business Traveler", value: "business" },
        { label: "Retiree Traveler", value: "retiree" },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <Text style={styles.editTitle}>Edit Profile</Text>
            </View>

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
                    onChangeText={setBio}
                    style={styles.bioInput}
                    multiline
                />
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
            <Pressable onPress={() => router.replace("../Profile")} style={styles.saveButton}>
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

