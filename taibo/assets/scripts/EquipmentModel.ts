import { _decorator, CCInteger, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EquipmentModel')
export class EquipmentModel extends Component {

    @property(CCInteger)
    id:number;

    start() {

    }

    update(deltaTime: number) {
        
    }
}


