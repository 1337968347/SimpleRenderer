precision highp float;

varying vec3 surfaceNormal;

varying vec3 worldPosition;
uniform vec3 eye;

/// import "sun.glsl"

void main() {

    vec3 eyeNormal = normalize(eye - worldPosition);
    vec3 sun = sunLight(surfaceNormal, eyeNormal, 5.0, 0.5, 0.8);
    gl_FragColor = vec4( vec3(0.7, 0.8, 1.0), 1.0);
}
