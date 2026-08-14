import { QueryResponse } from "@pinecone-database/pinecone";
import { LLMService } from "../llm/llm.js";
import { ChunkMetadata, PineconeService } from "../pinecone/pinecone.js";

export class RagService {
    private pineconeService: PineconeService;
    private llmService: LLMService;

    constructor() {
        this.pineconeService = new PineconeService();
        this.llmService = new LLMService();
    }

    async ask(meetingId: string, question: string) {
        const results = await this.pineconeService.search(
            meetingId,
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
            return `
[${meta?.startTime}s - ${meta?.endTime}s]
${meta?.text}
`;
        }).join("\n\n")
    }
}