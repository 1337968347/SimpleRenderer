precision highp float;

varying vec3 surfaceNormal;

varying vec3 worldPosition;
uniform vec3 eye;

/// import "sun.glsl"

void main() {

    vec3 eyeNormal = normalize(eye - worldPosition);
    vec3 sun = sunLight(surfaceNormal, eyeNormal, 0.9, 205.0, 0.2, 1.3);
    gl_FragColor = vec4(sun, 1.0);
}
