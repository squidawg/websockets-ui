import WebSocket from "ws";

export interface Payload {
    type:string,
    data:string,
    id?:string|number,
}

export interface Ships {
    position:{x:number, y:number},
    direction:boolean,
    type:string,
    length:number
}

export interface Response {
    type:ROOM|PLAYER|string,
    payload:Payload[],
}

export interface ShipdataPayload {
    state:STATE,
    x:number,
    y:number,
    attackState:boolean
}

export enum PLAYER {
    REG ='reg',
    UPDATE_WINNERS='update_winners',
}

export enum ROOM {
    CREATE_ROOM='create_room',
    CREATE_GAME='create_game',
    UPDATE_ROOM='update_room',
    ADD_PLAYER='add_user_to_room',
    START_GAME='start_game',
}

export enum GAME {
    ADD_SHIPS='add_ships',
    ATTACK='attack',
    RANDOM_ATTACK='randomAttack',
    TURN='turn',
    FINISH_GAME='finish',
}

export enum STATE {
    MISS='miss',
    SHOT='shot',
    KILLED='killed',
    ACTIVE='active'
}

export interface CustomWebsocket extends WebSocket {
    id?: string
}
