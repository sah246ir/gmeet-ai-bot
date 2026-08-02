import { config } from 'dotenv';
config()

export const ENV = {
    MEETING_URL: process.env.MEETING_URL || '',
    CONSUMER_URL: process.env.CONSUMER_URL || '',
    MEETING_ID: process.env.MEETING_ID || '',
}
