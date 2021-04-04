import {GPGPU} from '../../../vendor/ogl/src/extras/GPGPU.js';
import { Vec3 } from '../../../vendor/ogl/src/math/Vec3.js';

import {params} from '../../../params.js';
import { Texture } from '../../../vendor/ogl/src/core/Texture.js';

export default class Simulator {

    constructor(gl, {
        count
    }) {

        this.gl = gl;

        this.countX = count;
        this.countY = this.countX;

        this.initVelocitySimulator();
        this.initPositionSimulator();
        this.initPrograms();

    }

    initVelocitySimulator() {

        const initVelocityData = new Float32Array(this.countX * this.countY * 4);
        
        let velocityDataIterator = 0;

        for(let y = 0; y < this.countY; y++) {
            for(let x = 0; x < this.countX; x++) {

                initVelocityData[velocityDataIterator++] = 0;
                initVelocityData[velocityDataIterator++] = 0;
                initVelocityData[velocityDataIterator++] = 0;
                initVelocityData[velocityDataIterator++] = params.MIN_LIFERATE + (params.MAX_LIFERATE - params.MIN_LIFERATE) * Math.random();

            }
        }

        const randomData = new Float32Array(this.countX * this.countY * 4);
        let randomDataIterator = 0;

        for(let y = 0; y < this.countY; y++) {
            for(let x = 0; x < this.countX; x++) {

                randomData[randomDataIterator++] = Math.random();
                randomData[randomDataIterator++] = Math.random();
                randomData[randomDataIterator++] = Math.random();
                randomData[randomDataIterator++] = Math.random();

            }
        }

        this.hashData = this.createDataTexture({data: randomData, size: this.countX});

        this.velocitySim = new GPGPU(this.gl, {
            data: initVelocityData
        });

    }

    initPositionSimulator() {

        const initPositionData = new Float32Array(this.countX * this.countY * 4);
        
        let positionDataIterator = 0;

        for(let y = 0; y < this.countY; y++) {
            for(let x = 0; x < this.countX; x++) {

                initPositionData[positionDataIterator++] = 0;
                initPositionData[positionDataIterator++] = 0;
                initPositionData[positionDataIterator++] = 0;
                initPositionData[positionDataIterator++] = Math.random();

            }
        }

        this.positionSim = new GPGPU(this.gl, {
            data: initPositionData
        });

    }

    initPrograms() {

        const points = [
            new Vec3(-10.0, 0.0, 25.0),
            new Vec3(-5.0, 0.0, -18.0),
            new Vec3(5.0, 0.0, 30.0),
            new Vec3(10.0, 0.0,  -15.0)
        ]

        const velocitySimUniforms = {

            _Position: this.positionSim.uniform,
            _Hash: {
                value: this.hashData
            },
            _Points: {
                value: points
            },
            _SpatialF: {
                value: params.SPATIALF
            },
            _NoiseSpatialFScale: {
                value: params.NOISE_SAMPLE_SPATIALF_SCALE
            },
            _TemporalF: {
                value: params.TEMPORALF
            },
            _Amp: {
                value: params.AMP
            },
            _Time: {
                value: 0
            },
            _TimeScale: {
                value: params.TIME_SCALE
            },
            _MinLifeRate: {
                value: params.MIN_LIFERATE
            },
            _MaxLifeRate: {
                value: params.MAX_LIFERATE
            },
            _MinPathDist: {
                value: params.MIN_PATH_DIST
            },
            _MaxPathDist: {
                value: params.MAX_PATH_DIST
            },
            _ReturnForceK: {
                value: params.RETURN_FORCE_STR
            },
            _RepelForceK: {
                value: params.REPEL_FORCE_STR
            },
            _NoiseSampleSpread: {
                value: params.NOISE_SAMPLE_SPREAD
            },
            _NoiseJitterScale: {
                value: params.NOISE_JITTER_SCALE
            },
            _PathForce: {
                value: params.PATH_FORCE
            }
            

        }

        this.velocitySim.addPass({
            uniforms: velocitySimUniforms,
            fragment: require('./kernels/velocity.glsl')
        });

        const positionSimUniforms = {

            _Velocity: this.velocitySim.uniform,
            _Points: {
                value: points
            },
            _Time: {
                value: 0
            },
            _TimeScale: {
                value: params.TIME_SCALE
            }

        }

        this.positionSim.addPass({
            uniforms: positionSimUniforms,
            fragment: require('./kernels/position.glsl')
        });

        // pane.addInput(params, 'SPATIALF', {
        //     min: 0.001, max: 0.2
        // }).on('change', (ev) => {
        //     this.velocitySim.passes[0].program.uniforms._SpatialF.value = ev.value
        // });

        
        // pane.addInput(params, 'NOISE_SAMPLE_SPATIALF_SCALE', {
        //     min: 0.1, max: 10.0
        // }).on('change', (ev) => {
        //     this.velocitySim.passes[0].program.uniforms._NoiseSpatialFScale.value = ev.value
        // });

        // pane.addInput(params, 'TEMPORALF', {
        //     min: 0.001, max: 0.2
        // }).on('change', (ev) => {
        //     this.velocitySim.passes[0].program.uniforms._TemporalF.value = ev.value
        // });
     
        // pane.addInput(params, 'AMP', {
        //     min: 0.001, max: 0.1
        // }).on('change', (ev) => {
        //     this.velocitySim.passes[0].program.uniforms._Amp.value = ev.value
        // });

        // // pane.addInput(params, 'MIN_LIFERATE', {
        // //     min: 0.001, max: 0.01
        // // }).on('change', (ev) => {
        // //     this.velocitySim.passes[0].program.uniforms._MinLifeRate.value = ev.value
        // // });
        
        // pane.addInput(params, 'MIN_LIFERATE', {
        //     min: 0.001, max: 0.19
        // }).on('change', (ev) => {
        //     this.velocitySim.passes[0].program.uniforms._MinLifeRate.value = ev.value
        // });

        // pane.addInput(params, 'MAX_LIFERATE', {
        //     min: 0.002, max: 0.2
        // }).on('change', (ev) => {
        //     this.velocitySim.passes[0].program.uniforms._MaxLifeRate.value = ev.value
        // });

        // //RENAME TO TEMPORAL SPREAD/OFFSET
        // pane.addInput(params, 'NOISE_SAMPLE_SPREAD', {
        //     // min: 0, max: 100
        //     min: 0, max: 3
        // }).on('change', (ev) => {
        //     this.velocitySim.passes[0].program.uniforms._NoiseSampleSpread.value = ev.value
        // });

        // pane.addInput(params, 'NOISE_JITTER_SCALE', {
        //     // min: 0, max: 100
        //     min: 0, max: 20
        // }).on('change', (ev) => {
        //     this.velocitySim.passes[0].program.uniforms._NoiseJitterScale.value = ev.value
        // });

        // pane.addInput(params, 'PATH_FORCE', {
        //     // min: 0, max: 100
        //     min: 0.001, max: 0.1
        // }).on('change', (ev) => {
        //     this.velocitySim.passes[0].program.uniforms._PathForce.value = ev.value
        // });

        // pane.addInput(params, 'TIME_SCALE', {
        //     min: 0.0001, max: 0.1
        // }).on('change', (ev) => {
        //     this.velocitySim.passes[0].program.uniforms._TimeScale.value = ev.value
        //     this.positionSim.passes[0].program.uniforms._TimeScale.value = ev.value
        // });

    }

    updatePath({points}) {
        
        this.velocitySim.passes[0].program.uniforms._Points.value = points;
        this.positionSim.passes[0].program.uniforms._Points.value = points;

    }

    update({deltaTime, bezier}) {

        this.updatePath({points: bezier.PathPoints})

        this.velocitySim.passes[0].program.uniforms._Time.value += deltaTime;
        this.velocitySim.render();

        this.positionSim.passes[0].program.uniforms._Time.value += deltaTime;
        this.positionSim.render();

    }

    createDataTexture({data, size}) {

        return new Texture(this.gl, {
            image: data,
            target: this.gl.TEXTURE_2D,
            type: this.gl.FLOAT,
            format: this.gl.RGBA,
            internalFormat: this.gl.renderer.isWebgl2 ? this.gl.RGBA32F : this.gl.RGBA,
            wrapS: this.gl.CLAMP_TO_EDGE,
            wrapT: this.gl.CLAMP_TO_EDGE,
            generateMipmaps: false,
            minFilter: this.gl.NEAREST,
            magFilter: this.gl.NEAREST,
            width: size,
            flipY: false
        })

    }

    get Velocities() {
        return this.velocitySim.uniform
    }

    get Positions() {
        return this.positionSim.uniform
    }

}