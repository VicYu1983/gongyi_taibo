import { _decorator, BatchingUtility, CCFloat, postProcess, Component, game, log, MeshRenderer, Node, view, ParticleSystem, Enum, Mesh, instantiate, Button, Light, CCBoolean, Vec3, Camera, error } from 'cc';
import { PathMeshBuilder } from './PathMeshBuilder';
import { Equipment } from './Equipment';
import { FloorController } from './FloorController';
import { PPController } from './PPController';
import { EquipmentIcon } from './EquipmentIcon';
import { EquipmentBelong, EquipmentFloor, EquipmentModel, EquipmentState, EquipmentType, Tag } from './EquipmentModel';
import { Navigation } from './Navigation';
import { BackgroundController } from './BackgroundController';
import { IEnviromentChanger } from './IEnviromentChanger';
import { Controller } from './Controller';
import { UiFollow3D } from './UiFollow3D';
import { EquipmentGroupModel } from './EquipmentGroupModel';
import { EquipmentGroupIcon } from './EquipmentGroupIcon';
import { ICamera } from './ICamera';
import { Orbit } from './Orbit';
import { Area } from './Area';
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

    @property(Node)
    prefabEquipmentGroupIcon: Node;

    @property(PPController)
    postProcess: PPController = null;

    @property(ParticleSystem)
    particle: ParticleSystem;

    @property(FloorController)
    floor: FloorController;

    @property(Orbit)
    navigation: Orbit;

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

    currentTag: Tag;

    @property(Node)
    uiNode: Node;

    @property(CCFloat)
    speed: number = 1.0;

    @property(CCBoolean)
    alwaysShowIcon = true;

    @property(CCBoolean)
    debugAlarm = false;

    private bulidingTargetBlendValue = -0.3;
    private bulidingBlendValue: number = -0.3;
    private buildingFloorTargetOpacity: number[] = [];
    private buildingFloorCurrentOpacity: number[] = [];
    private buildingFloorMesh: MeshRenderer[] = [];

    private equipments: Equipment[] = [];
    btnEquipmentIcon: Node[] = [];

    private equipmentGroups: EquipmentGroupModel[] = [];
    private btnEquipmentGroupIcon: Node[] = [];
    private areas: Area[] = [];

    protected onLoad(): void {

        this.areas = this.node.getComponentsInChildren(Area);

        // 自動抓取equipment
        this.equipments = this.node.getComponentsInChildren(Equipment);

        // 自動產生對應的ui
        this.equipments.forEach((equipment, id, ary) => {
            if (equipment.node.active == false) return;
            if (equipment.getModel().type == EquipmentType.EARTHQUAKE_ALARM) return;

            const iconNode = instantiate(this.prefabEquipmentIcon);
            const icon = iconNode.getComponent(EquipmentIcon);
            icon.navigation = this.navigation;
            icon.model = equipment.getModel();

            const follow = iconNode.getComponent(UiFollow3D);
            follow.camera = this.navigation.getComponent(Camera);
            follow.followObject = equipment.node;

            this.uiNode.addChild(iconNode);

            iconNode.active = true;
            iconNode.on(EquipmentIcon.ON_CLICK, this.onBtnEquipmentIconClick, this);
            this.btnEquipmentIcon.push(iconNode);

            if (this.debugAlarm) {
                icon.model.state = Math.random() > .95 ? EquipmentState.ALARM1 : EquipmentState.NORMAL;
            }
        });

        // 自動搜集group model
        this.equipmentGroups = this.node.getComponentsInChildren(EquipmentGroupModel);
        this.equipmentGroups.forEach((group, id, ary) => {
            if (group.node.active == false) return;

            const iconNode = instantiate(this.prefabEquipmentGroupIcon);
            const icon = iconNode.getComponent(EquipmentGroupIcon);
            icon.model = group;

            const follow = iconNode.getComponent(UiFollow3D);
            follow.camera = this.navigation.getComponent(Camera);
            follow.followObject = group.node;

            this.uiNode.addChild(iconNode);

            iconNode.active = true;
            iconNode.on(EquipmentGroupIcon.ON_CLICK, this.onBtnEquipmentGroupIconClick, this);
            this.btnEquipmentGroupIcon.push(iconNode);
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
            this.updateEquipmentIconShow();
        }
    }

    onBtnEquipmentIconClick(model: EquipmentModel) {

        const equipment = model.node;

        const pos = equipment.getPosition();
        const rot = new Vec3();

        const cameraPos = this.navigation.node.getPosition();
        const zoomTo = cameraPos.clone().subtract(pos).normalize().multiplyScalar(1).add(pos);

        this.navigation.node.getRotation().getEulerAngles(rot);
        this.navigation.setTargetPositionAndRotation(zoomTo, rot);
    }

    onBtnEquipmentGroupIconClick(model: EquipmentGroupModel) {
        const equipment = model.node;

        const pos = equipment.getPosition();
        const rot = new Vec3();

        const cameraPos = this.navigation.node.getPosition();
        const zoomTo = cameraPos.clone().subtract(pos).normalize().multiplyScalar(.9).add(pos);

        this.navigation.node.getRotation().getEulerAngles(rot);
        this.navigation.setTargetPositionAndRotation(zoomTo, rot);

        // model.setShow(false);
        // this.updateEquipmentShow();
    }

    openBuilding(floor?: EquipmentFloor) {
        if (floor == null) {
            this.showFloor(this.currentFloor);
            this.changeEquipmentFloor(this.currentFloor);
        } else {
            this.showFloor(floor);
            this.changeEquipmentFloor(floor);
        }
    }

    closeBuilding() {
        this.hideAllFloor();
        this.showAllEquipment(false);
    }

    showAllEquipment(show: boolean) {
        this.equipments.forEach((equipment, id, ary) => {
            equipment.getModel().setShow(show);
        });

        this.equipmentGroups.forEach((group, id, ary) => {
            group.setShow(show);
        });
    }

    setOnlyDotAtAllEquipment(only: boolean) {
        this.equipments.forEach((equipment, id, ary) => {
            equipment.getModel().setOnlyDot(only);
        });
        this.equipmentGroups.forEach((group, id, ary) => {
            group.setOnlyDot(only);
        });
    }

    changeEquipmentState(state: EquipmentState) {
        this.currentState = state;
        this.updateEquipmentShow();
        this.updateEquipmentIconShow();
    }

    changeEquipmentType(type: EquipmentType, tag: Tag = null) {
        this.currentType = type;
        this.currentTag = tag;
        this.updateEquipmentShow();
        this.updateEquipmentIconShow();
    }

    changeEquipmentFloor(floor: EquipmentFloor) {
        this.currentFloor = floor;
        this.updateEquipmentShow();
        this.updateEquipmentIconShow();
    }

    changeEquipmentBelong(belong: EquipmentBelong) {
        this.currentBelong = belong;
        this.updateEquipmentShow();
        this.updateEquipmentIconShow();
    }

    hideAllFloor() {
        for (let i = 0; i < this.buildingFloorTargetOpacity.length; ++i) {
            this.buildingFloorTargetOpacity[i] = 0;
        }
    }

    showAllFloor() {
        for (let i = 0; i < this.buildingFloorTargetOpacity.length; ++i) {
            this.buildingFloorTargetOpacity[i] = 1;
            this.buildingFloor[i].active = true;
        }
    }

    showFloor(floor: EquipmentFloor) {
        if (floor == EquipmentFloor.ALL) {
            this.showAllFloor();
        } else {
            this.hideAllFloor();
            const id = this.buildingFloorEnum.indexOf(floor);
            if (id == -1) {
                return;
            }
            this.buildingFloorTargetOpacity[id] = 1;
            this.buildingFloor[id].active = true;
        }
    }

    getEquipment(id: number = 0) {
        return this.equipments[id];
    }

    private checkIsDither(material) {
        return material.effectName == "../shaders/standard-dither" || material.effectName == "../shaders/glass-dither";
    }

    // private earthquakeMaterials = ["earthquake", "external-pillar", "1F_pillar"];
    private earthquakeMaterials = ["earthquake"];

    private updateMaterialParams() {
        this.buildingFloorMesh.forEach((mesh, fid, ary) => {
            mesh.materials.forEach((material, id, matAry) => {

                if (this.checkIsDither(material)) {

                    let scaleBlend = 1.0;

                    // 台博舘的屋頂很高，這個參數不能公用
                    const isTaiboRoof = this.currentBelong == EquipmentBelong.TAIBO && fid == 4;
                    if (isTaiboRoof) {
                        scaleBlend = 3;
                    } else {
                        const isEarthquake = this.earthquakeMaterials.indexOf(material._parent._name) > -1;
                        if (isEarthquake) {
                            scaleBlend = .1;
                        }
                    }
                    material.setProperty("blendValue", this.bulidingBlendValue * scaleBlend);
                }
            });
        });
    }

    private updateEquipmentShow() {
        this.equipments.forEach((equipment, id, ary) => {
            const isBelong = equipment.getModel().belong === this.currentBelong;
            const isType = equipment.getModel().type === this.currentType;

            let isState = equipment.getModel().state === this.currentState;
            // 沒有設定state等於全部都要顯示
            if (this.currentState === EquipmentState.NONE) {
                isState = true;
            }

            let isFloor = equipment.getModel().floor === this.currentFloor;
            if (this.currentFloor === EquipmentFloor.ALL) {
                isFloor = true;
            }

            let isTag = true;
            if (this.currentTag != null) {
                if (!equipment.getModel().hasTag(this.currentTag)) {
                    isTag = false;
                }
            }

            equipment.getModel().setShow(isBelong && isFloor && isType && isState && isTag);
        });
    }

    private updateEquipmentIconShow() {
        const isAlarm = (this.currentState == EquipmentState.ALARM1);
        this.equipmentGroups.forEach((group, id, ary) => {
            group.setAtAlarm(isAlarm);
        });

        this.equipmentGroups.forEach((group, id, ary) => {
            const isBelong = group.belong === this.currentBelong;
            const isType = group.type === this.currentType;

            let isFloor = group.floor === this.currentFloor;
            if (this.currentFloor === EquipmentFloor.ALL) {
                isFloor = true;
            }

            let isTag = true;
            if (this.currentTag != null) {
                if (!group.hasTag(this.currentTag)) {
                    isTag = false;
                }
            }

            group.setShow(isBelong && isFloor && isType && isTag);
        });
    }

    toNormal() {
        this.bulidingTargetBlendValue = -0.3;
        this.postProcess.targetBloom = 0;
        this.floor.targetFloorEmissive = 0.5;
        this.particle.stopEmitting();

        this.background.toNormal();

        this.light.node.active = true;

        this.areas.forEach((area, id, ary) => {
            area.toNormal();
        })
    }
    toScifi() {
        this.bulidingTargetBlendValue = .5;
        this.postProcess.targetBloom = 1;
        this.floor.targetFloorEmissive = 1;
        this.particle.play();

        this.background.toScifi();

        this.light.node.active = false;

        this.areas.forEach((area, id, ary) => {
            area.toScifi();
        })
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


