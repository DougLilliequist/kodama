    precision highp float;

    uniform sampler2D _Normal;
    varying vec2 vUv;

    vec4 packRGBA (float v) {
        vec4 pack = fract(vec4(1.0, 255.0, 65025.0, 16581375.0) * v);
        pack -= pack.yzww * vec2(1.0 / 255.0, 0.0).xxxy;
        return pack;
    }

    void main() {

        vec3 n = texture2D(_Normal, vUv).xyz;
        if(dot(n,n) < 0.2) discard;
        n = n * 2.0 - 1.0;
        vec4 depth = packRGBA(gl_FragCoord.z);

        gl_FragColor = depth;
    }