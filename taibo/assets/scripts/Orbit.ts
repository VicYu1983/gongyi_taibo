import { _decorator, CCFloat, Component, EventKeyboard, EventMouse, input, Input, KeyCode, log, Mat4, Node, Quat, Vec2, Vec3 } from 'cc';
import { ICamera } from './ICamera';
const { ccclass, property } = _decorator;

@ccclass('Orbit')
export class Orbit extends Component implements ICamera {

    static ON_NAVIGATION_CHANGE = "ON_NAVIGATION_CHANGE";

    @property(Node)
    lookAt: Node;

    @property(CCFloat)
    distance: number = 5;

    @property(CCFloat)
    yaw: number = 0;

    @property(CCFloat)
    pitch: number = 0;

    private isShiftDown = false;
    private isMouseDown = false;

    private lookAtMat = new Mat4();
    private yawMat = new Mat4();
    private rollMat = new Mat4();
    private offsetMat = new Mat4();
    private cameraMat = new Mat4();

    private targetMat = new Mat4();
    private currentMat = new Mat4();

    private targetQuat = new Quat();
    private currentQuat = new Quat();

    private targetPosition = new Vec3();
    private currentPosition = new Vec3();

    private initLootAtPosition;
    private initDistance;
    private initYaw;
    private initPitch;

    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);

        this.setTarget(this.lookAt.getWorldPosition());
        this.cameraMat.rotate(Math.PI * 0.5, new Vec3(0, 1, 0));

        this.currentMat = this.calculateMatrix();
        this.targetMat = this.currentMat.clone();

        this.initLootAtPosition = this.lookAt.getWorldPosition();
        this.initDistance = this.distance;
        this.initYaw = this.yaw;
        this.initPitch = this.pitch;
    }

    isNavigation(): boolean {
        return this.isMouseDown;
    }
    backToInit(): void {
        this.distance = this.initDistance;
        this.yaw = this.initYaw;
        this.pitch = this.initPitch;
        this.setTarget(this.initLootAtPosition);
    }

    setTargetPositionAndRotation(position: Vec3, rotation: Vec3): void {
        this.distance = .09;
        this.setTarget(position);
    }

    onKeyDown(e: EventKeyboard) {
        switch (e.keyCode) {
            case KeyCode.SHIFT_LEFT:
                this.isShiftDown = true;
                break;
        }
    }

    onKeyUp(e: EventKeyboard) {
        switch (e.keyCode) {
            case KeyCode.SHIFT_LEFT:
                this.isShiftDown = false;
                break;
        }
    }

    setTarget(target: Vec3) {
        this.lookAtMat.identity();
        this.lookAtMat.transform(target);
    }

    onMouseMove(e: EventMouse) {
        if (this.isShiftDown) {
            const result: Mat4 = this.calculateMatrix();

            const up = new Vec3(result.m04, result.m05, result.m06);
            up.multiplyScalar(e.getDeltaY() * -.01);

            const right = new Vec3(result.m00, result.m01, result.m02);
            right.multiplyScalar(e.getDeltaX() * -.01);

            const pos = new Vec3();
            this.lookAtMat.getTranslation(pos);

            pos.add(right).add(up);
            this.setTarget(pos);
        } else {
            this.yaw += e.getDeltaX() * -.003;
            this.pitch += e.getDeltaY() * -.003;
        }
    }

    onMouseDown(e: EventMouse) {
        const isLeftClick = e.getButton() === EventMouse.BUTTON_LEFT;
        if (isLeftClick) {
            input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
            this.isMouseDown = true;
            this.node.emit(Orbit.ON_NAVIGATION_CHANGE, true);
        }
    }

    onMouseUp(e: EventMouse) {
        const isLeftClick = e.getButton() === EventMouse.BUTTON_LEFT;
        if (isLeftClick) {
            input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
            this.isMouseDown = false;
            this.node.emit(Orbit.ON_NAVIGATION_CHANGE, false);
        }
    }

    onMouseWheel(e: EventMouse) {
        this.distance += e.getScrollY() * 0.0005;
    }

    calculateMatrix() {
        this.yawMat.identity();
        this.yawMat.rotate(this.yaw, new Vec3(0, 1, 0));

        this.rollMat.identity();
        this.rollMat.rotate(this.pitch, new Vec3(0, 0, 1));

        this.offsetMat.identity();
        this.offsetMat.transform(new Vec3(this.distance, 0, 0));

        return this.lookAtMat.clone().multiply(this.yawMat).multiply(this.rollMat).multiply(this.offsetMat).multiply(this.cameraMat);
    }

    update(deltaTime: number) {

        this.targetMat = this.calculateMatrix();

        this.targetMat.getRotation(this.targetQuat);
        this.currentQuat.slerp(this.targetQuat, deltaTime * 8);

        this.targetMat.getTranslation(this.targetPosition);
        this.currentPosition.lerp(this.targetPosition, deltaTime * 8);

        this.node.setWorldPosition(this.currentPosition);
        this.node.setWorldRotation(this.currentQuat);
    }
}


