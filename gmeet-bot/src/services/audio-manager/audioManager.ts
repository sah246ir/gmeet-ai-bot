import { Deepgram } from "../deepgram/deepgram"

export class AudioManager {
    private clients: Map<string,Deepgram>
    constructor(){
        this.clients = new Map()
    }
    createInstance(meetingId: string) {
        const client = new Deepgram(meetingId);
        this.clients.set(meetingId, client);
        client.startSession()
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
}