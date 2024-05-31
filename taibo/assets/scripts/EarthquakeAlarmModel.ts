import { _decorator, Component, director, game, MeshRenderer, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EarthquakeAlarmModel')
export class EarthquakeAlarmModel extends Component {

    _power: number = 2.0;

    set power(power) {
        this._power = power;
    }

    get power() {
        return this._power;
    }

    start() {
        this.getComponentInChildren(MeshRenderer).node.active = false;
    }

    update(deltaTime: number) {
        this.power = ((Math.sin(game.totalTime * 0.01) + 1.0) * 0.5 * 0.5 + 0.5) * 2;
    }
}


