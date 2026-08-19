import 'dotenv/config';
import http from 'node:http';
import { createApp } from './http/app.js';
import { attachWebSocketServer } from './ws/server.js';
import { meetingPostProcessWorker } from './queue/meeting-post-process/worker.js';
import { ENV } from './lib/ENV.js';
import { TranscribeManager as TM } from './services/transcribe-manager/transcribeManager.js';
import { dockerService } from './services/docker/docker.js';

const app = createApp();
export const TranscribeManager = new TM()

const server = http.createServer(app);
export const { broadcast } = attachWebSocketServer(server);

const port = Number(ENV.port ?? 3000);
server.listen(port, () => console.log(`sgmeet-bot listening on :${port}`));

const shutdown = async () => {
    console.log("Shutting down...");

    // 1. Start the 5-second emergency backup timer
    const forceExitTimeout = setTimeout(() => {
        console.error("Shutdown took too long! Forcing exit now...");
        process.exit(1);
    }, 5000);
    
    forceExitTimeout.unref(); 

    try {
        // 2. Wait for your workers to finish closing
        console.log("Stopping TranscribeManager...");
        await TranscribeManager.stopAll();

        console.log("Destroying Containers...");
        await dockerService.destroyAll();

        console.log("Closing post-process worker...");
        await meetingPostProcessWorker.close();

        // 3. Turn server.close into a modern async function so we can await it
        console.log("Closing HTTP server...");
        await new Promise((resolve) => server.close(resolve));
        
        console.log("All systems closed cleanly. Exiting.");
        process.exit(0);

    } catch (error) {
        console.error("Error during shutdown cleanup:", error);
        process.exit(1);
    }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
