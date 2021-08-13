precision highp float;

uniform vec3 color;
uniform vec3 sunColor;
uniform vec3 sunDirection;
uniform sampler2D waterNoise;
uniform float time;
varying vec3 worldPosition;

// 漫反射 
vec3 sunLight(const vec3 surfaceNormal) {
  return max(dot(sunDirection, surfaceNormal), 0.0) * sunColor;
}

void main() {
  vec2 uv = vec2(worldPosition.x, worldPosition.z);
  vec4 noise = (texture2D(waterNoise, (uv + vec2(time * 0.43, time * 0.39)) * 0.07)) +
    (texture2D(waterNoise, (uv - vec2(time * 0.41, -time * 0.42)) * 0.05)) - 1.0;
  vec3 color = sunLight(noise.xzy * vec3(2.0, 1.0, 2.0));
  gl_FragColor = vec4(color * vec3(0.3, 0.5, 0.9), 1.0);
}