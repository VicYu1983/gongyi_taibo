import { _decorator, Component, Animation, Label, log, Node, NodeEventType, Vec3 } from 'cc';
import { EquipmentGroupModel } from './EquipmentGroupModel';
import { EquipmentModel } from './EquipmentModel';
import { Orbit } from './Orbit';
const { ccclass, property } = _decorator;

@ccclass('EquipmentGroupIcon')
export class EquipmentGroupIcon extends Component {

    static ON_CLICK = "ON_CLICK";

    @property(Orbit)
    navigation: Orbit;

    @property(EquipmentGroupModel)
    model: EquipmentGroupModel;

    @property(Label)
    txtCount: Label;

    private animationComponent;

    protected onLoad(): void {
        this.animationComponent = this.getComponent(Animation);

        this.model.node.on(EquipmentModel.ON_CHANGE, this.onModelChange, this);
        this.node.on(NodeEventType.MOUSE_UP, this.onBtnClick, this);
    }

    onBtnClick() {
        this.node.emit(EquipmentGroupIcon.ON_CLICK, this.model);
    }

    private cameraForward = new Vec3();

    private checkBehindCamera() {
        const dirFromCamera = this.model.node.getPosition().subtract(this.navigation.node.getPosition()).normalize();

        this.cameraForward.x = this.navigation.node.getWorldMatrix().m08;
        this.cameraForward.y = this.navigation.node.getWorldMatrix().m09;
        this.cameraForward.z = this.navigation.node.getWorldMatrix().m10;
        this.cameraForward.multiplyScalar(-1);

        return dirFromCamera.clone().dot(this.cameraForward) > 0;
    }

    onModelChange(model: EquipmentGroupModel) {
        
        if (model.getOnlyDot()) {
            this.node.active = false;
            return;
        }

        let show = this.model.getShow() && this.model.getGroupMode();

        const sameDir = this.checkBehindCamera();
        if (!sameDir) {
            show = false;
        }

        // 播放出現動畫
        if (!this.node.active && show) {
            this.animationComponent.play(this.animationComponent.clips[0].name);
        }

        this.node.active = show;
    }

    start() {
        this.txtCount.string = this.model.equipments.length.toString();
    }

    update(deltaTime: number) {

    }
}


