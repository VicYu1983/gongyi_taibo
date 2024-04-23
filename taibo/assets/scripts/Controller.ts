import { _decorator, Button, Component, EventHandler, log, Node, Vec3 } from 'cc';
import { BuildingController } from './BuildingController';
import { Navigation } from './Navigation';
const { ccclass, property } = _decorator;

@ccclass('Controller')
export class Controller extends Component {

    @property(BuildingController)
    building:BuildingController;

    @property(Navigation)
    navigation:Navigation;

    @property(Button)
    btnNormal:Button;

    @property(Button)
    btnScifi:Button;

    @property(Button)
    btnEquipment:Button;

    start() {
        this.btnNormal.node.on('click', this.onNormalClick, this);
        this.btnScifi.node.on('click', this.onScifiClick, this);
        this.btnEquipment.node.on('click', this.onEquipmentClick, this);
    }

    onEquipmentClick(){
        const equipment = this.building.getEquipment(1);
        
        const pos = equipment.node.getPosition();
        const rot = new Vec3();
        equipment.node.getRotation().getEulerAngles(rot);
        this.navigation.setTargetPositionAndRotation(pos, rot);
    }

    onNormalClick(){
        this.building.changeToNormal();
    }

    onScifiClick(){
        this.building.changeToScifi();
    }

    update(deltaTime: number) {
        
    }
}


