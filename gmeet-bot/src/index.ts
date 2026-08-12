import 'dotenv/config';
import http from 'node:http';
import { createApp } from './http/app.js';
import { attachWebSocketServer } from './ws/server.js';
import './queue/meeting.worker.js';
import { ENV } from './lib/ENV.js';
import { AudioManager } from './services/audio-manager/audioManager.js';

const app = createApp();
export const TranscribeManager = new AudioManager()

const server = http.createServer(app);
attachWebSocketServer(server);

const port = Number(ENV.port ?? 3000);
server.listen(port, () => console.log(`gmeet-bot listening on :${port}`));
