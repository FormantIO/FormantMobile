# FormantMobile

React Native example app using Formant's data-sdk

## Development

1. Ensure you have NodeJS installed and then `npm i`
2. [Sign up for Expo EAS](https://expo.dev/signup) and [set up your environment](https://docs.expo.dev/build/setup/)
3. To execute the app on an iOS simulator, `eas build -p ios --profile development`
    1. You should only have to build this once unless you are modifying native modules, expo config, etc
    2. In the future, you can select the build you want to run via `eas build:run -p ios`
4. `npx expo start --dev-client`
    1. This is the command you will normally run to develop once your environment is all set
    2. You can tap "i" to (re)launch the iOS simulator

## Example app configuration

1. Set the `LAN_MODE` const based on if you want to make a direct IP connection to an agent vs routing through the Formant cloud
    1. If you are using `LAN_MODE`, your agent must be at least version `1.132.40` or higher
        1. You must also set `export FORMANT_AGENT_IP=0.0.0.0` (or the device's private IP accessible to the client) in /var/lib/formant/.bashrc
    2. If you are _not_ connecting locally, make sure to copy `auth.example.json.txt` to `auth.json.txt` and fill in your login
        1. This file is explicitly ignored in the gitignore
2. Update the `DEFAULT_AGENT_ENDPOINT` const to reflect your device's name or IP address. Port 5502 is the default
3. `JOYSTICK_STREAM_NAME` is the topic/stream that the joystick data will be sent to
4. `VIDEO_ASPECT_RATIO` can be modified to match your teleop video aspect ratio to properly size the video player

## Rebuilding the player JS

You should only need to do this if `@formant/ui-sdk-realtime-player` or its dependencies are updated

1. `cd` into `telep-peer-rn` and `npm i`
2. `npm run build`
3. Copy the contents of dist/assets/{HASH}.js into player.txt located in the Expo assets folder
