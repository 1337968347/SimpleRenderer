attribute vec3 position;
uniform mat4 modeView;
uniform mat4 projection;
varying vec3 vPostion;

void main() {
    vPostion = vPostion;
    gl_Position = projection * modeView * vec4(position, 1.0);
}