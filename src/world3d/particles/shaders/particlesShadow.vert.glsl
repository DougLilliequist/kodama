precision highp float;

attribute vec3 position;
attribute vec2 samplerCoord;
attribute vec3 normal;
attribute vec2 uv;

uniform sampler2D _Position;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
varying vec2 vUv;

void main() {

    vec4 worldPos = texture2D(_Position, samplerCoord);
    vec4 wPos = modelMatrix * vec4(worldPos.xyz, 1.0);
    vec4 viewPos = viewMatrix * wPos;
    float lifePhase = worldPos.w * 4.0 * (1.0-worldPos.w);
    viewPos.xy += position.xy * lifePhase;

    vec4 clipPos = projectionMatrix * viewPos;

    gl_Position = clipPos;
    vUv = uv;

}