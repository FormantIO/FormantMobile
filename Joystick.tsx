import {
    Animated,
    View,
    PanResponder,
    StyleSheet,
    FlexAlignType
} from "react-native";
import React, { useRef } from "react";

export interface JoystickProps {
    onJoystickEvent: (x: number, y: number) => void;
    size: number;
    maxTravel: number;
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    alignSelf?: FlexAlignType;
    margin?: number;
}

const Joystick: React.FC<JoystickProps> = ({
    onJoystickEvent,
    size,
    maxTravel,
    color,
    backgroundColor,
    borderColor,
    alignSelf,
    margin
}) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const previousMousePosition = useRef({ x: 0, y: 0 });

    const styles = StyleSheet.create({
        container: {
            height: maxTravel * 2,
            width: maxTravel * 2,
            alignItems: "center",
            alignSelf: alignSelf || "center",
            justifyContent: "center",
            backgroundColor: backgroundColor || "#EEEEEE",
            margin: margin || 0,
            borderRadius: maxTravel * 2,
            borderColor: borderColor || "#CCCCCC",
            borderWidth: 1
        },
        joystick: {
            height: size,
            width: size,
            backgroundColor: color || "#27314A",
            borderRadius: size
        }
    });

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (event, gestureState) => {
                const { dx, dy } = gestureState;

                const currentMousePosition = {
                    x: event.nativeEvent.pageX,
                    y: event.nativeEvent.pageY
                };

                // Calculate the distance of the current touch from the center of the joystick
                const distanceFromCenter = Math.hypot(dx, dy);

                if (distanceFromCenter <= maxTravel) {
                    onJoystickEvent(dx / maxTravel, (dy / maxTravel) * -1);
                    Animated.event([null, { dx: pan.x, dy: pan.y }], {
                        useNativeDriver: false
                    })(event, gestureState);
                } else {
                    // Calculate the angle between the current touch and the center of the joystick
                    const angle = Math.atan2(dy, dx);

                    // Calculate the position on the edge of the circle within the maxDistance limit
                    const newPosition = {
                        x: Math.cos(angle) * maxTravel,
                        y: Math.sin(angle) * maxTravel
                    };

                    onJoystickEvent(
                        newPosition.x / maxTravel,
                        (newPosition.y / maxTravel) * -1
                    );

                    // Update the Animated value
                    pan.setValue(newPosition);
                }

                // Update the previous mouse position
                previousMousePosition.current = currentMousePosition;
            },
            onPanResponderRelease: () => {
                onJoystickEvent(0, 0);
                Animated.spring(pan, {
                    toValue: {
                        x: 0,
                        y: 0
                    },
                    useNativeDriver: false
                }).start();
            }
        })
    ).current;

    return (
        <View style={styles.container}>
            <Animated.View
                style={{
                    transform: [{ translateX: pan.x }, { translateY: pan.y }]
                }}
                {...panResponder.panHandlers}
            >
                <View style={styles.joystick}></View>
            </Animated.View>
        </View>
    );
};

export default Joystick;
