uniform vec3 fogColor;
uniform float globalFogDensity;
uniform float fogHeight;

vec3 heightFog(vec3 cameraPosition, vec3 viewPosition, vec3 color) {
    float rayLength = length(cameraPosition - viewPosition);
    float eyeFogEffectZ = cameraPosition.y - fogHeight;

    float effectZ = fogHeight - viewPosition.y;
    float heightFallOff = 0.4;

    float falloff = effectZ * heightFallOff;
    float fogFactor = min((1.0 - exp2(-falloff)) / falloff, 1.0);
    float fogDensity =  min(exp2(eyeFogEffectZ * heightFallOff), 1.0);

    float fog = min(fogDensity, fogFactor) * max(exp2(-rayLength * globalFogDensity), 0.3);
    return mix(fogColor, color, fog);
}