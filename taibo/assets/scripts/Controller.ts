import { _decorator, Button, Camera, CCBoolean, Component, director, EventHandler, log, Node, Vec3 } from 'cc';
import { BuildingController } from './BuildingController';
import { Navigation } from './Navigation';
import { EquipmentIcon } from './EquipmentIcon';
import { EquipmentBelong, EquipmentModel, EquipmentState, EquipmentType } from './EquipmentModel';
import { Equipment } from './Equipment';
import { Model } from './Model';
const { ccclass, property } = _decorator;
const { requireComponent } = _decorator;

@ccclass('Controller')
@requireComponent(Model)
export class Controller extends Component {

    @property(BuildingController)
    buildingTaibo: BuildingController;

    @property(BuildingController)
    buildingXuku: BuildingController;

    @property(Navigation)
    navigation: Navigation;

    @property(Node)
    uiNode: Node;

    @property(CCBoolean)
    isBuild: Boolean = false;

    private building: BuildingController;

    start() {

        this.building = this.buildingTaibo;

        const self = this;

        window["cocos"] = {
            openFloor: function (id = 0) {
                this.building.openBuilding(id);
            },
            backToInit: function () {
                self.onBackCameraClick();
            },
            showAirEquipment() {
                self.building.showAllEquipment(true);
            },
            getEquipmentScreenPos() {
                return self.getEquipmentScreenPos();
            }
        }

        if (this.isBuild) {
            this.uiNode.active = false;
            this.callWeb("cocosReady", null);
        } else {

            this.changeToTaibo();
        }
    }

    changeToCarbon() {
        this.building.changeEquipmentType(EquipmentType.CARBON);
    }

    changeToAir() {
        this.building.changeEquipmentType(EquipmentType.AIR);
    }

    changeFloorB1F(floor: number) {
        this.building.openBuilding(0);
    }

    changeFloorN1F(floor: number) {
        this.building.openBuilding(1);
    }

    changeFloorN2F(floor: number) {
        this.building.openBuilding(2);
    }

    changeToTaibo() {
        this.buildingTaibo.changeEquipmentBelong(EquipmentBelong.TAIBO);
        this.buildingXuku.changeEquipmentBelong(EquipmentBelong.TAIBO);

        this.buildingTaibo.openBuilding(1);
        this.buildingXuku.closeBuilding();

        this.building = this.buildingTaibo;
    }

    changeToXuku() {
        this.buildingTaibo.changeEquipmentBelong(EquipmentBelong.XUKU);
        this.buildingXuku.changeEquipmentBelong(EquipmentBelong.XUKU);

        this.buildingXuku.openBuilding(0);
        this.buildingTaibo.closeBuilding();

        this.building = this.buildingXuku;
    }

    getEquipmentScreenPos() {

        const locations: Vec3[] = [];
        this.building.equipments.forEach((equipment, id, ary) => {

            // log(equipment.node.name);

            const worldPosition = equipment.node.worldPosition;

            // log(worldPosition);

            // 将世界坐标转换为屏幕坐标
            const screenPosition = new Vec3();
            // this.navigation.getComponent(Camera).convertToUINode(worldPosition, this.uiNode, screenPosition);
            this.navigation.getComponent(Camera).worldToScreen(worldPosition, screenPosition);

            // 调整屏幕坐标以匹配视图端口大小
            // screenPosition.x = screenPosition.x * view.getVisibleSize().width / 2 + view.getVisibleSize().width / 2;
            // screenPosition.y = screenPosition.y * view.getVisibleSize().height / 2 + view.getVisibleSize().height / 2;

            locations.push(screenPosition);
            // console.log(`屏幕坐标: (${screenPosition.x}, ${screenPosition.y}, ${screenPosition.z})`);
        });
        return locations;
    }


    onScreenClick() {
        this.getEquipmentScreenPos();
    }

    onBackCameraClick() {
        this.navigation.backToInit();
    }

    onShowFloorClick(e: MouseEvent) {
        this.building.showFloor(Math.floor(Math.random() * this.building.buildingFloor.length));
    }

    onEquipmentClick() {
        const equipment = this.building.getEquipment(0);

        const pos = equipment.node.getPosition();
        const rot = new Vec3();
        equipment.node.getRotation().getEulerAngles(rot);
        this.navigation.setTargetPositionAndRotation(pos, rot);
    }

    onNormalClick() {
        this.building.changeToNormal();
    }

    onScifiClick() {
        this.building.changeToScifi();
    }

    update(deltaTime: number) {
        // if (window["html"] != undefined && window["html"]["update"] != undefined) {
        //     window["html"]["update"]({
        //         equipments: this.getEquipmentScreenPos()
        //     });
        // }
    }

    callWeb(method, params) {
        if (window["html"] != undefined && window["html"][method] != undefined) {
            window["html"][method](params);
        }
    }
}


