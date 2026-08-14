import {config} from "dotenv"
config()
export const ENV = {
    deepgramApiKey: process.env.DEEPGRAM_KEY as string,
    pineconeApiKey: process.env.PINECONE_KEY as string,
    groqApiKey: process.env.GROQ_KEY as string,
    pineconeIndex: process.env.PINECONE_INDEX as string,
    redisUrl: process.env.REDIS_URL as string,
    port: process.env.PORT as string
}