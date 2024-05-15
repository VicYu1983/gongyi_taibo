import { _decorator, CCBoolean, Color, Component, Enum, error, log, MeshRenderer, Node, Vec4 } from 'cc';
import { EquipmentBelong, EquipmentFloor, EquipmentModel, EquipmentState, EquipmentType } from './EquipmentModel';
const { ccclass, property } = _decorator;
const { requireComponent } = _decorator;

@ccclass('Equipment')
@requireComponent(EquipmentModel)
export class Equipment extends Component {

    @property(MeshRenderer)
    alarmIcon: MeshRenderer;

    @property(Color)
    normalColor: Color = new Color(0, 224, 255, 255);

    @property(Color)
    notActiveColor: Color = new Color(144, 144, 144, 255);

    @property(Color)
    alarm1Color: Color = new Color(255, 55, 55, 255);

    @property(Color)
    alarm2Color: Color = new Color(245, 166, 47, 255);

    @property(Color)
    alarm3Color: Color = new Color(70, 249, 88, 255);

    @property(Color)
    alarm4Color: Color = new Color(22, 94, 255, 255);

    currentColor: Color = this.normalColor;

    protected onLoad(): void {
        this.getModel().node.on(EquipmentModel.ON_CHANGE, this.onModelStateChange, this);

        // const modelData = this.node.name.split("_");
        // const belong = modelData[1];
        // const floor = modelData[2];
        // const type = modelData[3];
        // const code = modelData[4];

        // switch (belong) {
        //     case "Taibo": this.getModel().belong = EquipmentBelong.TAIBO; break;
        //     case "Xuku": this.getModel().belong = EquipmentBelong.TAIBO; break;
        //     default: error("should not be here!", this.node.name, belong);
        // }

        // switch (floor) {
        //     case "B2F": this.getModel().floor = EquipmentFloor.B2F; break;
        //     case "B1F": this.getModel().floor = EquipmentFloor.B1F; break;
        //     case "1F": this.getModel().floor = EquipmentFloor.N1F; break;
        //     case "2F": this.getModel().floor = EquipmentFloor.N2F; break;
        //     case "3F": this.getModel().floor = EquipmentFloor.N3F; break;
        //     case "4F": this.getModel().floor = EquipmentFloor.N4F; break;
        //     case "5F": this.getModel().floor = EquipmentFloor.N5F; break;
        //     case "6F": this.getModel().floor = EquipmentFloor.N6F; break;
        //     case "7F": this.getModel().floor = EquipmentFloor.N7F; break;
        //     default: error("should not be here!", this.node.name, floor);
        // }

        // switch (type) {
        //     case "Air": this.getModel().type = EquipmentType.AIR; break;
        //     case "AirCon": this.getModel().type = EquipmentType.AIRCONDITION; break;
        //     case "CCTV": this.getModel().type = EquipmentType.CCTV; break;
        //     case "Earth": this.getModel().type = EquipmentType.EARTHQUAKE; break;
        //     case "Elec": this.getModel().type = EquipmentType.ELECTRIC; break;
        //     case "Enviro": this.getModel().type = EquipmentType.ENVIROMENT; break;
        //     case "Fire": this.getModel().type = EquipmentType.FIRE; break;
        //     case "Secu": this.getModel().type = EquipmentType.SECURITY; break;
        //     default: error("should not be here!", this.node.name, type);
        // }
        
        // this.getModel().code = code;
    }

    start() {
        this.currentColor = this.normalColor.clone();
        this.onModelStateChange(this.getModel());
    }

    onModelStateChange(data: EquipmentModel) {
        this.node.active = data.getShow();
        this.setState();
    }

    setState() {
        switch (this.getModel().state) {
            case EquipmentState.ALARM4:
                this.changeToAlarm4();
                break;
            case EquipmentState.ALARM3:
                this.changeToAlarm3();
                break;
            case EquipmentState.ALARM2:
                this.changeToAlarm2();
                break;
            case EquipmentState.ALARM1:
                this.changeToAlarm1();
                break;
            case EquipmentState.NORMAL:
                this.changeToNormal();
                break;
            case EquipmentState.NOT_ACTIVE:
                this.changeToNotActive();
                break;

        }
    }

    changeToAlarm1() {
        this.alarmIcon.material.setProperty("mainColor", this.alarm1Color);
    }

    changeToAlarm2() {
        this.alarmIcon.material.setProperty("mainColor", this.alarm2Color);
    }

    changeToAlarm3() {
        this.alarmIcon.material.setProperty("mainColor", this.alarm3Color);
    }

    changeToAlarm4() {
        this.alarmIcon.material.setProperty("mainColor", this.alarm4Color);
    }

    changeToNotActive() {
        this.alarmIcon.material.setProperty("mainColor", this.notActiveColor);
    }

    changeToNormal() {
        this.alarmIcon.material.setProperty("mainColor", this.normalColor);
    }

    update(deltaTime: number) {

    }

    getModel() {
        return this.getComponent(EquipmentModel);
    }
}


