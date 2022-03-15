uniform vec3 fogColor;
uniform float globalFogDensity;
uniform float fogHeight;

vec3 heightFog(vec3 eyePosition, vec3 viewPosition, vec3 color) {
    // float effectZ = length(eyePosition - viewPosition);
    // float heightFallOff = eyePosition.y - fogHeight;
    // float falloff = effectZ * heightFallOff;
    // float fogFactor = (1.0 - exp2(-falloff)) / falloff;

    // float fogDensity = exp2(-heightFallOff * globalFogDensity);
    // float fog = fogFactor * fogDensity;
    // return mix(color,fogColor , fog);

    float distance = length(eyePosition - viewPosition) * globalFogDensity;
    float fogDensity = exp2(-distance);
    return mix(fogColor, color, fogDensity);
}