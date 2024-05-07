import { _decorator, CCBoolean, Color, Component, Enum, log, MeshRenderer, Node, Vec4 } from 'cc';
import { EquipmentModel, EquipmentState } from './EquipmentModel';
const { ccclass, property } = _decorator;
const { requireComponent } = _decorator;

@ccclass('Equipment')
@requireComponent(EquipmentModel)
export class Equipment extends Component {

    @property(MeshRenderer)
    alarmIcon: MeshRenderer;

    @property(Color)
    normalColor: Color = new Color(0, 224, 255, 255);

    @property(Color)
    notActiveColor: Color = new Color(144, 144, 144, 255);

    @property(Color)
    alarm1Color: Color = new Color(255, 55, 55, 255);

    @property(Color)
    alarm2Color: Color = new Color(245, 166, 47, 255);

    @property(Color)
    alarm3Color: Color = new Color(70, 249, 88, 255);

    @property(Color)
    alarm4Color: Color = new Color(22, 94, 255, 255);

    currentColor: Color = this.normalColor;

    protected onLoad(): void {
        this.getModel().node.on(EquipmentModel.ON_CHANGE, this.onModelStateChange, this);
    }

    start() {
        this.currentColor = this.normalColor.clone();
        this.onModelStateChange(this.getModel());
    }

    onModelStateChange(data: EquipmentModel) {
        this.node.active = data.getShow();
        this.setState();
    }

    setState() {
        switch (this.getModel().state) {
            case EquipmentState.ALARM4:
                this.changeToAlarm4();
                break;
            case EquipmentState.ALARM3:
                this.changeToAlarm3();
                break;
            case EquipmentState.ALARM2:
                this.changeToAlarm2();
                break;
            case EquipmentState.ALARM1:
                this.changeToAlarm1();
                break;
            case EquipmentState.NORMAL:
                this.changeToNormal();
                break;
            case EquipmentState.NOT_ACTIVE:
                this.changeToNotActive();
                break;

        }
    }

    changeToAlarm1() {
        this.alarmIcon.material.setProperty("mainColor", this.alarm1Color);
    }

    changeToAlarm2() {
        this.alarmIcon.material.setProperty("mainColor", this.alarm2Color);
    }

    changeToAlarm3() {
        this.alarmIcon.material.setProperty("mainColor", this.alarm3Color);
    }

    changeToAlarm4() {
        this.alarmIcon.material.setProperty("mainColor", this.alarm4Color);
    }

    changeToNotActive() {
        this.alarmIcon.material.setProperty("mainColor", this.notActiveColor);
    }

    changeToNormal() {
        this.alarmIcon.material.setProperty("mainColor", this.normalColor);
    }

    update(deltaTime: number) {

    }

    getModel() {
        return this.getComponent(EquipmentModel);
    }
}


