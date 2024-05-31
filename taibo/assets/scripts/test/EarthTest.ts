import { _decorator, Component, log, MeshRenderer, Node, Vec4 } from 'cc';
import { EarthquakeAlarmModel } from '../EarthquakeAlarmModel';
const { ccclass, property } = _decorator;

@ccclass('EarthTest')
export class EarthTest extends Component {

    @property(Node)
    nodes: Node[] = [];

    @property(EarthquakeAlarmModel)
    points: EarthquakeAlarmModel[] = [];

    start() {
    }

    update(deltaTime: number) {
        const ps = this.points.map((quake, id, ary) => {
            const p = quake.node.getWorldPosition();
            return new Vec4(p.x, p.y, p.z, quake.power);
        });

        this.nodes.forEach((node, id, ary) => {
            const mats = node.getComponent(MeshRenderer).materials;
            mats.forEach((mat, id, ary) => {
                mat.setProperty("earthquakePoints", ps);
            });
        });
    }
}


