
export interface Payload {
    uid?:string,
    type:string
    data:{}|""
    id:number
}

export interface Ships {
    position:{x:number, y:number},
    direction:boolean,
    type:string,
    length:number
}
export interface Response {
    type:ROOM|PLAYER|string,
    payload:Payload[]
}
export class User {
    private readonly uid: number;
    private readonly name: string;
    private readonly password: string;
    private ships:ShipData[] = [];
    constructor(uid:number,name:string, password: string) {
        this.uid = uid;
        this.name = name;
        this.password = password;
    }

    addShip(ship:ShipData){
        this.ships.push(ship)
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
    private readonly roomId:number;
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

export class ShipData {
    private state: STATE = STATE.ACTIVE;
    private hitCounter = 0;
    private result:{
        state:STATE,
        x:number,
        y:number,
        attackState:boolean
    } = {
        state:STATE.ACTIVE,
        x:0,
        y:0,
        attackState:false
    };
    private shipData:Ships;
    private attackState = false;
    constructor(shipData:Ships){
        this.shipData = shipData;
    }
    setHitCounter(hit:number){
        this.hitCounter = hit
    }

    attackHandler(x:number,y:number){
        if(this.state === STATE.KILLED){
            return this.state
        }
        if(!this.shipData.direction){
            const minX = x >= this.shipData.position.x;
            const maxX = x <= this.shipData.position.x + this.shipData.length - 1;
            const staticY = y === this.shipData.position.y
            if(minX && maxX && staticY) {
                this.setHitCounter(this.hitCounter += 1)
                this.state = STATE.SHOT;
                this.attackState = true

            }
        }
        if(this.shipData.direction) {
            const minY = y >= this.shipData.position.y;
            const maxY = y <= this.shipData.position.y + this.shipData.length - 1;
            const staticX = x === this.shipData.position.x
            if(minY && maxY && staticX) {
                this.setHitCounter(this.hitCounter += 1)
                this.state = STATE.SHOT;
                this.attackState = true

            }
        }
        if(this.shipData.length === this.hitCounter){
            this.state = STATE.KILLED;
        }
        this.result = {state: this.state, x:x, y:y, attackState:this.attackState}


        return this.result;
    }
    get getState(){
        return this.result;
    }
    setAttackState(){
        this.attackState = false
    }
    get getAttackState(){
        return this.attackState
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

export enum STATE {
    MISS='miss',
    SHOT='shot',
    KILLED='killed',
    ACTIVE='active'
}
