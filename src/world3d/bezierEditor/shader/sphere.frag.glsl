precision highp float;

varying vec3 vNormal;

void main() {

    float light = dot(normalize(vNormal), vec3(0.0, 1.0, 0.0))*0.35 + (1.0 - 0.35);

    gl_FragColor = vec4(vec3(light), 1.0);

}