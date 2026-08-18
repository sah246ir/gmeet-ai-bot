export type PersistedWord = { word: string; speaker?: number };

export function parseWords(raw: unknown): PersistedWord[] {
    const value = typeof raw === "string" ? safeJsonParse(raw) : raw;
    return Array.isArray(value) ? (value as PersistedWord[]) : [];
}

function safeJsonParse(raw: string): unknown {
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

export function formatSpeakerLines(words: PersistedWord[]): string[] {
    const speakerLines: string[] = [];
    let currentSpeaker: number | undefined;
    let currentLine: string[] = [];

    for (const w of words) {
        if (w.speaker !== currentSpeaker) {
            if (currentLine.length > 0) {
                speakerLines.push(`Speaker ${currentSpeaker ?? "unknown"}: ${currentLine.join(" ")}`);
            }
            currentSpeaker = w.speaker;
            currentLine = [];
        }
        currentLine.push(w.word);
    }
    if (currentLine.length > 0) {
        speakerLines.push(`Speaker ${currentSpeaker ?? "unknown"}: ${currentLine.join(" ")}`);
    }

    return speakerLines;
}

export function formatTranscriptBlock(params: {
    startTime: number;
    endTime: number;
    text: string;
    words: PersistedWord[];
}): string {
    const speakerLines = formatSpeakerLines(params.words);
    const speakerBlock = speakerLines.length > 0 ? `\nSpeakers:\n${speakerLines.join("\n")}` : "";

    return `
[${params.startTime}s - ${params.endTime}s]
${params.text}${speakerBlock}
`;
}

export function buildFullMeetingContext(
    segments: Array<{ startTime: number; endTime: number; text: string; words: unknown }>,
): string {
    return segments
        .map((segment) =>
            formatTranscriptBlock({
                startTime: segment.startTime,
                endTime: segment.endTime,
                text: segment.text,
                words: parseWords(segment.words),
            }),
        )
        .join("\n\n");
}

export function countDistinctSpeakers(segments: Array<{ words: unknown }>): number {
    const speakers = new Set<number>();
    for (const segment of segments) {
        for (const w of parseWords(segment.words)) {
            if (typeof w.speaker === "number" && Number.isFinite(w.speaker)) {
                speakers.add(w.speaker);
            }
        }
    }
    return speakers.size;
}
