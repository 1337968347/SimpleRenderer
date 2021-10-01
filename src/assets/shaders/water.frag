precision highp float;

varying vec4 projected;
varying vec3 worldPosition;
varying vec3 surfaceNormal;
uniform vec3 color;
uniform sampler2D reflection;
uniform sampler2D refraction;
uniform vec3 eye;
uniform vec3 sunColor;
uniform vec3 sunDirection;

void main() {

  vec2 screenNoise = vec2(surfaceNormal.x, surfaceNormal.y * 0.5);
  // 获取在屏幕上的坐标
  vec2 screenPosition = ((vec2(projected) / projected.w) + 1.0) * 0.5;
  // 屏幕坐标 + 噪音坐标 =  倒影的坐标
  vec2 reflectionUV = clamp(screenPosition + screenNoise * 0.03, vec2(0.01), vec2(0.99));
  // 获取倒影的颜色
  vec3 reflectionSample = vec3(texture2D(reflection, reflectionUV));
  // 折射
  vec4 refractionSample = texture2D(refraction, clamp(screenPosition - screenNoise * 0.01, vec2(0.001), vec2(0.999)));
  // refractionSample.a 山的顶点到eye的向量
  // 水面的顶点到eye的向量
  // 向量相减 = 山顶点指向水面的向量
   // 水面到眼睛的距离
  float depth = length(worldPosition - eye);
  float waterDepth = min(refractionSample.a - depth, 40.0);

  // 在折射颜色跟水面颜色之间根据水深插值
  vec3 extinction = min((waterDepth / 35.0) * vec3(2.1, 1.05, 1.0), vec3(1.0));
  vec3 refractionColor = max(mix(vec3(refractionSample) * 0.5, color, extinction), vec3(0.0));

  vec3 eyeNormal = normalize(eye - worldPosition);
  
  // 视线跟水面法线的夹角
  float theta1 = clamp(dot(eyeNormal, surfaceNormal), 0.0, 1.0);
  float rf0 = 0.02; // realtime rendering, page 236
  // 菲涅尔反射： 与水面夹角小主要反射， 大是折射
  float reflectance = rf0 + (1.0 - rf0) * pow((1.0 - theta1), 5.0);
  // phong光照反射
  // 漫反射
  vec3 diffuseColor = max(dot(sunDirection, surfaceNormal), 0.0) * sunColor * 3.0;
  // 镜面反射
  vec3 reflectionDirection = normalize(reflect(-sunDirection, surfaceNormal));
  float reflecttionDot = max(0.0, dot(eyeNormal, reflectionDirection));
  vec3 specularColor = pow(reflecttionDot, 128.0) * sunColor * 5.0;

  vec3 finalColor = mix(refractionColor * diffuseColor, reflectionSample * (diffuseColor + specularColor), reflectance);
  gl_FragColor = vec4(finalColor, depth);
}