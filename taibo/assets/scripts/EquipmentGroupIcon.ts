import { _decorator, Component, Animation, Label, log, Node, NodeEventType } from 'cc';
import { EquipmentGroupModel } from './EquipmentGroupModel';
import { EquipmentModel } from './EquipmentModel';
const { ccclass, property } = _decorator;

@ccclass('EquipmentGroupIcon')
export class EquipmentGroupIcon extends Component {

    static ON_CLICK = "ON_CLICK";

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

    onModelChange(model: EquipmentGroupModel) {
        
        if (model.getOnlyDot()) {
            this.node.active = false;
            return;
        }

        const show = this.model.getShow() && this.model.getGroupMode();

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


