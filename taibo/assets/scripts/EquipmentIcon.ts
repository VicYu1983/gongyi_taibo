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

    private bubbleNormalSize = new Size(200, 89);
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
    private camera;
    private screenPosition: Vec3 = new Vec3();

    start() {
        this.animationComponent = this.getComponent(Animation);
        this.camera = this.navigation.getComponent(Camera);

        this.model.node.on(EquipmentModel.ON_CHANGE, this.onModelChange, this);
        this.onModelChange();
        this.addListener();
        this.onBtnRelease();
    }

    addListener() {
        this.removeListener();
        this.bubble.node.on(NodeEventType.MOUSE_UP, this.onBtnClick, this);
        this.bubble.node.on(NodeEventType.MOUSE_MOVE, this.onBtnHover, this);
        this.bubble.node.on(NodeEventType.MOUSE_LEAVE, this.onBtnRelease, this);
    }

    removeListener() {
        this.node.off(NodeEventType.MOUSE_UP, this.onBtnClick, this);
        this.node.off(NodeEventType.MOUSE_MOVE, this.onBtnHover, this);
        this.node.off(NodeEventType.MOUSE_LEAVE, this.onBtnRelease, this);
    }

    onModelChange() {

        if (!this.node.active && this.model.getShow()) {
            this.animationComponent.play(this.animationComponent.clips[0].name);
        }

        // if (this.node.active && !this.model.getShow()) {
        //     log("play close");
        // }

        this.node.active = this.model.getShow();

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
                this.iconBackSprite.color = this.iconBackColor[4];
                break;
            case EquipmentState.NOT_ACTIVE:
                this.iconBackSprite.color = this.iconBackColor[5];
                break;
        }
    }

    syncPosition() {
        if (this.model == null) return;
        const worldPosition = this.model.node.worldPosition;

        this.camera.convertToUINode(worldPosition, this.node.parent, this.screenPosition);
        this.node.position = this.screenPosition;
    }

    onBtnClick() {
        this.node.emit(EquipmentIcon.ON_CLICK, this.model);
    }

    onBtnHover() {
        if (this.isHover) return;
        this.isHover = true;

        this.txtLocation.node.active = true;

        switch (this.model.type) {
            case EquipmentType.AIR:
                this.txtName.node.position = this.nameHoverLocaiton.clone();
                this.txtLocation.node.position = this.locationHoverLocaiton.clone();
                
                this.hovers[0].active = true;
                this.animationComponent.play(this.animationComponent.clips[1].name);

                this.iconBackLocationTarget = this.iconBackLocation[0].clone();
                this.bubbleSizeTarget = this.bubbleSizes[0].clone();
                // this.bubble.setContentSize(this.bubbleSizes[0]);
                break;
            case EquipmentType.AIRCONDITION:
                this.bubble.setContentSize(this.bubbleSizes[0]);
                break;
            case EquipmentType.CCTV:
                this.bubble.setContentSize(this.bubbleSizes[0]);
                break;
            case EquipmentType.EARTHQUAKE:
                this.bubble.setContentSize(this.bubbleSizes[0]);
                break;
            case EquipmentType.ELECTRIC:
                this.bubble.setContentSize(this.bubbleSizes[0]);
                break;
            case EquipmentType.ENVIROMENT:
                this.bubble.setContentSize(this.bubbleSizes[0]);
                break;
            case EquipmentType.FIRE:
                this.bubble.setContentSize(this.bubbleSizes[0]);
                break;
            case EquipmentType.SECURITY:
                this.bubble.setContentSize(this.bubbleSizes[0]);
                break;
        }
    }

    onBtnRelease() {
        if (!this.isHover) return;
        this.isHover = false;

        this.txtLocation.node.active = false;

        this.txtName.node.position = this.nameNormalLocaiton.clone();
        this.txtLocation.node.position = this.locationNormalLocaiton.clone();
        this.iconBackLocationTarget = this.iconBackNormalLocation.clone();
        // this.bubble.setContentSize(this.bubbleNormalSize);

        this.bubbleSizeTarget = this.bubbleNormalSize.clone();

        this.hovers.forEach((node, id, ary) => {
            node.active = false;
        });

        // switch (this.model.type) {
        //     case EquipmentType.AIR:
        //         break;
        //     case EquipmentType.AIRCONDITION:
        //         break;
        //     case EquipmentType.CCTV:
        //         break;
        //     case EquipmentType.EARTHQUAKE:
        //         break;
        //     case EquipmentType.ELECTRIC:
        //         break;
        //     case EquipmentType.ENVIROMENT:
        //         break;
        //     case EquipmentType.FIRE:
        //         break;
        //     case EquipmentType.SECURITY:
        //         break;
        // }
    }

    update(deltaTime: number) {
        this.syncPosition();
        
        this.iconBackLocationCurrent = this.iconBackLocationCurrent.lerp(this.iconBackLocationTarget, deltaTime * 10.0);
        this.iconBackSprite.node.position = this.iconBackLocationCurrent;

        this.bubbleSizeCurrent = this.bubbleSizeCurrent.lerp(this.bubbleSizeTarget, deltaTime * 10.0);
        this.bubble.setContentSize(this.bubbleSizeCurrent);
    }
}


