import { _decorator, CCInteger, Component, Enum, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum EquipmentState {
    ALARM,
    NORMAL,
    WARN
}

export enum EquipmentType {
    AIR,
    CARBON
}

export enum EquipmentBelong {
    TAIBO,
    XUKU
}

export enum EquipmentFloor {
    B1F,
    N1F,
    N2F,
    N3F,
    N4F,
    N5F,
    N6F,
    N7F
}

@ccclass('EquipmentModel')
export class EquipmentModel extends Component {

    static ON_STATE_CHANGE = "ON_STATE_CHANGE";

    @property(CCInteger)
    id: number;

    @property({ type: Enum(EquipmentBelong) })
    belong: EquipmentBelong = EquipmentBelong.TAIBO;

    @property({ type: Enum(EquipmentFloor) })
    floor: EquipmentFloor = EquipmentFloor.B1F;

    @property({ type: Enum(EquipmentState) })
    state: EquipmentState = EquipmentState.ALARM;

    @property({ type: Enum(EquipmentType) })
    type: EquipmentType = EquipmentType.AIR;

    start() {

    }

    setState(state: EquipmentState) {
        if (this.state != state) {
            this.state = state;
            this.node.emit(EquipmentModel.ON_STATE_CHANGE, this.state);
        }
    }

    update(deltaTime: number) {

    }
}


