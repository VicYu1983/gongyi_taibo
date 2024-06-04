import { _decorator, CCBoolean, Color, Component, Enum, error, log, MeshRenderer, Node, Vec4 } from 'cc';
import { EquipmentBelong, EquipmentFloor, EquipmentModel, EquipmentState, EquipmentType } from './EquipmentModel';
import { Area } from './Area';
const { ccclass, property } = _decorator;
const { requireComponent } = _decorator;

@ccclass('Equipment')
@requireComponent(EquipmentModel)
export class Equipment extends Component {

    @property(MeshRenderer)
    alarmIcon: MeshRenderer;

    @property(MeshRenderer)
    centerSphere: MeshRenderer;

    @property([Node])
    links: Node[] = [];

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

    normalSize = new Vec4(0.025, 0.025, 0, 0);
    notActiveSize = new Vec4(0.025, 0.025, 0, 0);
    alarm1Size = new Vec4(0.05, 0.05, 0, 0);
    alarm2Size = new Vec4(0.05, 0.05, 0, 0);
    alarm3Size = new Vec4(0.05, 0.05, 0, 0);
    alarm4Size = new Vec4(0.05, 0.05, 0, 0);

    currentColor: Color = this.normalColor;

    protected onLoad(): void {
        this.getModel().node.on(EquipmentModel.ON_CHANGE, this.onModelStateChange, this);
    }

    start() {
        this.currentColor = this.normalColor.clone();
        this.onModelStateChange(this.getModel());
        this.centerSphere.node.active = false;
    }

    onModelStateChange(data: EquipmentModel) {
        this.node.active = data.getShow();
        this.setState();

        this.links.forEach((node, id, ary) => {
            node.active = data.getShow();
        });
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
        this.alarmIcon.material.setProperty("alarmParams", this.alarm1Size);
    }

    changeToAlarm2() {
        this.alarmIcon.material.setProperty("mainColor", this.alarm2Color);
        this.alarmIcon.material.setProperty("alarmParams", this.alarm2Size);
    }

    changeToAlarm3() {
        this.alarmIcon.material.setProperty("mainColor", this.alarm3Color);
        this.alarmIcon.material.setProperty("alarmParams", this.alarm3Size);
    }

    changeToAlarm4() {
        this.alarmIcon.material.setProperty("mainColor", this.alarm4Color);
        this.alarmIcon.material.setProperty("alarmParams", this.alarm4Size);
    }

    changeToNotActive() {
        this.alarmIcon.material.setProperty("mainColor", this.notActiveColor);
        this.alarmIcon.material.setProperty("alarmParams", this.notActiveSize);
    }

    changeToNormal() {
        this.alarmIcon.material.setProperty("mainColor", this.normalColor);
        this.alarmIcon.material.setProperty("alarmParams", this.normalSize);
    }

    update(deltaTime: number) {

    }

    getModel() {
        return this.getComponent(EquipmentModel);
    }
}


