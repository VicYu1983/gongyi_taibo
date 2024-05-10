import { _decorator, Camera, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UiFollow3D')
export class UiFollow3D extends Component {

    @property(Node)
    followObject: Node;

    @property(Camera)
    camera: Camera;

    private screenPosition: Vec3 = new Vec3();

    start() {

    }

    update(deltaTime: number) {
        this.syncPosition();
    }

    private syncPosition() {
        const worldPosition = this.followObject.worldPosition;

        this.camera.convertToUINode(worldPosition, this.node.parent, this.screenPosition);
        this.node.position = this.screenPosition;
    }
}


