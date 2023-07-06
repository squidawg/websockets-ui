import {RawData} from "ws";
import {onUpdateDb, onGetUser} from "../db.js";
import {PLAYER, ROOM, RoomState} from "../types.js";

export const commandController = (id:string,data: RawData)=> {
    const resData = JSON.parse(String(data));
    switch (resData.type) {
        case PLAYER.REG:
            onUpdateDb(id, resData);
            return [PLAYER.REG, resData];
        case ROOM.CREATE_ROOM:
            const data = JSON.stringify([
                {
                    roomId: 0,
                    roomUsers:
                        [
                            {
                                name: onGetUser(id),
                                index: 0,
                            }
                        ],
                },
            ]);
            return [ROOM.UPDATE_ROOM, onUpdateRequest(ROOM.UPDATE_ROOM,resData,data)];
        case ROOM.ADD_PLAYER:
            const createGame = JSON.stringify({
                data:
                    JSON.stringify({
                        idGame: 0,
                        idPlayer: 0,
                    })
            })
            const updRoom = JSON.stringify({data: []})
            const onCreateGame = onUpdateRequest(ROOM.CREATE_GAME,resData,createGame);
            const onUpdateRoom = onUpdateRequest(ROOM.UPDATE_ROOM,resData,updRoom);
            return [ROOM.ADD_PLAYER, onCreateGame, onUpdateRoom]
    }
}

const onUpdateRequest = (type:string,resData:RoomState,  data:string):RoomState => {
    resData.type = type;
    if(data){
        resData.data = data
    }
    return JSON.parse(JSON.stringify(resData))
}
