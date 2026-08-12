import { Deepgram } from "../deepgram/deepgram"

export class AudioManager {
    private clients: Map<string,Deepgram>
    constructor(){
        this.clients = new Map()
    }

    createInstance(meetingId:string){
        this.clients.set(
            meetingId,
            new Deepgram(meetingId)
        )
    }

    getInstance(meetingId:string){
        return this.clients.get(
            meetingId
        )
    }
}