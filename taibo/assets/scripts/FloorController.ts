import { _decorator, Component, MeshRenderer, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Floor')
export class FloorController extends Component {

    targetFloorEmissive = 0.0;
    private currentFloorEmissive = 0.0;

    start() {

    }

    update(deltaTime: number) {
        this.currentFloorEmissive += (this.targetFloorEmissive - this.currentFloorEmissive) * .2;
        this.node.getComponent(MeshRenderer).material.setProperty("emissive", this.currentFloorEmissive);
    }
}


