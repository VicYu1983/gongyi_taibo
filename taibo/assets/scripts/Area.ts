import { _decorator, CCFloat, Color, Component, MeshRenderer, Node, Vec4 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Area')
export class Area extends Component {

    @property(Color)
    areaColor: Color = new Color(0, 224, 255, 255);

    @property(CCFloat)
    waveFrequence:number = 10;

    protected onLoad(): void {
        this.getComponent(MeshRenderer).material.setProperty("mainColor", this.areaColor);
        this.getComponent(MeshRenderer).material.setProperty("waveFrequence", this.waveFrequence);
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


