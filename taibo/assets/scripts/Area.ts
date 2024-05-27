import { _decorator, CCFloat, Color, Component, Material, MeshRenderer, Node, Vec4 } from 'cc';
import { IEnviromentChanger } from './IEnviromentChanger';
const { ccclass, property } = _decorator;

@ccclass('Area')
export class Area extends Component implements IEnviromentChanger {


    @property(Color)
    areaColor: Color = new Color(0, 224, 255, 255);

    @property(CCFloat)
    waveFrequence: number = 10;

    private targetOpacity = .2;
    private currentOpacity = .2;

    private material: Material;

    protected onLoad(): void {
        this.material = this.getComponent(MeshRenderer).material;
        this.material.setProperty("mainColor", this.areaColor);
        this.material.setProperty("waveFrequence", this.waveFrequence);
    }

    start() {

    }

    update(deltaTime: number) {
        this.currentOpacity += (this.targetOpacity - this.currentOpacity) * .2;
        this.material.setProperty("opacity", this.currentOpacity);
    }

    toNormal() {
        this.targetOpacity = .3;
    }

    toScifi() {
        this.targetOpacity = 0.1;
    }
}


