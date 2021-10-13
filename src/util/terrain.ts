import { vec3 } from '../math/MV';
import * as Scene from '../scene';

// 基于四叉树实现的碰撞检测
export class Terrain {
  camera: Scene.Camera;
  resolution: number;
  depth: number;
  localCameraPosition: Float32Array = vec3.create();
  mesh: Scene.SimpleMesh;
  constructor(camera: Scene.Camera, resolution: number, depth: number) {
    this.camera = camera;
    this.resolution = resolution;
    this.depth = depth;
    this.mesh = new Scene.SimpleMesh()
  }
}
