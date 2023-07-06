import { httpServer } from "./http_server/index.js";
import {RawData, WebSocketServer} from 'ws'
import {commandController} from "./ws_server/commandController.js";
import {ROOM} from "./types.js";
const HTTP_PORT = 3000;

const wsServer = new WebSocketServer({ server: httpServer });


httpServer.listen(HTTP_PORT, () => {
    console.log(`Start static http server on the ${HTTP_PORT} port!`);
});


wsServer.on('connection', (connection, req) => {
    console.log('received a new connection')
    const id = String(req.headers['sec-websocket-key']);
    connection.on('message', async (data:RawData) => {
        const response = await commandController(id,data);
        if(await response.type === ROOM.UPDATE_ROOM){
            wsServer.clients.forEach(client =>{
                client.send(JSON.stringify(response));
            });
        }
        if(await response.type === 'add_user_to_room'){
            wsServer.clients.forEach(client =>{
                client.send(JSON.stringify(response));
            });
        }
        else{
            connection.send(JSON.stringify(response));
        }
    })
})
