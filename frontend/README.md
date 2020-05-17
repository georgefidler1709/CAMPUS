# Building the Frontend

The front-end does not need to be deployed, and can readily be accessed using the instructions in the root README.

If you would like to run the front-end locally on a Mac/iOS simulator, you will need to follow the instructions **[here](https://docs.expo.io/get-started/installation/?redirected)**.
Once these instructions have been followed, run the following commands from the project root directory:
``` bash
cd app/frontend
npm install
echo "AUTH_KEY=auth key for firestore account
MAPS_API_KEY=key for google maps api" > .env
npm run
```
An Expo dialog will then open up on your browser, and you need to click **Run on iOS simulator**.


To run on android you will need to install android studio **[here](https://developer.android.com/studio)** and follow the instructions **[here](https://developer.android.com/studio/run/managing-avds)**.

Then after following all other instructions and start the application click **Run on android
device/emulator**.
