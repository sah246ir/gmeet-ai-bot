import { joinMeeting, waitUntilMeetingEnds } from './meeting.js';
import { handleAudioData, startAudioCapture } from './audio.js';
import { ENV } from './ENV.js';
import { initializeWebsocket } from './streamer.js';

async function main() {
    const ws = initializeWebsocket(ENV.CONSUMER_URL);
    console.log("initializeWebsocket")
    const meeting = await joinMeeting(ENV.MEETING_URL);
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