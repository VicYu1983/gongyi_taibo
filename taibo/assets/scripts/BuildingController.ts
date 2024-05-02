import { _decorator, BatchingUtility, CCFloat, postProcess, Component, game, log, MeshRenderer, Node, view, ParticleSystem, Enum, Mesh, instantiate, Button, Light } from 'cc';
import { PathMeshBuilder } from './PathMeshBuilder';
import { Equipment } from './Equipment';
import { FloorController } from './FloorController';
import { PPController } from './PPController';
import { EquipmentIcon } from './EquipmentIcon';
import { EquipmentBelong, EquipmentFloor, EquipmentModel, EquipmentState, EquipmentType } from './EquipmentModel';
import { Navigation } from './Navigation';
import { BackgroundController } from './BackgroundController';
import { IEnviromentChanger } from './IEnviromentChanger';
const { Bloom } = postProcess;
const { ccclass, property } = _decorator;

@ccclass('BuildingController')
export class BuildingController extends Component implements IEnviromentChanger {


    @property([Node])
    buildingFloor: Node[] = [];

    @property(Node)
    prefabEquipmentIcon: Node;

    @property(PPController)
    postProcess: PPController = null;

    @property(ParticleSystem)
    particle: ParticleSystem;

    @property(FloorController)
    floor: FloorController;

    @property(Navigation)
    navigation: Navigation;

    @property(BackgroundController)
    background: BackgroundController;

    @property(Light)
    light:Light;

    @property(CCFloat)
    buildingTargetHeight = 0.0;

    @property({ type: Enum(EquipmentState) })
    currentState: EquipmentState = EquipmentState.NORMAL;

    @property({ type: Enum(EquipmentType) })
    currentType: EquipmentType = EquipmentType.AIR;

    @property({ type: Enum(EquipmentFloor) })
    currentFloor: EquipmentFloor = EquipmentFloor.B1F;

    @property({ type: Enum(EquipmentBelong) })
    currentBelong: EquipmentBelong = EquipmentBelong.TAIBO;

    @property(Node)
    uiNode: Node;

    private buildingHeight: number = 0;
    private buildingFloorTargetOpacity: number[] = [];
    private buildingFloorCurrentOpacity: number[] = [];
    private buildingFloorMesh: MeshRenderer[] = [];

    private equipments: Equipment[] = [];
    btnEquipmentIcon: Node[] = [];

    start() {
        this.toNormal();

        this.buildingFloor.forEach((floor, id, ary) => {
            this.buildingFloorTargetOpacity.push((floor.active === true) ? 1 : 0);
            this.buildingFloorCurrentOpacity.push((floor.active === true) ? 1 : 0);
            this.buildingFloorMesh.push(floor.getComponent(MeshRenderer));
        });

        // 自動抓取equipment
        this.equipments = this.node.getComponentsInChildren(Equipment);

        // 自動產生對應的ui
        this.equipments.forEach((equipment, id, ary) => {
            const iconNode = instantiate(this.prefabEquipmentIcon);
            const icon = iconNode.getComponent(EquipmentIcon);
            icon.navigation = this.navigation;
            icon.model = equipment.getModel();
            this.uiNode.addChild(iconNode);

            iconNode.active = true;
            iconNode.on(EquipmentIcon.ON_CLICK, this.onBtnEquipmentIconClick, this);
            this.btnEquipmentIcon.push(iconNode);
        });

        this.navigation.node.on(Navigation.ON_NAVIGATION_CHANGE, this.onNavigationChange, this);
    }

    onNavigationChange(active) {
        if (active) {
            this.showAllEquipment(false);
        } else {
            this.updateEquipmentShow();
        }
    }

    onBtnEquipmentIconClick(model: EquipmentModel) {
        model.setState(EquipmentState.ALARM1);
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

    changeEquipmentState(state: EquipmentState) {
        this.currentState = state;
        this.updateEquipmentShow();
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

        // for(let i = 0; i < this.buildingFloorTargetOpacity.length; ++i){
        //     this.buildingFloorTargetOpacity[i] = 0;
        // }
    }

    showFloor(id: number = 0) {
        this.hideAllFloor();
        // this.buildingFloorTargetOpacity[id] = 1;
        this.buildingFloor[id].active = true;
    }

    getEquipment(id: number = 0) {
        return this.equipments[id];
    }

    private updateMaterialParams() {
        this.buildingFloorMesh.forEach((mesh, id, ary) => {
            mesh.materials.forEach((material, id, matAry) => {
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
            let isState = equipment.getModel().state === this.currentState;
            if (this.currentState === EquipmentState.NONE) {
                isState = true;
            }
            equipment.getModel().setShow(isBelong && isFloor && isType && isState);
        });
    }

    toNormal() {
        this.buildingTargetHeight = 0;
        this.postProcess.targetBloom = 0;
        this.floor.targetFloorEmissive = 0.5;
        this.particle.stopEmitting();

        this.background.toNormal();

        this.light.node.active = true;
    }
    toScifi() {
        this.buildingTargetHeight = 3;
        this.postProcess.targetBloom = 1;
        this.floor.targetFloorEmissive = 1;
        this.particle.play();

        this.background.toScifi();

        this.light.node.active = false;
    }

    update(deltaTime: number) {

        // this.buildingFloorMesh.forEach((mesh, id, ary) => {
        //     const current = this.buildingFloorCurrentOpacity[id];
        //     const target = this.buildingFloorTargetOpacity[id];
        //     this.buildingFloorCurrentOpacity[id] = current + (target - current) * .2;

        //     mesh.materials.forEach((mat, id, ary) => {
        //         if (mat.effectName == "../shaders/standard-dither") {
        //             mat.setProperty("opacity", current);
        //         }
        //     });
        // });

        this.buildingHeight += (this.buildingTargetHeight - this.buildingHeight) * .2;
        this.updateMaterialParams();

    }
}


