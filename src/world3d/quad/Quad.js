import { Mesh } from "../../vendor/ogl/src/core/Mesh";
import { Program } from "../../vendor/ogl/src/core/Program";
import { Texture } from "../../vendor/ogl/src/core/Texture";
import { Plane } from "../../vendor/ogl/src/extras/Plane";


export default class Quad extends Mesh {
    constructor(gl) {
        super(gl);
        this.gl = gl;
        this.geometry = new Plane(this.gl, {
            width:1,
            height:1
        });

        const uniforms = {
            _Normal: {
                value: new Texture(this.gl)
            }
        }

        this.program = new Program(this.gl, {
            uniforms,
            vertex: require('./shader/quad.vert.glsl'),
            fragment: require('./shader/quad.frag.glsl')
        });
            
    }
}