precision highp float;

uniform vec3 color;
uniform sampler2D waterNoise;
uniform float time;
uniform vec3 eye;
varying vec3 worldPosition;

/// import "sun.glsl"

vec4 getNoise(vec2 uv) {
  vec2 uv0 = (uv / 103.0) + vec2(time / 17.0, time / 29.0);
  vec2 uv1 = uv / 107.0 - vec2(time / -19.0, time / 31.0);
  vec2 uv2 = uv / vec2(897.0, 983.0) + vec2(time / 101.0, time / 97.0);
  vec2 uv3 = uv / vec2(991.0, 877.0) - vec2(time / 109.0, time / -113.0);
  vec4 noise = (texture2D(waterNoise, uv0)) +
    (texture2D(waterNoise, uv1)) +
    (texture2D(waterNoise, uv2)) +
    (texture2D(waterNoise, uv3));
  return noise * 0.5 - 1.0;
}

void main() {
  vec2 uv = vec2(worldPosition.x, worldPosition.z);
  vec4 noise = getNoise(uv);

  vec3 eyeNormal = normalize(eye - worldPosition);
  vec3 surfaceNormal = normalize(vec3(0, 3.0, 0) + vec3(noise.x, 0, noise.y));

  vec3 sun = sunLight(surfaceNormal, eyeNormal, 200.0, 1.0, 0.5);
  gl_FragColor = vec4(sun + color, 1.0);
}