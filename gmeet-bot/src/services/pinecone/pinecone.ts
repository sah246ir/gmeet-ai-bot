import { Pinecone as pc, type Pinecone, type RecordMetadata, type Index } from "@pinecone-database/pinecone"
import { ENV } from "../../lib/ENV.js"

export type ChunkMetadata = {
    id:string;
    meetingId: string;
    sessionToken: string;
    text: string;
    startTime: number;
    endTime: number;
    words: string;
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
        records: ChunkMetadata[]
    ) {
        const embeddings:number[][] = []
        for(let record of records){
            const embedding = await this.embed(record.text);
            embeddings.push(embedding)
        }
        await this.index.upsert({
            records:records.map((rec,i)=>{
                return {
                    id:rec.id,
                    metadata:rec,
                    values:embeddings[i]!
                }
            })
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