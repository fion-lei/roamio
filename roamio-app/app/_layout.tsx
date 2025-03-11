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

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const systemColorScheme = Appearance.getColorScheme();
  const router = useRouter();

  useEffect(() => {
    const loadTheme = async () => {
      const stored = (await AsyncStorage.getItem("theme")) as ThemeOptions;
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
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : LightTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.palePink},
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
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerTitle: "",
            headerShadowVisible: false,
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
        {/* Profile Page */}
        <Stack.Screen name="Profile" />
      </Stack>
    </ThemeProvider>
  );
}
