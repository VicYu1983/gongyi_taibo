import { _decorator, Camera, CCFloat, Component, Enum, error, log, Node, Vec3 } from 'cc';
import { EquipmentBelong, EquipmentFloor, EquipmentModel, EquipmentType } from './EquipmentModel';
const { ccclass, property } = _decorator;

@ccclass('EquipmentGroupModel')
export class EquipmentGroupModel extends EquipmentModel {

    @property([EquipmentModel])
    equipments: EquipmentModel[] = [];

    @property(Camera)
    camera: Camera;

    @property(CCFloat)
    detectDistance = 3.0;

    private isAlarm = false;

    protected onLoad(): void {
        const groupName = this.node.name.split("_")[4];
        this.equipments = [];
        const equs = this.node.parent.getComponentsInChildren(EquipmentModel);
        equs.forEach((equ, id, ary) => {
            const modelData = equ.node.name.split("_");
            const hasGroup = modelData.length > 5;
            if (hasGroup) {
                const group = modelData[5];
                if (group == groupName) {
                    this.equipments.push(equ);
                }
            }
        });

        const center = new Vec3();
        this.equipments.forEach((equ, id, ary) => {
            center.add(equ.node.getWorldPosition());
        });
        center.multiplyScalar(1 / this.equipments.length);
        this.node.setWorldPosition(center);

        super.onLoad();
    }

    start() {

    }

    update(deltaTime: number) {
        if (!this.showOnScreen) return;
        this.checkDistance();
    }

    setAtAlarm(alarm: boolean) {
        this.isAlarm = alarm;
        this.node.emit(EquipmentModel.ON_CHANGE, this);
    }

    private turnToGroupMode() {
        if (this.getGroupMode()) return;
        this.setGroupMode(true);
        this.equipments.forEach((equpment, id, ary) => {
            equpment.setGroupMode(true);
        });
    }

    private turnToNoneGroupMode() {
        if (!this.getGroupMode()) return;
        this.setGroupMode(false);
        this.equipments.forEach((equpment, id, ary) => {
            equpment.setGroupMode(false);
        });
    }

    private checkDistance() {
        if (this.isAlarm) {
            this.turnToNoneGroupMode();
        } else {
            const distanceFromCamera = this.camera.node.getPosition().subtract(this.node.getPosition()).length();
            if (distanceFromCamera > this.detectDistance && !this.groupMode) {
                this.turnToGroupMode();
            }
            if (distanceFromCamera <= this.detectDistance && this.groupMode) {
                this.turnToNoneGroupMode();
            }
        }
    }
}


