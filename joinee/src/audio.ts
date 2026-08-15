import { spawn } from "child_process";

export function startAudioCapture() {
    const ffmpeg = spawn("ffmpeg", [
        "-f", "pulse",
        "-i", "virtual_sink.monitor",
        "-ar", "16000",
        "-ac", "1",
        "-c:a", "pcm_s16le",      // Crucial: Explicitly define the codec
        "-f", "s16le",
        "-blocksize", "3200",     // Optional: flushes chunks every 100ms
        "pipe:1",
    ]);

    return ffmpeg.stdout;
}

export function handleAudioData(data: Buffer) {
    console.log("AUDIO DATA =", data);
}