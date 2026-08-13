import { joinMeeting, waitUntilMeetingEnds } from './meeting.js';
import { handleAudioData, startAudioCapture } from './audio.js';
import { ENV } from './ENV.js';
import { initializeWebsocket } from './streamer.js';

async function main() {
    const consumer = initializeWebsocket(ENV.CONSUMER_URL);
    const meeting = await joinMeeting(ENV.MEETING_URL);
    const audioStream = startAudioCapture()
    let index = 0;
    audioStream.on('data', (data: Buffer)=>{
        consumer.send(
            JSON.stringify({
                type:"audio-transcribe-chunk",
                data: data.toString('base64'),
                meetingId: ENV.MEETING_ID,
                index: index++,
            })
        )
    })
    await waitUntilMeetingEnds(meeting)
    consumer.close()
}
main().then(console.log).catch(console.error)