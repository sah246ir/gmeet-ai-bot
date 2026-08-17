import axios, { type AxiosInstance } from "axios";
import { ENV } from "../../lib/ENV.js";

interface CreateContainerParams {
    meetingId: string;
    meetingUrl: string;
    image?: string;
    waitForReady?: boolean;
}

export class DockerService {
    private client: AxiosInstance;
    private containers = new Map<string, string>(); // meetingId -> containerId

    constructor() {
        this.client = axios.create({
            socketPath: "/var/run/docker.sock",
            baseURL: `http://localhost/v${ENV.dockerVersion ?? "1.46"}`,
            headers: { "Content-Type": "application/json" },
        });
    }

    async createContainer({
        meetingId,
        meetingUrl,
        image = ENV.dockerImage,
        waitForReady = false,
    }: CreateContainerParams): Promise<{ containerId: string; containerIP: string }> {
        if (!ENV.useDocker) {
            throw new Error("please set USE_DOCKER=1 to use the local docker daemon");
        }
        if (!image) {
            throw new Error("no docker image: pass one explicitly or set DOCKER_IMAGE");
        }

        const createResponse = await this.client.post("/containers/create", {
            Image: image,
            Env: [
                `MEETING_URL=${meetingUrl}`,
                `CONSUMER_URL=${ENV.consumerUrl}`,
                `MEETING_ID=${meetingId}`,
            ],
        });
        const containerId = createResponse.data.Id as string;

        await this.client.post(`/containers/${containerId}/start`);

        const inspectResponse = await this.client.get(`/containers/${containerId}/json`);
        const containerIP = inspectResponse.data.NetworkSettings.IPAddress as string;


        this.containers.set(meetingId, containerId);

        return { containerId, containerIP };
    }

    async destroyContainer(meetingId: string): Promise<void> {
        const containerId = this.containers.get(meetingId);
        if (!containerId) {
            throw new Error(`no active container for meeting ${meetingId}`);
        }

        // 304 means the container was already stopped (e.g. it exited on its own) — not an error.
        await this.client.post(`/containers/${containerId}/stop`, undefined, {
            validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
        });
        await this.client.delete(`/containers/${containerId}`);

        this.containers.delete(meetingId);
    }

    getContainerId(meetingId: string): string | undefined {
        return this.containers.get(meetingId);
    }

    private async waitForReachable(url: string, timeout: number): Promise<void> {
        const interval = 1000;
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            try {
                const response = await fetch(url);
                if (response.ok) return;
            } catch {
                // ignore and retry
            }
            await new Promise((resolve) => setTimeout(resolve, interval));
        }

        throw new Error(`Container did not become reachable at ${url} within ${timeout}ms`);
    }
}

export const dockerService = new DockerService();
