import { meetingTranscript } from "./constants.js"
import { buildFullMeetingContext, countDistinctSpeakers } from "../lib/transcript-format.js"
import { RagService } from "../lib/rag.js"

async function main() {
    const context = buildFullMeetingContext(meetingTranscript)
    const speakerCount = countDistinctSpeakers(meetingTranscript)
    const summary = await RagService.llmService.summarize(context)
    console.log(JSON.stringify({ speakerCount, summary }, null, 2))
}

main()
.then(()=>console.log("succeed"))
.catch((e)=>console.log("fail",e))
