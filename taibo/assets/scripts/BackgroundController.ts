import { _decorator, Color, Component, MeshRenderer, Node } from 'cc';
import { IEnviromentChanger } from './IEnviromentChanger';
const { ccclass, property } = _decorator;

@ccclass('BackgroundController')
export class BackgroundController extends Component implements IEnviromentChanger {
    
    @property(Color)
    normal: Color = new Color(200, 200, 200);

    @property(Color)
    scifi: Color = new Color(0, 50, 95);

    target: Color;
    current: Color;

    start() {
        this.current = this.normal.clone();
        this.target = this.scifi.clone();
    }

    update(deltaTime: number) {
        this.current = this.current.lerp(this.target, .2);
        this.getComponent(MeshRenderer).material.setProperty("mainColor", this.current);
    }

    toNormal() {
        this.target = this.normal.clone();
    }

    toScifi() {
        this.target = this.scifi.clone();
    }
}


