# Set Up Instructions
You need [Visual Studio Code](https://code.visualstudio.com/download) installed to run this project.
The project requires running the front-end and back-end simultaneously. The following provides step-by-step instructions for installation, setup, and troubleshooting. 

### Front-End Environment
---
1. Follow these [instructions](https://reactnative.dev/docs/set-up-your-environment?os=macos) to set up the environment and emulator.
- Select your Development OS (the app runs on macOS, Windows, and Linux)
- Select the Target OS as 'Android'
- Install Node.js and follow the environment instructions based on your OS
2. Follow these [instructions](https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=simulated) to install Android Studio & make an Android Device (OS-dependent)
- Configuring the emulator path is **important**!
- When choosing an emulator device, select 'Medium Phone'.
3. Open Visual Studio Code with a new window
- Select 'Clone Git Repository'
- Enter the repository URL https://github.com/fion-lei/roamio.git
- Select repository destination
- Open cloned repository
4. Open the terminal in the current project window, and enter in the following commands:
- Navigate to the project directory ➡ `` cd .\roamio-app\``
- Install dependencies ➡ ``npm install``
    - Any issues will indicate Node JS was not properly installed, retrace step 1
5. Run the project on Android Emulator by entering the following commands:
- Start project ➡ ``npx expo start``
- Once loaded, enter ``a`` to open the app in the emulator, this should automatically launch the device created in step 2. 
    - Any issues will indicate the emulator environment variable/path was not properly configured (see step 2)
  
*Note:* If the environment is correctly set up, the app should load with the configured device from step 2. Now, we can run the backend.

### Back-End Set Up
---
1. In the current project window, open a new terminal and execute the following commands:
- Navigate to the backend directory in terminal ➡ `` cd .\backend\``
- Install dependencies ➡ ``npm install`` 
- Run the server ➡ ``npm run dev`` 

---
#### General Troubleshooting
- Front-End & Back-End not connecting?
    - Enter in the front-end terminal ``r`` to reload the app 
    - Enter in the back-end terminal ``rs`` to reload the server

#### Troubleshooting for Front-End
- Issues with dependencies? Exit out of the Expo Go Server. Remove and reinstall the packages and dependencies
    - ``rm -rf node_modules package-lock.json yarn.lock``
    - ``npm install``

- Issues with Expo? Reload the cache
    - ``npx expo start --clear``

#### Troubleshooting for Back-End
- Issues with connecting to Front-End?
    - Check IP / Gateway for emulator is correct
