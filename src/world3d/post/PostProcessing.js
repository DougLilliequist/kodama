import { Texture } from '../../vendor/ogl/src/core/Texture.js';
import {Post} from '../../vendor/ogl/src/extras/Post.js';
import { Vec2 } from '../../vendor/ogl/src/math/Vec2.js';

export default class PostProcessing {

    constructor(gl) {

        this.gl = gl;

        this.initFxaaPass();
        this.initBlurPass();
        this.initFakeAtmospherePass();
        this.initDitherPass();

    }

    initFxaaPass() {

        this.fxaaPass = new Post(this.gl, {
            width: this.gl.canvas.clientWidth,
            height: this.gl.canvas.clientHeight
        });

        const uniforms = {
            _Color: {
                value: new Texture(this.gl)
            },
            _Resolution: {
                value: new Vec2(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight)
            }
        }   

        this.fxaaPass.addPass({
            uniforms,
            fragment: require('./fxaa.glsl')
        });

    }

    initBlurPass() {

        const scale = 0.25;
        this.blurPass = new Post(this.gl, {
            width: this.gl.canvas.clientWidth*scale,
            height: this.gl.canvas.clientHeight*scale,
            type: this.gl.HALF_FLOAT,
            internalFormat: this.gl.RGBA16F
        });

        let stepCount = 9;
        for(let i = 0; i < stepCount; i++) {

            const uniforms = {
                _StepSize: {
                    value: 0.5 + i
                },
                _Time: {
                    value: 0
                },
                _Resolution: {
                    value: new Vec2(this.gl.canvas.clientWidth*scale, this.gl.canvas.clientHeight*scale)
                },
                _Seed: {
                    value: i
                }
            }   
    
            this.blurPass.addPass({
                uniforms,
                fragment: require('./blur.glsl')
            });

        }

        // const ditherUniforms = {
        //     _Time: {
        //         value: 0.0
        //     }
        // }

        // this.blurPass.addPass({
        //     uniforms: ditherUniforms,
        //     fragment: require('./dither.glsl')
        // });

    }

    initFakeAtmospherePass() {

        this.fakeAtmospherePass = new Post(this.gl, {
            width: this.gl.canvas.clientWidth,
            height: this.gl.canvas.clientHeight
        })

        const uniforms = {
            _Base: {
                value: new Texture(this.gl)
            },
            _Blur: {
                value: null
            },
            _Depth: {
                value: null
            },
            _Time: {
                value: 0
            }
        }   

        this.fakeAtmospherePass.addPass({
            uniforms,
            fragment: require('./screen.glsl')
        });

    }

    initDitherPass() {

        this.ditherPass = new Post(this.gl, {
            width: this.gl.canvas.clientWidth,
            height: this.gl.canvas.clientHeight
        })

        const uniforms = {
            _Time: {
                value: 0
            }
        }   

        this.ditherPass.addPass({
            uniforms,
            fragment: require('./dither.glsl')
        });

    }

    render({scene, depth, dt}) {

        this.fxaaPass.render({scene});
        
        this.blurPass.passes.forEach((pass) => {
            pass.program.uniforms._Time.value += dt;
        });
        this.blurPass.render({scene: this.fxaaPass.passes[0].mesh});

        this.fakeAtmospherePass.passes[0].program.uniforms._Blur = this.blurPass.uniform;
        this.fakeAtmospherePass.passes[0].program.uniforms._Depth.value = depth;
        this.fakeAtmospherePass.passes[0].program.uniforms._Time.value += dt;
        this.fakeAtmospherePass.render({scene: this.fxaaPass.passes[0].mesh});

        this.ditherPass.passes[0].program.uniforms._Time.value += dt;
        this.ditherPass.render({scene: this.fakeAtmospherePass.passes[0].mesh});

    }

    onResize({width, height}) {
        this.fxaaPass.resize({width, height});
        this.blurPass.resize({width: width*0.25, height: height*0.25});
        this.fakeAtmospherePass.resize({width, height});

    }

}