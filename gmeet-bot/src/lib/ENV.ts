import {config} from "dotenv"
config()
export const ENV = {
    deepgramApiKey: process.env.DEEPGRAM_KEY as string,
    redisUrl: process.env.REDIS_URL as string,
    port: process.env.PORT as string
}