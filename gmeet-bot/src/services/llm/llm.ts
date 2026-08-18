import Groq from "groq-sdk";
import { ENV } from "../../lib/ENV.js";
import { meetingSummarySchema, type MeetingSummaryType } from "./llm.schema.js";

const SUMMARY_SYSTEM_PROMPT = `You are a meeting-minutes assistant. You will be given the full transcript of one meeting, including diarized "Speaker N: ..." lines derived from voice diarization.

Produce a structured summary of the ENTIRE meeting as a single JSON object with EXACTLY these keys and no others:

{
  "overview": string,            // 2-4 sentence plain-language summary of what the meeting was about and what happened
  "keyPoints": string[],         // concise bullet points of the most important topics discussed, in the order they came up
  "decisions": [{ "title": string, "description": string }],   // decisions the group actually reached; return [] if none were made
  "actionItems": [{ "owner": string, "task": string, "due": string }],  // concrete follow-up tasks; "owner" is the person responsible if identifiable from the dialogue, otherwise "Unassigned"; "due" is an explicit date/deadline mentioned in the transcript, otherwise an empty string
  "speakers": [{ "label": string, "note": string }]  // one entry per distinct speaker in the transcript; "label" is the person's real name if stated or clearly inferable from dialogue (e.g. someone is addressed by name or introduces themselves), otherwise "Speaker N" using the diarization index; "note" is an optional short description of their apparent role — omit if unclear
}

Rules:
- Base everything ONLY on the provided transcript. Do not invent facts, names, or dates.
- If there are no clear decisions or action items, return an empty array for that field.
- Keep "overview" and "keyPoints" free of speaker labels; those belong only in "speakers".
- Respond with ONLY the JSON object — no markdown code fences, no commentary, no leading or trailing text.`;

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

    async summarize(context: string): Promise<MeetingSummaryType> {
        const response = await this.client.chat.completions.create({
            model: "openai/gpt-oss-20b",
            temperature: 0.2,
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: SUMMARY_SYSTEM_PROMPT,
                },
                {
                    role: "user",
                    content: `Meeting transcript:\n\n${context}`,
                },
            ],
        });

        const raw = response.choices[0]?.message?.content ?? "";

        let parsed: unknown;
        try {
            parsed = JSON.parse(raw);
        } catch {
            throw new Error("LLM summary response was not valid JSON");
        }

        const result = meetingSummarySchema.safeParse(parsed);
        if (!result.success) {
            throw new Error(`LLM summary response failed schema validation: ${result.error.message}`);
        }

        return result.data;
    }
}