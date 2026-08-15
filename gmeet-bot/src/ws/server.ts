import type { Server as HttpServer } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { WSEventSchema } from './handlers/schema';
import { audioTranscribeChunkHandler } from './handlers/audio-transcribe-chunk/handler';
import { audioTranscribeEndHandler } from './handlers/audio-transcribe-end/handler';

export function attachWebSocketServer(httpServer: HttpServer) {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (socket) => {
    console.log("client connected")
    socket.on('message', async(data) => {
      const eventData = JSON.parse(data.toString())
      const parsedData = WSEventSchema.safeParse(eventData)
      if(parsedData.error){
        console.log(parsedData.error)
        throw Error()
      }
      
      const finaldata = parsedData.data
      switch(finaldata.type){
        case "audio-transcribe-chunk":
          await audioTranscribeChunkHandler(finaldata)
          break
        case "audio-transcribe-end":
          await audioTranscribeEndHandler(finaldata)
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
