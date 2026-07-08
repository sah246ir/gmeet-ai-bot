import { spawn } from "child_process";

export function startAudioCapture() {
    const ffmpeg = spawn("ffmpeg", [
        "-f", "pulse",
        "-i", "alsa_output....monitor",
        "-ar", "16000",
        "-ac", "1",
        "-f", "s16le",
        "pipe:1",
    ]);

    return ffmpeg.stdout;
}

export function handleAudioData(data: Buffer) {
    console.log("AUDIO DATA =", data);
}