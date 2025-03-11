import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
} from "@react-navigation/native";

export const LightTheme = {
  ...NavigationLightTheme,
  colors: {
    ...NavigationLightTheme.colors,
    background: "#ffffff", // Primary color for light mode
    card: "#ff989a", // Secondary color
    text: "#333333",
    border: "#ffd9d9",
    primary: "#f55e61", // Accent color
    notification: '#ffd9d9',
  },
  
};

export const DarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    background: "#1a1a1a", // Primary color for dark mode
    card: "#252525", // Secondary color
    text: "#f9f9f9",
    border: "#374151",
    primary: "#ff914d", // Accent color
  },
};


// export const MyLightTheme = {
//     dark: false,
//     colors: {
//       primary: "#5f0202",
//       background: "#ffffff",
//       card: "rgb(255, 255, 255)",
//       text: "#5f0202",
//       border: "#00ff00",
//       notification: "rgb(55, 222, 58)",
//     },
//   };

// export const MyDarkTheme = {
// dark: false,
// colors: {
//     primary: "#5f0202",
//     background: "#ffffff",
//     card: "rgb(255, 255, 255)",
//     text: "#5f0202",
//     border: "#00ff00",
//     notification: "rgb(55, 222, 58)",
// },
// };
