import {ShipData} from "./shipData.js";

export class User {
    private score: number = 0;
    private readonly uid: string;
    private readonly name: string;
    private readonly password: string;
    private index: number = 0;
    private ships: ShipData[] = [];

    constructor(uid: string, name: string, password: string) {
        this.uid = uid;
        this.name = name;
        this.password = password;
    }

    addShip(ship: ShipData) {
        this.ships.push(ship);
    };

    setScore() {
        this.score += 1;
    };

    setIndex(i: number) {
        this.index = i;
    };

    get getShips() {
        return this.ships;
    };

    get getUserId() {
        return this.uid;
    };

    get getName() {
        return this.name;
    };

    get getPassword() {
        return this.password;
    };

    get currentScore() {
        return this.score;
    };

    get userIndex() {
        return this.index;
    };

}
