import { _decorator, Button, CCBoolean, Component, EventHandler, log, Node, Vec3 } from 'cc';
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
            // this.btnShowFloor.node.on('click', this.onShowFloorClick, this);
        }
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

    }
}


