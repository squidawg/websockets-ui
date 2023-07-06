export interface User {
    uid?:string,
    type: string,
    data:{
        name:string,
        password:string
        error?:boolean,
        errorText?:string
    }
    id:number
}
export interface CreateGame {
    type: string,
    data: string
    id: number,

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
    FINISH_GAME='finish'
}

export enum GAME {
    ADD_SHIPS='add_ships',
    ATTACK='attack',
    RANDOM_ATTACK='randomAttack',
    TURN='turn'
}

export interface RoomState {
    type: string,
    data:string,
    id: number,
}
