import { _decorator, Button, Camera, CCBoolean, Component, director, Enum, EventHandler, EventKeyboard, input, Input, KeyCode, log, Node, Vec3 } from 'cc';
import { BuildingController } from './BuildingController';
import { Navigation } from './Navigation';
import { EquipmentIcon } from './EquipmentIcon';
import { EquipmentBelong, EquipmentFloor, EquipmentModel, EquipmentState, EquipmentType, Tag } from './EquipmentModel';
import { Equipment } from './Equipment';
import { Model } from './Model';
import { Orbit } from './Orbit';
import { Level } from './EarthquakeAlarmModel';
const { ccclass, property } = _decorator;
const { requireComponent } = _decorator;

export enum BUILDTYPE {
    DEBUG,
    PREVIEW,
    RELEASE
}

@ccclass('Controller')
@requireComponent(Model)
export class Controller extends Component {

    @property(BuildingController)
    buildingTaibo: BuildingController;

    @property(BuildingController)
    buildingXuku: BuildingController;

    @property(Orbit)
    navigation: Orbit;

    @property(Node)
    uiNode: Node;

    @property({ type: Enum(BUILDTYPE) })
    buildType = BUILDTYPE.DEBUG;

    private building: BuildingController;
    private isScifi = false;
    isForward: boolean;
    isLeft: boolean;
    isBack: boolean;
    isRight: boolean;
    isUp: boolean;
    isDown: boolean;

    protected onLoad(): void {

        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    start() {

        this.building = this.buildingTaibo;

        this.buildingTaibo.btnEquipmentIcon.forEach((icon, id, ary) => {
            icon.on(EquipmentIcon.ON_CLICK, this.onBtnEquipmentIconClick, this);
        });

        this.buildingXuku.btnEquipmentIcon.forEach((icon, id, ary) => {
            icon.on(EquipmentIcon.ON_CLICK, this.onBtnEquipmentIconClick, this);
        });

        const self = this;
        window["cocos"] = {
            openFloor(id = 0) {
                switch (id) {
                    case -2: self.building.openBuilding(EquipmentFloor.B2F); break;
                    case -1: self.building.openBuilding(EquipmentFloor.B1F); break;
                    case 1: self.building.openBuilding(EquipmentFloor.N1F); break;
                    case 2: self.building.openBuilding(EquipmentFloor.N2F); break;
                    case 3: self.building.openBuilding(EquipmentFloor.N3F); break;
                    case 4: self.building.openBuilding(EquipmentFloor.N4F); break;
                    case 5: self.building.openBuilding(EquipmentFloor.N5F); break;
                    case 6: self.building.openBuilding(EquipmentFloor.N6F); break;
                    case 99: self.building.openBuilding(EquipmentFloor.ALL); break;
                    default:
                        console.log("id值域為0~6, 99");
                }

            },
            backToInit() {
                self.onBackCameraClick();
            },
            zoomToEquipment(code: string) {
                self.zoomToEquipment(code);
            },
            showAll(onlyAlarm = false) {
                if (onlyAlarm) {
                    self.changeToALLAlarm();
                } else {
                    self.changeToALL();
                }
            },
            showAir(onlyAlarm = false) {
                if (onlyAlarm) {
                    self.changeToAirAlarm();
                } else {
                    self.changeToAir();
                }
            },
            showAirConditioner(onlyAlarm = false) {
                if (onlyAlarm) {
                    self.changeToAirConditionAlarm();
                } else {
                    self.changeToAirCondition();
                }
            },
            showEnvironment(onlyAlarm = false) {
                if (onlyAlarm) {
                    self.changeToEnviromentAlarm();
                } else {
                    self.changeToEnviroment();
                }
            },
            showSecurity(onlyAlarm = false) {
                if (onlyAlarm) {
                    self.changeToSecurityAlarm();
                } else {
                    self.changeToSecurity();
                }
            },
            showCCTV(onlyAlarm = false) {
                if (onlyAlarm) {
                    self.changeToCCTVAlarm();
                } else {
                    self.changeToCCTV();
                }
            },
            showWeb(onlyAlarm = false) {
                if (onlyAlarm) {
                    self.changeToWebAlarm();
                } else {
                    self.changeToWeb();
                }
            },
            showOther(onlyAlarm = false) {
                if (onlyAlarm) {
                    self.changeToOtherAlarm();
                } else {
                    self.changeToOther();
                }
            },
            showEarthquake() {
                self.changeToEarthquake();
            },
            showEarthquakeAlarm(level = 50) {
                switch (level) {
                    case 50:
                        self.changeToEarthquakeAlarm5A();
                        break;
                    case 51:
                        self.changeToEarthquakeAlarm5B();
                        break;
                    case 60:
                        self.changeToEarthquakeAlarm6A();
                        break;
                    case 61:
                        self.changeToEarthquakeAlarm6B();
                        break;
                    case 70:
                        self.changeToEarthquakeAlarm7A();
                        break;
                    default:
                        console.log("50:5A, 51:5B, 60:6A, 61:6B, 70:7A");
                }
            },
            showElectric(onlyAlarm = false) {
                if (onlyAlarm) {
                    self.changeToElectricAlarm();
                } else {
                    self.changeToElectric();
                }
            },
            showFire(onlyAlarm = false) {
                if (onlyAlarm) {
                    self.changeToFireAlarm();
                } else {
                    self.changeToFire();
                }
            },
            changeToTaibo() {
                self.changeToTaibo();
            },
            changeToXuku() {
                self.changeToXuku();
            },
            toggleScifi() {
                self.toggleScifi();
            },
            syncData(data: any) {
                console.log("receive data from web");
                console.log(data);

                self.syncEquipment(data);
            }
        }

        switch (this.buildType) {
            case BUILDTYPE.DEBUG:
                break;
            case BUILDTYPE.PREVIEW:
                this.uiNode.active = false;
                break;
            case BUILDTYPE.RELEASE:
                this.uiNode.active = false;

                this.buildingTaibo.closeBuilding();
                this.buildingXuku.closeBuilding();

                this.callWeb("cocosReady", null);
                break;

        }
    }

    testSyncEquipment() {
        const data = [{ id: "AIR001", belong: 0, state: 2, msg: "異常信號", time: "02-01 20:00", data: { temp: 20, wet: 10, co2: 33, pm: 23 } }, { id: "AIR002", belong: 0, state: 3, msg: "異常信號2", time: "01-01 00:00", data: { temp: 20, wet: 10, co2: 33, pm: 23 } }];
        this.syncEquipment(data);
    }

    private syncEquipment(data) {
        const self = this;
        data.forEach((data, id, ary) => {
            const eid = data.id;
            const belong = data.belong;
            const msg = data.msg;
            const time = data.time;
            const eData = data.data;

            var state;
            switch (data.state) {
                case 0: state = EquipmentState.NORMAL; break;
                case 1: state = EquipmentState.NOT_ACTIVE; break;
                case 2: state = EquipmentState.ALARM1; break;
                case 3: state = EquipmentState.ALARM2; break;
                case 4: state = EquipmentState.ALARM3; break;
                case 5: state = EquipmentState.ALARM4; break;
                default:
                    state = EquipmentState.NORMAL;
                    console.log("state值域為0~5");
            }

            switch (belong) {
                case 0:
                    self.buildingTaibo.syncEquipment(eid, state, time, msg, eData);
                    break;
                case 1:
                    self.buildingXuku.syncEquipment(eid, state, time, msg, eData);
                    break;
            }
        });
    }

    onKeyUp(e: EventKeyboard) {
        switch (e.keyCode) {
            case KeyCode.KEY_R:
                this.toggleScifi();
        }
    }

    onBtnEquipmentIconClick(model: EquipmentModel) {
        this.callWeb("onClickEquipment", model.code);
    }

    private allState = [EquipmentState.NOT_ACTIVE, EquipmentState.NORMAL, EquipmentState.ALARM1, EquipmentState.ALARM2, EquipmentState.ALARM3, EquipmentState.ALARM4];
    private onlyAlarmState = [EquipmentState.ALARM1, EquipmentState.ALARM2, EquipmentState.ALARM3, EquipmentState.ALARM4];

    changeToALL() {
        this.building.changeEquipmentType([EquipmentType.AIR, EquipmentType.AIRCONDITION, EquipmentType.CCTV, EquipmentType.EARTHQUAKE, EquipmentType.ELECTRIC, EquipmentType.ENVIROMENT, EquipmentType.FIRE, EquipmentType.SECURITY, EquipmentType.WEB]);
        this.building.changeEquipmentState(this.allState);
    }

    changeToALLAlarm() {
        this.building.changeEquipmentType([EquipmentType.AIR, EquipmentType.AIRCONDITION, EquipmentType.CCTV, EquipmentType.EARTHQUAKE_ALARM, EquipmentType.ELECTRIC, EquipmentType.ENVIROMENT, EquipmentType.FIRE, EquipmentType.SECURITY_ALARM, EquipmentType.WEB]);
        this.building.changeEquipmentState(this.onlyAlarmState);
    }

    changeToAir() {
        this.building.changeEquipmentType([EquipmentType.AIR]);
        this.building.changeEquipmentState(this.allState);
    }

    changeToAirAlarm() {
        this.building.changeEquipmentType([EquipmentType.AIR]);
        this.building.changeEquipmentState(this.onlyAlarmState);
    }

    changeToAirCondition() {
        this.building.changeEquipmentType([EquipmentType.AIRCONDITION]);
        this.building.changeEquipmentState(this.allState);
    }

    // 機電和空調的告警都歸類到【其他設備】
    changeToAirConditionAlarm() {
        this.building.changeEquipmentType([EquipmentType.AIRCONDITION, EquipmentType.ELECTRIC]);
        this.building.changeEquipmentState(this.onlyAlarmState);
    }

    changeToEnviroment() {
        this.building.changeEquipmentType([EquipmentType.ENVIROMENT]);
        this.building.changeEquipmentState(this.allState);
    }

    changeToEnviromentAlarm() {
        this.building.changeEquipmentType([EquipmentType.ENVIROMENT]);
        this.building.changeEquipmentState(this.onlyAlarmState);
    }

    changeToFire() {
        this.building.changeEquipmentType([EquipmentType.FIRE]);
        this.building.changeEquipmentState(this.allState);
    }

    changeToFireAlarm() {
        this.building.changeEquipmentType([EquipmentType.FIRE]);
        this.building.changeEquipmentState(this.onlyAlarmState);
    }

    changeToSecurity() {
        this.building.changeEquipmentType([EquipmentType.SECURITY]);
        this.building.changeEquipmentState(this.allState);
    }

    changeToSecurityAlarm() {
        this.building.changeEquipmentType([EquipmentType.SECURITY_ALARM]);
        this.building.changeEquipmentState(this.onlyAlarmState);
    }

    changeToCCTV() {
        this.building.changeEquipmentType([EquipmentType.CCTV]);
        this.building.changeEquipmentState(this.allState);
    }

    changeToCCTVAlarm() {
        this.building.changeEquipmentType([EquipmentType.CCTV]);
        this.building.changeEquipmentState(this.onlyAlarmState);
    }

    changeToElectric() {
        this.building.changeEquipmentType([EquipmentType.ELECTRIC]);
        this.building.changeEquipmentState(this.allState);
    }

    changeToWeb() {
        this.building.changeEquipmentType([EquipmentType.WEB]);
        this.building.changeEquipmentState(this.allState);
    }

    changeToWebAlarm() {
        this.building.changeEquipmentType([EquipmentType.WEB]);
        this.building.changeEquipmentState(this.onlyAlarmState);
    }

    changeToOther() {
        this.building.changeEquipmentType([EquipmentType.OTHER]);
        this.building.changeEquipmentState(this.allState);
    }

    changeToOtherAlarm() {
        this.building.changeEquipmentType([EquipmentType.OTHER]);
        this.building.changeEquipmentState(this.onlyAlarmState);
    }

    // 機電和空調的告警都歸類到【其他設備】
    changeToElectricAlarm() {
        this.building.changeEquipmentType([EquipmentType.AIRCONDITION, EquipmentType.ELECTRIC]);
        this.building.changeEquipmentState(this.onlyAlarmState);
    }

    changeToEarthquake() {
        this.building.changeEquipmentType([EquipmentType.EARTHQUAKE]);
        this.building.changeEquipmentState(this.allState);
    }

    changeToEarthquakeAlarm(level: Level) {
        this.building.changeEquipmentType([EquipmentType.EARTHQUAKE_ALARM]);
        this.building.changeEquipmentState(this.allState);
        this.building.changeEarthquakeLevel(level);
    }

    changeToEarthquakeAlarm5A() {
        this.changeToEarthquakeAlarm(Level.EARTHQUAKE_5A);
    }

    changeToEarthquakeAlarm5B() {
        this.changeToEarthquakeAlarm(Level.EARTHQUAKE_5B);
    }

    changeToEarthquakeAlarm6A() {
        this.changeToEarthquakeAlarm(Level.EARTHQUAKE_6A);
    }

    changeToEarthquakeAlarm6B() {
        this.changeToEarthquakeAlarm(Level.EARTHQUAKE_6B);
    }

    changeToEarthquakeAlarm7A() {
        this.changeToEarthquakeAlarm(Level.EARTHQUAKE_7A);
    }

    // changeToAir() {
    //     this.building.changeEquipmentType(EquipmentType.EARTHQUAKE);
    // }

    changeFloorB2F() {
        this.building.openBuilding(EquipmentFloor.B2F);
    }

    changeFloorB1F() {
        this.building.openBuilding(EquipmentFloor.B1F);
    }

    changeFloorN1F() {
        this.building.openBuilding(EquipmentFloor.N1F);
    }

    changeFloorN2F() {
        this.building.openBuilding(EquipmentFloor.N2F);
    }

    changeFloorN3F() {
        this.building.openBuilding(EquipmentFloor.N3F);
    }

    changeFloorN4F() {
        this.building.openBuilding(EquipmentFloor.N4F);
    }

    changeFloorN5F() {
        this.building.openBuilding(EquipmentFloor.N5F);
    }

    changeFloorN6F() {
        this.building.openBuilding(EquipmentFloor.N6F);
    }

    changeFloorALL() {
        this.building.openBuilding(EquipmentFloor.ALL);
    }

    changeToTaibo() {

        this.buildingTaibo.currentBelong = EquipmentBelong.TAIBO;
        this.buildingXuku.currentBelong = EquipmentBelong.TAIBO;

        this.buildingTaibo.openBuilding();
        this.buildingXuku.closeBuilding();

        this.building = this.buildingTaibo;
    }

    changeToXuku() {

        this.buildingTaibo.currentBelong = EquipmentBelong.XUKU;
        this.buildingXuku.currentBelong = EquipmentBelong.XUKU;

        this.buildingXuku.openBuilding();
        this.buildingTaibo.closeBuilding();

        this.building = this.buildingXuku;
    }

    zoomToEquipment(code) {
        const equipment = this.building.getEquipmentByCode(code);
        if (equipment === null) {
            console.log("cocos 沒有這個code的設備:" + code);
            return;
        }
        this.building.onBtnEquipmentIconClick(equipment.getModel());
    }

    toggleScifi() {
        if (this.isScifi) {
            this.onNormalClick();
        } else {
            this.onScifiClick();
        }
    }
    // getEquipmentScreenPos() {

    //     const locations: Vec3[] = [];
    //     this.building.equipments.forEach((equipment, id, ary) => {

    //         // log(equipment.node.name);

    //         const worldPosition = equipment.node.worldPosition;

    //         // log(worldPosition);

    //         // 将世界坐标转换为屏幕坐标
    //         const screenPosition = new Vec3();
    //         // this.navigation.getComponent(Camera).convertToUINode(worldPosition, this.uiNode, screenPosition);
    //         this.navigation.getComponent(Camera).worldToScreen(worldPosition, screenPosition);

    //         // 调整屏幕坐标以匹配视图端口大小
    //         // screenPosition.x = screenPosition.x * view.getVisibleSize().width / 2 + view.getVisibleSize().width / 2;
    //         // screenPosition.y = screenPosition.y * view.getVisibleSize().height / 2 + view.getVisibleSize().height / 2;

    //         locations.push(screenPosition);
    //         // console.log(`屏幕坐标: (${screenPosition.x}, ${screenPosition.y}, ${screenPosition.z})`);
    //     });
    //     return locations;
    // }


    // onScreenClick() {
    //     this.getEquipmentScreenPos();
    // }

    onBackCameraClick() {
        this.navigation.backToInit();
    }

    onShowFloorClick(e: MouseEvent) {
        this.building.showFloor(Math.floor(Math.random() * this.building.buildingFloor.length));
    }

    onEquipmentClick() {
        this.zoomToEquipment("319107");
    }

    onNormalClick() {
        this.building.toNormal();
        this.isScifi = false;
    }

    onScifiClick() {
        this.building.toScifi();
        this.isScifi = true;
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


