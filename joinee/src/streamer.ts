import {WebSocket} from 'ws';
export const initializeWebsocket = (consumer:string) => {
    const ws = new WebSocket(consumer);
    ws.onmessage = (event) => {
    };
    ws.onopen = () => {
    };
    ws.onclose = () => {
    };

    return ws
}