import { _decorator, Button, Camera, CCBoolean, Component, director, Enum, EventHandler, EventKeyboard, input, Input, KeyCode, log, Node, Vec3 } from 'cc';
import { BuildingController } from './BuildingController';
import { Navigation } from './Navigation';
import { EquipmentIcon } from './EquipmentIcon';
import { EquipmentBelong, EquipmentFloor, EquipmentModel, EquipmentState, EquipmentType } from './EquipmentModel';
import { Equipment } from './Equipment';
import { Model } from './Model';
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

    @property(Navigation)
    navigation: Navigation;

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
            openFloor: function (id = 0) {
                switch (id) {
                    case 0: self.building.openBuilding(EquipmentFloor.B1F); break;
                    case 1: self.building.openBuilding(EquipmentFloor.N1F); break;
                    case 2: self.building.openBuilding(EquipmentFloor.N2F); break;
                    case 3: self.building.openBuilding(EquipmentFloor.N3F); break;
                    case 4: self.building.openBuilding(EquipmentFloor.N4F); break;
                }
            },
            backToInit: function () {
                self.onBackCameraClick();
            },
            showAir(onlyAlarm = false) {
                if (onlyAlarm) {
                    self.changeToAirAlarm();
                } else {
                    self.changeToAir();
                }
            },
            showAirCondition(onlyAlarm = false) {
                if (onlyAlarm) {
                    self.changeToAirConditionAlarm();
                } else {
                    self.changeToAirCondition();
                }
            },
            showEnviroment(onlyAlarm = false) {
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
            showEarthquake(onlyAlarm = false) {
                if (onlyAlarm) {
                    self.changeToEarthquakeAlarm();
                } else {
                    self.changeToEarthquake();
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
        this.callWeb("onClickEquipment", model.id);
    }

    // changeToCarbon() {
    //     this.building.changeEquipmentType(EquipmentType.CARBON);
    // }

    changeToAir() {
        this.building.changeEquipmentType(EquipmentType.AIR);
        this.building.changeEquipmentState(EquipmentState.NONE);
    }

    changeToAirAlarm() {
        this.building.changeEquipmentType(EquipmentType.AIR);
        this.building.changeEquipmentState(EquipmentState.ALARM1);
    }

    changeToAirCondition() {
        this.building.changeEquipmentType(EquipmentType.AIRCONDITION);
        this.building.changeEquipmentState(EquipmentState.NONE);
    }

    changeToAirConditionAlarm() {
        this.building.changeEquipmentType(EquipmentType.AIRCONDITION);
        this.building.changeEquipmentState(EquipmentState.ALARM1);
    }

    changeToEnviroment() {
        this.building.changeEquipmentType(EquipmentType.ENVIROMENT);
        this.building.changeEquipmentState(EquipmentState.NONE);
    }

    changeToEnviromentAlarm() {
        this.building.changeEquipmentType(EquipmentType.ENVIROMENT);
        this.building.changeEquipmentState(EquipmentState.ALARM1);
    }

    changeToFire() {
        this.building.changeEquipmentType(EquipmentType.FIRE);
        this.building.changeEquipmentState(EquipmentState.NONE);
    }

    changeToFireAlarm() {
        this.building.changeEquipmentType(EquipmentType.FIRE);
        this.building.changeEquipmentState(EquipmentState.ALARM1);
    }

    changeToSecurity() {
        this.building.changeEquipmentType(EquipmentType.SECURITY);
        this.building.changeEquipmentState(EquipmentState.NONE);
    }

    changeToSecurityAlarm() {
        this.building.changeEquipmentType(EquipmentType.SECURITY);
        this.building.changeEquipmentState(EquipmentState.ALARM1);
    }

    changeToCCTV() {
        this.building.changeEquipmentType(EquipmentType.CCTV);
        this.building.changeEquipmentState(EquipmentState.NONE);
    }

    changeToCCTVAlarm() {
        this.building.changeEquipmentType(EquipmentType.CCTV);
        this.building.changeEquipmentState(EquipmentState.ALARM1);
    }

    changeToElectric() {
        this.building.changeEquipmentType(EquipmentType.ELECTRIC);
        this.building.changeEquipmentState(EquipmentState.NONE);
    }

    changeToElectricAlarm() {
        this.building.changeEquipmentType(EquipmentType.ELECTRIC);
        this.building.changeEquipmentState(EquipmentState.ALARM1);
    }

    changeToEarthquake() {
        this.building.changeEquipmentType(EquipmentType.EARTHQUAKE);
        this.building.changeEquipmentState(EquipmentState.NONE);
    }

    changeToEarthquakeAlarm() {
        this.building.changeEquipmentType(EquipmentType.EARTHQUAKE);
        this.building.changeEquipmentState(EquipmentState.ALARM1);
    }


    // changeToAir() {
    //     this.building.changeEquipmentType(EquipmentType.EARTHQUAKE);
    // }

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

    changeToTaibo() {
        this.buildingTaibo.changeEquipmentBelong(EquipmentBelong.TAIBO);
        this.buildingXuku.changeEquipmentBelong(EquipmentBelong.TAIBO);

        this.buildingTaibo.openBuilding(EquipmentFloor.B1F);
        this.buildingXuku.closeBuilding();

        this.building = this.buildingTaibo;
    }

    changeToXuku() {
        this.buildingTaibo.changeEquipmentBelong(EquipmentBelong.XUKU);
        this.buildingXuku.changeEquipmentBelong(EquipmentBelong.XUKU);

        this.buildingXuku.openBuilding(EquipmentFloor.N1F);
        this.buildingTaibo.closeBuilding();

        this.building = this.buildingXuku;
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
        const equipment = this.building.getEquipment(0);

        const pos = equipment.node.getPosition();
        const rot = new Vec3();
        equipment.node.getRotation().getEulerAngles(rot);
        this.navigation.setTargetPositionAndRotation(pos, rot);
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


