import createClock from './util/clock';
import createInputHandler from './util/input';
import createGlUtils from './util/glUtils';
import createUniformManager from './util/uniform';

export default async () => {
  const canvasEl = document.querySelector('canvas');
  const clock = createClock();
  const glUtils = createGlUtils();
  const gl = glUtils.getContext(canvasEl);
  const uniform = createUniformManager(gl);
  console.log(uniform);
  clock.start();
  const inputHandler = createInputHandler();
  inputHandler.bind(canvasEl);
};
