import { _decorator, CCFloat, Component, EventKeyboard, EventMouse, input, Input, KeyCode, log, Mat4, Node, Quat, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NewComponent')
export class NewComponent extends Component {
    currentMousePos: Vec2;
    currentMousePosDiff: Vec2;
    isMouseMove: boolean;
    isMouseRightDown: boolean;

    @property(Node)
    lookAt: Node;

    @property(CCFloat)
    distance: number = 5;

    @property(CCFloat)
    yaw: number = 0;

    @property(CCFloat)
    roll: number = 0;

    private isShiftDown = false;

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
            this.yaw += e.getDeltaX() * -.005;
            this.roll += e.getDeltaY() * -.005;
        }
        this.isMouseMove = true;
    }

    onMouseDown(e: EventMouse) {
        const isRightClick = e.getButton() === EventMouse.BUTTON_LEFT;
        if (isRightClick) {
            input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
            this.isMouseRightDown = true;
        }
    }

    onMouseUp(e: EventMouse) {
        const isRightClick = e.getButton() === EventMouse.BUTTON_LEFT;
        if (isRightClick) {
            input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
            this.isMouseRightDown = false;
        }
    }

    onMouseWheel(e: EventMouse) {
        this.distance += e.getScrollY() * -0.001;
    }

    calculateMatrix() {
        this.yawMat.identity();
        this.yawMat.rotate(this.yaw, new Vec3(0, 1, 0));

        this.rollMat.identity();
        this.rollMat.rotate(this.roll, new Vec3(0, 0, 1));

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


