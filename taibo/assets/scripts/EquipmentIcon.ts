import { _decorator, animation, Animation, Button, Camera, Color, Component, Label, log, Node, NodeEventType, Size, Sprite, SpriteFrame, UITransform, Vec3 } from 'cc';
import { EquipmentModel, EquipmentState, EquipmentType } from './EquipmentModel';
import { Navigation } from './Navigation';
const { ccclass, property } = _decorator;

@ccclass('EquipmentIcon')
export class EquipmentIcon extends Component {

    static ON_CLICK = "ON_CLICK";

    @property(Navigation)
    navigation: Navigation;

    @property(UITransform)
    bubble: UITransform;

    @property(Label)
    txtName: Label;

    @property(Label)
    txtLocation: Label;

    // error =========
    @property(Label)
    txtTime: Label;

    @property(Label)
    txtMsg: Label;
    // error =========

    // air ==========
    @property(Label)
    txtTemp: Label;

    @property(Label)
    txtWet: Label;

    @property(Label)
    txtCO: Label;

    @property(Label)
    txtPM: Label;
    // air ==========

    // enviroment ==========
    @property(Label)
    txtTemp2: Label;

    @property(Label)
    txtWet2: Label;
    // enviroment ==========

    @property(EquipmentModel)
    model: EquipmentModel;

    @property(Sprite)
    iconBackSprite: Sprite;

    @property(Vec3)
    iconBackLocation: Vec3[] = [];

    @property(Sprite)
    iconSprite: Sprite;

    @property([SpriteFrame])
    iconSpriteFrame: SpriteFrame[] = [];

    @property([Color])
    iconBackColor: Color[] = [];

    @property([Size])
    bubbleSizes: Size[] = [];

    @property([Node])
    hovers: Node[] = [];

    private bubbleNormalSize = new Size(150, 89);
    private bubbleSizeCurrent = this.bubbleNormalSize.clone();
    private bubbleSizeTarget = this.bubbleNormalSize.clone();

    private isHover = false;

    private iconBackNormalLocation = new Vec3(42, 51, 0);
    private iconBackLocationCurrent = this.iconBackNormalLocation.clone();
    private iconBackLocationTarget = this.iconBackNormalLocation.clone();

    private nameNormalLocaiton = new Vec3(20, 0, 0);
    private nameHoverLocaiton = new Vec3(20, 7, 0);

    private locationNormalLocaiton = new Vec3(20, 0, 0);
    private locationHoverLocaiton = new Vec3(20, -14, 0);

    private animationComponent;

    protected onLoad(): void {
        this.animationComponent = this.getComponent(Animation);

        this.model.node.on(EquipmentModel.ON_CHANGE, this.onModelChange, this);
        this.bubble.node.on(NodeEventType.MOUSE_UP, this.onBtnClick, this);
        this.bubble.node.on(NodeEventType.MOUSE_MOVE, this.onBtnHover, this);
        this.bubble.node.on(NodeEventType.MOUSE_LEAVE, this.onBtnRelease, this);
    }

    start() {
        this.onModelChange();
        this.onBtnRelease();
        this.closeAllHover();
    }

    // addListener() {
    //     this.removeListener();
    //     this.bubble.node.on(NodeEventType.MOUSE_UP, this.onBtnClick, this);
    //     this.bubble.node.on(NodeEventType.MOUSE_MOVE, this.onBtnHover, this);
    //     this.bubble.node.on(NodeEventType.MOUSE_LEAVE, this.onBtnRelease, this);
    // }

    // removeListener() {
    //     this.node.off(NodeEventType.MOUSE_UP, this.onBtnClick, this);
    //     this.node.off(NodeEventType.MOUSE_MOVE, this.onBtnHover, this);
    //     this.node.off(NodeEventType.MOUSE_LEAVE, this.onBtnRelease, this);
    // }

    onModelChange() {

        if (this.model.getOnlyDot()) {
            this.node.active = false;
            return;
        }

        // 播放出現動畫
        if (!this.node.active && this.model.getShow()) {
            this.animationComponent.play(this.animationComponent.clips[0].name);
        }

        // if (this.node.active && !this.model.getShow()) {
        //     log("play close");
        // }

        this.node.active = this.model.getShow();

        // 這裏也需要更新hover中的東西
        // this.onBtnHover();

        this.txtName.string = this.model.code;
        switch (this.model.type) {
            case EquipmentType.AIR:
                this.iconSprite.spriteFrame = this.iconSpriteFrame[0];
                break;
            case EquipmentType.AIRCONDITION:
                this.iconSprite.spriteFrame = this.iconSpriteFrame[3];
                break;
            case EquipmentType.CCTV:
                this.iconSprite.spriteFrame = this.iconSpriteFrame[1];
                break;
            case EquipmentType.EARTHQUAKE:
                this.iconSprite.spriteFrame = this.iconSpriteFrame[5];
                break;
            case EquipmentType.ELECTRIC:
                this.iconSprite.spriteFrame = this.iconSpriteFrame[4];
                break;
            case EquipmentType.ENVIROMENT:
                this.iconSprite.spriteFrame = this.iconSpriteFrame[2];
                break;
            case EquipmentType.FIRE:
                this.iconSprite.spriteFrame = this.iconSpriteFrame[7];
                break;
            case EquipmentType.SECURITY:
                this.iconSprite.spriteFrame = this.iconSpriteFrame[8];
                break;
        }

        switch (this.model.state) {
            case EquipmentState.NORMAL:
                this.iconBackSprite.color = this.iconBackColor[0];
                break;
            case EquipmentState.ALARM1:
                this.iconBackSprite.color = this.iconBackColor[1];
                break;
            case EquipmentState.ALARM2:
                this.iconBackSprite.color = this.iconBackColor[2];
                break;
            case EquipmentState.ALARM3:
                this.iconBackSprite.color = this.iconBackColor[3];
                break;
            case EquipmentState.ALARM4:
                break;
            case EquipmentState.NOT_ACTIVE:
                this.iconBackSprite.color = this.iconBackColor[5];

                // air
                this.txtTemp.string = "---";
                this.txtWet.string = "---";
                this.txtCO.string = "---";
                this.txtPM.string = "---";

                // enviroment
                this.txtTemp2.string = "---";
                this.txtWet2.string = "---";
                break;
        }

        switch (this.model.type) {
            case EquipmentType.AIR:
                this.txtTemp.string = this.model.getData().temp + " °C";
                this.txtWet.string = this.model.getData().wet + " %rH";
                this.txtCO.string = this.model.getData().co2 + " ppm";
                this.txtPM.string = this.model.getData().pm + " μg/m3";
                break;
            case EquipmentType.ENVIROMENT:
                this.txtTemp2.string = this.model.getData().temp + " °C";
                this.txtWet2.string = this.model.getData().wet + " %rH";
                break;
        }

        this.txtTime.string = this.model.getTime();
        this.txtMsg.string = this.model.getMessage();

        // alarm的强制顯示展開
        if (this.model.state == EquipmentState.ALARM1) {
            this.changeViewByModel();
        }
    }

    onBtnClick() {
        this.node.emit(EquipmentIcon.ON_CLICK, this.model);
    }

    reAttach() {
        const parent = this.node.parent;
        this.node.removeFromParent();
        parent.addChild(this.node);
    }

    onBtnHover() {

        this.reAttach();

        if (this.model.state == EquipmentState.ALARM1) {
            return;
        }

        if (this.isHover) return;
        this.isHover = true;

        this.changeViewByModel();
    }

    onBtnRelease() {
        if (this.model.state == EquipmentState.ALARM1) {
            return;
        }

        if (!this.isHover) return;
        this.isHover = false;

        this.txtLocation.node.active = false;

        this.txtName.node.position = this.nameNormalLocaiton.clone();
        this.txtLocation.node.position = this.locationNormalLocaiton.clone();
        this.iconBackLocationTarget = this.iconBackNormalLocation.clone();

        this.bubbleSizeTarget = this.bubbleNormalSize.clone();

        this.closeAllHover();
    }

    update(deltaTime: number) {

        this.iconBackLocationCurrent = this.iconBackLocationCurrent.lerp(this.iconBackLocationTarget, deltaTime * 10.0);
        this.iconBackSprite.node.position = this.iconBackLocationCurrent;

        this.bubbleSizeCurrent = this.bubbleSizeCurrent.lerp(this.bubbleSizeTarget, deltaTime * 10.0);
        this.bubble.setContentSize(this.bubbleSizeCurrent);
    }

    private closeAllHover() {
        this.hovers.forEach((node, id, ary) => {
            node.active = false;
        });
    }

    private changeViewByModel() {
        this.closeAllHover();

        this.txtLocation.node.active = true;
        this.txtName.node.position = this.nameHoverLocaiton.clone();
        this.txtLocation.node.position = this.locationHoverLocaiton.clone();

        switch (this.model.type) {
            case EquipmentType.AIR:
                switch (this.model.state) {
                    case EquipmentState.NOT_ACTIVE:
                    case EquipmentState.NORMAL:
                        this.showHover(0);
                        break;
                    case EquipmentState.ALARM1:
                    case EquipmentState.ALARM2:
                    case EquipmentState.ALARM3:
                    case EquipmentState.ALARM4:
                        this.showHover(2);
                        break;
                }
                break;
            case EquipmentType.ENVIROMENT:
                switch (this.model.state) {
                    case EquipmentState.NOT_ACTIVE:
                    case EquipmentState.NORMAL:
                        this.showHover(1);
                        break;
                    case EquipmentState.ALARM1:
                    case EquipmentState.ALARM2:
                    case EquipmentState.ALARM3:
                    case EquipmentState.ALARM4:
                        this.showHover(2);
                        break;
                }
                break;
            case EquipmentType.AIRCONDITION:
            case EquipmentType.CCTV:
            case EquipmentType.EARTHQUAKE:
            case EquipmentType.ELECTRIC:
            case EquipmentType.FIRE:
            case EquipmentType.SECURITY:
                switch (this.model.state) {
                    case EquipmentState.NOT_ACTIVE:
                    case EquipmentState.NORMAL:
                        this.showHover(3);
                        break;
                    case EquipmentState.ALARM1:
                    case EquipmentState.ALARM2:
                    case EquipmentState.ALARM3:
                    case EquipmentState.ALARM4:
                        this.showHover(2);
                        break;
                }
                break;
        }
    }

    private showHover(id) {
        this.hovers[id].active = true;
        this.iconBackLocationTarget = this.iconBackLocation[id].clone();
        this.bubbleSizeTarget = this.bubbleSizes[id].clone();
    }
}


