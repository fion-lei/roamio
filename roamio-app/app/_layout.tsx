import { Stack } from "expo-router";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, useColorScheme } from "react-native";
import { LightTheme, DarkTheme } from "@/utilities/themeOptions";
import { Colors } from "@/constants/Colors";
import { Pressable } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Import the UserProvider from your UserContext file
import { UserProvider } from "../contexts/UserContext"; // adjust the path as necessary

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const systemColorScheme = Appearance.getColorScheme();
  const router = useRouter();

  useEffect(() => {
    const loadTheme = async () => {
      const stored = await AsyncStorage.getItem("theme");
      if (stored) {
        setColorScheme(stored);
      } else {
        setColorScheme("light");
      }
    };

    loadTheme();
  }, [colorScheme]);

  // Load fonts
  const [fontsLoaded] = useFonts({
    "quicksand-light": require("./../assets/fonts/Quicksand-Light.ttf"),
    "quicksand-regular": require("./../assets/fonts/Quicksand-Regular.ttf"),
    "quicksand-medium": require("./../assets/fonts/Quicksand-Medium.ttf"),
    "quicksand-semibold": require("./../assets/fonts/Quicksand-SemiBold.ttf"),
    "quicksand-bold": require("./../assets/fonts/Quicksand-Bold.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    // Wrap the entire app in UserProvider for global user state
    <UserProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : LightTheme}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: Colors.palePink },
            headerTintColor: Colors.coral,
            headerShadowVisible: false,
            title: "",
          }}
        >
          {/* Hide header on Intro */}
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="Intro"
            options={{ title: "Intro", headerShown: false }}
          />

          {/* Login and Signup */}
          <Stack.Screen
            name="Login"
            options={{
              headerStyle: { backgroundColor: Colors.white },
              headerTintColor: Colors.coral,
              headerTitle: "",
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="SignUp"
            options={{
              headerStyle: { backgroundColor: Colors.coral },
              headerTintColor: Colors.white,
              headerTitle: "",
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="SignUpDetails"
            options={{
              // Set false to force user to enter in details
              headerShown: false,
              headerTintColor: Colors.white,
              headerStyle: { backgroundColor: Colors.coral },
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerTitle: "",
              headerBackVisible: false,
              headerRight: () => (
                <Pressable onPress={() => router.push("/Profile")}>
                  <FontAwesome
                    name="user"
                    size={24}
                    color={Colors.coral}
                    style={{ marginRight: 15 }}
                  />
                </Pressable>
              ),
            }}
          />
          <Stack.Screen
          name="Profile"
          options={{
            headerTitle: "",
            headerRight: () => (
              <Pressable onPress={() => router.push("./settings/Settings")}>
                <FontAwesome
                  name="gear"
                  size={24}
                  color={Colors.coral}
                  style={{ marginRight: 15 }}
                />
              </Pressable>
            ),
          }}
          />
          
        </Stack>
      </ThemeProvider>
    </UserProvider>
  );
}
