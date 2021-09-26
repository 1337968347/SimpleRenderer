precision highp float;

varying vec2 screenPosition;
uniform sampler2D texture;
uniform sampler2D bloom;

void main() {
  vec4 bloomColor = texture2D(bloom, screenPosition) * 0.25;
  vec4 color = 0.75 * texture2D(texture, screenPosition) + bloomColor;

  gl_FragColor = color;//

}