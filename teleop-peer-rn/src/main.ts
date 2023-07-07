import "@formant/ui-sdk-realtime-player";
import { RealtimePlayer } from "@formant/ui-sdk-realtime-player";

let started = false;
window.addEventListener("message", message => {
    const player = el("formant-realtime-player") as RealtimePlayer;

    if (!started) {
        started = true;
        player.drawer.start();
    }

    player.drawVideoFrame(JSON.parse(message.data));
});

function el(selector: string) {
    return document.querySelector(selector) as HTMLElement;
}
