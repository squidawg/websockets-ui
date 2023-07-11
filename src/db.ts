import {Room, User} from "./types.js";

export class Database {
    private users:User[] = [];
    private rooms:Room[] = [];

    addRoom(room:Room){
        this.rooms.push(room);
    }
    addUser(user:User){
        this.users.push(user);
    }
    getUserById = (uId:number) => {
        return this.users.find(user => user.getUserId === uId);
    }
    getRoomById = (uId:number) => {
        return this.rooms.find(room => room.getRoomId === uId);
    }

    getRoomByUser = (uId:number) => {
        return this.rooms.map(room => room
            .getUsers
            .find(user => user.getUserId === uId) ? room : false).at(0)
    }
}

