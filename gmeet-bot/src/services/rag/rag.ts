import { QueryResponse } from "@pinecone-database/pinecone";
import { LLMService } from "../llm/llm.js";
import { ChunkMetadata, PineconeService } from "../pinecone/pinecone.js";

export class RagService {
    pineconeService: PineconeService;
    llmService: LLMService;

    constructor() {
        this.pineconeService = new PineconeService();
        this.llmService = new LLMService();
    }

    async ask(meetingId: string, question: string) {
        const results = await this.pineconeService.search(
            { meetingId },
            question
        );
        const context = await this.buildContext(results)
        const llmResponse = await this.llmService.answer(
            question,
            context
        )
        return llmResponse
    }

    async askSession(sessionToken: string, question: string) {
        const results = await this.pineconeService.search(
            { sessionToken },
            question
        );
        const context = await this.buildContext(results)
        const llmResponse = await this.llmService.answer(
            question,
            context
        )
        return llmResponse
    }

    async buildContext(matchResult:QueryResponse<ChunkMetadata>){
        return matchResult.matches.map((m)=>{
            const meta = m.metadata

            let words: { word: string; speaker?: number }[] = []
            try {
                words = meta?.words ? JSON.parse(meta.words) : []
            } catch {
                words = []
            }

            const speakerLines: string[] = []
            let currentSpeaker: number | undefined
            let currentLine: string[] = []
            for (const w of words) {
                if (w.speaker !== currentSpeaker) {
                    if (currentLine.length > 0) {
                        speakerLines.push(`Speaker ${currentSpeaker ?? "unknown"}: ${currentLine.join(" ")}`)
                    }
                    currentSpeaker = w.speaker
                    currentLine = []
                }
                currentLine.push(w.word)
            }
            if (currentLine.length > 0) {
                speakerLines.push(`Speaker ${currentSpeaker ?? "unknown"}: ${currentLine.join(" ")}`)
            }

            const speakerBlock = speakerLines.length > 0 ? `\nSpeakers:\n${speakerLines.join("\n")}` : ""

            return `
[${meta?.startTime}s - ${meta?.endTime}s]
${meta?.text}${speakerBlock}
`;
        }).join("\n\n")
    }
}