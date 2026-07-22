import 'dotenv/config';
import http from 'node:http';
import { createApp } from './http/app.js';
import { attachWebSocketServer } from './ws/server.js';
import './queue/meeting.worker.js';

const app = createApp();
const server = http.createServer(app);
attachWebSocketServer(server);

const port = Number(process.env.PORT ?? 3000);
server.listen(port, () => console.log(`gmeet-bot listening on :${port}`));
