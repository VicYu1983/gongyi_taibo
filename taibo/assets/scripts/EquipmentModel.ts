import { _decorator, CCInteger, CCString, Component, Enum, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum EquipmentState {
    ALARM1,
    ALARM2,
    ALARM3,
    ALARM4,
    NORMAL,
    NOT_ACTIVE,
    NONE
}

export enum EquipmentType {
    AIR, // 空品
    AIRCONDITION, // 空調
    ENVIROMENT, // 微環境
    FIRE, // 消防
    SECURITY, // 連綫保全
    EARTHQUAKE, // 地震
    CCTV, // cctv
    ELECTRIC // 電力
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

    @property(CCString)
    code: string;

    @property({ type: Enum(EquipmentBelong) })
    belong: EquipmentBelong = EquipmentBelong.TAIBO;

    @property({ type: Enum(EquipmentFloor) })
    floor: EquipmentFloor = EquipmentFloor.B1F;

    @property({ type: Enum(EquipmentState) })
    state: EquipmentState = EquipmentState.NORMAL;

    @property({ type: Enum(EquipmentType) })
    type: EquipmentType = EquipmentType.AIR;

    view: Node;

    private isOnlyDot = false;
    private message: string = "異常信號";
    private time: string = "10-08 10:15";
    private groupMode = false;

    private data = {
        temp: 0,
        wet: 54,
        co2: 0.5,
        pm: 10
    }

    private alarmable = [
        EquipmentType.AIR, EquipmentType.AIRCONDITION, EquipmentType.ENVIROMENT, EquipmentType.FIRE, EquipmentType.SECURITY, EquipmentType.EARTHQUAKE, EquipmentType.CCTV, EquipmentType.ELECTRIC
    ];

    private electable = [
        EquipmentType.AIRCONDITION, EquipmentType.FIRE, EquipmentType.SECURITY, EquipmentType.EARTHQUAKE, EquipmentType.ELECTRIC
    ];

    private showOnScreen = true;

    start() {

    }

    isAlarmable() {
        return this.alarmable.indexOf(this.type) >= 0;
    }

    isElectable() {
        return this.electable.indexOf(this.type) >= 0;
    }

    setShow(show: boolean) {
        this.showOnScreen = show;
        this.node.emit(EquipmentModel.ON_CHANGE, this);
    }

    setOnlyDot(only: boolean) {
        this.isOnlyDot = only;
        this.node.emit(EquipmentModel.ON_CHANGE, this);
    }

    getShow() {
        return this.showOnScreen;
    }

    getOnlyDot() {
        return this.isOnlyDot;
    }

    getMessage() {
        return this.message;
    }

    setData(state, msg, time, data) {
        this.state = state;
        this.message = msg;
        this.time = time;
        this.data = data;
        this.node.emit(EquipmentModel.ON_CHANGE, this);
    }

    setGroupMode(group) {
        this.groupMode = group;
        this.node.emit(EquipmentModel.ON_CHANGE, this);
    }

    getGroupMode() {
        return this.groupMode;
    }

    getData() {
        return this.data;
    }

    getTime() {
        return this.time;
    }

    getMsg() {
        return this.message;
    }

    // setState(state: EquipmentState) {
    //     if (this.state != state) {
    //         this.state = state;
    //         this.node.emit(EquipmentModel.ON_CHANGE, this);
    //     }
    // }

    update(deltaTime: number) {

    }
}


