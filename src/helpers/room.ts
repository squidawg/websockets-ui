import {User} from "./user.js";

export class Room {
    private readonly roomId: number;
    private nextUser = '';
    private users: User[] = [];

    constructor(roomId: number) {
        this.roomId = roomId;
    }

    setNextUser(user: string) {
        this.nextUser = user;
    }

    addUser(user: User) {
        this.users.push(user);
    }

    get getUsers() {
        return this.users;
    }

    get getRoomId() {
        return this.roomId;
    }

}
