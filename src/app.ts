import createClock from './util/clock';
import createInputHandler from './util/input';
import { getGL } from './util/glUtils';
import Uniform from './util/uniform';

export default async () => {
  const canvasEl = document.querySelector('canvas');
  const clock = createClock();
  const gl = getGL();
  const uniform = new Uniform();
  console.log(uniform, gl);
  clock.start();
  const inputHandler = createInputHandler();
  inputHandler.bind(canvasEl);
};
