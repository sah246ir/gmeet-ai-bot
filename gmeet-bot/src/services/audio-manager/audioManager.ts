import { Deepgram } from "../deepgram/deepgram"

export class AudioManager {
    private clients: Map<string,Deepgram>
    constructor(){
        this.clients = new Map()
    }
    async createInstance(meetingId: string) {
        const client = new Deepgram(meetingId);
        this.clients.set(meetingId, client);
        await client.startSession()
        return client;
    }

    getInstance(meetingId:string){
        return this.clients.get(
            meetingId
        )
    }

    removeInstance(meetingId: string) {
        this.clients.delete(meetingId)
    }

    async stopAll() {
        for (const [meetingId, client] of this.clients) {
          await client.stopSession();
          console.log(`Stopped Deepgram session: ${meetingId}`);
        }

        this.clients.clear();
      }
}