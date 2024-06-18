import { _decorator, CCInteger, CCString, Component, Enum, error, log, Mesh, Node } from 'cc';
import { Controller } from './Controller';
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
    NONE,
    AIR, // 空品
    AIRCONDITION, // 空調
    ENVIROMENT, // 微環境
    FIRE, // 消防
    SECURITY, // 連綫保全
    EARTHQUAKE, // 地震
    CCTV, // cctv
    ELECTRIC, // 電力
    EARTHQUAKE_ALARM, // 地震告警(only for alarm)
    SECURITY_ALARM, // 連綫保全告警(only for alarm)
    WEB, // 網路
    OTHER // 其他
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
    N7F,
    ALL
}

export enum Tag {
    EARTHQUAKE_5A,
    EARTHQUAKE_5B,
    EARTHQUAKE_6A,
    EARTHQUAKE_6B,
    EARTHQUAKE_7A
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

    @property(CCString)
    CNCode: string;

    @property(CCString)
    locationName: string;

    @property(CCString)
    codePrefix: string = "{0}";

    @property({ type: Enum(EquipmentBelong) })
    belong: EquipmentBelong = EquipmentBelong.TAIBO;

    @property({ type: Enum(EquipmentFloor) })
    floor: EquipmentFloor = EquipmentFloor.B1F;

    @property({ type: Enum(EquipmentState) })
    state: EquipmentState = EquipmentState.NORMAL;

    @property({ type: Enum(EquipmentType) })
    type: EquipmentType = EquipmentType.AIR;

    @property(Mesh)
    meshs: Mesh[] = [];

    @property({ type: Enum(Tag) })
    tags: Tag[] = [];

    view: Node;

    private isOnlyDot = false;
    private message: string = "異常信號";
    private time: string = "10-08 10:15";
    protected groupMode = false;

    private data = {
        temp: 0,
        wet: 54,
        co2: 0.5,
        pm: 10
    }

    // private alarmable = [
    //     EquipmentType.AIR, EquipmentType.AIRCONDITION, EquipmentType.ENVIROMENT, EquipmentType.FIRE, EquipmentType.SECURITY, EquipmentType.EARTHQUAKE, EquipmentType.CCTV, EquipmentType.ELECTRIC
    // ];

    // private electable = [
    //     EquipmentType.AIRCONDITION, EquipmentType.FIRE, EquipmentType.SECURITY, EquipmentType.EARTHQUAKE, EquipmentType.ELECTRIC
    // ];

    protected showOnScreen = true;

    private formatString(template: string, ...args: any[]): string {
        return template.replace(/{(\d+)}/g, (match, index) => {
            return typeof args[index] !== 'undefined' ? args[index] : match;
        });
    }

    protected onLoad(): void {
        const modelData = this.node.name.split("_");
        const belong = modelData[1];
        const floor = modelData[2];
        const type = modelData[3];

        if (modelData.length > 4) {
            const code = modelData[4];

            // 規則一：把基本的code的[-]統一換成[_]。也就是説如果需要帶有[_]的名稱可以先用[-]
            let usingCode = code.replace(/-/gm, "_");
            // 規則二：把codePrefix的format套用到目前的code上。如果同時需要[_][-]。可以用這個方法
            usingCode = this.formatString(this.codePrefix, usingCode);
            this.code = usingCode;

            // for earthquake alarm
            if (this.code.indexOf("5AR") > -1) {
                this.state = EquipmentState.ALARM1;
                this.tags = [Tag.EARTHQUAKE_5A];
            }
            if (this.code.indexOf("5AB") > -1) {
                this.state = EquipmentState.ALARM4;
                this.tags = [Tag.EARTHQUAKE_5A];
            }
            if (this.code.indexOf("5BR") > -1) {
                this.state = EquipmentState.ALARM1;
                this.tags = [Tag.EARTHQUAKE_5B];
            }
            if (this.code.indexOf("5BB") > -1) {
                this.state = EquipmentState.ALARM4;
                this.tags = [Tag.EARTHQUAKE_5B];
            }
            if (this.code.indexOf("6AR") > -1) {
                this.state = EquipmentState.ALARM1;
                this.tags = [Tag.EARTHQUAKE_6A];
            }
            if (this.code.indexOf("6AB") > -1) {
                this.state = EquipmentState.ALARM4;
                this.tags = [Tag.EARTHQUAKE_6A];
            }
            if (this.code.indexOf("6BR") > -1) {
                this.state = EquipmentState.ALARM1;
                this.tags = [Tag.EARTHQUAKE_6B];
            }
            if (this.code.indexOf("6BB") > -1) {
                this.state = EquipmentState.ALARM4;
                this.tags = [Tag.EARTHQUAKE_6B];
            }
            if (this.code.indexOf("7AR") > -1) {
                this.state = EquipmentState.ALARM1;
                this.tags = [Tag.EARTHQUAKE_7A];
            }
            if (this.code.indexOf("7AB") > -1) {
                this.state = EquipmentState.ALARM4;
                this.tags = [Tag.EARTHQUAKE_7A];
            }
        }

        switch (belong) {
            case "Taibo": this.belong = EquipmentBelong.TAIBO; break;
            case "Xuku": this.belong = EquipmentBelong.XUKU; break;
            default: error("should not be here!", this.node.name, belong);
        }

        switch (floor) {
            case "B2F": this.floor = EquipmentFloor.B2F; break;
            case "B1F": this.floor = EquipmentFloor.B1F; break;
            case "1F": this.floor = EquipmentFloor.N1F; break;
            case "2F": this.floor = EquipmentFloor.N2F; break;
            case "3F": this.floor = EquipmentFloor.N3F; break;
            case "4F": this.floor = EquipmentFloor.N4F; break;
            case "5F": this.floor = EquipmentFloor.N5F; break;
            case "6F": this.floor = EquipmentFloor.N6F; break;
            case "7F": this.floor = EquipmentFloor.N7F; break;
            default: error("should not be here!", this.node.name, floor);
        }

        switch (type) {
            case "Air": this.type = EquipmentType.AIR; break;
            case "AirCon": this.type = EquipmentType.AIRCONDITION; break;
            case "CCTV": this.type = EquipmentType.CCTV; break;
            case "Earth": this.type = EquipmentType.EARTHQUAKE; break;
            case "EarthAlarm": this.type = EquipmentType.EARTHQUAKE_ALARM; break;
            case "Elec": this.type = EquipmentType.ELECTRIC; break;
            case "Enviro": this.type = EquipmentType.ENVIROMENT; break;
            case "Fire": this.type = EquipmentType.FIRE; break;
            case "Secu": this.type = EquipmentType.SECURITY; break;
            case "SecuAlarm": this.type = EquipmentType.SECURITY_ALARM; break;
            case "Web": this.type = EquipmentType.WEB; break;
            case "Other": this.type = EquipmentType.OTHER; break;
            default: error("should not be here!", this.node.name, type);
        }

        if(this.code == "10001"){
            console.log(this.type);
            console.log(this.floor);
        }

        // if(this.type === EquipmentType.AIRCONDITION){
        //     console.log(this.code);
        //     console.log(this.floor);
        // }
    }

    start() {

    }

    // isAlarmable() {
    //     return this.alarmable.indexOf(this.type) >= 0;
    // }

    // isElectable() {
    //     return this.electable.indexOf(this.type) >= 0;
    // }

    setShow(show: boolean) {
        this.showOnScreen = show;
        this.node.emit(EquipmentModel.ON_CHANGE, this);
    }

    setOnlyDot(only: boolean) {
        this.isOnlyDot = only;
        this.node.emit(EquipmentModel.ON_CHANGE, this);
    }

    hasTag(tag: Tag) {
        return this.tags.indexOf(tag) > -1;
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

    setState(state: EquipmentState) {
        if (this.state != state) {
            this.state = state;
            this.node.emit(EquipmentModel.ON_CHANGE, this);
        }
    }

    // isAlarm() {
    //     return this.state == EquipmentState.ALARM1 || this.state == EquipmentState.ALARM2 || this.state == EquipmentState.ALARM3 || this.state == EquipmentState.ALARM4;
    // }

    update(deltaTime: number) {

    }
}


