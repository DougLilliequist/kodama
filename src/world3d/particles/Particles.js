import { Camera } from '../../vendor/ogl/src/core/Camera.js';
import { Geometry } from '../../vendor/ogl/src/core/Geometry.js';
import {Mesh} from '../../vendor/ogl/src/core/Mesh.js';
import {Program} from '../../vendor/ogl/src/core/Program.js'
import { Texture } from '../../vendor/ogl/src/core/Texture.js';
import {Plane} from '../../vendor/ogl/src/extras/Plane.js';
import {Shadow} from '../../vendor/ogl/src/extras/Shadow.js';
import { Sphere } from '../../vendor/ogl/src/extras/Sphere.js';

import Simulator from './simulation/Simulator.js'

import {params} from '../../params.js'

export default class Particles extends Mesh {

    constructor(gl, {
        count,
        normal
    }) {

        super(gl);

        this.gl = gl;

        this.countX = count;
        this.countY = count;

        this.initSimulator();
        this.initGeometry();
        this.initMaterial(normal);
        this.initShadowPass(normal);

    }

    initSimulator() {

        this.simulator = new Simulator(this.gl, {
            count: this.countX
        });

    }

    initGeometry() {
        
        const refGeometry = new Plane(this.gl, {width: 0.1, height: 0.1});
        const {position, normal, uv, index} = refGeometry.attributes;
        const localPositionData = position.data;
        const normalData = normal.data;
        const uvData = uv.data;
        const indexData = index.data;

        const scaleData = new Float32Array(this.countX*this.countY);
        let scaleDataIterator = 0.0;
        for(let i = 0; i < scaleData.length;i++) {
            scaleData[scaleDataIterator++] = Math.random();
        }
        
        this.geometry = new Geometry(this.gl, {

            position: {
                size: 3,
                data: localPositionData
            },
            samplerCoord: {
                instanced: 1,
                size: 2,
                data: this.simulator.positionSim.coords
            },
            uv: {
                size: 2,
                data: uvData
            },
            normal: {
                size: 3,
                data: normalData
            },
            scale: {
                size:1,
                instanced: 1,
                data: scaleData
            },
            index: {
                data: indexData
            }

        });

    }

    initMaterial(normal) {

        const uniforms = {

            _Position: this.simulator.Positions,
            _Normal: {
                value: normal
            },
            _ShadowMapTexelSize: {
                value: 1.0/params.shadow.SIZE
            }

        }

        this.program = new Program(this.gl, {
            uniforms,
            vertex: require('./shaders/particles.vert.glsl'),
            fragment: require('./shaders/particles.frag.glsl'),
            cullFace: this.gl.BACK,
            transparent: false
        })

    }

    initShadowPass(normal) {

        // this.shadowCamera = new Camera(this.gl, {
        //     near: 1.0,
        //     far: 20.0,
        //     left: -32.0,
        //     right: 32.0,
        //     top: 32.0,
        //     bottom: -32.0
        // });

        this.shadowCamera = new Camera(this.gl, {
            near: 1.0,
            far: 300.0,
            left: -28.0,
            right: 28.0,
            top: 28.0,
            bottom: -28.0
        });

        // this.shadowCamera = new Camera(this.gl, {
        //     near: 1.0,
        //     far: 100.0,
        //     left: -12.0,
        //     right: 12.0,
        //     top: 12.0,
        //     bottom: -12.0
        // });

        // this.shadowCamera.position.set(0.0, 5.0, 5.0);
        // this.shadowCamera.position.set(0.0, 8.0, 0.25);
        // this.shadowCamera.position.set(0.0, 10.0, 1.0);
        // this.shadowCamera.position.set(0.0, 10.0, 2.0);
        this.shadowCamera.position.set(0.0, 50.0, 0.0);
        this.shadowCamera.lookAt([0.0, 0.0, 0.0]);

        this.shadowPass = new Shadow(this.gl, {light: this.shadowCamera, width: params.shadow.SIZE, height: params.shadow.SIZE});

        this.shadowPass.add({mesh: this, vertex: require('./shaders/particlesShadow.vert.glsl'), fragment: require('./shaders/particlesShadow.frag.glsl')});
        this.depthProgram.uniforms._Position = this.simulator.Positions;
        this.depthProgram.uniforms._Normal = {value: normal};

    }

    update({deltaTime, bezier}) {
        
        this.simulator.update({deltaTime, bezier});
        this.shadowPass.render({scene: this})

    }

}