### Front-End Environment Set Up Instructions
---
1. Install Node.js and follow the environment instructions based on your OS
- https://reactnative.dev/docs/set-up-your-environment?os=macos
2. Install Android Studio + Make an Android Device
- https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=simulated
3. Configure Emulator path (important)
4. Navigate to project directory in terminal (locate package.json) -- ./roamio-app
5. Launch emulator
6. Start project 'npx expo start'

### Back-End Instructions

#### Troubleshooting for Front-End
Issues with dependencies?
- rm -rf node_modules package-lock.json yarn.lock
- npm install

Issues with Expo? Reload the cache
- npx expo start --clear


#### roamio-app File Structure
---
app
- Contains the app's navigation, which is file-based. The file structure of the app directory determines the app's navigation.
- The app has two routes defined by two files: app/(tabs)/index.tsx and app/(tabs)/explore.tsx. The layout file in app/(tabs)/_layout.tsx sets up the tab navigator.

assets
- holds images and logos

components
- Contains React Native components, like ThemedText.tsx, which creates text elements that use the app's color scheme in light and dark modes.

constants
- Contains Colors.ts, which contains a list of color values throughout the app.

hooks
- Contains React Hooks, which allows sharing common behavior between components. For example, useThemeColor() is a hook that returns a color based on the current theme.
- https://react.dev/reference/react/hooks

scripts USE AT YOUR OWN CAUTION PLS
- Contains reset-project.js, which can be run with npm run reset-project. This script will move the app directory to app-example, and create a new app directory with an index.tsx file.

app.json
- Contains configuration options for the project and is called the app config. These options change the behavior of your project while developing, building, submitting, and updating your app.

package.json
- The package.json file contains the project's dependencies, scripts, and metadata. Anytime a new dependency is added to your project, it will be added to this file.

tsconfig.json
- Contains the rules that TypeScript will use to enforce type safety throughout the project.



