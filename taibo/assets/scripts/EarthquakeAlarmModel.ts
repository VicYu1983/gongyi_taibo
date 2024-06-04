import { _decorator, CCFloat, Color, Component, director, Enum, game, MeshRenderer, Node } from 'cc';
import { EquipmentBelong, EquipmentFloor, EquipmentType } from './EquipmentModel';
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

    @property({ type: Enum(EquipmentFloor) })
    floor: EquipmentFloor = EquipmentFloor.ALL;

    @property({ type: Enum(EquipmentBelong) })
    belong: EquipmentBelong = EquipmentBelong.TAIBO;

    @property(MeshRenderer)
    alarmIcon: MeshRenderer;

    @property([Node])
    links: Node[] = [];

    @property(Color)
    lightColor: Color = new Color(0, 224, 255, 255);

    @property(Color)
    heavyColor: Color = new Color(255, 55, 55, 255);

    currentColor: Color = this.lightColor;

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
        this.changeColor();
    }

    get currentMaxPower() {
        return this._currentMaxPower;
    }

    // private _power: number = 1.0;
    // set power(power) {
    //     this._power = power;
    // }

    // get power() {
    //     return this._power;
    // }

    // private powerMap(id) {
    //     switch (id) {
    //         case "0": return 0;
    //         case "1": return 1;
    //         case "2": return 2;
    //     }
    // }

    protected onLoad(): void {
        const powers = this.node.name.split("_");
        if (powers.length > 1) {
            this.maxPower[0] = Number(powers[1]);
            this.maxPower[1] = Number(powers[2]);
            this.maxPower[2] = Number(powers[3]);
            this.maxPower[3] = Number(powers[4]);
            this.maxPower[4] = Number(powers[5]);
        }
    }

    private changeColor() {
        switch (this._currentMaxPower) {
            case 1: this.alarmIcon.material.setProperty("mainColor", this.lightColor);
                break;
            case 2: this.alarmIcon.material.setProperty("mainColor", this.heavyColor);
                break;
        }
    }

    start() {
        // this.level = Level.EARTHQUAKE_5A;
        // this.getComponentInChildren(MeshRenderer).node.active = false;
    }

    // update(deltaTime: number) {
    //     if (this._currentMaxPower == 0) {
    //         this.power = 0;
    //         return;
    //     }
    //     this.power = ((Math.sin(game.totalTime * 0.005) + 1.0) * 0.5 * 0.1 + 0.9) * this._currentMaxPower;
    // }
}


