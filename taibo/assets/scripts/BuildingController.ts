import { _decorator, BatchingUtility, CCFloat, postProcess, Component, game, log, MeshRenderer, Node, view, ParticleSystem } from 'cc';
import { PathMeshBuilder } from './PathMeshBuilder';
import { Equipment } from './Equipment';
import { FloorController } from './FloorController';
import { PPController } from './PPController';
const { Bloom } = postProcess;
const { ccclass, property } = _decorator;

@ccclass('BuildingController')
export class BuildingController extends Component {

    @property([Node])
    buildingFloor: Node[] = [];

    @property([Equipment])
    equipments: Equipment[] = [];

    @property(PPController)
    postProcess: PPController = null;

    @property(ParticleSystem)
    particle: ParticleSystem;

    @property(FloorController)
    floor: FloorController;

    @property(CCFloat)
    buildingTargetHeight = 0.0;

    private buildingHeight: number = 0;

    start() {
        this.changeToNormal();
    }

    // protected onLoad(): void {
    //     BatchingUtility.batchStaticModel(this.node, this.node);
    // }

    openBuilding(floor: number = 0) {
        this.showFloor(floor);
        this.showEquipment(floor);
    }

    closeBuilding() {
        this.hideAllFloor();
        this.showAllEquipment(false);
    }

    showAllEquipment(show: boolean) {
        this.equipments.forEach((equipment, id, ary) => {
            equipment.node.active = show;
        });
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

    showEquipment(floor: number = 0) {
        this.equipments.forEach((equipment, id, ary) => {
            if (equipment.getModel().floor === floor) {
                equipment.node.active = true;
            } else {
                equipment.node.active = false;
            }
        });
    }

    getEquipment(id: number = 0) {
        return this.equipments[id];
    }

    updateMaterialParams() {
        this.buildingFloor.forEach((node, id, ary) => {
            node.getComponent(MeshRenderer).materials.forEach((material, id, matAry) => {
                if (material.effectName == "../shaders/standard-dither") {
                    material.setProperty("buildingHeight", this.buildingHeight);
                }
            });
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


