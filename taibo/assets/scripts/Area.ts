import { _decorator, CCFloat, Color, Component, Material, Mesh, MeshRenderer, Node, Vec4 } from 'cc';
import { IEnviromentChanger } from './IEnviromentChanger';
const { ccclass, property } = _decorator;

@ccclass('Area')
export class Area extends Component implements IEnviromentChanger {

    @property(MeshRenderer)
    box:MeshRenderer;

    @property(MeshRenderer)
    floor:MeshRenderer;

    @property(Color)
    areaColor: Color = new Color(0, 224, 255, 255);

    @property(CCFloat)
    waveFrequence: number = 10;


    private targetOpacity = .2;
    private currentOpacity = .2;

    private boxMaterial: Material;
    private floorMaterial: Material;

    protected onLoad(): void {
        this.boxMaterial = this.box.getComponent(MeshRenderer).material;
        this.boxMaterial.setProperty("mainColor", this.areaColor);
        this.boxMaterial.setProperty("waveFrequence", this.waveFrequence);

        this.floorMaterial = this.floor.getComponent(MeshRenderer).material;
    }

    start() {

    }

    update(deltaTime: number) {
        this.currentOpacity += (this.targetOpacity - this.currentOpacity) * .2;
        this.boxMaterial.setProperty("opacity", this.currentOpacity);

        this.areaColor.a = this.currentOpacity * 255;
        this.floorMaterial.setProperty("mainColor", this.areaColor);
    }

    toNormal() {
        this.targetOpacity = .3;
    }

    toScifi() {
        this.targetOpacity = 0.1;
    }
}


