### Front-End Environment Set Up Instructions
---
1. Install Node.js and follow the environment instructions based on your OS
- https://reactnative.dev/docs/set-up-your-environment?os=macos
2. Install Android Studio + Make an Android Device
- https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=simulated
3. Configure Emulator path (important)
4. Navigate to project directory in terminal -- ./roamio-app
5. Launch emulator
6. Start project 'npx expo start'

### Back-End Instructions
---
1. 



#### Troubleshooting for Front-End
Issues with dependencies?
- rm -rf node_modules package-lock.json yarn.lock
- npm install

Issues with Expo? Reload the cache
- npx expo start --clear
