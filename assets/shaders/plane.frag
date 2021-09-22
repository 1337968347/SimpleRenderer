precision highp float;

varying vec3 surfaceNormal;

varying vec3 worldPosition;
uniform vec3 eye;

/// import "sun.glsl"

void main() {

    vec3 eyeNormal = normalize(eye - worldPosition);
    vec3 sun = sunLight(surfaceNormal, eyeNormal, 155.0, 1.5, 1.8);
    gl_FragColor = vec4( sun , 1.0);
}
