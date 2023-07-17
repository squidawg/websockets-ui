import {Room, ShipData, User} from "./types.js";

export class Database {
    private users:User[] = [];
    private rooms:Room[] = [];
    private ships:ShipData[] = [];

    addRoom(room:Room){
        this.rooms.push(room);
    }
    addUser(user:User){
        this.users.push(user);
    }
    get getUsers() {
        return this.users
    }
    getUserById = (uId:string) => {
        return this.users.find(user => user.getUserId === uId);
    }
    getRoomById = (uId:number) => {
        return this.rooms.find(room => room.getRoomId === uId);
    }
    getRoomByUser = (uId:string) => {
        return this.rooms.map(room => room
            .getUsers
            .find(user => user.getUserId === uId) ? room : room).at(0)
    }
}

