import { Stack } from "expo-router";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'; // Light mode, Dark mode
import { Quicksand_300Light, Quicksand_400Regular, Quicksand_500Medium, Quicksand_600SemiBold, Quicksand_700Bold, useFonts } from "@expo-google-fonts/quicksand";


export default function RootLayout() {
  // Set up app fonts
  useFonts({
    'quicksand-light': Quicksand_300Light,
    'quicksand-regular': Quicksand_400Regular, 
    'quicksand-medium': Quicksand_500Medium,
    'quicksand-semibold':Quicksand_600SemiBold,
    'quicksand-bold': Quicksand_700Bold
  })

  return (  
  <Stack> 
    <Stack.Screen name = "index"/>
  </Stack>
  );
  // <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>

  {/* </ThemeProvider> */}

}
