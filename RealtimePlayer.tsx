import { WebView, WebViewMessageEvent } from "react-native-webview";
import { Asset } from "expo-asset";
import { useState } from "react";
import { View, ViewStyle } from "react-native";

const consoleJS = `
  // set up logging between WebView and RN
  const consoleLog = (type, log) => window.ReactNativeWebView.postMessage(JSON.stringify({ 'type': type, 'log': log }));
  console = {
    log: (log) => consoleLog('log', log),
    debug: (log) => consoleLog('debug', log),
    info: (log) => consoleLog('info', log),
    warn: (log) => consoleLog('warn', log),
    error: (log) => consoleLog('error', log),
  };
`;

const playerHTML = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Realtime Player</title>
    <style>
      body {
        background-color: black;
        padding: 0;
        margin: 0;
      }
    </style>
  </head>
  <body>
    <formant-realtime-player></formant-realtime-player>
  </body>
</html>
`;

async function loadPlayerJS(): Promise<string | null> {
    let file = Asset.fromModule(require("./assets/player.txt"));
    const fileContents = await fetch(file.uri);
    return fileContents.text();
}

const onMessage = (event: WebViewMessageEvent): void => {
    if (event?.nativeEvent?.data) {
        console.log(`[RealtimePlayer] ${event.nativeEvent.data}`);
    }
};

interface RealtimePlayerProps {
    webViewRef: React.RefObject<WebView>;
    enableDebugLogs?: boolean;
    style?: ViewStyle;
}

const RealtimePlayer: React.FC<RealtimePlayerProps> = ({
    webViewRef,
    style,
    enableDebugLogs
}) => {
    const [playerJS, setPlayerJS] = useState("");

    loadPlayerJS().then(playerSrc => {
        if (playerSrc) {
            setPlayerJS(playerSrc);
        }
    });

    return (
        <View style={style}>
            <WebView
                ref={webViewRef}
                originWhitelist={["*"]}
                scrollEnabled={false}
                textInteractionEnabled={false}
                source={{ html: playerHTML }}
                injectedJavaScript={enableDebugLogs ? consoleJS : "" + playerJS}
                onMessage={onMessage}
            />
        </View>
    );
};

export default RealtimePlayer;
