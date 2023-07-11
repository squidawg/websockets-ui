
export interface Payload {
    uid?:string,
    type:string
    data:{}|""
    id:number
}

export interface Ships {
    positions:{}
}
export interface Response {
    type:ROOM|PLAYER|string,
    payload:Payload[]
}

export class User {
    private readonly uid: number;
    private readonly name: string;
    private readonly password: string;
    private ships:Ships[] = [];
    constructor(uid:number,name:string, password: string) {
        this.uid = uid;
        this.name = name;
        this.password = password;
    }

    setShips(ships:Ships[]){
        this.ships = ships;
    }
    get getShips(){
        return this.ships;
    }
    get getUserId(){
        return this.uid;
    }
    get getName(){
        return this.name;
    }

}

export class Room {
    private roomId:number;
    private users: User[] = [];
    constructor(roomId:number) {
        this.roomId = roomId;
    }
    addUser(user:User){
        this.users.push(user);
    }
    get getUsers(){
        return this.users;
    }

    get getRoomId(){
        return this.roomId;
    }

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
