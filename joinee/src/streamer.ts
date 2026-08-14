import {WebSocket} from 'ws';
export const initializeWebsocket = (consumer:string) => {
    const ws = new WebSocket(consumer);
    

    return ws
}