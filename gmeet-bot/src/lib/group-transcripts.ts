import { TranscriptSegment } from "@prisma/client";
import { ChunkMetadata } from "../services/pinecone/pinecone";

type PersistedWord = { word: string; speaker?: number };

function parseWords(raw: TranscriptSegment["words"]): PersistedWord[] {
    return Array.isArray(raw) ? (raw as unknown as PersistedWord[]) : [];
}

export function groupTranscripts(segments: TranscriptSegment[], meetingId: string, sessionToken: string) {
    const chunks: ChunkMetadata[] = [];
    let buffer: (Omit<ChunkMetadata,"id"|"words"|"sessionToken"> & { words: PersistedWord[] })[] = [];
    let chunkIndex = 0;

    for (const segment of segments) {
        buffer.push({
            endTime: segment.endTime,
            meetingId: segment.meetingId,
            startTime: segment.startTime,
            text: segment.text,
            words: parseWords(segment.words),
        });

        if (buffer.length >= 5) {
            chunks.push({
                id: `${meetingId}_chunk_${chunkIndex++}`,
                text: buffer.map(s => s.text).join(" "),
                endTime: buffer[buffer.length - 1]?.endTime,
                meetingId: segment.meetingId,
                startTime: buffer[0]?.startTime,
                words: JSON.stringify(buffer.flatMap(s => s.words)),
                sessionToken,
            });

            buffer = [];
        }
    }

    if (buffer.length > 0) {
        chunks.push({
            id: `${meetingId}_chunk_${chunkIndex}`,
            text: buffer.map(s => s.text).join(" "),
            endTime: buffer[buffer.length - 1]?.endTime,
            meetingId: meetingId,
            startTime: buffer[0]?.startTime,
            words: JSON.stringify(buffer.flatMap(s => s.words)),
            sessionToken,
        });
    }

    return chunks;
}