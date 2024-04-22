import { _decorator, CCFloat, Component, Event, EventKeyboard, EventMouse, Input, input, KeyCode, Node, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Navigation')
export class Navigation extends Component {

    @property(CCFloat)
    public rotateSpeed: number = 0.1;

    @property(CCFloat)
    public moveSpeed: number = 1.0;

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

    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);

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
        }
    }

    onMouseUp(e: EventMouse) {
        const isRightClick = e.getButton() === EventMouse.BUTTON_RIGHT;
        if (isRightClick) {
            input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
            this.isMouseRightDown = false;
            this.currentMousePos = null;
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

            const newPosition = this.node.getPosition().add(this.moveVelocity.multiplyScalar(this.moveSpeed));
            this.node.setPosition(newPosition);

            const isValidRotate = this.currentMousePosDiff != null && this.isMouseMove;
            if (isValidRotate) {
                const euler = new Vec3();
                this.node.getRotation().getEulerAngles(euler);

                euler.add(new Vec3(this.currentMousePosDiff.y * this.rotateSpeed, -this.currentMousePosDiff.x * this.rotateSpeed, 0));
                this.node.setRotationFromEuler(euler);
            }
        }

        this.isMouseMove = false;
    }
}


