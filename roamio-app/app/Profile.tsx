import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";


export default function Profile()
{
  return (
    <View style={styles.container}>
     
      <View style={styles.profileHeader}>
       
        <Image
          source={require("../assets/images/profilePicture.png")}
          style={styles.avatar}
        />

        <Text style={styles.name}>Wendy Wanderer</Text>

        <Text style={styles.subtitle}>Solo Traveler | Digital Nomad</Text>

        <Text style={styles.email}>wendy.wanderer@email.com</Text>

      </View>

      <View style={styles.bioContainer}>

        <Text style={styles.bio}>
          28, a digital nomad from Los Angeles who thrives on spontaneous adventures.
          Whether it's a quirky café in Calgary or an offbeat hiking trail, she’s all about
          budget-friendly experiences and authentic local vibes.
        </Text>

      </View>

      <View style={styles.infoContainer}>

        <Text style={styles.info}>
          Exploring Calgary’s quirkiest spots
          Finding budget-friendly stays & tours  
          Prefers the road less traveled  
          Tech-savvy & always connected  
        </Text>

      </View>

      <Pressable style={styles.button} onPress={() => console.log("Edit Profile Clicked!")}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </Pressable>

    </View>
  );
}


// Styles
const styles = StyleSheet.create({
  container:
  {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    padding: 20,
  }
  ,
  profileHeader:
  {
    alignItems: "center",
    marginBottom: 20,
  }
  ,
  avatar:
  {
    width: 200,
    height: 280,
    borderRadius: 90,
    marginBottom: 15,
    borderWidth: 4,
    borderColor: Colors.coral,
    shadowColor: Colors.coral,
    shadowOpacity: 0.4,
    shadowRadius: 8,
  }
  ,
  name:
  {
    fontSize: 28,
    fontFamily: "quicksand-bold",
    color: Colors.primary,
  }
  ,
  subtitle:
  {
    fontSize: 16,
    fontFamily: "quicksand-medium",
    color: Colors.grey,
  }
  ,
  email:
  {
    fontSize: 14,
    fontFamily: "quicksand-light",
    color: Colors.coral,
    fontStyle: "italic",
    marginTop: 5,
  }
  ,
  bioContainer:
  {
    width: "90%",
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  }
  ,
  bio:
  {
    fontSize: 16,
    fontFamily: "quicksand-regular",
    color: Colors.primary,
    textAlign: "center",
    fontStyle: "italic",
  }
  ,
  infoContainer:
  {
    width: "90%",
    backgroundColor: Colors.palePink,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    marginBottom: 20,
  }
  ,
  info:
  {
    fontSize: 16,
    fontFamily: "quicksand-regular",
    color: Colors.primary,
    textAlign: "left",
    lineHeight: 24,
  }
  ,
  button:
  {
    backgroundColor: Colors.coral,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "60%",
  }
  ,
  buttonText:
  {
    color: Colors.white,
    fontSize: 18,
    fontFamily: "quicksand-bold",
  },
});





















