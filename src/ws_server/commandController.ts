import {RawData} from "ws";
import {Database} from "../db.js";
import {GAME, Payload, PLAYER, Response, Room, ROOM, ShipData, Ships, STATE, User} from "../types.js";

const database = new Database();

export const commandController = (id:number,data: RawData) => {

    const resData = JSON.parse(String(data));
    switch (resData.type) {
        case PLAYER.REG:
            const resDataParse = JSON.parse(resData.data)
            const user = new User(id, resDataParse.name, resDataParse.password);
            database.addUser(user);
            const userPayload = JSON.stringify(
                {
                    name: user.getName,
                    index: user.getUserId,
                    error: false,
                    errorText: '',
                }
            );
            const userRes:Response = {
                type:PLAYER.REG,
                payload: [onUpdateRequest(PLAYER.REG,resData,userPayload)]
            }
            return userRes
        case ROOM.CREATE_ROOM:
            const roomId =  Math.floor(Math.random() * 10) + 1;
            const newRoom = new Room(roomId);
            const roomCreator = database.getUserById(id);
            if(!roomCreator){
                console.log('user not found')
                return;
            }
            newRoom.addUser(roomCreator);
            database.addRoom(newRoom);
            const roomUpdPayload = JSON.stringify([
                {
                    roomId: roomId,
                    roomUsers:
                        [
                            {
                                name: roomCreator.getName,
                                index: roomCreator.getUserId,
                            }
                        ],
                },
            ]);
            const roomResponse:Response = {type:ROOM.UPDATE_ROOM, payload:[onUpdateRequest(ROOM.UPDATE_ROOM,resData,roomUpdPayload)]}
            return roomResponse;
        case ROOM.ADD_PLAYER:
            const roomIdParse = JSON.parse(resData.data);
            const roomById = database.getRoomById(roomIdParse['indexRoom']);
            const roomJoiner = database.getUserById(id);
            if(!roomById|| !roomJoiner){
                console.log('room not found');
                return;
            }
            roomById.addUser(roomJoiner);

            const usersUid = roomById.getUsers.map(user=>user.getUserId);
            const startGamePayload:Payload[] = []
            usersUid.forEach(user=> {
                const updRoom = JSON.stringify([]);
                const createGamePayload = JSON.stringify({
                    idGame: 0,
                    idPlayer: user,
                });
                startGamePayload.push(onUpdateRequest(ROOM.UPDATE_ROOM, resData, updRoom, user),
                    onUpdateRequest(ROOM.CREATE_GAME, resData, createGamePayload, user))
            })
            return {type:ROOM.ADD_PLAYER, payload:startGamePayload};
        case GAME.ADD_SHIPS:
            const shipsPayload = JSON.parse(resData.data);
            const userById = database.getUserById(id);
            shipsPayload.ships.forEach((ship:Ships)=>{
                const shipInstance = new ShipData(ship);
                userById!.addShip(shipInstance)
            })

            if(!userById){
                console.log('not such user was found');
                return;
            }
            const turnPayload = JSON.stringify({
                currentPlayer: id,
                id:0,
            });
            const foundRoom = database.getRoomByUser(id);

            if(!foundRoom){
                console.log("No room was found");
                return;
            }
            const isFullRoom = foundRoom!['users']
                .map(user => user.getShips.length > 0)
                .every(i => i);

            if(isFullRoom){
                const result:Payload[] = [];
                foundRoom!['users']
                    .forEach(user => {
                    result.push(
                        onUpdateRequest(ROOM.START_GAME, resData, JSON.stringify(user.getShips), user.getUserId),
                        onUpdateRequest(GAME.TURN, resData, turnPayload, user.getUserId));
                });
                const shipsResponse:Response = {type:ROOM.START_GAME, payload: result};
                return shipsResponse;
            }
            return {type:'', payload:[]};
        case GAME.ATTACK:
            const attackCoordinates = JSON.parse(resData.data);
            const shipPosition = database
                .getRoomByUser(id)!
                .getUsers
                .find((user:User) => user.getUserId !== id);
            shipPosition!.getShips.forEach((sh:ShipData)=> {
                 sh.attackHandler(attackCoordinates.x, attackCoordinates.y)
                }
            )
            const res = shipPosition!.getShips.find((ship:ShipData)=>
                ship.getAttackState
            )
            if(!res){
                console.log(`couldn't clear cache`);
                return;
            }
            res!.setAttackState()
            const attackPayload = JSON.stringify({
                position:attackCoordinates,
                currentPlayer: id,
                status: res!.getState.state
            });
            const updTurn = JSON.stringify({
                currentPlayer:shipPosition!.getUserId
            })
            const startGamePayloadTest:Payload[] = [];
            startGamePayloadTest.push(
                onUpdateRequest(GAME.ATTACK,resData, attackPayload,),
                onUpdateRequest(GAME.TURN,resData,updTurn))


            return {type:GAME.ATTACK, payload:startGamePayloadTest};
    }
}

const onUpdateRequest = (type:string,resData:Payload,  data:string, id:number=0):Payload => {
    resData.type = type;
    resData.id = id;
    if(data){
        resData.data = data;
    }
    return JSON.parse(JSON.stringify(resData));
}



