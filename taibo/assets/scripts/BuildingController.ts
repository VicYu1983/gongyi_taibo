import { _decorator, BatchingUtility, CCFloat, postProcess, Component, game, log, MeshRenderer, Node, view, ParticleSystem, Enum } from 'cc';
import { PathMeshBuilder } from './PathMeshBuilder';
import { Equipment } from './Equipment';
import { FloorController } from './FloorController';
import { PPController } from './PPController';
import { EquipmentIcon } from './EquipmentIcon';
import { EquipmentBelong, EquipmentFloor, EquipmentModel, EquipmentState, EquipmentType } from './EquipmentModel';
const { Bloom } = postProcess;
const { ccclass, property } = _decorator;

@ccclass('BuildingController')
export class BuildingController extends Component {

    @property([Node])
    buildingFloor: Node[] = [];

    @property([Equipment])
    equipments: Equipment[] = [];

    @property([Node])
    btnEquipmentIcon: Node[] = [];

    @property(PPController)
    postProcess: PPController = null;

    @property(ParticleSystem)
    particle: ParticleSystem;

    @property(FloorController)
    floor: FloorController;

    @property(CCFloat)
    buildingTargetHeight = 0.0;

    @property({ type: Enum(EquipmentType) })
    currentType: EquipmentType;

    @property({ type: Enum(EquipmentFloor) })
    currentFloor: EquipmentFloor;

    @property({ type: Enum(EquipmentBelong) })
    currentBelong: EquipmentBelong;

    private buildingHeight: number = 0;

    start() {
        this.changeToNormal();

        this.btnEquipmentIcon.forEach((icon, id, ary) => {
            icon.on(EquipmentIcon.ON_CLICK, this.onBtnEquipmentIconClick, this);
        });

        // this.updateEquipmentShow();
    }

    onBtnEquipmentIconClick(model: EquipmentModel) {
        model.setState(EquipmentState.ALARM);
    }

    // protected onLoad(): void {
    //     BatchingUtility.batchStaticModel(this.node, this.node);
    // }

    openBuilding(floor: number = 0) {
        this.showFloor(floor);
        this.changeEquipmentFloor(floor);
    }

    closeBuilding() {
        this.hideAllFloor();
        this.showAllEquipment(false);
    }

    showAllEquipment(show: boolean) {
        this.equipments.forEach((equipment, id, ary) => {
            equipment.getModel().setShow(show);
        });
    }

    changeEquipmentType(type: EquipmentType) {
        this.currentType = type;
        this.updateEquipmentShow();
    }

    changeEquipmentFloor(floor: EquipmentFloor) {
        this.currentFloor = floor;
        this.updateEquipmentShow();
    }

    changeEquipmentBelong(belong: EquipmentBelong) {
        this.currentBelong = belong;
        this.updateEquipmentShow();
    }

    hideAllFloor() {
        this.buildingFloor.forEach((floor, id, ary) => {
            floor.active = false;
        });
    }

    showFloor(id: number = 0) {
        this.hideAllFloor();
        this.buildingFloor[id].active = true;
    }

    // showEquipment(floor: number = 0) {
    //     this.equipments.forEach((equipment, id, ary) => {
    //         if (equipment.getModel().floor === floor) {
    //             equipment.getModel().setShow(true);
    //         } else {
    //             equipment.getModel().setShow(false);
    //         }
    //     });
    // }

    getEquipment(id: number = 0) {
        return this.equipments[id];
    }

    private updateMaterialParams() {
        this.buildingFloor.forEach((node, id, ary) => {
            node.getComponent(MeshRenderer).materials.forEach((material, id, matAry) => {
                if (material.effectName == "../shaders/standard-dither") {
                    material.setProperty("buildingHeight", this.buildingHeight);
                }
            });
        });
    }

    private updateEquipmentShow() {
        this.equipments.forEach((equipment, id, ary) => {
            const isBelong = equipment.getModel().belong === this.currentBelong;
            const isFloor = equipment.getModel().floor === this.currentFloor;
            const isType = equipment.getModel().type === this.currentType;
            equipment.getModel().setShow(isBelong && isFloor && isType);
        });
    }

    changeToNormal() {
        this.buildingTargetHeight = 0;
        this.postProcess.targetBloom = 0;
        this.floor.targetFloorEmissive = 0.5;
        this.particle.stopEmitting();
    }

    changeToScifi() {
        this.buildingTargetHeight = 3;
        this.postProcess.targetBloom = 1;
        this.floor.targetFloorEmissive = 1;
        this.particle.play();
    }

    update(deltaTime: number) {

        this.buildingHeight += (this.buildingTargetHeight - this.buildingHeight) * .2;
        this.updateMaterialParams();
    }
}


