import { _decorator, CCFloat, Component, log, Mesh, MeshRenderer, Node, Quat, utils, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PathMeshBuilder')
export class PathMeshBuilder extends Component {

    @property(MeshRenderer)
    points: MeshRenderer[] = [];

    @property(CCFloat)
    thickness = 1.0;



    start() {

        const verts: number[] = [];
        const indices: number[] = [];
        const uvs: number[] = [];
        const dists: number[] = [];

        this.points.forEach((mesh: MeshRenderer, id: number, ary: MeshRenderer[]) => {

            const currentPosition = mesh.node.getPosition();
            mesh.node.active = false;
            if (id == 0) {
                log("first");

                const next = this.points[id + 1];
                const out: Vec3[] = this.getTwoVerts(mesh, next);
                const left = out[0].add(currentPosition);
                const right = out[1].add(currentPosition);
                verts.push(left.x);
                verts.push(left.y);
                verts.push(left.z);
                verts.push(right.x);
                verts.push(right.y);
                verts.push(right.z);

                const distToNext = next.node.getPosition().subtract(currentPosition).length();
                dists.push(distToNext);

                // log("left:" + left);
                // log("right:" + right);

            } else if (id == (this.points.length - 1)) {
                log("last");
                // last
                const prev = this.points[id - 1];
                let out: Vec3[] = this.getTwoVerts(mesh, prev);
                const right = out[0].add(currentPosition);
                const left = out[1].add(currentPosition);
                verts.push(left.x);
                verts.push(left.y);
                verts.push(left.z);
                verts.push(right.x);
                verts.push(right.y);
                verts.push(right.z);

                // log("left:" + left);
                // log("right:" + right);
            } else {
                // other
                log("other");

                const prev = this.points[id - 1];
                const next = this.points[id + 1];

                let out: Vec3[] = this.getTwoVerts(mesh, next);
                const v1 = out[0].add(currentPosition);
                const v2 = out[1].add(currentPosition);

                out = this.getTwoVerts(mesh, prev);
                const v3 = out[0].add(currentPosition);
                const v4 = out[1].add(currentPosition);

                // log("v1:" + v1);
                // log("v2:" + v2);
                // log("v3:" + v3);
                // log("v4:" + v4);

                const toV3 = v3.clone().subtract(currentPosition).normalize();
                const toV2 = v2.clone().subtract(currentPosition).normalize();
                const radian = Vec3.angle(toV2, toV3);
                const dist = this.thickness / Math.cos(radian * 0.5);
                const v3v2dir = toV3.clone().add(toV2).normalize().multiplyScalar(dist);
                const v1v4dir = v3v2dir.clone().negative();

                v3v2dir.add(currentPosition);
                v1v4dir.add(currentPosition);

                verts.push(v1v4dir.x);
                verts.push(v1v4dir.y);
                verts.push(v1v4dir.z);
                verts.push(v3v2dir.x);
                verts.push(v3v2dir.y);
                verts.push(v3v2dir.z);

                const distToNext = next.node.getPosition().subtract(currentPosition).length();
                dists.push(distToNext);
            }
        });

        let currentDist = 0;
        for (let i = 0; i < this.points.length - 1; ++i) {
            const first = i * 2;
            indices.push(first);
            indices.push(first + 1);
            indices.push(first + 3);
            indices.push(first);
            indices.push(first + 3);
            indices.push(first + 2);

            uvs.push(currentDist);
            uvs.push(0);
            uvs.push(currentDist);
            uvs.push(1);
            currentDist += dists[i];
        }

        uvs.push(currentDist);
        uvs.push(0);
        uvs.push(currentDist);
        uvs.push(1);

        log(uvs);

        const mesh = utils.MeshUtils.createMesh({
            positions: verts,
            indices: indices,
            uvs: uvs
        });

        this.getComponent(MeshRenderer).mesh = mesh;

    }

    private getTwoVerts(currentMesh: MeshRenderer, nextMesh: MeshRenderer) {
        const dir = nextMesh.node.getPosition().clone().subtract(currentMesh.node.getPosition()).normalize();
        const right = dir.clone().cross(Vec3.UP).normalize().multiplyScalar(this.thickness);
        const left = right.clone().negative();
        return [left, right];
    }

    update(deltaTime: number) {

    }
}


