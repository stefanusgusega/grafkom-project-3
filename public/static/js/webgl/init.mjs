import {initShaders} from './utils/initShaders.mjs';
import {transpose, inverse, translationTranspos, matIdentity, matLookAt, matPerspective, matOblique, matOrtho, matmul, degToRad, arrToMat, flatten2D} from './utils/util.mjs';
import {render} from './render.mjs';
import {GiraffesRenderer} from './renderer/giraffe.mjs'

export function init(master) {
    master.canvas = document.getElementById('glCanvas');
    master.gl = master.canvas.getContext('webgl');
    
    const canvas_size = 640;

    if (!master.gl) throw new Error('Web GL Not Supported');

    // WebGL Configurations
    master.gl.viewport(0, 0, master.canvas.width, master.canvas.height);
    master.gl.clearColor(1.0, 1.0, 1.0, 1.0);
    master.gl.clear(master.gl.COLOR_BUFFER_BIT);

    master.gl.enable(master.gl.DEPTH_TEST);

    // Load Shaders 
    var vs = document.getElementById('shaderVs').innerHTML;
    var fs = document.getElementById('shaderFs').innerHTML;


    if (!initShaders(master.gl, vs, fs)) {
        console.log('Failed to intialize shaders.');
        return;
    }  
    
    master.vPosition = master.gl.getAttribLocation(master.gl.program, 'vertPosition');
    master.vColor = master.gl.getAttribLocation(master.gl.program, 'vertColor');
    master.vNormal = master.gl.getAttribLocation(master.gl.program, 'vertNormal');
    master.vTexture = master.gl.getAttribLocation(master.gl.program, 'vertTexture');

    master.matWorldUniformLocation = master.gl.getUniformLocation(master.gl.program, 'mWorld');
	master.matViewUniformLocation = master.gl.getUniformLocation(master.gl.program, 'mView');
    master.matProjUniformLocation = master.gl.getUniformLocation(master.gl.program, 'mProj');
    master.matNormLocation = master.gl.getUniformLocation(master.gl.program, 'mNorm');
    master.matUSamplerLocation = master.gl.getUniformLocation(master.gl.program, 'uSampler');
    master.mappingMode = master.gl.getUniformLocation(master.gl.program, 'mode');
    master.shadeMode = master.gl.getUniformLocation(master.gl.program, 'stateShade');
    
    var worldMatrix = matIdentity();
    var viewMatrix = matLookAt(master.eye, master.center, master.up);
    var projMatrix = matPerspective(degToRad(45), 640/640, 0.1, 1000.0);
    var normMatrix = transpose(inverse(flatten2D(matmul(arrToMat(viewMatrix), arrToMat(worldMatrix)))));

    const value_shadeButton = document.getElementById('shade').value;
    if (value_shadeButton == "On") {
        master.gl.uniform1i(master.shadeMode, 1);  
    } else {
        master.gl.uniform1i(master.shadeMode, 0);  
    }

    master.gl.uniformMatrix4fv(master.matWorldUniformLocation, false, worldMatrix);
	master.gl.uniformMatrix4fv(master.matViewUniformLocation, false, viewMatrix);
    master.gl.uniformMatrix4fv(master.matProjUniformLocation, false, projMatrix);
    master.gl.uniformMatrix4fv(master.matNormLocation, false, normMatrix);
    master.gl.uniform1i(master.matUSamplerLocation, 0);

    master.renderer['giraffe'] = new GiraffesRenderer(master);
    
    events(master);
    render(master);
}

function updateView(master) {
    const viewMatrix = matLookAt(master.eye, master.center, master.up);
	master.gl.uniformMatrix4fv(master.matViewUniformLocation, false, viewMatrix);
}

function updateProj(master) {
    var projMatrix;
    if (master.mode == 0) {
        const m = matOblique(75, 75);
        const n = matOrtho(-4.0, 4.0, -4.0, 4.0, 0.1, 100.0);
        const mX = -1.7;
        const mY = -1.7;
        projMatrix = translationTranspos(matmul(arrToMat(m), arrToMat(n)), mX, mY, 0);
    } else if (master.mode == 1) {
        projMatrix = matPerspective(degToRad(45), 640/640, 0.1, 100.0)
    } else {
        projMatrix = matOrtho(-4.0, 4.0, -4.0, 4.0, 0.1, 100.0)
    }
    master.gl.uniformMatrix4fv(master.matProjUniformLocation, false, projMatrix);
}

function updateWorld(master) {
    const worldMatrix = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        master.movement[0], master.movement[1], master.movement[2], 1
    ]);
    master.gl.uniformMatrix4fv(master.matWorldUniformLocation, false, worldMatrix);
}

function events(master) {
    const rotationCamera = {
        'x': document.getElementById('cameraRotateX'),
        'y': document.getElementById('cameraRotateY'),
    }
    const movement = {
        'x': document.getElementById('movex'),
        'y': document.getElementById('movey'),
        'z': document.getElementById('movez')
    }
    const eye = {
        'x': document.getElementById('eyex'),
        'y': document.getElementById('eyey'),
        'z': document.getElementById('eyez')
    }
    const center = {
        'x': document.getElementById('centerx'),
        'y': document.getElementById('centery'),
        'z': document.getElementById('centerz')
    }
    const up = {
        'x': document.getElementById('upx'),
        'y': document.getElementById('upy'),
        'z': document.getElementById('upz')
    }
    const animation = {
        'giraffe': document.getElementById('giraffeRot'),
    }

    const resetButton = document.getElementById('reset');
    const orthoButton = document.getElementById('ortho');
    const obliqueButton = document.getElementById('oblique');
    const perspectiveButton = document.getElementById('perspective');
    const shadeButoon = document.getElementById('shade');

    const giraffeButton = document.getElementById('giraffeAnimate');
    
    movement['x'].oninput = function() {
        master.movement[0] = parseInt(movement['x'].value);
        updateWorld(master);
        render(master);
    };

    movement['y'].oninput = function() {
        master.movement[1] = parseInt(movement['y'].value);
        updateWorld(master);
        render(master);
    };

    movement['z'].oninput = function() {
        master.movement[2] = parseInt(movement['z'].value);
        updateWorld(master);
        render(master);
    };

    eye['x'].oninput = function() {
        master.eye[0] = parseInt(eye['x'].value);
        updateView(master)
        render(master);
    };

    eye['y'].oninput = function() {
        master.eye[1] = parseInt(eye['y'].value);
        updateView(master)
        render(master);
    };

    eye['z'].oninput = function() {
        master.eye[2] = parseInt(eye['z'].value);
        updateView(master)
        render(master);
    };

    center['x'].oninput = function() {
        master.center[0] = parseInt(center['x'].value);
        updateView(master);
        render(master);
    };

    center['y'].oninput = function() {
        master.center[1] = parseInt(center['y'].value);
        updateView(master);
        render(master);
    };

    center['z'].oninput = function() {
        master.center[2] = parseInt(center['z'].value);
        updateView(master);
        render(master);
    };

    up['x'].oninput = function() {
        master.up[0] = parseInt(up['x'].value);
        updateView(master);
        render(master);
    }

    up['y'].oninput = function() {
        master.up[1] = parseInt(up['y'].value);
        updateView(master);
        render(master);
    }

    up['z'].oninput = function() {
        master.up[2] = parseInt(up['z'].value);
        updateView(master);
        render(master);
    }

    animation['giraffe'].oninput = function() {
        const val = parseInt(animation['giraffe'].value);
        master.giraffe.rotation = val;
        master.giraffe.updateAnimation();
        master.giraffe.updateTransform();
        render(master);
    };
    
    shadeButoon.addEventListener("click", function(){
        const value_shadeButton = document.getElementById('shade').value;
        if(value_shadeButton == "On"){
            document.getElementById("shade").value="Off";
            master.gl.uniform1i(master.gl.getUniformLocation(master.gl.program,"stateShade"), 0);  
        }else{
            document.getElementById("shade").value="On";
            master.gl.uniform1i(master.gl.getUniformLocation(master.gl.program,"stateShade"), 1);  
        }
        render(master)
    });

    resetButton.addEventListener("click", function() {
        master.eye = [0, 0, -8];
        master.center = [0, 0, 0];
        master.up = [0, 1, 0];
        master.movement = [0, 0, 0];
        master.cameraRotation = [0, 0, 0];
        master.mode = 1;
        var i = 0;
        for (var key in eye) {
            eye[key].value = master.eye[i]
            center[key].value = master.center[i]
            up[key].value = master.up[i]
            movement[key].value = master.movement[i];
            i++;
        }

        rotateWorld(master)
        updateView(master);
        updateWorld(master);
        updateProj(master);
        render(master);
    });
    
    obliqueButton.addEventListener('click', function() {
        master.mode = 0;
        updateProj(master)
        render(master)
    })
    
    perspectiveButton.addEventListener('click', function() {
        master.mode = 1;
        updateProj(master)
        render(master)
    })

    orthoButton.addEventListener('click', function() {
        master.mode = 2;
        updateProj(master)
        render(master)
    })

    giraffeButton.addEventListener("click", function() {
        var now = parseInt(animation['giraffe'].value);
        var markUp = true;
        var markDown = false;
        function animate() {
            master.renderer['giraffe'].render();
            if (markUp) {
                now++;
                if (now == 20) {
                    markUp = false;
                    markDown = true;
                }
            }
            if (markDown) {
                now--;
                if (now == -20) {
                    markUp = true;
                    markDown = false;
                }
            }

            master.giraffe.rotation = now;
            master.giraffe.updateAnimation();
            master.giraffe.updateTransform();
            animation['giraffe'].value = now;
            
            if (master.isStartGiraffeAnimation) requestAnimationFrame(animate);
        }

        master.isStartGiraffeAnimation = !master.isStartGiraffeAnimation;
        if (master.isStartGiraffeAnimation) requestAnimationFrame(animate);
    });
}