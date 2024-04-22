import { _decorator, BatchingUtility, CCFloat, postProcess, Component, game, log, MeshRenderer, Node, view, ParticleSystem } from 'cc';
import { PathMeshBuilder } from './PathMeshBuilder';
const { Bloom } = postProcess;
const { ccclass, property } = _decorator;

@ccclass('BuildingController')
export class BuildingController extends Component {

    @property([Node])
    nodeArray: Node[] = [];

    @property(CCFloat)
    buildingTargetHeight = 0.0;

    @property(Node)
    postProcess:Node = null;

    @property(ParticleSystem)
    particle:ParticleSystem;

    @property(Node)
    floor:Node;

    @property(PathMeshBuilder)
    pathBuilder:PathMeshBuilder;

    buildingHeight:number = 0;
    targetBloom:number = .3;
    currentBloom:number = .3;

    targetFloorEmissive = 0.0;
    currentFloorEmissive = 0.0;

    start() {
        this.changeToNormal();
    }

    // protected onLoad(): void {
    //     BatchingUtility.batchStaticModel(this.node, this.node);
    // }

    updateMaterialParams(){
        this.nodeArray.forEach((node, id, ary)=>{
            node.getComponent(MeshRenderer).materials.forEach((material, id, matAry)=>{
                material.setProperty("buildingHeight", this.buildingHeight);
            });
        });
        this.floor.getComponent(MeshRenderer).material.setProperty("emissive", this.currentFloorEmissive);
    }

    changeToNormal(){
        this.buildingTargetHeight = 0;
        this.targetBloom = .0;
        this.targetFloorEmissive = 0.5;
        this.particle.stopEmitting();

        this.pathBuilder.node.active = false;
    }

    changeToScifi(){
        this.buildingTargetHeight = 3;
        this.targetBloom = 1;
        this.targetFloorEmissive = 1;
        this.particle.play();

        this.pathBuilder.node.active = true;
    }

    update(deltaTime: number) {

        this.buildingHeight += (this.buildingTargetHeight - this.buildingHeight) * .2;
        this.currentBloom += (this.targetBloom - this.currentBloom) * .2;
        this.currentFloorEmissive += (this.targetFloorEmissive - this.currentFloorEmissive) * .2;

        this.postProcess.getComponent(Bloom).intensity = this.currentBloom;
        this.updateMaterialParams();
    }
}


