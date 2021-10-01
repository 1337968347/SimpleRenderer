attribute vec3 position;

uniform float time;
uniform sampler2D waterNoise;
uniform mat4 projection;
uniform mat4 modelTransform;

varying vec3 worldPosition;
varying float depth;
varying vec3 surfaceNormal;
varying vec4 projected;

vec4 getNoise(vec2 uv) {
  vec2 uv0 = (uv / 103.0) + vec2(time / 60.0, time / 80.0);
  vec2 uv1 = uv / 107.0 - vec2(time / -50.0, time / 90.0);
  vec2 uv2 = uv / vec2(897.0, 983.0) + vec2(time / 101.0, time / 97.0);
  vec2 uv3 = uv / vec2(991.0, 877.0) - vec2(time / 109.0, time / -113.0);
  vec4 noise = (texture2D(waterNoise, uv0)) +
    (texture2D(waterNoise, uv1)) +
    (texture2D(waterNoise, uv2)) +
    (texture2D(waterNoise, uv3));
  return noise * 0.25 - 0.5;
}

void main() {
  vec4 worldPosition4 = modelTransform * vec4(position, 1.0);
  vec2 uv = vec2(worldPosition4.x, worldPosition4.z);
  vec4 noise = getNoise(uv);
  worldPosition4 = vec4(worldPosition4.xyz + 20.0 * noise.y, 1.0);
  gl_Position = projection * worldPosition4;

  worldPosition = vec3(worldPosition4);
  depth = gl_Position.z;
  surfaceNormal = normalize(vec3(0, 1, 0) + vec3(noise.x, 0, noise.y));
  projected = gl_Position;
}