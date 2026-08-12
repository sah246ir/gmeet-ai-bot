import type { Server as HttpServer } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { WSEventSchema } from './handlers/schema';
import { audioTranscribeChunkHandler } from './handlers/audio-transcribe-chunk/handler';
import { audioTranscribeEndHandler } from './handlers/audio-transcribe-end/handler';

export function attachWebSocketServer(httpServer: HttpServer) {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (socket) => {
    socket.on('message', (data) => {
      const eventData = JSON.parse(data.toString())
      const parsedData = WSEventSchema.safeParse(eventData)
      if(parsedData.error) throw Error()
      
      const finaldata = parsedData.data
      switch(finaldata.type){
        case "audio-transcribe-chunk":
          audioTranscribeChunkHandler(finaldata)
          break
        case "audio-transcribe-end":
          audioTranscribeEndHandler(finaldata)
          break
        default:

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
