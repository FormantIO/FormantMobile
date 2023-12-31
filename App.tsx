// import polyfills before anything else
import "cross-fetch";
import "react-native-get-random-values";
import { registerGlobals } from "react-native-webrtc";
registerGlobals();

import { Button, StyleSheet, TextInput, View, Dimensions } from "react-native";
import { Asset } from "expo-asset";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import WebView from "react-native-webview";

import { Authentication, Device, Fleet, PeerDevice } from "@formant/data-sdk";
import RealtimePlayer from "./components/RealtimePlayer";
import Joystick from "./components/Joystick";

const JOYSTICK_STREAM_NAME = "/joystick";
const LAN_MODE = false;
// when making a direct connection, the IP and port must be specified. when making a connection
// through the Formant stack, specify the device name
const DEFAULT_AGENT_ENDPOINT = LAN_MODE ? "192.168.1.100:5502" : "robotname";
const VIDEO_ASPECT_RATIO = 9 / 16;

const styles = StyleSheet.create({
    container: {
        marginTop: 60,
        flex: 1
    }
});

let playerRef: React.MutableRefObject<WebView> | null = null;
let connectedDevice: Device | PeerDevice | null = null;

async function getLANOrRemoteDevice(
    deviceDescriptor: string
): Promise<Device | PeerDevice> {
    if (LAN_MODE) {
        return Fleet.getPeerDevice(`http://${deviceDescriptor}`);
    } else {
        const credsString = await loadCloudAuth();
        const creds = JSON.parse(credsString);
        await Authentication.login(creds.username, creds.password);
        const devices = await Fleet.getDevices();
        let device: Device;
        for (const device of devices) {
            if (device.name === deviceDescriptor) {
                return device;
            }
        }
    }
}

async function loadCloudAuth(): Promise<string | null> {
    const file = Asset.fromModule(require("./assets/auth.json.txt"));
    const fileContents = await fetch(file.uri);
    return fileContents.text();
}

function startVideoFn(deviceDescriptor: string) {
    getLANOrRemoteDevice(deviceDescriptor)
        .then(device => {
            if (!device) {
                return;
            }

            device.on("connect", () => {
                console.log(`Connected to device: ${deviceDescriptor}`);
            });

            device.on("disconnect", () => {
                connectedDevice = null;
                console.log(`Disconnected from device: ${deviceDescriptor}`);
            });

            let selectedVideoStream = "n/a";

            device.addRealtimeListener((_peerId, message) => {
                if (
                    message?.header?.stream?.streamName ===
                        selectedVideoStream &&
                    playerRef?.current != null
                ) {
                    playerRef.current.postMessage(
                        JSON.stringify(message.payload.h264VideoFrame)
                    );
                }
            });

            device
                .startRealtimeConnection()
                .then(async () => {
                    connectedDevice = device;
                    console.log("Started realtime connection");

                    device.getRealtimeVideoStreams().then(videoStreams => {
                        console.log("Got realtime video streams:");
                        console.log(JSON.stringify(videoStreams));
                        if (videoStreams.length > 0) {
                            selectedVideoStream = videoStreams[0].name;
                            device.startListeningToRealtimeVideo(
                                videoStreams[0]
                            );
                        }
                    });
                })
                .catch(error => {
                    console.error(error);
                });
        })
        .catch(error => {
            console.error(error);
        });
}

export default function App() {
    playerRef = useRef<WebView>();

    const [inputText, setInputText] = useState(DEFAULT_AGENT_ENDPOINT);
    const [videoEnabled, setVideoEnabled] = useState(false);

    const handleInputChange = (text: string) => {
        setInputText(text);
    };

    const handleStartVideo = () => {
        if (!videoEnabled) {
            setVideoEnabled(true);
            startVideoFn(inputText);
        }
    };

    const onJoystickEvent = (x: number, y: number) => {
        console.log(`Got joystick event: ${JSON.stringify({ x, y })}`);
        if (connectedDevice) {
            connectedDevice.sendRealtimeMessage({
                header: {
                    stream: {
                        entityId: connectedDevice.id,
                        streamName: JOYSTICK_STREAM_NAME,
                        streamType: "twist"
                    },
                    created: Date.now()
                },
                payload: {
                    twist: {
                        linear: {
                            x: y,
                            y: 0,
                            z: 0
                        },
                        angular: {
                            x: 0,
                            y: 0,
                            z: x
                        }
                    }
                }
            });
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <TextInput
                value={inputText}
                onChangeText={handleInputChange}
                placeholder="Enter agent endpoint (e.g. 192.168.1.100:5502)"
                autoCapitalize="none"
                editable={!videoEnabled}
                style={[
                    { borderWidth: 1 },
                    { borderColor: "gray" },
                    { borderRadius: 8 },
                    { paddingHorizontal: 10 },
                    { paddingVertical: 8 },
                    { marginLeft: 10 },
                    { marginRight: 10 },
                    { marginBottom: 10 },
                    { backgroundColor: videoEnabled ? "#F4F4F4" : "white" },
                    videoEnabled && { opacity: 0.5 }
                ]}
            />
            {!videoEnabled && (
                <Button title="Start Video" onPress={handleStartVideo} />
            )}
            {videoEnabled && (
                <RealtimePlayer
                    webViewRef={playerRef}
                    style={{
                        height: Math.round(
                            VIDEO_ASPECT_RATIO * Dimensions.get("window").width
                        )
                    }}
                />
            )}
            {videoEnabled && (
                <Joystick
                    onJoystickEvent={onJoystickEvent}
                    size={50}
                    maxTravel={100}
                    margin={30}
                />
            )}
        </View>
    );
}
