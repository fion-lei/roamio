# Running the App 
You need [Visual Studio Code](https://code.visualstudio.com/download) installed to run this project.
The project requires running the front-end and back-end simultaneously. The following provides step-by-step instructions for installation, setup, and troubleshooting. 

### Front-End Environment
---
1. Follow these [instructions](https://reactnative.dev/docs/set-up-your-environment?os=macos) to set up the environment and emulator.
    - Select your Development OS (the app runs on macOS, Windows, and Linux)
    - Select the Target OS as **Android**
    - Install Node.js and follow the environment instructions based on your OS
2. Follow these [instructions](https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=simulated) to install Android Studio & make an Android Device (OS-dependent)
    - Configuring the emulator path is **important**!
    - When choosing an emulator device, select 'Medium Phone'.
3. Clone the repository in Visual Studio Code
    ```bash
    git clone https://github.com/fion-lei/roamio
    ```
4. Open the terminal in the current project window, and enter in the following commands:
- Navigate to the project directory
    ```bash
    cd .\roamio-app\
    ```
- Install dependencies
    ```bash
    npm install
    ```
    - Any issues will indicate Node JS was not properly installed, see step 1
5. Run the project on Android Emulator:
- Start the Expo Go app, once loaded enter `a` to open Android 
    ```bash
    npx expo start
    ```
    - This should automatically launch the device created in step 2. 
    - Any issues will indicate the emulator environment variable/path was not properly configured (see step 2)
  
*Note:* If the environment is correctly set up, the app should load with the configured device from step 2. Now, we can run the backend.

### Back-End Set Up
---
1. In the current project window, open a new terminal in the project window, navigate to the backend
    ```bash
    cd .\backend\
    ```
2. Install dependencies
    ```bash
    npm install
    ```
3. Run the server
    ```bash
    npm start
    ```
4. (Optional) Resetting the data to default version
    ```bash
    npm run reset-data
    ```
---
#### General Troubleshooting
- Front-End & Back-End not connecting?
    - In the front-end terminal while the Expo Go server is running and enter ``r`` to reload the app 
    ```bash
        › Using Expo Go
        › Press s │ switch to development build

        › Press a │ open Android
        › Press w │ open web

        › Press j │ open debugger
        › Press r │ reload app // Use this to reload the app
        › Press m │ toggle menu
        › shift+m │ more tools
        › Press o │ open project code in your editor

        › Press ? │ show all commands
    ```

    - Run the backend server, enter `rs` to refresh the server
    ```bash
    npm run dev

    $ > roamio-backend@1.0.0 start
    $ > node server.js

    $ Server is running on port ____

    rs 
    ```

#### Troubleshooting for Front-End
- Issues with dependencies? Exit out of the Expo Go Server. Remove and reinstall the packages and dependencies
    - ``rm -rf node_modules package-lock.json yarn.lock``
    - ``npm install``

- Issues with Expo? Reload the cache
    - ``npx expo start --clear``

#### Troubleshooting for Back-End
- Issues with the server? 
    - Stop the server `Ctrl+C`, run the development server `npm run dev` and type in `rs` to restart the server 
- Issues with connecting to Front-End?
    - Check IP / Gateway for emulator is correct
    - Open settings, Click 'Network & Internet', Click 'Internet', Click 'AndroidWifi', Scroll down to 'Gateway'
        - Ensure the Gateway Address is correct and running on the same server 

