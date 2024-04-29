import { _decorator, Component, Enum, Node } from 'cc';
import { EquipmentBelong, EquipmentFloor, EquipmentType } from './EquipmentModel';
const { ccclass, property } = _decorator;

@ccclass('Model')
export class Model extends Component {

    static ON_MODEL_CHANGE = "ON_MODEL_CHANGE";

    @property({ type: Enum(EquipmentType) })
    currentType: EquipmentType;

    @property({ type: Enum(EquipmentFloor) })
    currentFloor: EquipmentFloor;

    @property({ type: Enum(EquipmentBelong) })
    currentBelong: EquipmentBelong;

    start() {

    }

    changeEquipmentType(type: EquipmentType) {
        this.currentType = type;
        this.node.emit(Model.ON_MODEL_CHANGE, this);
    }

    changeEquipmentFloor(floor: EquipmentFloor) {
        this.currentFloor = floor;
        this.node.emit(Model.ON_MODEL_CHANGE, this);
    }

    changeEquipmentBelong(belong: EquipmentBelong) {
        this.currentBelong = belong;
        this.node.emit(Model.ON_MODEL_CHANGE, this);
    }

    update(deltaTime: number) {

    }
}


