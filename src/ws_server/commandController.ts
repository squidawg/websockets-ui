import {RawData} from "ws";
import {onUpdateDb, onGetUser} from "../db.js";
import {PLAYER, ROOM, RoomState} from "../types.js";

export const commandController = async (id:string,data: RawData) => {
    const resData = JSON.parse(String(data));
    switch (resData.type) {
        case PLAYER.REG:
            onUpdateDb(id, resData);
            return resData;
        case ROOM.CREATE_ROOM:
            console.log(resData)
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
            return onUpdateRequest(ROOM.UPDATE_ROOM, data, resData)
    }
}

const onUpdateRequest = (type:string, data:string, resData:RoomState) => {
    resData.type = type;
    resData.data = data
    return resData
}
