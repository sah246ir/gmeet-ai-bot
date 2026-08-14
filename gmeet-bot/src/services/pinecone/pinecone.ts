import { Pinecone as pc, type Pinecone, type RecordMetadata, type Index } from "@pinecone-database/pinecone"
import { ENV } from "../../lib/ENV"

export type ChunkMetadata = {
    meetingId: string;
    text: string;
    transcriptId: string;
    startTime: number;
    endTime: number;
}
export class PineconeService {
    private index: Index<ChunkMetadata>
    private client: Pinecone;
    constructor() {
        this.client = new pc({
            apiKey: ENV.pineconeApiKey,
        });

        this.index = this.client.index<ChunkMetadata>(ENV.pineconeIndex);
    }

    private async embed(text: string) {
        const embeddings = await this.client.inference.embed({
            model: "llama-text-embed-v2",
            inputs: [text],
            parameters: {
                input_type: "passage"
            }
        });
        const embedding = embeddings.data[0];
        if (embedding && embedding.vectorType === 'dense') {
            return embedding.values
        }
        if (embedding && embedding.vectorType === 'sparse') {
            return embedding.sparseValues
        }

        return []
    }

    async upsertChunk(
        id: string,
        text: string,
        metadata: ChunkMetadata
    ) {
        const embedding = await this.embed(text);
        await this.index.upsert({
            records:[
                {
                    metadata,
                    id,
                    values:embedding
                }
            ]
        })

    }

    async search(meetingId: string, q: string){
        const embedding = await this.embed(q);
        const matches = await this.index.query({
            vector:embedding,
            topK:5,
            includeMetadata:true,
            filter:{
                meetingId:{
                    $eq:meetingId
                }
            }

        })
        return matches
    }


}