import { _decorator, Component, Node, postProcess } from 'cc';
const { ccclass, property } = _decorator;
const { Bloom } = postProcess;

@ccclass('PPController')
export class PPController extends Component {

    targetBloom: number = .3;
    private currentBloom: number = .3;

    start() {

    }

    update(deltaTime: number) {
        this.currentBloom += (this.targetBloom - this.currentBloom) * .2;
        this.node.getComponent(Bloom).intensity = this.currentBloom;
    }
}


