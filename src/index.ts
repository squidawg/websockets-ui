import { httpServer } from "./http_server/index.js";
import {RawData, WebSocketServer} from 'ws'
import {commandController} from "./ws_server/commandController.js";
import {PLAYER, ROOM, RoomState} from "./types.js";
const HTTP_PORT = 3000;

const wsServer = new WebSocketServer({ server: httpServer });


httpServer.listen(HTTP_PORT, () => {
    console.log(`Start static http server on the ${HTTP_PORT} port!`);
});


wsServer.on('connection', (connection, req) => {
    console.log('received a new connection')
    const id = String(req.headers['sec-websocket-key']);
    connection.on('message', async (data:RawData) => {
        const response =  commandController(id,data)!;
        const cmd = response.at(0);
        if(cmd === PLAYER.REG){
            connection.send(JSON.stringify(response.at(-1)));
        }
        if(cmd === ROOM.UPDATE_ROOM){
            wsServer.clients.forEach(client => {
                client.send(JSON.stringify(response.at(-1)));
            });
        }
        if(cmd === ROOM.ADD_PLAYER){
            wsServer.clients.forEach(client =>{
                response.slice(1).forEach((res:RoomState) => {
                    console.log(res)
                    client.send(JSON.stringify(res));
                })
            });
        }
    })
})
