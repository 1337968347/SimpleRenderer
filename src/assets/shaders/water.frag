precision highp float;

uniform vec3 color;
uniform float time;
uniform vec3 eye;
uniform sampler2D waterNoise;
uniform sampler2D reflection;
uniform sampler2D refraction;

varying vec4 projected;
varying vec3 worldPosition;
varying float depth;

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
  return noise * 0.25 - 0.5;
}

void main() {
  vec2 uv = vec2(worldPosition.x, worldPosition.z);
  // 噪音
  vec4 noise = getNoise(uv);
  vec3 surfaceNormal = normalize(vec3(noise.x, 1.0, noise.z));

  vec3 eyeNormal = normalize(eye - worldPosition);
  // 光照
  vec3 sun = sunLight(surfaceNormal, eyeNormal, 100.0, 1.5, 1.2);
  // 反射
  // 透视除法
  vec2 screenPosition = (projected.xy / projected.z + 1.0) * 0.5;
  vec2 reflectionUV = clamp(screenPosition + vec2(noise.x, noise.y * 0.5) * 0.05, vec2(0.01), vec2(0.99));
  vec3 reflectionSample = vec3(texture2D(reflection, reflectionUV - vec2(noise) * 0.08));

  gl_FragColor = vec4(color * (0.5 * sun + 0.5 * reflectionSample), depth);
}