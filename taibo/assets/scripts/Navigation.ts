import { _decorator, Camera, CCFloat, Component, Event, EventKeyboard, EventMouse, Input, input, KeyCode, lerp, Node, Vec2, Vec3 } from 'cc';
import { ICamera } from './ICamera';
const { ccclass, property } = _decorator;

@ccclass('Navigation')
export class Navigation extends Component implements ICamera {

    static ON_NAVIGATION_CHANGE = "ON_NAVIGATION_CHANGE";

    @property(CCFloat)
    rotateSpeed: number = 0.1;

    @property(CCFloat)
    moveSpeed: number = 1.0;

    private moveVelocity = new Vec3();
    private isMouseRightDown = false;
    private isForward = false;
    private isLeft = false;
    private isRight = false;
    private isBack = false;
    private isUp = false;
    private isDown = false;
    private currentMousePos: Vec2 = null;
    private currentMousePosDiff: Vec2 = null;
    private isMouseMove = false;
    private targetPosition: Vec3 = new Vec3();
    private targetRotation: Vec3 = new Vec3();
    private initCameraPosition;
    private initCameraRotation;

    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);

        this.targetPosition = this.node.getPosition();
        this.node.getRotation().getEulerAngles(this.targetRotation);

        this.initCameraPosition = this.targetPosition.clone();
        this.initCameraRotation = this.targetRotation.clone();
    }

    isNavigation() {
        return this.isMouseRightDown;
    }

    backToInit() {
        this.targetPosition = this.initCameraPosition.clone();
        this.targetRotation = this.initCameraRotation.clone();
    }

    setTargetPositionAndRotation(position: Vec3, rotation: Vec3) {
        this.targetPosition = position;
        this.targetRotation = rotation;
    }

    onMouseMove(e: EventMouse) {
        const currentPos = e.getLocation().clone();
        if (this.currentMousePos != null) {
            this.currentMousePosDiff = currentPos.clone().subtract(this.currentMousePos);
        }
        this.currentMousePos = currentPos;
        this.isMouseMove = true;
    }

    onMouseDown(e: EventMouse) {
        const isRightClick = e.getButton() === EventMouse.BUTTON_RIGHT;
        if (isRightClick) {
            input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
            this.isMouseRightDown = true;

            this.node.emit(Navigation.ON_NAVIGATION_CHANGE, true);
        }
    }

    onMouseUp(e: EventMouse) {
        const isRightClick = e.getButton() === EventMouse.BUTTON_RIGHT;
        if (isRightClick) {
            this.currentMousePos = null;

            input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
            this.isMouseRightDown = false;
            this.isForward = false;
            this.isLeft = false;
            this.isBack = false;
            this.isRight = false;
            this.isUp = false;
            this.isDown = false;

            this.node.emit(Navigation.ON_NAVIGATION_CHANGE, false);
        }
    }

    onKeyDown(e: EventKeyboard) {
        switch (e.keyCode) {
            case KeyCode.KEY_W:
                this.isForward = true;
                break;
            case KeyCode.KEY_A:
                this.isLeft = true;
                break;
            case KeyCode.KEY_S:
                this.isBack = true;
                break;
            case KeyCode.KEY_D:
                this.isRight = true;
                break;
            case KeyCode.KEY_Q:
                this.isUp = true;
                break;
            case KeyCode.KEY_E:
                this.isDown = true;
                break;
        }
    }

    onKeyUp(e: EventKeyboard) {
        switch (e.keyCode) {
            case KeyCode.KEY_W:
                this.isForward = false;
                break;
            case KeyCode.KEY_A:
                this.isLeft = false;
                break;
            case KeyCode.KEY_S:
                this.isBack = false;
                break;
            case KeyCode.KEY_D:
                this.isRight = false;
                break;
            case KeyCode.KEY_Q:
                this.isUp = false;
                break;
            case KeyCode.KEY_E:
                this.isDown = false;
                break;
        }
    }

    updateCamera() {
        const newPosition = this.targetPosition.clone().subtract(this.node.getPosition()).multiplyScalar(0.2).add(this.node.position);
        this.node.setPosition(newPosition);

        const euler = new Vec3();
        this.node.getRotation().getEulerAngles(euler);
        euler.lerp(this.targetRotation, .2);
        this.node.setRotationFromEuler(euler);
    }

    update(deltaTime: number) {

        this.moveVelocity.multiplyScalar(0);
        if (this.isForward) {
            this.moveVelocity.add(this.node.forward);
        }
        if (this.isRight) {
            this.moveVelocity.add(this.node.right);
        }
        if (this.isLeft) {
            this.moveVelocity.add(this.node.right.negative());
        }
        if (this.isBack) {
            this.moveVelocity.add(this.node.forward.negative());
        }
        if (this.isUp) {
            this.moveVelocity.add(new Vec3(0, -1, 0));
        }
        if (this.isDown) {
            this.moveVelocity.add(Vec3.UP);
        }
        this.moveVelocity.normalize();

        if (this.isMouseRightDown) {

            this.targetPosition.add(this.moveVelocity.multiplyScalar(deltaTime * this.moveSpeed));

            const isValidRotate = this.currentMousePosDiff != null && this.isMouseMove;
            if (isValidRotate) {
                this.targetRotation.add(new Vec3(this.currentMousePosDiff.y * this.rotateSpeed, -this.currentMousePosDiff.x * this.rotateSpeed, 0));
            }
        }

        this.updateCamera();

        this.isMouseMove = false;
    }
}


