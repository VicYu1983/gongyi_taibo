import { _decorator, Button, Camera, Component, log, Node, NodeEventType, Vec3 } from 'cc';
import { EquipmentModel } from './EquipmentModel';
import { Navigation } from './Navigation';
const { ccclass, property } = _decorator;

@ccclass('EquipmentIcon')
export class EquipmentIcon extends Component {

    static ON_CLICK = "ON_CLICK";

    @property(Navigation)
    navigation: Navigation;

    @property(Node)
    info: Node;

    @property(EquipmentModel)
    model: EquipmentModel;

    start() {

        this.model.node.on(EquipmentModel.ON_CHANGE, this.onModelChange, this);

        this.node.on(NodeEventType.MOUSE_UP, this.onBtnClick, this);
        this.node.on(NodeEventType.MOUSE_MOVE, this.onBtnHover, this);
        this.node.on(NodeEventType.MOUSE_LEAVE, this.onBtnRelease, this);

        this.onModelChange();
    }

    onModelChange() {
        this.node.active = this.model.showOnScreen;
    }

    syncPosition() {
        if (this.model == null) return;
        const worldPosition = this.model.node.worldPosition;
        const screenPosition = new Vec3();
        this.navigation.getComponent(Camera).convertToUINode(worldPosition, this.node.parent, screenPosition);
        this.node.position = screenPosition;
    }

    onBtnClick() {
        this.node.emit(EquipmentIcon.ON_CLICK, this.model);
    }

    onBtnHover() {

        this.info.active = true;
    }

    onBtnRelease() {

        this.info.active = false;
    }

    update(deltaTime: number) {
        this.syncPosition();
    }
}


