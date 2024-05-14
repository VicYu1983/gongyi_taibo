import { _decorator, Camera, CCFloat, Component, Enum, log, Node } from 'cc';
import { EquipmentBelong, EquipmentFloor, EquipmentModel, EquipmentType } from './EquipmentModel';
const { ccclass, property } = _decorator;

@ccclass('EquipmentGroupModel')
export class EquipmentGroupModel extends Component {

    static ON_GROUP_CHANGE = "ON_GROUP_CHANGE";

    static ON_MERGEMODE_ON = "ON_MERGEMODE_ON";
    static ON_MERGEMODE_OFF = "ON_MERGEMODE_OFF";

    @property([EquipmentModel])
    equipments: EquipmentModel[] = [];

    @property({ type: Enum(EquipmentBelong) })
    belong: EquipmentBelong = EquipmentBelong.TAIBO;

    @property({ type: Enum(EquipmentFloor) })
    floor: EquipmentFloor = EquipmentFloor.B1F;

    @property({ type: Enum(EquipmentType) })
    type: EquipmentType = EquipmentType.AIR;

    @property(Camera)
    camera: Camera;

    @property(CCFloat)
    detectDistance = 1.0;

    private showOnScreen = true;
    private isOnlyDot = false;
    private groupMode = false;

    protected onLoad(): void {
        const groupName = this.node.name.split("_")[4];
        this.equipments = [];
        const equs = this.node.parent.getComponentsInChildren(EquipmentModel);
        equs.forEach((equ, id, ary) => {
            const modelData = equ.node.name.split("_");
            const hasGroup = modelData.length > 5;
            if (hasGroup) {

                // const belong = modelData[1];
                // const floor = modelData[2];
                // const type = modelData[3];
                // const code = modelData[4];
                const group = modelData[5];
                log(group, groupName);
                if (group == groupName) {
                    this.equipments.push(equ);
                }
            }
        });
    }

    start() {

        log(this.equipments.length);
    }

    update(deltaTime: number) {
        if (!this.showOnScreen) return;
        this.checkDistance();
    }

    setShow(show: boolean) {
        this.showOnScreen = show;
        this.node.emit(EquipmentGroupModel.ON_GROUP_CHANGE, this);
    }

    getShow() {
        return this.showOnScreen;
    }

    setOnlyDot(only: boolean) {
        this.isOnlyDot = only;
        this.node.emit(EquipmentGroupModel.ON_GROUP_CHANGE, this);
    }

    getOnlyDot() {
        return this.isOnlyDot;
    }

    getGroupMode() {
        return this.groupMode;
    }

    setGroupMode(mode) {
        this.groupMode = mode;
        this.node.emit(EquipmentGroupModel.ON_GROUP_CHANGE, this);
    }

    private checkDistance() {
        const distanceFromCamera = this.camera.node.getPosition().subtract(this.node.getPosition()).length();
        if (distanceFromCamera > this.detectDistance && !this.groupMode) {
            this.setGroupMode(true);
            this.equipments.forEach((equpment, id, ary) => {
                equpment.setGroupMode(true);
            });
            this.node.emit(EquipmentGroupModel.ON_MERGEMODE_ON);
        }
        if (distanceFromCamera <= this.detectDistance && this.groupMode) {
            this.setGroupMode(false);
            this.equipments.forEach((equpment, id, ary) => {
                equpment.setGroupMode(false);
            });
            this.node.emit(EquipmentGroupModel.ON_MERGEMODE_OFF);
        }
    }
}


