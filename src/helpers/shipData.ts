import {ShipdataPayload, Ships, STATE} from "../types.js";

export class ShipData {
    private state: STATE = STATE.ACTIVE;
    private hitCounter = 0;
    private result: ShipdataPayload = {
        state: STATE.ACTIVE,
        x: 0,
        y: 0,
        attackState: false
    };
    private readonly shipData: Ships;
    private attackState = false;

    constructor(shipData: Ships) {
        this.shipData = shipData;
    }

    private setHitCounter(hit: number) {
        this.hitCounter = hit;
    }

    attackHandler(x: number, y: number) {
        if (this.state === STATE.KILLED) {
            return this.state
        }
        if (!this.shipData.direction) {
            const minX = x >= this.shipData.position.x;
            const maxX = x <= this.shipData.position.x + this.shipData.length - 1;
            const staticY = y === this.shipData.position.y;
            if (minX && maxX && staticY) {
                this.setHitCounter(this.hitCounter += 1);
                this.state = STATE.SHOT;
                this.attackState = true;

            } else {
                this.state = STATE.MISS;
                return this.result;
            }

        }
        if (this.shipData.direction) {
            const minY = y >= this.shipData.position.y;
            const maxY = y <= this.shipData.position.y + this.shipData.length - 1;
            const staticX = x === this.shipData.position.x;
            if (minY && maxY && staticX) {
                this.setHitCounter(this.hitCounter += 1);
                this.state = STATE.SHOT;
                this.attackState = true;

            } else {
                this.state = STATE.MISS;
                return this.result
            }

        }
        if (this.shipData.length === this.hitCounter) {
            this.state = STATE.KILLED;
        }

        this.result = {state: this.state, x: x, y: y, attackState: this.attackState}

        return this.result;
    }

    get stateGetter() {
        return this.state
    }

    get getState() {
        return this.result;
    }

    setAttackState() {
        this.attackState = false;
    }

    get getAttackState() {
        return this.attackState;
    }

    get getShips() {
        return this.shipData
    }

}
