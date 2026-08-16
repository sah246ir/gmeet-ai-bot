import { groupTranscripts } from "../lib/group-transcripts.js"
import { RagService } from "../services/rag/rag.js"
import { meetingTranscript } from "./constants.js"

async function main() {
    const RAG = new RagService()
    const transcribe = groupTranscripts(meetingTranscript,"test","test-session")
    await RAG.pineconeService.upsertChunk(transcribe)
    const ans = await RAG.ask("test","What dishes should the restaurant prioritize today, why are they being prioritized, what stock limitations should the team be aware of, and are there any allergy or kitchen safety issues they need to handle?")
    console.log(ans)
}

main()
.then(()=>console.log("succeed"))
.catch((e)=>console.log("fail",e))