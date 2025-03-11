import { Stack } from "expo-router";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, useColorScheme } from "react-native";
import { LightTheme, DarkTheme } from "@/utilities/themeOptions"; // Import custom themes
import { Colors } from "@/constants/Colors"; 

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const systemColorScheme = Appearance.getColorScheme(); // Get system theme

  useEffect(() => {
    const loadTheme = async () => {
      // await AsyncStorage.removeItem('theme');
      const stored = (await AsyncStorage.getItem("theme")) as ThemeOptions;
      if (stored) {
        setColorScheme(stored);
      } else {
        // Default to light if nothing or unexpected value is stored
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
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : LightTheme}>
      {/* <Stack screenOptions={{ headerShown: true }} /> */}
      <Stack
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="Intro"
          options={{ title: "Intro", headerShown: false }}
        />
        <Stack.Screen 
          name="Login" 
          options={{ 
            headerStyle: {
              backgroundColor: Colors.white,
            }, // ✅ Uses page color
            headerTintColor: Colors.coral, // ✅ Matches contrast
            headerTitle: "",
            headerShadowVisible: false,
          }} 
        />
        <Stack.Screen
          name="SignUp"
          options={{ 
            headerStyle: { backgroundColor: Colors.coral }, // ✅ Uses page color
            headerTintColor: Colors.white, // ✅ Matches contrast
            headerTitle: "",
            headerShadowVisible: false,
          }}/>
      </Stack>
    </ThemeProvider>
  );
}
