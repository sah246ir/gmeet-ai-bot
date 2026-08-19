import type { Server as HttpServer } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { WSEventSchema } from './handlers/schema.js';
import { audioTranscribeChunkHandler } from './handlers/audio-transcribe-chunk/handler.js';
import { audioTranscribeEndHandler } from './handlers/audio-transcribe-end/handler.js';
import { meetingJoiningHandler } from './handlers/meeting-joining/handler.js';
import { meetingJoinedHandler } from './handlers/meeting-joined/handler.js';
import { meetingFailedHandler } from './handlers/meeting-failed/handler.js';

export function attachWebSocketServer(httpServer: HttpServer) {
  const wss = new WebSocketServer({ server: httpServer });

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
      try {
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
      } catch (error) {
        console.error(`failed to handle "${finaldata.type}" message:`, error)
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
