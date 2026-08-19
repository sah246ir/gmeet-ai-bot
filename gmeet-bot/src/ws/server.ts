import type { Server as HttpServer } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { MeetingEvent } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { WSEventSchema } from './handlers/schema.js';
import { audioTranscribeChunkHandler } from './handlers/audio-transcribe-chunk/handler.js';
import { audioTranscribeEndHandler } from './handlers/audio-transcribe-end/handler.js';
import { meetingJoiningHandler } from './handlers/meeting-joining/handler.js';
import { meetingJoinedHandler } from './handlers/meeting-joined/handler.js';
import { meetingFailedHandler } from './handlers/meeting-failed/handler.js';
import { addMeetingEvent } from '../http/modules/meeting/meeting.service.js';

export function attachWebSocketServer(httpServer: HttpServer) {
  const wss = new WebSocketServer({ server: httpServer });

  // Tracks, per open socket, which meeting it belongs to and whether the bot
  // already told us how it ended (audio-transcribe-end or meeting-failed) -
  // lets the close handler tell "bot wrapped up on its own terms" apart from
  // "bot vanished mid-meeting" without touching the happy path. Set
  // synchronously (before the matching handler is awaited) so there's no race
  // between this flag and the close event, which the underlying socket can
  // fire before that handler's DB write has committed.
  const socketMeetings = new Map<WebSocket, { meetingId: string; reportedEnd: boolean }>();

  wss.on('connection', (socket) => {
    console.log("client connected")
    socket.on('message', async(data) => {
      const eventData = JSON.parse(data.toString())
      const parsedData = WSEventSchema.safeParse(eventData)
      if(parsedData.error){
        console.log(parsedData.error)
        return
      }

      const finaldata = parsedData.data
      const state = socketMeetings.get(socket) ?? { meetingId: finaldata.meetingId, reportedEnd: false }
      state.meetingId = finaldata.meetingId
      if (finaldata.type === "audio-transcribe-end" || finaldata.type === "meeting-failed") state.reportedEnd = true
      socketMeetings.set(socket, state)

      switch(finaldata.type){
        case "audio-transcribe-chunk":
          await audioTranscribeChunkHandler(finaldata)
          break
        case "audio-transcribe-end":
          await audioTranscribeEndHandler(finaldata)
          break
        case "meeting-joining":
          await meetingJoiningHandler(finaldata)
          break
        case "meeting-joined":
          await meetingJoinedHandler(finaldata)
          break
        case "meeting-failed":
          await meetingFailedHandler(finaldata)
          break
        default:

      }

    });

    socket.on('close', async () => {
      const state = socketMeetings.get(socket)
      socketMeetings.delete(socket)
      if (!state || state.reportedEnd) return

      try {
        const meeting = await prisma.meeting.findUnique({ where: { id: state.meetingId }, select: { state: true } })
        if (meeting?.state !== 'PENDING') return
        await addMeetingEvent(
          state.meetingId,
          MeetingEvent.FAILED,
          "FAILED",
          "Bot disconnected unexpectedly before the meeting finished",
        )
      } catch (error) {
        console.error("failed to record disconnect as a failure:", error)
      }
    });
  });

  function broadcast(event: unknown) {
    const payload = JSON.stringify(event);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  return { wss, broadcast };
}
