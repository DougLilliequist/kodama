precision highp float;

uniform sampler2D _Normal;
varying vec2 vUv;

void main() {

    vec3 n = texture2D(_Normal, vUv).xyz;
    if(n.x <= 0.0) discard;

    gl_FragColor = vec4(n, 1.0);

}