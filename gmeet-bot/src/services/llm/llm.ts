import Groq from "groq-sdk";
import { ENV } from "../../lib/ENV.js";

export class LLMService {
    private client: Groq;

    constructor() {
        this.client = new Groq({
            apiKey: ENV.groqApiKey,
        });
    }

    async answer(
        question: string,
        context: string
    ) {
        const response = await this.client.chat.completions.create({
            model: "openai/gpt-oss-20b",
            temperature: 0,
            messages: [
                {
                    role: "system",
                    content: `
                    You are a meeting assistant.

                    Answer the user's question using ONLY the provided meeting transcript.

                    Rules:
                    - Do not use outside knowledge.
                    - Do not invent information.
                    - If the answer cannot be found in the transcript, say:
                    "I couldn't find that information in this meeting."
                    - Keep the answer concise and factual.
                    - Preserve important names, decisions, and dates.
                    - Do not mention information that is not supported by the transcript.

                    Meeting transcript:
                    ${context}
                    `,
                },
                {
                    role: "user",
                    content: question,
                },
            ],
        });

        return response.choices[0]?.message?.content ?? "";
    }
}