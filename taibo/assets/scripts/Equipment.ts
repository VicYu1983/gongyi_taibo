import { _decorator, CCBoolean, Color, Component, Enum, log, MeshRenderer, Node, Vec4 } from 'cc';
import { EquipmentModel, EquipmentState } from './EquipmentModel';
const { ccclass, property } = _decorator;
const { requireComponent } = _decorator;

@ccclass('Equipment')
@requireComponent(EquipmentModel)
export class Equipment extends Component {

    @property(MeshRenderer)
    alarmIcon: MeshRenderer;

    alarmColor: Color = new Color(255, 0, 0, 255);
    normalColor: Color = new Color(0, 255, 0, 255);
    warnColor: Color = new Color(255, 255, 0, 255);
    currentColor: Color = this.normalColor;

    start() {
        this.getModel().node.on(EquipmentModel.ON_CHANGE, this.onModelStateChange, this);
        this.onModelStateChange(this.getModel());
    }

    onModelStateChange(data: EquipmentModel) {
        this.node.active = data.showOnScreen;
        this.setState();
    }

    setState() {
        switch (this.getModel().state) {
            case EquipmentState.ALARM:
                this.changeToAlarm();
                break;
            case EquipmentState.NORMAL:
                this.changeToNormal();
                break;
            case EquipmentState.WARN:
                this.changeToWarn();
                break;
        }
    }

    changeToAlarm() {
        this.alarmIcon.material.setProperty("mainColor", this.alarmColor);
    }

    changeToNormal() {
        this.alarmIcon.material.setProperty("mainColor", this.normalColor);
    }

    changeToWarn() {
        this.alarmIcon.material.setProperty("mainColor", this.warnColor);
    }

    update(deltaTime: number) {

    }

    getModel() {
        return this.getComponent(EquipmentModel);
    }
}


