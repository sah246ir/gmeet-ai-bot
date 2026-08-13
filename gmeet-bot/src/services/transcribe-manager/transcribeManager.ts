import { Deepgram } from "../deepgram/deepgram"

export class TranscribeManager {
    private clients: Map<string,Deepgram>
    constructor(){
        this.clients = new Map()
    }
    async createInstance(meetingId: string) {
        console.log("CREATING ",meetingId)
        const client = new Deepgram(meetingId);
        this.clients.set(meetingId, client);
        await client.startSession()
        console.log("CREATED ",meetingId)
        return client;
    }

    getInstance(meetingId:string){
        return this.clients.get(
            meetingId
        )
    }

    async removeInstance(meetingId: string) {
        await this.getInstance(meetingId)?.stopSession()
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