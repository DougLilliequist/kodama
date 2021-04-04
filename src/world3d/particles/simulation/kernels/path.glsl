precision highp float;

uniform sampler2D _Position;

uniform vec3 _Points[4];

varying vec2 vUv;

#define EPS 0.001

vec3 computeBezier(float t) {

    vec3 p0p1 = mix(_Points[0], _Points[1], t);
    vec3 p1p2 = mix(_Points[1], _Points[2], t);
    vec3 p2p3 = mix(_Points[2], _Points[3], t);

    vec3 a = mix(p0p1, p1p2, t);
    vec3 b = mix(p1p2, p2p3, t);

    return mix(a, b, t);
    
}

void main() {

    float phase = texture2D(_Position, vUv).w;

    gl_FragColor = vec4(computeBezier(phase), 1.0);

}