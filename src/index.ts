import { httpServer } from "./http_server/index.js";
import WebSocket, {RawData, WebSocketServer} from 'ws'
import {commandController} from "./ws_server/commandController.js";
import {GAME, PLAYER, ROOM} from "./types.js";
const HTTP_PORT = 3000;

httpServer.listen(HTTP_PORT, () => {
    console.log(`Start static http server on the ${HTTP_PORT} port!`);
});

const wsServer = new WebSocketServer({ server: httpServer });
export let state = 0

wsServer.on('connection', (connection, req) => {
    console.log('received a new connection')

    const id = String(req.headers['sec-websocket-key']);

    connection.on('message', async (data:RawData) => {
        const response =  commandController(id,data)!;
        const cmd = response.at(0);
        switch (cmd){
            case PLAYER.REG:
                connection.send(JSON.stringify(response.at(-1)));
                break;
            case ROOM.UPDATE_ROOM:
                wsServer.clients.forEach(client => {
                    client.send(JSON.stringify(response.at(-1)));
                });
                break;
            case ROOM.ADD_PLAYER:
                wsServer.clients.forEach(client =>{
                    response.slice(1).forEach((res) => {
                        client.send(JSON.stringify(res));
                    })
                });
                break;
            case ROOM.START_GAME:
                if(wsServer.clients.size === 2){
                    response.slice(1)!.forEach((res) => {
                        connection.send(JSON.stringify(res));
                        })
                }
                break;
        }
    })
})
