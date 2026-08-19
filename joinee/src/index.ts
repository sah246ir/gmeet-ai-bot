import type { WebSocket } from 'ws';
import { joinMeeting, waitForMeetingEntry, waitUntilMeetingEnds } from './meeting.js';
import { handleAudioData, startAudioCapture } from './audio.js';
import { ENV } from './ENV.js';
import { initializeWebsocket } from './streamer.js';

async function run(ws: WebSocket) {
    ws.send(
        JSON.stringify({
            type: "meeting-joining",
            meetingId: ENV.MEETING_ID,
        })
    )
    const meeting = await joinMeeting(ENV.MEETING_URL);
    await waitForMeetingEntry(meeting.page)
    ws.send(
        JSON.stringify({
            type: "meeting-joined",
            meetingId: ENV.MEETING_ID,
        })
    )
    const audioStream = startAudioCapture()
    let index = 0;
    audioStream.on('data', (data: Buffer)=>{
        ws.send(
            JSON.stringify({
                type:"audio-transcribe-chunk",
                data: data.toString('base64'),
                meetingId: ENV.MEETING_ID,
                index: index++,
            })
        )
    })
    ws.onmessage = (async(event)=>{
        const data = JSON.parse(event.data as string);
        if(data.type=="meeting-end"){
            const leaveCall = meeting.page.getByRole("button", { name: "Leave call" });

            if (await leaveCall.isVisible().catch(() => false)) {
                await leaveCall.click();
            }
        }
    })
    await waitUntilMeetingEnds(meeting)
    audioStream.destroy()
    ws.send(
        JSON.stringify({
            type:"audio-transcribe-end",
            meetingId: ENV.MEETING_ID,
        })
    )
}

async function main() {
    const ws = initializeWebsocket(ENV.CONSUMER_URL);
    await new Promise<void>((resolve) => ws.once("open", resolve));
    console.log("initializeWebsocket")

    try {
        await run(ws)
    } catch (error) {
        console.error(error)
        const message = error instanceof Error ? error.message : String(error)
        try {
            ws.send(JSON.stringify({ type: "meeting-failed", meetingId: ENV.MEETING_ID, error: message }))
        } catch (sendError) {
            console.error("failed to report failure:", sendError)
        }
        throw error
    } finally {
        ws.close()
    }
}
main().then(console.log).catch(console.error)
