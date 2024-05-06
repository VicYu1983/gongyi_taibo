import { _decorator, Animation, Button, Camera, Color, Component, Label, log, Node, NodeEventType, Sprite, SpriteFrame, Vec3 } from 'cc';
import { EquipmentModel, EquipmentState, EquipmentType } from './EquipmentModel';
import { Navigation } from './Navigation';
const { ccclass, property } = _decorator;

@ccclass('EquipmentIcon')
export class EquipmentIcon extends Component {

    static ON_CLICK = "ON_CLICK";

    @property(Navigation)
    navigation: Navigation;

    @property(Node)
    info: Node;

    @property(Label)
    txtName: Label;

    @property(EquipmentModel)
    model: EquipmentModel;

    @property(Sprite)
    iconBackSprite: Sprite;

    @property(Sprite)
    iconSprite: Sprite;

    @property([SpriteFrame])
    iconSpriteFrame: SpriteFrame[] = [];

    @property([Color])
    iconBackColor: Color[] = [];

    start() {

        this.model.node.on(EquipmentModel.ON_CHANGE, this.onModelChange, this);
        this.onModelChange();
        this.addListener();
        this.onBtnRelease();
    }

    addListener() {
        this.removeListener();
        this.node.on(NodeEventType.MOUSE_UP, this.onBtnClick, this);
        this.node.on(NodeEventType.MOUSE_MOVE, this.onBtnHover, this);
        this.node.on(NodeEventType.MOUSE_LEAVE, this.onBtnRelease, this);
    }

    removeListener() {
        this.node.off(NodeEventType.MOUSE_UP, this.onBtnClick, this);
        this.node.off(NodeEventType.MOUSE_MOVE, this.onBtnHover, this);
        this.node.off(NodeEventType.MOUSE_LEAVE, this.onBtnRelease, this);
    }

    onModelChange() {
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
        const screenPosition = new Vec3();
        this.navigation.getComponent(Camera).convertToUINode(worldPosition, this.node.parent, screenPosition);
        this.node.position = screenPosition;
    }

    onBtnClick() {
        this.node.emit(EquipmentIcon.ON_CLICK, this.model);
    }

    onBtnHover() {
        // if (this.info.active) return;
        // this.info.active = true;
        // this.node.getComponent(Animation).play(this.node.getComponent(Animation).clips[0].name);
    }

    onBtnRelease() {
        // if (!this.info.active) return;
        // this.info.active = false;
    }

    update(deltaTime: number) {
        this.syncPosition();
    }
}


