import { _decorator, CCBoolean, Color, Component, Enum, log, MeshRenderer, Node, Vec4 } from 'cc';
const { ccclass, property } = _decorator;

enum EquipmentState {
    ALARM,
    NORMAL,
    WARN
}

@ccclass('Equipment')
export class Equipment extends Component {

    @property({ type: Enum(EquipmentState) })
    equipmentState: EquipmentState = EquipmentState.ALARM;

    @property(MeshRenderer)
    alarmIcon: MeshRenderer;


    alarmColor: Color = new Color(255, 0, 0, 255);
    normalColor: Color = new Color(0, 255, 0, 255);
    warnColor: Color = new Color(255, 255, 0, 255);
    currentColor: Color = this.normalColor;

    start() {
        this.setState(this.equipmentState);
    }

    setState(state: EquipmentState) {
        switch (this.equipmentState) {
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
}


