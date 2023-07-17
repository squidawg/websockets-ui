import { httpServer } from "./http_server/index.js";
import WebSocket, {RawData, WebSocketServer} from 'ws'
import {commandController} from "./ws_server/commandController.js";
import {GAME, PLAYER, Response, ROOM} from "./types.js";
import * as crypto from "crypto";
const HTTP_PORT = 3000;

interface CustomWebsocket extends WebSocket{
    id?:string
}

httpServer.listen(HTTP_PORT, () => {
    console.log(`Start static http server on the ${HTTP_PORT} port!`);
});
const wsServer = new WebSocketServer({ server: httpServer });

wsServer.on('connection', (connection:CustomWebsocket, req) => {
    console.log('received a new connection');
    const uuid = crypto.randomBytes(20).toString('hex')
    connection.id = uuid;
    connection.on('message', async (data:RawData) => {
        const response:Response = commandController(uuid,data)!;
        switch (response.type){
            case PLAYER.REG:
                wsServer.clients.forEach((client:CustomWebsocket) => {
                    response.payload.forEach((res) => {
                        if(res.id === client.id){
                            res.id = 0;
                            client.send(JSON.stringify(res));
                        }
                        client.send(JSON.stringify(res));
                    })
                });
                break;
            case ROOM.UPDATE_ROOM:
                wsServer.clients.forEach((client:CustomWebsocket) => {
                    client.send(JSON.stringify(response.payload.at(0)));
                });
                break;
            case ROOM.ADD_PLAYER:
                wsServer.clients.forEach((client:CustomWebsocket) => {
                    response.payload.forEach((res) => {
                        if(res.id === client.id){
                            res.id = 0;
                            client.send(JSON.stringify(res));
                        }
                    })
                });
                break;
            case ROOM.START_GAME:
                wsServer.clients.forEach((client:CustomWebsocket) => {
                    response.payload.forEach((res) => {
                        if(res.id === client.id){
                            res.id = 0;
                            client.send(JSON.stringify(res));
                        }
                    })
                });
                break;
            case GAME.ATTACK:
                wsServer.clients.forEach((client:CustomWebsocket) =>{
                    response.payload.forEach(res => {
                        client.send(JSON.stringify(res))
                    })
                })
                break
            default:
                break;
        }
    })
})
