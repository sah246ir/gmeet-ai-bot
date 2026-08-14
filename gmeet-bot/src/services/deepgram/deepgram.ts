import { DeepgramClient, listen } from "@deepgram/sdk"
import { ENV } from "../../lib/ENV.js"
type DeepgramConnection = Awaited<
    ReturnType<DeepgramClient["listen"]["v1"]["connect"]>
>;
export interface TranscriptEvent {
    meetingId: string;
    text: string;
    isFinal: boolean;
    speechFinal: boolean;
    start: number;
    duration: number;
    words: any[];
}

type TranscriptHandler = (event: TranscriptEvent) => void;

export class Deepgram {
    client: DeepgramClient
    connection?: DeepgramConnection
    meetingId: string
    private transcriptHandler?: TranscriptHandler;
    constructor(meetingId: string) {
        this.client = new DeepgramClient({
            apiKey: ENV.deepgramApiKey
        })
        this.meetingId = meetingId
    }

    async startSession() {
        const connection = await this.client.listen.v1.connect({
            model: "nova-3",
            language: "en-US",
            smart_format: "true",
            encoding: "linear16",
            sample_rate: 16000,
            channels: 1,

        });
        this.registerListeners(connection)
        connection.connect()
        await connection.waitForOpen()
        this.connection = connection
    }
    public async stopSession() {
        this.connection?.close()
    }

    async sendAudio(chunk:Buffer){
        this.connection?.socket.send(chunk)
    } 

    public onTranscript(handler: TranscriptHandler) {
        this.transcriptHandler = handler;
    }

    private registerListeners(connection:DeepgramConnection){
        connection?.on("open", () => {
            console.log(`Deepgram connected: ${this.meetingId}`);
        });

        connection?.on("message", (data ) => {
            if (data.type !== "Results") return;
            const alt = data.channel.alternatives[0];
            console.log(alt)

            if (!alt.transcript?.trim()) return;

            this.transcriptHandler?.({
                meetingId:this.meetingId,
                text: alt.transcript,
                isFinal: data.is_final || false,
                speechFinal: data.speech_final || false,
                start: data.start,
                duration: data.duration,
                words: alt.words ?? [],
            });
        });

        connection?.on("error", (err) => {
            console.error("Deepgram Error:", err);
        });

        connection?.on("close", () => {
            console.log(`Deepgram closed: ${this.meetingId}`);
        });
    }
}