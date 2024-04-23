import { _decorator, Component, Node, systemEvent, SystemEvent, EventMouse, Camera, Vec3, geometry, PhysicsSystem, input, Input, PhysicsRayResult, log } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HoverEffect')
export class HoverEffect extends Component {

    @property(Camera)
    camera: Camera | null = null;

    onLoad() {
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }

    onDestroy() {
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }

    onMouseMove(event: EventMouse) {
        
        if (this.camera) {
            // 获取鼠标位置
            const mousePoint = event.getLocation();
            const outRay = new geometry.Ray();

            // 通过摄像机和鼠标位置创建射线
            this.camera.screenPointToRay(mousePoint.x, mousePoint.y, outRay);

            // 射线投射检测
            const result = PhysicsSystem.instance.raycastClosest(outRay);
            log(result);
            
            if (result) {
                const hitResult: PhysicsRayResult = PhysicsSystem.instance.raycastClosestResult;
                console.log('Hover over: ', hitResult.collider.node.name);

                // 你可以在这里更改物体的材质或触发其他视觉效果
                // 例如改变颜色或播放动画等
            }
        }
    }
}
