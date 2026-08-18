import { joinMeeting, waitForMeetingEntry, waitUntilMeetingEnds } from './meeting.js';
import { handleAudioData, startAudioCapture } from './audio.js';
import { ENV } from './ENV.js';
import { initializeWebsocket } from './streamer.js';

async function main() {
    const ws = initializeWebsocket(ENV.CONSUMER_URL);
    await new Promise<void>((resolve) => ws.once("open", resolve));
    console.log("initializeWebsocket")

    ws.send(
        JSON.stringify({
            type: "meeting-joining",
            meetingId: ENV.MEETING_ID,
        })
    )
    const meeting = await joinMeeting(ENV.MEETING_URL);
    ws.send(
        JSON.stringify({
            type: "meeting-waiting",
            meetingId: ENV.MEETING_ID,
        })
    )
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
            await meeting.browser.close()
            audioStream.destroy()
            ws.send(
                JSON.stringify({
                    type: "audio-transcribe-end",
                    meetingId: ENV.MEETING_ID,
                })
            );
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
    ws.close()
}
main().then(console.log).catch(console.error)