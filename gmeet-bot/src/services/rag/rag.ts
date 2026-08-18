import { QueryResponse } from "@pinecone-database/pinecone";
import { LLMService } from "../llm/llm.js";
import { ChunkMetadata, PineconeService } from "../pinecone/pinecone.js";
import { formatTranscriptBlock, parseWords } from "../../lib/transcript-format.js";

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

            return formatTranscriptBlock({
                startTime: meta?.startTime ?? 0,
                endTime: meta?.endTime ?? 0,
                text: meta?.text ?? "",
                words: parseWords(meta?.words),
            })
        }).join("\n\n")
    }
}