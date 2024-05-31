import { _decorator, CCFloat, Component, director, Enum, game, MeshRenderer, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum Level {
    EARTHQUAKE_5A,
    EARTHQUAKE_5B,
    EARTHQUAKE_6A,
    EARTHQUAKE_6B,
    EARTHQUAKE_7A,
    EARTHQUAKE_0
}

@ccclass('EarthquakeAlarmModel')
export class EarthquakeAlarmModel extends Component {

    @property(CCFloat)
    maxPower: number[] = [];

    @property({ type: Enum(Level) })
    maxPowerLevel: Level[] = [];

    private _currentMaxPower = 1.0;

    private _level: Level = Level.EARTHQUAKE_5A;
    set level(level: Level) {
        this._level = level;
        if (level == Level.EARTHQUAKE_0) {
            this._currentMaxPower = 0;
        } else {
            this._currentMaxPower = this.maxPower[this.maxPowerLevel.indexOf(level)];
        }

    }

    private _power: number = 1.0;
    set power(power) {
        this._power = power;
    }

    get power() {
        return this._power;
    }

    protected onLoad(): void {
        const powers = this.node.name.split("_");
        if (powers.length > 1) {
            this.maxPower[0] = parseInt(powers[1]);
            this.maxPower[1] = parseInt(powers[2]);
            this.maxPower[2] = parseInt(powers[3]);
            this.maxPower[3] = parseInt(powers[4]);
            this.maxPower[4] = parseInt(powers[5]);
        }
    }

    start() {
        this.level = Level.EARTHQUAKE_5A;
        this.getComponentInChildren(MeshRenderer).node.active = false;
    }

    update(deltaTime: number) {
        if (this._currentMaxPower == 0) {
            this.power = 0;
            return;
        }
        this.power = ((Math.sin(game.totalTime * 0.01) + 1.0) * 0.5 * 0.5 + 0.5) * this._currentMaxPower;
    }
}


