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

    // @property(CCFloat)
    // maxPower1: number = 0;

    // @property(CCFloat)
    // maxPower2: number = 0;

    // @property(CCFloat)
    // maxPower3: number = 0;

    // @property(CCFloat)
    // maxPower4: number = 0;

    // @property(CCFloat)
    // maxPower5: number = 0;

    @property(CCFloat)
    private maxPower: number[] = [];

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

    private powerMap(id) {
        switch (id) {
            case "0": return 0;
            case "1": return 0.25;
            case "2": return 2;
        }
    }

    protected onLoad(): void {
        const powers = this.node.name.split("_");
        if (powers.length > 1) {
            this.maxPower[0] = this.powerMap(powers[1]);
            this.maxPower[1] = this.powerMap(powers[2]);
            this.maxPower[2] = this.powerMap(powers[3]);
            this.maxPower[3] = this.powerMap(powers[4]);
            this.maxPower[4] = this.powerMap(powers[5]);
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
        this.power = ((Math.sin(game.totalTime * 0.005) + 1.0) * 0.5 * 0.1 + 0.9) * this._currentMaxPower;
    }
}


