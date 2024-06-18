import { _decorator, CCBoolean, Color, Component, Enum, error, log, Material, MeshRenderer, Node, Vec4 } from 'cc';
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

    @property(Material)
    materials: Material[] = [];

    protected onLoad(): void {
        this.getModel().node.on(EquipmentModel.ON_CHANGE, this.onModelStateChange, this);
    }

    start() {
        this.onModelStateChange(this.getModel());
        // this.centerSphere.node.active = false;
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
        this.alarmIcon.material = this.materials[2];
    }

    changeToAlarm2() {
        this.alarmIcon.material = this.materials[3];
    }

    changeToAlarm3() {
        this.alarmIcon.material = this.materials[4];
    }

    changeToAlarm4() {
        // this.alarmIcon.ma
        this.alarmIcon.material = this.materials[5];
    }

    changeToNotActive() {
        this.alarmIcon.material = this.materials[1];
    }

    changeToNormal() {
        this.alarmIcon.material = this.materials[0];
    }

    update(deltaTime: number) {

    }

    getModel() {
        return this.getComponent(EquipmentModel);
    }
}


