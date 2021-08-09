import { mat4, vec3 } from '../lib/MV';
import InputHandler from './input';
import { SceneCamera } from './scene';
export default class CameraConstroller {
  input: InputHandler;
  camera: SceneCamera;

  constructor(input: InputHandler, camera: SceneCamera) {
    this.input = input;
    this.camera = camera;
  }

  tick() {
    const { x, y } = this.input.getOffsetFromElementCenter();
    this.camera.yaw += x * 0.0001;
    this.camera.pitch += y * 0.0001;
    const inverseRotation = this.camera.getInverseRotation();
    const direction = vec3.create();
    if (this.input.keys.W) {
      direction[2] = -1;
    } else if (this.input.keys.S) {
      direction[2] = 1;
    }
    if (this.input.keys.A) {
      direction[0] = -1;
    } else if (this.input.keys.D) {
      direction[0] = 1;
    }
    vec3.scale(vec3.normalize(direction), 1.0);
    // 先获取方向, 然后在这个方向上平移
    mat4.multiplyVec3(inverseRotation, direction);
    vec3.add(this.camera.position, direction);
  }
}
