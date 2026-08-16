import { RagService } from "../../../lib/rag.js";
import { assertMeetingOwnership } from "../meeting/meeting.service.js";

export async function queryMeeting(meetingId: string, sessionToken: string, question: string) {
    const owned = await assertMeetingOwnership(meetingId, sessionToken);

    if (!owned) {
        return null;
    }

    const answer = await RagService.ask(meetingId, question);
    return { answer };
}
