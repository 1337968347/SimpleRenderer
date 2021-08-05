import createClock from './util/clock';
import { getGL, VertexBufferObject } from './util/glUtils';
import Uniform from './util/uniform';
import { SceneCamera, SceneGraph, SceneMaterial, SceneSimpleMesh } from './util/scene';
import { ShaderManager } from './util/shader';
import { createLoader } from './util/loader';

export default async () => {
  const canvasEl = document.querySelector('canvas');
  const clock = createClock();
  const gl = getGL(canvasEl);
  const resources = createLoader('/src');
  const shaderManager = new ShaderManager(resources);

  const sceneGraph = new SceneGraph(gl);
  const triangle = new VertexBufferObject(new Float32Array([-1, 1, 1, 0, -1, 1, 1, 1, 1]));
  const mesh = new SceneSimpleMesh(triangle);
  const shader = shaderManager.get('transform.vertex', 'color.frag');
  const material = new SceneMaterial(
    shader,
    {
      color: Uniform.Vec3([1, 0, 0]),
    },
    [mesh],
  );
  const camera = new SceneCamera([material]);
  sceneGraph.root.append(camera);
  clock.setOnTick(() => {
    sceneGraph.draw();
  });
  clock.start();
};
