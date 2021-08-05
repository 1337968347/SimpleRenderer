attribute vec3 position;
uniform mat4 projection;
uniform mat4 worldView;
varying vec3 vPosition;

void main(){
  vPosition = position;
  gl_Position = projection*worldView*vec4(position, 1.0);
}