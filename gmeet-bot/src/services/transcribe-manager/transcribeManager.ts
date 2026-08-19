import { Deepgram, TranscriptEvent } from "../deepgram/deepgram.js"

export class TranscribeManager {
    private clients: Map<string, Promise<Deepgram>>
    constructor(){
        this.clients = new Map()
    }

    // Returns a promise that only resolves once the Deepgram session is
    // actually open. Every caller for the same meetingId awaits the same
    // promise, so a chunk that arrives while the session is still connecting
    // waits instead of racing sendAudio() against an unset connection (which
    // would otherwise silently drop the chunk).
    async getInstance(meetingId: string, onTranscript: (event: TranscriptEvent) => void) {
        let clientPromise = this.clients.get(meetingId)
        if (!clientPromise) {
            clientPromise = this.createInstance(meetingId, onTranscript)
            this.clients.set(meetingId, clientPromise)
        }
        return clientPromise
    }

    private async createInstance(meetingId: string, onTranscript: (event: TranscriptEvent) => void) {
        console.log("CREATING ",meetingId)
        const client = new Deepgram(meetingId);
        client.onTranscript(onTranscript)
        await client.startSession()
        console.log("CREATED ",meetingId)
        return client;
    }

    async removeInstance(meetingId: string) {
        const clientPromise = this.clients.get(meetingId)
        this.clients.delete(meetingId)
        await (await clientPromise)?.stopSession()
    }

    async stopAll() {
        const pending = [...this.clients.values()]
        this.clients.clear()

        for (const clientPromise of pending) {
          const client = await clientPromise
          await client.stopSession();
          console.log(`Stopped Deepgram session: ${client.meetingId}`);
        }
      }
}
