import { _decorator, BatchingUtility, CCFloat, postProcess, Component, game, log, MeshRenderer, Node, view, ParticleSystem, Enum, Mesh, instantiate, Button, Light, CCBoolean, Vec3, Camera } from 'cc';
import { PathMeshBuilder } from './PathMeshBuilder';
import { Equipment } from './Equipment';
import { FloorController } from './FloorController';
import { PPController } from './PPController';
import { EquipmentIcon } from './EquipmentIcon';
import { EquipmentBelong, EquipmentFloor, EquipmentModel, EquipmentState, EquipmentType } from './EquipmentModel';
import { Navigation } from './Navigation';
import { BackgroundController } from './BackgroundController';
import { IEnviromentChanger } from './IEnviromentChanger';
import { Controller } from './Controller';
import { UiFollow3D } from './UiFollow3D';
const { Bloom } = postProcess;
const { ccclass, property } = _decorator;

@ccclass('BuildingController')
export class BuildingController extends Component implements IEnviromentChanger {


    @property([Node])
    buildingFloor: Node[] = [];

    @property([CCFloat])
    buildingFloorHeight: number[] = [];

    @property({ type: Enum(EquipmentFloor) })
    buildingFloorEnum: EquipmentFloor[] = [];

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
    light: Light;

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

    @property(CCFloat)
    speed: number = 1.0;

    @property(CCBoolean)
    alwaysShowIcon = true;

    private bulidingTargetBlendValue = -0.3;
    private bulidingBlendValue: number = -0.3;
    private buildingFloorTargetOpacity: number[] = [];
    private buildingFloorCurrentOpacity: number[] = [];
    private buildingFloorMesh: MeshRenderer[] = [];

    private equipments: Equipment[] = [];
    btnEquipmentIcon: Node[] = [];

    protected onLoad(): void {

        // 自動抓取equipment
        this.equipments = this.node.getComponentsInChildren(Equipment);

        // 自動產生對應的ui
        this.equipments.forEach((equipment, id, ary) => {
            const iconNode = instantiate(this.prefabEquipmentIcon);
            const icon = iconNode.getComponent(EquipmentIcon);
            icon.navigation = this.navigation;
            icon.model = equipment.getModel();

            const follow = iconNode.getComponent(UiFollow3D);
            follow.camera = this.navigation.getComponent(Camera);
            follow.followObject = icon.model.node;

            this.uiNode.addChild(iconNode);

            iconNode.active = true;
            iconNode.on(EquipmentIcon.ON_CLICK, this.onBtnEquipmentIconClick, this);
            this.btnEquipmentIcon.push(iconNode);
        });

        if (!this.alwaysShowIcon) {
            this.navigation.node.on(Navigation.ON_NAVIGATION_CHANGE, this.onNavigationChange, this);
        }
    }

    start() {
        this.buildingFloorTargetOpacity = [];
        this.buildingFloorCurrentOpacity = [];
        this.buildingFloorMesh = [];

        this.toNormal();

        this.buildingFloor.forEach((floor, id, ary) => {
            this.buildingFloorTargetOpacity.push((floor.active == true) ? 1 : 0);
            this.buildingFloorCurrentOpacity.push((floor.active == true) ? 1 : 0);
            this.buildingFloorMesh.push(floor.getComponent(MeshRenderer));
        });

        this.buildingFloorMesh.forEach((mesh, id, ary) => {
            const height = this.buildingFloorHeight[id];
            mesh.materials.forEach((material, mid, ary) => {
                if (this.checkIsDither(material)) {
                    material.setProperty("blendRange", 0.3);
                    material.setProperty("blendValue", 0);
                    material.setProperty("blendFloorY", height);
                }
            })
        });




    }

    syncEquipment(code: string, state: EquipmentState, time: string, msg: string, data: any) {
        this.equipments.forEach((equipment, id, ary) => {
            if (equipment.getModel().code == code) {
                equipment.getModel().setData(state, msg, time, data);
            }
        });
    }

    onNavigationChange(active) {
        if (active) {
            this.setOnlyDotAtAllEquipment(true);
        } else {
            this.setOnlyDotAtAllEquipment(false);
            this.updateEquipmentShow();
        }
    }

    onBtnEquipmentIconClick(model: EquipmentModel) {

        const equipment = model.node;

        const pos = equipment.getPosition();
        const rot = new Vec3();
        equipment.getRotation().getEulerAngles(rot);
        this.navigation.setTargetPositionAndRotation(pos, rot);
    }

    // protected onLoad(): void {
    //     BatchingUtility.batchStaticModel(this.node, this.node);
    // }

    openBuilding(floor: EquipmentFloor) {
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

    setOnlyDotAtAllEquipment(only: boolean) {
        this.equipments.forEach((equipment, id, ary) => {
            equipment.getModel().setOnlyDot(only);
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
        for (let i = 0; i < this.buildingFloorTargetOpacity.length; ++i) {
            this.buildingFloorTargetOpacity[i] = 0;
        }
    }

    showFloor(floor: EquipmentFloor) {
        this.hideAllFloor();
        const id = this.buildingFloorEnum.indexOf(floor);
        this.buildingFloorTargetOpacity[id] = 1;
        this.buildingFloor[id].active = true;
    }

    getEquipment(id: number = 0) {
        return this.equipments[id];
    }

    private checkIsDither(material) {
        return material.effectName == "../shaders/standard-dither" || material.effectName == "../shaders/glass-dither";
    }

    private updateMaterialParams() {
        this.buildingFloorMesh.forEach((mesh, id, ary) => {
            mesh.materials.forEach((material, id, matAry) => {
                if (this.checkIsDither(material)) {
                    material.setProperty("blendValue", this.bulidingBlendValue);
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
        this.bulidingTargetBlendValue = -0.3;
        this.postProcess.targetBloom = 0;
        this.floor.targetFloorEmissive = 0.5;
        this.particle.stopEmitting();

        this.background.toNormal();

        this.light.node.active = true;
    }
    toScifi() {
        this.bulidingTargetBlendValue = .5;
        this.postProcess.targetBloom = 1;
        this.floor.targetFloorEmissive = 1;
        this.particle.play();

        this.background.toScifi();

        this.light.node.active = false;
    }

    update(deltaTime: number) {

        this.buildingFloorMesh.forEach((mesh, id, ary) => {

            const current = this.buildingFloorCurrentOpacity[id];
            const target = this.buildingFloorTargetOpacity[id];

            this.buildingFloorCurrentOpacity[id] = current + (target - current) * deltaTime * this.speed * 1.5;

            mesh.materials.forEach((material, id, ary) => {
                if (this.checkIsDither(material)) {
                    material.setProperty("opacity", current);
                }
            });

            // 正在消失的目標。消失到盡頭時隱藏
            if (target == 0 && current < .1) {
                mesh.node.active = false;
            }
        });

        this.bulidingBlendValue += (this.bulidingTargetBlendValue - this.bulidingBlendValue) * deltaTime * this.speed;
        this.updateMaterialParams();

    }
}


