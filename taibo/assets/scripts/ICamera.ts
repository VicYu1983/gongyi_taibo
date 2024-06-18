import { Vec3 } from "cc";

export interface ICamera {
    isNavigation(): boolean;

    backToInit(): void;

    setTargetPositionAndRotation(position: Vec3, rotation?: Vec3): void;
}


