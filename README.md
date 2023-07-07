# FormantMobile

React Native example app using Formant's data-sdk

## Development

1. Ensure you have the React Native environment installed for Expo development
2. Make sure to update your bundleIdentifier and projectId in app.json
3. Install and login to Expo EAS
4. `eas build -p ios --profile development`
    1. You should only have to build this once unless you are modifying native modules, expo config, etc
    2. In the future, you can select the build you want to run via `eas build:run -p ios`
5. `npx expo start --dev-client`

## Rebuilding the player JS

You should only need to do this if `@formant/ui-sdk-realtime-player` or its dependencies are updated

1. `cd` into `telep-peer-rn` and `npm i`
2. `npm run build`
3. Copy the contents of dist/assets/{HASH}.js into player.txt located in the Expo assets folder
