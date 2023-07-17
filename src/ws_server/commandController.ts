import {RawData} from "ws";
import {Database} from "../db.js";
import {GAME, Payload, PLAYER, Response, Room, ROOM, ShipData, Ships, STATE, User} from "../types.js";

const database = new Database();

const createUser = async (user:User) => {
    return new Promise((resolve, reject) => {
        if(!user){
            reject({type:'',payload:[]});
        }
    });
}

export const commandController = (uId:string,data: RawData) => {
    const resData:Payload = JSON.parse(String(data));

    switch (resData.type) {
        case PLAYER.REG:
            const userData = JSON.parse(resData.data);
            const user = new User(uId, userData.name, userData.password);

            const isUserExists:User = database
                .getUsers
                .find(user=> user.getName === userData.name)!;

            database.addUser(user);

            user.setIndex(database
                .getUsers
                .findIndex(user => user.getUserId === uId));


            let userPayload = JSON.stringify(
                {
                    name: user.getName,
                    index: user.userIndex,
                    error: false,
                    errorText: '',
                }
            );
            const onUpdatePayload = (isUserExists:User) => {
                if(isUserExists){
                    if(isUserExists!.getPassword === userData.password) {
                        userPayload = JSON.stringify(
                            {
                                name: isUserExists.getName,
                                index: isUserExists.userIndex,
                                error: false,
                                errorText: '',
                            }
                        );
                    }
                    else {
                        return{type:'',payload:[]}
                    }
                }
            }
            if(isUserExists){
                if(isUserExists!.getPassword === userData.password) {
                    userPayload = JSON.stringify(
                        {
                            name: isUserExists.getName,
                            index: isUserExists.userIndex,
                            error: false,
                            errorText: '',
                        }
                    );
                }
                else {
                    return{type:'',payload:[]}
                }
            }

            const allUsers: {wins: number, name: string}[] = [];
            database.getUsers.forEach(user => {
                const winnerPayload = ({
                    name: user!.getName,
                    wins: user!.currentScore
                });
                allUsers.push(winnerPayload);
            })

            const regPayload:Payload[] = [];
            regPayload.push(
                onUpdateRequest(PLAYER.REG,resData,userPayload,user.getUserId),
                onUpdateRequest(PLAYER.UPDATE_WINNERS,resData,JSON.stringify(allUsers))
                );

            const userResponse:Response = {
                type:PLAYER.REG,
                payload: regPayload
            };

            return userResponse;
        case ROOM.CREATE_ROOM:
            const roomId =  Math.floor(Math.random() * 10) + 1;
            const newRoom = new Room(roomId);
            const roomCreator = database!.getUserById(uId);

            newRoom.addUser(roomCreator!);
            database.addRoom(newRoom);
            const roomPayload = JSON.stringify([
                {
                    roomId: roomId,
                    roomUsers:
                        [
                            {
                                name: roomCreator!.getName,
                                index: roomCreator!.userIndex,
                            }
                        ],
                },
            ]);
            const roomResponse:Response = {type:ROOM.UPDATE_ROOM, payload:[onUpdateRequest(ROOM.UPDATE_ROOM,resData,roomPayload)]}
            return roomResponse;
        case ROOM.ADD_PLAYER:
            const parsedRoom = JSON.parse(resData.data);
            const room = database.getRoomById(parsedRoom['indexRoom']);
            const roomJoiner = database.getUserById(uId);
            if(!room || !roomJoiner){
                console.log('room not found');
                return;
            }
            room.addUser(roomJoiner);

            const roomUsers = room.getUsers;
            const startGamePayload:Payload[] = [];
            roomUsers.forEach(user=> {
                const createGamePayload = JSON.stringify({
                    idGame: 0,
                    idPlayer: user.userIndex,
                });
                startGamePayload.push(
                    onUpdateRequest(ROOM.UPDATE_ROOM, resData, JSON.stringify([]), user.getUserId),
                    onUpdateRequest(ROOM.CREATE_GAME, resData, createGamePayload, user.getUserId)
                );
            });
            return {type:ROOM.ADD_PLAYER, payload:startGamePayload};
        case GAME.ADD_SHIPS:
            const shipCoordinates = JSON.parse(resData.data);
            const userById = database.getUserById(uId);
            shipCoordinates.ships.forEach((ship:Ships) => {
                const shipInstance = new ShipData(ship);
                userById!.addShip(shipInstance);
            });

            if(!userById){
                console.log('not such user was found');
                return;
            }

            const turnPayload = JSON.stringify({
                currentPlayer: userById.userIndex,
                id:0,
            });

            const foundRoom = database.getRoomByUser(uId);

            if(!foundRoom){
                console.log("No room was found");
                return;
            }

            const isFullRoom = foundRoom!['users']
                .map(user => user.getShips.length > 0)
                .every(i => i);

            if(isFullRoom) {
                foundRoom.setNextUser(userById.getUserId);
                const result:Payload[] = [];
                foundRoom!['users']
                    .forEach(user => {
                        const  shipCoordinates = user.getShips.map(ship=> ship.getShips);
                        result.push(
                        onUpdateRequest(ROOM.START_GAME, resData, JSON.stringify(shipCoordinates), user.getUserId),
                        onUpdateRequest(GAME.TURN, resData, turnPayload, user.getUserId));
                });
                const shipsResponse:Response = {type:ROOM.START_GAME, payload: result};
                return shipsResponse;
            }
            return {type:'', payload:[]};
        case GAME.ATTACK:
            const isAttacker = database.getRoomByUser(uId);
            const attackCoordinates = JSON.parse(resData.data);
            const secondPlayer = database
                .getRoomByUser(uId)!
                .getUsers
                .find((user:User) => user.getUserId !== uId);

            if(isAttacker!['nextUser'] === database.getUserById(uId)!.getUserId){
                secondPlayer!
                    .getShips
                    .forEach((shipData:ShipData)=> {
                            shipData.attackHandler(attackCoordinates.x, attackCoordinates.y)
                        }
                    );

                const attackResult = secondPlayer!.getShips.find((ship:ShipData) =>
                    ship.getAttackState);

                if(attackResult) {
                    attackResult!.setAttackState();
                }

                const currentUser = database
                    .getRoomByUser(uId)!
                    .getUsers
                    .find((user:User) => user.getUserId === uId);

                const opponentPlayer = database
                    .getRoomByUser(uId)!
                    .getUsers
                    .find((user:User) => user.getUserId !== uId);

                const attackPayload = JSON.stringify({
                    position:{x:attackCoordinates.x, y:attackCoordinates.y},
                    currentPlayer: currentUser!.userIndex,
                    status: attackResult?.getState?.state || STATE.MISS
                });

                let updTurn = JSON.stringify({
                    currentPlayer:opponentPlayer!.userIndex
                });
                isAttacker!['nextUser'] = opponentPlayer!.getUserId

                const startGamePayloadTest:Payload[] = [];
                startGamePayloadTest.push(
                    onUpdateRequest(GAME.ATTACK,resData, attackPayload),
                );

                if(attackResult?.getState?.state === STATE.KILLED) {
                    const currentShip:Ships = attackResult.getShips;
                    const minX = currentShip.position.x - 1 === -1 ? 0 : currentShip.position.x - 1;
                    const minY = currentShip.position.y - 1 === -1 ? 0:currentShip.position.y - 1;

                    if(!currentShip.direction) {
                        const maxX = currentShip.position.x + currentShip.length >= 10 ?
                            9 :currentShip.position.x + currentShip.length;
                        const maxY = currentShip.position.y + 2 >= 10 ? 10: currentShip.position.y + 2;
                        for(let i = minY; i < maxY; i++) {
                            for(let j = minX; j <= maxX; j++) {
                                if(!(j >= currentShip.position.x
                                    && j < currentShip.position.x + currentShip.length
                                    && i === currentShip.position.y)) {
                                    const missPayload = JSON.stringify({
                                        position:{x:j, y:i},
                                        currentPlayer:currentUser!.userIndex,
                                        state:STATE.MISS
                                    })
                                    startGamePayloadTest.push(onUpdateRequest(GAME.ATTACK, resData, missPayload))
                                }
                            }
                        }
                    }
                    if(currentShip.direction) {
                        const maxY = currentShip.position.y + currentShip.length >= 10 ?
                            9 :currentShip.position.y + currentShip.length;
                        const maxX = currentShip.position.x + 2 >= 10 ? 10: currentShip.position.x + 2;
                        for(let j = minY; j <= maxY; j++) {
                            for(let i = minX; i < maxX; i++) {
                                if(!(j >= currentShip.position.y
                                    && j < currentShip.position.y + currentShip.length
                                    && i === currentShip.position.x)) {
                                    const missPayload = JSON.stringify({
                                        position:{x:i, y:j},
                                        currentPlayer:currentUser!.userIndex,
                                        state:STATE.MISS
                                    })
                                    startGamePayloadTest.push(onUpdateRequest(GAME.ATTACK, resData, missPayload))
                                }
                            }
                        }
                    }
                    isAttacker!['nextUser'] = currentUser!.getUserId
                    updTurn = JSON.stringify({
                        currentPlayer:currentUser!.userIndex
                    });
                }
                startGamePayloadTest.push(onUpdateRequest(GAME.TURN,resData,updTurn));
                const isGameOver = secondPlayer!.getShips.every( ship=>
                    ship.stateGetter === STATE.KILLED
                )
                if(isGameOver){
                    const curUser = database.getUserById(uId);
                    curUser!.setScore()
                    const finPayload = JSON.stringify({
                        winPlayer: currentUser!.userIndex,
                    })
                    const winnerPayload = JSON.stringify([{
                        name: curUser!.getName,
                        wins: curUser!.currentScore
                    }])
                    startGamePayloadTest.push(
                        onUpdateRequest(GAME.FINISH_GAME, resData ,finPayload),
                        onUpdateRequest(PLAYER.UPDATE_WINNERS,resData,winnerPayload))
                }
                return {type:GAME.ATTACK, payload:startGamePayloadTest};
            }
            return{type:GAME.ATTACK, payload:[]};


        case GAME.RANDOM_ATTACK:
            const randomX = Math.floor(Math.random() * 10)
            const randomY = Math.floor(Math.random() * 10)

            const randomAttack = database
                .getRoomByUser(uId)!
                .getUsers
                .find((user:User) => user.getUserId !== uId);

            randomAttack!
                .getShips
                .forEach((sh:ShipData)=> {
                    sh.attackHandler(randomX, randomY)
                })
            const response = randomAttack!.getShips.find((ship:ShipData) =>
                ship.getAttackState);

            if(response){
                response!.setAttackState();
            }
            const uIndRandom = database
                .getRoomByUser(uId)!
                .getUsers
                .find((user:User) => user.getUserId === uId);
            const opponentPlayerRandom = database
                .getRoomByUser(uId)!
                .getUsers
                .find((user:User) => user.getUserId !== uId);

            const randomAttackPayload = JSON.stringify({
                position:{x:randomX,y:randomY},
                currentPlayer: uIndRandom!.userIndex,
                status: response?.getState?.state || STATE.MISS
            });

            const updRandomTurn = JSON.stringify({
                currentPlayer:opponentPlayerRandom!.userIndex
            });

            const randomPayload:Payload[] = [];
            randomPayload.push(
                onUpdateRequest(GAME.ATTACK,resData, randomAttackPayload),
                onUpdateRequest(GAME.TURN,resData,updRandomTurn));

            return {type:GAME.ATTACK, payload:randomPayload};
    }
}

const onUpdateRequest = (type:string,resData:Payload,  data:string, id:string|number=0):Payload => {
    resData.type = type;
    resData.id = id;
    resData.data = data;
    return JSON.parse(JSON.stringify(resData));
}



