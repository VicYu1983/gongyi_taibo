import { _decorator, Camera, CCFloat, Component, Enum, error, log, Node, Vec3 } from 'cc';
import { EquipmentBelong, EquipmentFloor, EquipmentModel, EquipmentType } from './EquipmentModel';
const { ccclass, property } = _decorator;

@ccclass('EquipmentGroupModel')
export class EquipmentGroupModel extends EquipmentModel {

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

        const modelData = this.node.name.split("_");
        const belong = modelData[1];
        const floor = modelData[2];
        const type = modelData[3];

        switch (belong) {
            case "Taibo": this.belong = EquipmentBelong.TAIBO; break;
            case "Xuku": this.belong = EquipmentBelong.XUKU; break;
            default: error("should not be here!", this.node.name, belong);
        }

        switch (floor) {
            case "B2F": this.floor = EquipmentFloor.B2F; break;
            case "B1F": this.floor = EquipmentFloor.B1F; break;
            case "1F": this.floor = EquipmentFloor.N1F; break;
            case "2F": this.floor = EquipmentFloor.N2F; break;
            case "3F": this.floor = EquipmentFloor.N3F; break;
            case "4F": this.floor = EquipmentFloor.N4F; break;
            case "5F": this.floor = EquipmentFloor.N5F; break;
            case "6F": this.floor = EquipmentFloor.N6F; break;
            case "7F": this.floor = EquipmentFloor.N7F; break;
            default: error("should not be here!", this.node.name, floor);
        }

        switch (type) {
            case "Air": this.type = EquipmentType.AIR; break;
            case "AirCon": this.type = EquipmentType.AIRCONDITION; break;
            case "CCTV": this.type = EquipmentType.CCTV; break;
            case "Earth": this.type = EquipmentType.EARTHQUAKE; break;
            case "Elec": this.type = EquipmentType.ELECTRIC; break;
            case "Enviro": this.type = EquipmentType.ENVIROMENT; break;
            case "Fire": this.type = EquipmentType.FIRE; break;
            case "Secu": this.type = EquipmentType.SECURITY; break;
            default: error("should not be here!", this.node.name, type);
        }
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
        this.setGroupMode(true);
        this.equipments.forEach((equpment, id, ary) => {
            equpment.setGroupMode(true);
        });
    }

    private turnToNoneGroupMode() {
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


