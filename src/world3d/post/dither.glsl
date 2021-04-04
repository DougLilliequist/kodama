precision highp float;

uniform sampler2D tMap;
uniform float _Time;

vec2 vUv;

float hash12(vec2 p)
{
	vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

void main() {

    vec3 col = texture2D(tMap, vUv).xyz;

    float hash1 = hash12(gl_FragCoord.xy+fract(_Time)*1300.0);
    float hash2 = hash12(gl_FragCoord.yx+fract(_Time+0.3123)*1300.0);
    float dither = ((hash1) + (hash2-1.0)) / 255.0;

    gl_FragColor = vec4(col + dither, 1.0);

}