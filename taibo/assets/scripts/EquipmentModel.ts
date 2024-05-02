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
    B2F,
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

    // static ON_STATE_CHANGE = "ON_STATE_CHANGE";
    // static ON_VISIBLE_CHANGE = "ON_VISIBLE_CHANGE";
    static ON_CHANGE = "ON_CHANGE";

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

    showOnScreen = true;

    start() {

    }

    setShow(show: boolean) {
        this.showOnScreen = show;
        this.node.emit(EquipmentModel.ON_CHANGE, this);
    }

    setState(state: EquipmentState) {
        if (this.state != state) {
            this.state = state;
            this.node.emit(EquipmentModel.ON_CHANGE, this);
        }
    }

    update(deltaTime: number) {

    }
}


