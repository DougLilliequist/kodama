precision highp float;

uniform sampler2D tMap;
uniform vec2 _Resolution;

uniform float _StepSize;

varying vec2 vUv;

void main() {
    
    vec2 texelSize = 1.0 / _Resolution;

    vec3 col = texture2D(tMap, vUv + texelSize * _StepSize).xyz;
    col += texture2D(tMap, vUv - texelSize * _StepSize).xyz;
    col += texture2D(tMap, vUv + vec2(texelSize.x, -texelSize.y) * _StepSize).xyz;
    col += texture2D(tMap, vUv + vec2(-texelSize.x, +texelSize.y) * _StepSize).xyz;
    col /= 4.0;

    // Output to screen
    gl_FragColor = vec4(col,1.0);

}