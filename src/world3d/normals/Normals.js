import {Sphere} from '../../vendor/ogl/src/extras/Sphere.js';
import {Program} from '../../vendor/ogl/src/core/Program.js';
import {Transform} from '../../vendor/ogl/src/core/Transform.js';
import {Mesh} from '../../vendor/ogl/src/core/Mesh.js';
import {RenderTarget} from '../../vendor/ogl/src/core/RenderTarget.js';

export default class Normals {

    constructor(gl, renderer) {

        this.gl = gl;

        this.scene = new Transform();

        this.texture = new RenderTarget(this.gl, {
            width: 64.0,
            height: 64.0,
            depth: false,
            depthTexture: false,
            format: this.gl.RGB
            // type: this.gl.HALF_FLOAT,
            // format: this.gl.RGBA,
            // internalFormat: gl.RGBA16F
        });

        const geometry = new Sphere(this.gl, {
            radius: 0.98,
            widthSegments: 64.0,
            heightSegments: 64.0
        });

        const program = new Program(this.gl, {
            vertex: require('./shaders/normals.vert.glsl'),
            fragment: require('./shaders/normals.frag.glsl'),
            depthTest: false,
            depthWrite: false
        });

        const normalSphere = new Mesh(this.gl, {
            geometry,
            program,
            frustumCulled: false
        });

        normalSphere.setParent(this.scene);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.renderer.render({scene: this.scene, target: this.texture});
        // renderer.render({scene: this.scene});
        // this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // this.gl.clearColor(0.7, 0.7, 0.7, 1.0);
    }

    get Texture() {
        return this.texture.texture;
    }

}