import { _decorator, Button, Camera, CCBoolean, Component, director, EventHandler, log, Node, Vec3 } from 'cc';
import { BuildingController } from './BuildingController';
import { Navigation } from './Navigation';
const { ccclass, property } = _decorator;

@ccclass('Controller')
export class Controller extends Component {

    @property(BuildingController)
    building: BuildingController;

    @property(Navigation)
    navigation: Navigation;

    @property(Button)
    btnNormal: Button;

    @property(Button)
    btnScifi: Button;

    @property(Button)
    btnEquipment: Button;

    @property(Button)
    btnBackCamera: Button;

    @property(Button)
    btnScreen: Button;

    @property(Node)
    uiNode: Node;

    @property(CCBoolean)
    isBuild: Boolean = false;

    // @property(Button)
    // btnShowFloor:Button;

    start() {

        const self = this;
        window["cocos"] = {
            openFloor: function (id = 0) {
                self.building.showFloor(id);
            },
            backToInit: function () {
                self.onBackCameraClick();
            },
            getEquipmentScreenPos() {
                return self.getEquipmentScreenPos();
            }
        }

        if (this.isBuild) {
            this.uiNode.active = false;
            this.building.showFloor(0);
        } else {
            this.btnNormal.node.on('click', this.onNormalClick, this);
            this.btnScifi.node.on('click', this.onScifiClick, this);
            this.btnEquipment.node.on('click', this.onEquipmentClick, this);
            this.btnBackCamera.node.on('click', this.onBackCameraClick, this);
            this.btnScreen.node.on('click', this.onScreenClick, this);
            // this.btnShowFloor.node.on('click', this.onShowFloorClick, this);

            this.getEquipmentScreenPos();
        }
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
        const equipment = this.building.getEquipment(1);

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
        if (window["html"] != undefined && window["html"]["update"] != undefined) {
            window["html"]["update"]({
                equipments: this.getEquipmentScreenPos()
            });
        }
    }
}


