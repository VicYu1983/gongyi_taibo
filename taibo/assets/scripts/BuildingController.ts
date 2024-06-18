import { _decorator, BatchingUtility, CCFloat, postProcess, Component, game, log, MeshRenderer, Node, view, ParticleSystem, Enum, Mesh, instantiate, Button, Light, CCBoolean, Vec3, Camera, error, Vec4, Quat } from 'cc';
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
import { EarthquakeAlarmModel, Level } from './EarthquakeAlarmModel';
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
    items: Node[] = [];

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

    currentState: EquipmentState[] = [EquipmentState.NORMAL];
    currentType: EquipmentType[] = [EquipmentType.AIR];
    currentFloor: EquipmentFloor = EquipmentFloor.B1F;
    currentTag: Tag;
    currentLevel: Level;

    currentBelong: EquipmentBelong = EquipmentBelong.TAIBO;

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
    private earthquakeAlarms: EarthquakeAlarmModel[] = [];

    protected onLoad(): void {

        this.areas = this.node.getComponentsInChildren(Area);
        this.earthquakeAlarms = this.node.getComponentsInChildren(EarthquakeAlarmModel);

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
                icon.model.state = EquipmentState.NORMAL;
                if (Math.random() > .95) {
                    icon.model.state = EquipmentState.ALARM1;
                }
                if (Math.random() > .95) {
                    icon.model.state = EquipmentState.ALARM2;
                }
                if (Math.random() > .95) {
                    icon.model.state = EquipmentState.ALARM3;
                }
                if (Math.random() > .95) {
                    icon.model.state = EquipmentState.ALARM4;
                }
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

        this.buildingFloorMesh.forEach((mesh, fid, ary) => {
            mesh.materials.forEach((material, id, matAry) => {
                if (this.checkIsEarthquake(material)) {
                    material.setProperty("earthquakeSize", 1.0);
                }
            });
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
            this.updateEquipmentGroupShow();
            this.updateEarthquakesShow();
        }
    }

    onBtnEquipmentIconClick(model: EquipmentModel) {

        // cctv 點擊不要zoom
        if (model.type === EquipmentType.CCTV) return;

        console.log("onBtnEquipmentIconClick:" + model.code);

        const equipment = model.node;

        const pos = equipment.getPosition();
        const rot = new Vec3();
        const zoomTo = pos.clone().add(new Vec3(-.5, .4, 0.));

        this.navigation.setTargetPositionAndRotation(zoomTo, rot);
    }

    onBtnEquipmentGroupIconClick(model: EquipmentGroupModel) {
        const equipment = model.node;

        const pos = equipment.getPosition();
        const rot = new Vec3();

        const zoomTo = pos.clone().add(new Vec3(-.9, .8, 0.));

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
        this.showAllEarthquakes(false);
    }

    showAllEarthquakes(show: boolean) {
        this.earthquakeAlarms.forEach((earth, id, ary) => {
            earth.node.active = show;
        });
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

    changeEquipmentState(state: EquipmentState[]) {
        this.currentState = state;
        this.updateEquipmentShow();
        this.updateEquipmentGroupShow();
        this.updateEarthquakesShow();
    }

    changeEquipmentType(type: EquipmentType[], tag: Tag = null) {

        // 類別是地震告警時，點位開始update
        // this.earthquakeAlarms.forEach((earth, id, ary) => {
        //     const isEarthAlarm = type.indexOf(EquipmentType.EARTHQUAKE_ALARM) >= 0;
        //     if (!isEarthAlarm) {
        //         earth.level = Level.EARTHQUAKE_0;
        //     }
        // });

        this.currentType = type;
        this.currentTag = tag;
        this.updateEquipmentShow();
        this.updateEquipmentGroupShow();
        this.updateEarthquakesShow();
    }

    changeEquipmentFloor(floor: EquipmentFloor) {
        this.currentFloor = floor;
        this.updateEquipmentShow();
        this.updateEquipmentGroupShow();
        this.updateEarthquakesShow();
    }

    changeEquipmentBelong(belong: EquipmentBelong) {
        this.currentBelong = belong;
        this.updateEquipmentShow();
        this.updateEquipmentGroupShow();
        this.updateEarthquakesShow();
    }

    changeEarthquakeLevel(level: Level = null) {
        this.currentLevel = level;
        this.earthquakeAlarms.forEach((quake, id, ary) => {
            quake.level = level;
        });
        this.updateEarthquakesShow();
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

    getEquipmentByCode(code: String) {
        let targetEquipment = null;
        this.equipments.forEach((equipment, id, ary) => {
            if (equipment.getModel().code === code) {
                targetEquipment = equipment;
                console.log("find:" + equipment.getModel().code)
                // return;
            }
        });
        return targetEquipment;
    }

    private checkIsDither(material) {
        return material.effectName == "../shaders/standard-dither" || material.effectName == "../shaders/glass-dither";
    }

    private checkIsEarthquake(material) {
        return material.effectName == "../shaders/standard-dither";
    }

    private updateEquipmentShow() {
        this.equipments.forEach((equipment, id, ary) => {
            const isBelong = equipment.getModel().belong === this.currentBelong;
            let isType = this.currentType.indexOf(equipment.getModel().type) >= 0;

            let isState = this.currentState.indexOf(equipment.getModel().state) >= 0;

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

    private updateEquipmentGroupShow() {
        const isAlarmPage = this.currentState.indexOf(EquipmentState.NORMAL) == -1;
        this.equipmentGroups.forEach((group, id, ary) => {
            group.setAtAlarm(isAlarmPage);
        });

        this.equipmentGroups.forEach((group, id, ary) => {
            const isBelong = group.belong === this.currentBelong;
            let isType = this.currentType.indexOf(group.type) >= 0;

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

    private updateEarthquakesShow() {
        this.earthquakeAlarms.forEach((earth, id, ary) => {
            const isBelong = earth.belong === this.currentBelong;
            const isType = this.currentType.indexOf(EquipmentType.EARTHQUAKE_ALARM) >= 0;

            let isFloor = earth.floor === this.currentFloor;
            if (this.currentFloor === EquipmentFloor.ALL) {
                isFloor = true;
            }

            const isHavePower = earth.currentMaxPower > 0;

            earth.node.active = (isBelong && isType && isFloor && isHavePower);
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

        this.bulidingBlendValue += (this.bulidingTargetBlendValue - this.bulidingBlendValue) * deltaTime * this.speed;
        this.buildingFloorMesh.forEach((mesh, fid, ary) => {

            const current = this.buildingFloorCurrentOpacity[fid];
            const target = this.buildingFloorTargetOpacity[fid];

            this.buildingFloorCurrentOpacity[fid] = current + (target - current) * deltaTime * this.speed * 1.5;

            mesh.materials.forEach((material, id, ary) => {
                if (this.checkIsDither(material)) {
                    material.setProperty("opacity", current);
                }

                // blending...
                let scaleBlend = 1.0;

                // 台博舘的屋頂很高，這個參數不能公用
                const isTaiboRoof = this.currentBelong == EquipmentBelong.TAIBO && fid == 4;
                if (isTaiboRoof) {
                    scaleBlend = 3;
                }
                material.setProperty("blendValue", this.bulidingBlendValue * scaleBlend);
            });

            // 正在消失的目標。消失到盡頭時隱藏
            if (target == 0 && current < .1) {
                mesh.node.active = false;
            }
        });


    }
}


