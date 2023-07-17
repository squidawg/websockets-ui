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

export class User {
    private score:number = 0;
    private turnPlayer = false
    private readonly uid: string;
    private readonly name: string;
    private readonly password: string;
    private index:number = 0;
    private ships:ShipData[] = [];
    constructor(uid:string,name:string, password: string) {
        this.uid = uid;
        this.name = name;
        this.password = password;
    }
    setTurn(){
        this.turnPlayer = !this.turnPlayer;
    };
    get getTurn(){
        return this.turnPlayer;
    };
    addShip(ship:ShipData){
        this.ships.push(ship);
    };
    setScore(){
        this.score += 1;
    };
    setIndex(i:number){
        this.index = i;
    };

    get getShips(){
        return this.ships;
    };
    get getUserId(){
        return this.uid;
    };
    get getName(){
        return this.name;
    };
    get getPassword(){
        return this.password;
    };
    get currentScore(){
        return this.score;
    };
    get userIndex(){
        return this.index;
    };

}

export class Room {
    private readonly roomId:number;
    private nextUser:string = '';
    private users: User[] = [];
    constructor(roomId:number) {
        this.roomId = roomId;
    }
    setNextUser(user:string){
        this.nextUser = user;
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

export class ShipData {
    private state: STATE = STATE.ACTIVE;
    private hitCounter = 0;
    private result:ShipdataPayload = {
        state:STATE.ACTIVE,
        x:0,
        y:0,
        attackState:false
    };
    private readonly shipData:Ships;
    private attackState = false;
    constructor(shipData:Ships){
        this.shipData = shipData;
    }
    private setHitCounter(hit:number){
        this.hitCounter = hit;
    }

    attackHandler(x:number,y:number){
        if(this.state === STATE.KILLED){
            return this.state
        }
        if(!this.shipData.direction){
            const minX = x >= this.shipData.position.x;
            const maxX = x <= this.shipData.position.x + this.shipData.length - 1;
            const staticY = y === this.shipData.position.y;
            if(minX && maxX && staticY) {
                this.setHitCounter(this.hitCounter += 1);
                this.state = STATE.SHOT;
                this.attackState = true;

            }
            else {
                this.state = STATE.MISS;
                return this.result;
            }

        }
        if(this.shipData.direction) {
            const minY = y >= this.shipData.position.y;
            const maxY = y <= this.shipData.position.y + this.shipData.length - 1;
            const staticX = x === this.shipData.position.x;
            if(minY && maxY && staticX) {
                this.setHitCounter(this.hitCounter += 1);
                this.state = STATE.SHOT;
                this.attackState = true;

            }
            else {
                this.state = STATE.MISS;
                return this.result
            }

        }
        if(this.shipData.length === this.hitCounter){
            this.state = STATE.KILLED;
        }

        this.result = {state: this.state, x:x, y:y, attackState:this.attackState}

        return this.result;
    }
    get stateGetter(){
        return this.state
    }
    get getState(){
        return this.result;
    }
    setAttackState(){
        this.attackState = false;
    }
    get getAttackState(){
        return this.attackState;
    }
    get getShips(){
        return this.shipData
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
