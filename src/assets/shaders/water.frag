precision highp float;

uniform vec3 color;
uniform vec3 sunColor;
uniform vec3 sunDirection;
uniform sampler2D waterNoise;
uniform float time;
uniform vec3 eye;
varying vec3 worldPosition;


// 漫反射 
vec3 sunLight(const vec3 surfaceNormal) {
  vec3 product = sunColor * vec3(1.0, 0.5, 1.0);
  vec3 diffuse = max(dot(sunDirection, surfaceNormal), 0.0) * product;
  // 半角向量
  vec3 eV = normalize(sunDirection) + normalize((vec3(0.0,1.0,0.0) - worldPosition));
  float ks = 3.8 * pow(max(dot(normalize(eV), normalize(surfaceNormal)), 0.0), 100.0);
  vec3 specular = ks * product;
  return diffuse + specular;
}

vec4 getNoise(vec2 uv) {
  vec2 uv0 = (uv / 103.0) + vec2(time / 17.0, time / 29.0);
  vec2 uv1 = uv / vec2(897.0, 983.0) + vec2(time / 101.0, time / 97.0);

  vec4 noise = (texture2D(waterNoise, uv0)) +
    (texture2D(waterNoise, uv1));
  return noise -0.5;
}

void main() {
  vec2 uv = vec2(worldPosition.x, worldPosition.z);
  vec4 noise = getNoise(uv);

  vec3 surfaceNormal = vec3(0.0,1.0,0.0) + vec3(noise.x ,0.0,noise.z);
  vec3 sun = sunLight(surfaceNormal);
  gl_FragColor = vec4(sun * color, 1.0);
}