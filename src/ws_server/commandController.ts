import {RawData} from "ws";
import {onUpdateDb, onGetUser} from "../db.js";
import {GAME, Payload, PLAYER, ROOM} from "../types.js";

export const commandController = (id:string,data: RawData) => {
    const resData = JSON.parse(String(data));
    switch (resData.type) {
        case PLAYER.REG:
            onUpdateDb(id, resData);
            const userPayload = JSON.stringify(
                {
                    name:onGetUser(id)?.name,
                    index: onGetUser(id)?.id,
                    error: false,
                    errorText: '',
                }
            )
            return [PLAYER.REG, onUpdateRequest(PLAYER.REG,resData,userPayload)];
        case ROOM.CREATE_ROOM:
            const roomUpdPayload = JSON.stringify([
                {
                    roomId: Math.floor(Math.random() * 10) + 1,
                    roomUsers:
                        [
                            {
                                name: onGetUser(id)?.name,
                                index: onGetUser(id)?.id,
                            }
                        ],
                },
            ]);
            return [ROOM.UPDATE_ROOM, onUpdateRequest(ROOM.UPDATE_ROOM,resData,roomUpdPayload)];
        case ROOM.ADD_PLAYER:
            const createGamePayload = JSON.stringify({
                idGame: 0,
                idPlayer: onGetUser(id)?.id,
            })
            const updRoom = JSON.stringify([])
            return [
                ROOM.ADD_PLAYER,
                onUpdateRequest(ROOM.UPDATE_ROOM,resData,updRoom),
                onUpdateRequest(ROOM.CREATE_GAME,resData,createGamePayload)
            ]
        case GAME.ADD_SHIPS:
            const shipsPayload = JSON.parse(resData.data)
            const turnPayload = JSON.stringify({
                currentPlayer: onGetUser(id)?.id,
                id:0
            })
            return [
                ROOM.START_GAME,
                onUpdateRequest(ROOM.START_GAME,resData,shipsPayload['ships']),
                onUpdateRequest(GAME.TURN,resData,turnPayload)];
        case GAME.ATTACK:
    }
}

const onUpdateRequest = (type:string,resData:Payload,  data:string):Payload => {
    resData.type = type;
    if(data){
        resData.data = data;
    }
    return JSON.parse(JSON.stringify(resData));
}
