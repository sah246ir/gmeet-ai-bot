import { config } from 'dotenv';
import { joinMeeting, waitUntilMeetingEnds } from './meeting';
import { handleAudioData, startAudioCapture } from './audio';
config()

async function main() {
    const meeting = await joinMeeting(process.env.MEETING_URL!);
    const audioStream = startAudioCapture()
    audioStream.on('data', handleAudioData)
    await waitUntilMeetingEnds(meeting)
}
main().then(console.log).catch(console.error)