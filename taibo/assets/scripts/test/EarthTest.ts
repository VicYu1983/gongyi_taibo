import { _decorator, Component, log, MeshRenderer, Node, Vec4 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EarthTest')
export class EarthTest extends Component {

    @property(Node)
    nodes:Node[] = [];

    @property(Node)
    points:Node[] = [];

    start() {
    }

    update(deltaTime: number) {
        const ps = this.points.map((node, id, ary)=>{
            const p = node.getWorldPosition();
            return new Vec4(p.x, p.y, p.z, 1.0);
        });

        log(ps);

        this.nodes.forEach((node, id, ary)=>{
            const mats = node.getComponent(MeshRenderer).materials;
            mats.forEach((mat, id, ary)=>{
                mat.setProperty("earthquakePoints", ps);
            });
        });
    }
}


