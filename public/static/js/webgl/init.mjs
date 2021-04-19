import {initShaders} from './utils/initShaders.mjs';
import {transpose, inverse, translationTranspos, matIdentity, matLookAt, matPerspective, matOblique, matOrtho, matmul, degToRad, arrToMat, flatten2D, rotateMat} from './utils/util.mjs';
import {render} from './render.mjs';
import {GiraffesRenderer} from './renderer/giraffe.mjs'
import {BatRenderer} from './renderer/Bat.mjs'
import {DogRenderer} from './renderer/dog.mjs'

export function init(master) {
    master.canvas = document.getElementById('glCanvas');
    master.gl = master.canvas.getContext('webgl');
    master.gl.getExtension("OES_standard_derivatives");

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
    master.worldCameraPositionLocation = master.gl.getUniformLocation(master.gl.program, "u_worldCameraPosition");
    master.matUSamplerLocation = master.gl.getUniformLocation(master.gl.program, 'uSampler');
    master.mappingMode = master.gl.getUniformLocation(master.gl.program, 'mode');
    master.shadeMode = master.gl.getUniformLocation(master.gl.program, 'stateShade');
    //master.matDiffuseLocation = master.gl.getUniformLocation(master.gl.program, 'u_diffuse');
    //master.matNormMapLocation = master.gl.getUniformLocation(master.gl.program, 'u_normal_map');
    //master.matLightPosLocation = master.gl.getUniformLocation(master.gl.program, 'u_light_pos');
   

    var cameraPosition = [0, 0, -8];
    var cameraMatrix = matLookAt(master.eye, master.center, master.up);
	var viewMatrix = inverse(cameraMatrix);
    master.worldMatrix = matIdentity();
    var projMatrix = matPerspective(degToRad(45), 640/640, 0.1, 1000.0);
    var normMatrix = transpose(inverse(flatten2D(matmul(arrToMat(viewMatrix), arrToMat(master.worldMatrix)))));

    const value_shadeButton = document.getElementById('shade').value;
    if (value_shadeButton == "On") {
        master.gl.uniform1i(master.shadeMode, 1);  
    } else {
        master.gl.uniform1i(master.shadeMode, 0);  
    }

    master.gl.uniformMatrix4fv(master.matWorldUniformLocation, false, master.worldMatrix);
	master.gl.uniformMatrix4fv(master.matViewUniformLocation, false, viewMatrix);
    master.gl.uniformMatrix4fv(master.matProjUniformLocation, false, projMatrix);
    master.gl.uniformMatrix4fv(master.matNormLocation, false, normMatrix);
    master.gl.uniform3fv(master.worldCameraPositionLocation, cameraPosition);
    master.gl.uniform1i(master.matUSamplerLocation, 0);
    // bump mapping
    //master.gl.uniform1i(master.matDiffuseLocation, 0.5);
    //master.gl.uniform1i(master.matNormMapLocation, 0.5);
    
    master.renderer['giraffe'] = new GiraffesRenderer(master);
    master.renderer['Bat'] = new BatRenderer(master);
    master.renderer['dog'] = new DogRenderer(master);
    
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
    const update = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        master.movement[0], master.movement[1], master.movement[2], 1
    ]);
    master.worldMatrix = matIdentity()
    master.worldMatrix = matmul(arrToMat(update), arrToMat(master.worldMatrix))
    master.worldMatrix = flatten2D(matmul(rotateMat(master.cameraRotation[0], master.cameraRotation[1], master.cameraRotation[2], 0, 0, 0), master.worldMatrix))

    master.gl.uniformMatrix4fv(master.matWorldUniformLocation, false, master.worldMatrix);
}

function events(master) {
    const rotationCamera = {
        'x': document.getElementById('cameraRotateX'),
        'y': document.getElementById('cameraRotateY'),
    }
    const giraffeTranslation = {
        'x': document.getElementById('gTx'),
        'y': document.getElementById('gTy'),
        'z': document.getElementById('gTz')
    }
    const giraffeNeckRotation = {
        'x': document.getElementById('gRNx'),
        'y': document.getElementById('gRNy'),
        'z': document.getElementById('gRNz')
    }
    const giraffeHeadRotation = {
        'x': document.getElementById('gHx'),
        'y': document.getElementById('gHy'),
        'z': document.getElementById('gHz')
    }
    const giraffeLegFrontLeftRotation = {
        'x': document.getElementById('gLFLx'),
        'y': document.getElementById('gLFLy'),
        'z': document.getElementById('gLFLz')
    }
    const giraffeLegFrontRightRotation = {
        'x': document.getElementById('gLFRx'),
        'y': document.getElementById('gLFRy'),
        'z': document.getElementById('gLFRz')
    }
    const giraffeLegBackLeftRotation = {
        'x': document.getElementById('gLBLx'),
        'y': document.getElementById('gLBLy'),
        'z': document.getElementById('gLBLz')
    }
    const giraffeLegBackRightRotation = {
        'x': document.getElementById('gLBRx'),
        'y': document.getElementById('gLBRy'),
        'z': document.getElementById('gLBRz')
    }
    const BatTranslation = {
        'x': document.getElementById('dTx'),
        'y': document.getElementById('dTy'),
        'z': document.getElementById('dTz')
    }
    const BatWing2Rotation = {
        'x': document.getElementById('dRNx'),
        'y': document.getElementById('dRNy'),
        'z': document.getElementById('dRNz')
    }
    const BatWing1Rotation = {
        'x': document.getElementById('dHx'),
        'y': document.getElementById('dHy'),
        'z': document.getElementById('dHz')
    }
    const BatLegFrontLeftRotation = {
        'x': document.getElementById('dLFLx'),
        'y': document.getElementById('dLFLy'),
        'z': document.getElementById('dLFLz')
    }
    const BatLegFrontRightRotation = {
        'x': document.getElementById('dLFRx'),
        'y': document.getElementById('dLFRy'),
        'z': document.getElementById('dLFRz')
    }
    const BatEarLeftRotation = {
        'x': document.getElementById('dLBLx'),
        'y': document.getElementById('dLBLy'),
        'z': document.getElementById('dLBLz')
    }
    const BatEarRightRotation = {
        'x': document.getElementById('dLBRx'),
        'y': document.getElementById('dLBRy'),
        'z': document.getElementById('dLBRz')
    }

    const dogTranslation = {
        'x': document.getElementById('dTx'),
        'y': document.getElementById('dTy'),
        'z': document.getElementById('dTz')
    }
    const dogNeckRotation = {
        'x': document.getElementById('dRNx'),
        'y': document.getElementById('dRNy'),
        'z': document.getElementById('dRNz')
    }
    const dogHeadRotation = {
        'x': document.getElementById('dHx'),
        'y': document.getElementById('dHy'),
        'z': document.getElementById('dHz')
    }
    const dogLegFrontLeftRotation = {
        'x': document.getElementById('dLFLx'),
        'y': document.getElementById('dLFLy'),
        'z': document.getElementById('dLFLz')
    }
    const dogLegFrontRightRotation = {
        'x': document.getElementById('dLFRx'),
        'y': document.getElementById('dLFRy'),
        'z': document.getElementById('dLFRz')
    }
    const dogLegBackLeftRotation = {
        'x': document.getElementById('dLBLx'),
        'y': document.getElementById('dLBLy'),
        'z': document.getElementById('dLBLz')
    }
    const dogLegBackRightRotation = {
        'x': document.getElementById('dLBRx'),
        'y': document.getElementById('dLBRy'),
        'z': document.getElementById('dLBRz')
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
        'Bat' : document.getElementById('BatRot'),
        'dog' : document.getElementById('dogRot')
    }

    const resetButton = document.getElementById('reset');
    const orthoButton = document.getElementById('ortho');
    const obliqueButton = document.getElementById('oblique');
    const perspectiveButton = document.getElementById('perspective');
    const shadeButoon = document.getElementById('shade');

    const giraffeButton = document.getElementById('giraffeAnimate');
    const BatButton = document.getElementById('BatAnimate')
    const dogButton = document.getElementById('dogAnimate')

    rotationCamera['x'].oninput = function() {
        master.cameraRotation[0] = parseInt(rotationCamera['x'].value);
        updateWorld(master);
        render(master);
    };

    rotationCamera['y'].oninput = function() {
        master.cameraRotation[1] = parseInt(rotationCamera['y'].value);
        updateWorld(master);
        render(master);
    };

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

    giraffeTranslation['x'].oninput = function() {
        const val = parseInt(giraffeTranslation['x'].value)
        master.giraffe.bodyLocation[0] = val
        master.giraffe.translateModel()
        master.giraffe.updateTransform()
        render(master);
    }

    giraffeTranslation['y'].oninput = function() {
        const val = parseInt(giraffeTranslation['y'].value)
        master.giraffe.bodyLocation[1] = val
        master.giraffe.translateModel()
        master.giraffe.updateTransform()
        render(master);
    }

    giraffeTranslation['z'].oninput = function() {
        const val = parseInt(giraffeTranslation['z'].value)
        master.giraffe.bodyLocation[2] = val
        master.giraffe.translateModel()
        master.giraffe.updateTransform()
        render(master);
    }

    giraffeNeckRotation['x'].oninput = function() {
        const val = parseInt(giraffeNeckRotation['x'].value)
        master.giraffe.inRotation['neck']['x'] = val
        master.giraffe.rotateModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeNeckRotation['y'].oninput = function() {
        const val = parseInt(giraffeNeckRotation['y'].value)
        master.giraffe.inRotation['neck']['y'] = val
        master.giraffe.rotateModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeNeckRotation['z'].oninput = function() {
        const val = parseInt(giraffeNeckRotation['z'].value)
        master.giraffe.inRotation['neck']['z'] = val
        master.giraffe.rotateModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeHeadRotation['x'].oninput = function() {
        const val = parseInt(giraffeHeadRotation['x'].value)
        master.giraffe.inRotation['head']['x'] = val
        master.giraffe.rotateModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeHeadRotation['y'].oninput = function() {
        const val = parseInt(giraffeHeadRotation['y'].value)
        master.giraffe.inRotation['head']['y'] = val
        master.giraffe.rotateModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeHeadRotation['z'].oninput = function() {
        const val = parseInt(giraffeHeadRotation['z'].value)
        master.giraffe.inRotation['head']['z'] = val
        master.giraffe.rotateModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegFrontLeftRotation['x'].oninput = function() {
        const val = parseInt(giraffeLegFrontLeftRotation['x'].value)
        master.giraffe.inRotation['leg-front-left']['x'] = val
        master.giraffe.rotateModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegFrontLeftRotation['y'].oninput = function() {
        const val = parseInt(giraffeLegFrontLeftRotation['y'].value)
        master.giraffe.inRotation['leg-front-left']['y'] = val
        master.giraffe.rotateModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegFrontLeftRotation['z'].oninput = function() {
        const val = parseInt(giraffeLegFrontLeftRotation['z'].value)
        master.giraffe.inRotation['leg-front-left']['z'] = val
        master.giraffe.rotateModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegFrontRightRotation['x'].oninput = function() {
        const val = parseInt(giraffeLegFrontRightRotation['x'].value)
        master.giraffe.inRotation['leg-front-right']['x'] = val
        master.giraffe.rotateModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegFrontRightRotation['y'].oninput = function() {
        const val = parseInt(giraffeLegFrontRightRotation['y'].value)
        master.giraffe.inRotation['leg-front-right']['y'] = val
        master.giraffe.rotateModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegFrontRightRotation['z'].oninput = function() {
        const val = parseInt(giraffeLegFrontRightRotation['z'].value)
        master.giraffe.inRotation['leg-front-right']['z'] = val
        master.giraffe.rotateModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegBackLeftRotation['x'].oninput = function() {
        const val = parseInt(giraffeLegBackLeftRotation['x'].value)
        master.giraffe.inRotation['leg-back-left']['x'] = val
        master.giraffe.rotateModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegBackLeftRotation['y'].oninput = function() {
        const val = parseInt(giraffeLegBackLeftRotation['y'].value)
        master.giraffe.inRotation['leg-back-left']['y'] = val
        master.giraffe.rotateModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegBackLeftRotation['z'].oninput = function() {
        const val = parseInt(giraffeLegBackLeftRotation['z'].value)
        master.giraffe.inRotation['leg-back-left']['z'] = val
        master.giraffe.rotateModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegBackRightRotation['x'].oninput = function() {
        const val = parseInt(giraffeLegBackRightRotation['x'].value)
        master.giraffe.inRotation['leg-back-right']['x'] = val
        master.giraffe.rotateModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegBackRightRotation['y'].oninput = function() {
        const val = parseInt(giraffeLegBackRightRotation['y'].value)
        master.giraffe.inRotation['leg-back-right']['y'] = val
        master.giraffe.rotateModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegBackRightRotation['z'].oninput = function() {
        const val = parseInt(giraffeLegBackRightRotation['z'].value)
        master.giraffe.inRotation['leg-back-right']['z'] = val
        master.giraffe.rotateModel()
        master.giraffe.updateTransform()
        render(master)
    }

    BatTranslation['x'].oninput = function() {
        const val = parseInt(BatTranslation['x'].value)
        master.Bat.bodyLocation[0] = val
        master.Bat.translateModel()
        master.Bat.updateTransform()
        render(master);
    }
    
    BatTranslation['y'].oninput = function() {
        const val = parseInt(BatTranslation['y'].value)
        master.Bat.bodyLocation[1] = val
        master.Bat.translateModel()
        master.Bat.updateTransform()
        render(master);
    }
    
    BatTranslation['z'].oninput = function() {
        const val = parseInt(BatTranslation['z'].value)
        master.Bat.bodyLocation[2] = val
        master.Bat.translateModel()
        master.Bat.updateTransform()
        render(master);
    }
    
    BatWing2Rotation['x'].oninput = function() {
        const val = parseInt(BatWing2Rotation['x'].value)
        master.Bat.inRotation['Wing2']['x'] = val
        master.Bat.rotateModel()
        master.Bat.updateTransform()
        render(master)
    }
    
    BatWing2Rotation['y'].oninput = function() {
        const val = parseInt(BatWing2Rotation['y'].value)
        master.Bat.inRotation['Wing2']['y'] = val
        master.Bat.rotateModel()
        master.Bat.updateTransform()
        render(master)
    }
    
    BatWing2Rotation['z'].oninput = function() {
        const val = parseInt(BatWing2Rotation['z'].value)
        master.Bat.inRotation['Wing2']['z'] = val
        master.Bat.rotateModel()
        master.Bat.updateTransform()
        render(master)
    }
    
    BatWing1Rotation['x'].oninput = function() {
        const val = parseInt(BatWing1Rotation['x'].value)
        master.Bat.inRotation['Wing1']['x'] = val
        master.Bat.rotateModel()
        master.Bat.updateTransform()
        render(master)
    }
    
    BatWing1Rotation['y'].oninput = function() {
        const val = parseInt(BatWing1Rotation['y'].value)
        master.Bat.inRotation['Wing1']['y'] = val
        master.Bat.rotateModel()
        master.Bat.updateTransform()
        render(master)
    }
    
    BatWing1Rotation['z'].oninput = function() {
        const val = parseInt(BatWing1Rotation['z'].value)
        master.Bat.inRotation['Wing1']['z'] = val
        master.Bat.rotateModel()
        master.Bat.updateTransform()
        render(master)
    }
    
    BatLegFrontLeftRotation['x'].oninput = function() {
        const val = parseInt(BatLegFrontLeftRotation['x'].value)
        master.Bat.inRotation['leg-front-left']['x'] = val
        master.Bat.rotateModel()
        master.Bat.updateTransform()
        render(master)
    }
    
    BatLegFrontLeftRotation['y'].oninput = function() {
        const val = parseInt(BatLegFrontLeftRotation['y'].value)
        master.Bat.inRotation['leg-front-left']['y'] = val
        master.Bat.rotateModel()
        master.Bat.updateTransform()
        render(master)
    }
    
    BatLegFrontLeftRotation['z'].oninput = function() {
        const val = parseInt(BatLegFrontLeftRotation['z'].value)
        master.Bat.inRotation['leg-front-left']['z'] = val
        master.Bat.rotateModel()
        master.Bat.updateTransform()
        render(master)
    }
    
    BatLegFrontRightRotation['x'].oninput = function() {
        const val = parseInt(BatLegFrontRightRotation['x'].value)
        master.Bat.inRotation['leg-front-right']['x'] = val
        master.Bat.rotateModel()
        master.Bat.updateTransform()
        render(master)
    }
    
    BatLegFrontRightRotation['y'].oninput = function() {
        const val = parseInt(BatLegFrontRightRotation['y'].value)
        master.Bat.inRotation['leg-front-right']['y'] = val
        master.Bat.rotateModel()
        master.Bat.updateTransform()
        render(master)
    }
    
    BatLegFrontRightRotation['z'].oninput = function() {
        const val = parseInt(BatLegFrontRightRotation['z'].value)
        master.Bat.inRotation['leg-front-right']['z'] = val
        master.Bat.rotateModel()
        master.Bat.updateTransform()
        render(master)
    }
    
    BatEarLeftRotation['x'].oninput = function() {
        const val = parseInt(BatEarLeftRotation['x'].value)
        master.Bat.inRotation['ear-left']['x'] = val
        master.Bat.rotateModel()
        master.Bat.updateTransform()
        render(master)
    }
    
    BatEarLeftRotation['y'].oninput = function() {
        const val = parseInt(BatEarLeftRotation['y'].value)
        master.Bat.inRotation['ear-left']['y'] = val
        master.Bat.rotateModel()
        master.Bat.updateTransform()
        render(master)
    }
    
    BatEarLeftRotation['z'].oninput = function() {
        const val = parseInt(BatEarLeftRotation['z'].value)
        master.Bat.inRotation['ear-left']['z'] = val
        master.Bat.rotateModel()
        master.Bat.updateTransform()
        render(master)
    }
    
    BatEarRightRotation['x'].oninput = function() {
        const val = parseInt(BatEarRightRotation['x'].value)
        master.Bat.inRotation['ear-right']['x'] = val
        master.Bat.rotateModel()
        master.Bat.updateTransform()
        render(master)
    }
    
    BatEarRightRotation['y'].oninput = function() {
        const val = parseInt(BatEarRightRotation['y'].value)
        master.Bat.inRotation['ear-right']['y'] = val
        master.Bat.rotateModel()
        master.Bat.updateTransform()
        render(master)
    }
    
    BatEarRightRotation['z'].oninput = function() {
        const val = parseInt(BatEarRightRotation['z'].value)
        master.Bat.inRotation['ear-right']['z'] = val
        master.Bat.rotateModel()
        master.Bat.updateTransform()
        render(master)
    }

    
    dogTranslation['x'].oninput = function() {
        const val = parseInt(dogTranslation['x'].value)
        master.dog.bodyLocation[0] = val
        master.dog.translateModel()
        master.dog.updateTransform()
        render(master);
    }
    
    dogTranslation['y'].oninput = function() {
        const val = parseInt(dogTranslation['y'].value)
        master.dog.bodyLocation[1] = val
        master.dog.translateModel()
        master.dog.updateTransform()
        render(master);
    }
    
    dogTranslation['z'].oninput = function() {
        const val = parseInt(dogTranslation['z'].value)
        master.dog.bodyLocation[2] = val
        master.dog.translateModel()
        master.dog.updateTransform()
        render(master);
    }
    
    dogNeckRotation['x'].oninput = function() {
        const val = parseInt(dogNeckRotation['x'].value)
        master.dog.inRotation['neck']['x'] = val
        master.dog.rotateModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogNeckRotation['y'].oninput = function() {
        const val = parseInt(dogNeckRotation['y'].value)
        master.dog.inRotation['neck']['y'] = val
        master.dog.rotateModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogNeckRotation['z'].oninput = function() {
        const val = parseInt(dogNeckRotation['z'].value)
        master.dog.inRotation['neck']['z'] = val
        master.dog.rotateModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogHeadRotation['x'].oninput = function() {
        const val = parseInt(dogHeadRotation['x'].value)
        master.dog.inRotation['head']['x'] = val
        master.dog.rotateModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogHeadRotation['y'].oninput = function() {
        const val = parseInt(dogHeadRotation['y'].value)
        master.dog.inRotation['head']['y'] = val
        master.dog.rotateModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogHeadRotation['z'].oninput = function() {
        const val = parseInt(dogHeadRotation['z'].value)
        master.dog.inRotation['head']['z'] = val
        master.dog.rotateModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegFrontLeftRotation['x'].oninput = function() {
        const val = parseInt(dogLegFrontLeftRotation['x'].value)
        master.dog.inRotation['leg-front-left']['x'] = val
        master.dog.rotateModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegFrontLeftRotation['y'].oninput = function() {
        const val = parseInt(dogLegFrontLeftRotation['y'].value)
        master.dog.inRotation['leg-front-left']['y'] = val
        master.dog.rotateModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegFrontLeftRotation['z'].oninput = function() {
        const val = parseInt(dogLegFrontLeftRotation['z'].value)
        master.dog.inRotation['leg-front-left']['z'] = val
        master.dog.rotateModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegFrontRightRotation['x'].oninput = function() {
        const val = parseInt(dogLegFrontRightRotation['x'].value)
        master.dog.inRotation['leg-front-right']['x'] = val
        master.dog.rotateModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegFrontRightRotation['y'].oninput = function() {
        const val = parseInt(dogLegFrontRightRotation['y'].value)
        master.dog.inRotation['leg-front-right']['y'] = val
        master.dog.rotateModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegFrontRightRotation['z'].oninput = function() {
        const val = parseInt(dogLegFrontRightRotation['z'].value)
        master.dog.inRotation['leg-front-right']['z'] = val
        master.dog.rotateModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegBackLeftRotation['x'].oninput = function() {
        const val = parseInt(dogLegBackLeftRotation['x'].value)
        master.dog.inRotation['leg-back-left']['x'] = val
        master.dog.rotateModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegBackLeftRotation['y'].oninput = function() {
        const val = parseInt(dogLegBackLeftRotation['y'].value)
        master.dog.inRotation['leg-back-left']['y'] = val
        master.dog.rotateModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegBackLeftRotation['z'].oninput = function() {
        const val = parseInt(dogLegBackLeftRotation['z'].value)
        master.dog.inRotation['leg-back-left']['z'] = val
        master.dog.rotateModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegBackRightRotation['x'].oninput = function() {
        const val = parseInt(dogLegBackRightRotation['x'].value)
        master.dog.inRotation['leg-back-right']['x'] = val
        master.dog.rotateModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegBackRightRotation['y'].oninput = function() {
        const val = parseInt(dogLegBackRightRotation['y'].value)
        master.dog.inRotation['leg-back-right']['y'] = val
        master.dog.rotateModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegBackRightRotation['z'].oninput = function() {
        const val = parseInt(dogLegBackRightRotation['z'].value)
        master.dog.inRotation['leg-back-right']['z'] = val
        master.dog.rotateModel()
        master.dog.updateTransform()
        render(master)
    }


    animation['giraffe'].oninput = function() {
        const val = parseInt(animation['giraffe'].value);
        master.giraffe.distributeRotation(val)
        master.giraffe.updateAnimation();
        master.giraffe.updateTransform();
        render(master);
    };

    animation['Bat'].oninput = function() {
        const val = parseInt(animation['Bat'].value);
        master.Bat.distributeRotation(val)
        master.Bat.updateAnimation();
        master.Bat.updateTransform();
        render(master);
    };

    animation['dog'].oninput = function() {
        const val = parseInt(animation['dog'].value);
        master.dog.distributeRotation(val)
        master.dog.updateAnimation();
        master.dog.updateTransform();
        render(master);
    }

    
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

            
            master.giraffe.distributeRotation(now)
            master.giraffe.updateAnimation();
            master.giraffe.updateTransform();
            animation['giraffe'].value = now;
            
            if (master.isStartGiraffeAnimation) requestAnimationFrame(animate);
        }

        master.isStartGiraffeAnimation = !master.isStartGiraffeAnimation;
        if (master.isStartGiraffeAnimation) requestAnimationFrame(animate);
    });

    BatButton.addEventListener("click", function() {
        var now = parseInt(animation['Bat'].value);
        var markUp = true;
        var markDown = false;
        function animate() {
            master.renderer['Bat'].render();
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

            master.Bat.distributeRotation(now)
            master.Bat.updateAnimation();
            master.Bat.updateTransform();
            animation['Bat'].value = now;
            
            if (master.isStartBatAnimation) requestAnimationFrame(animate);
        }

        master.isStartBatAnimation = !master.isStartBatAnimation;
        if (master.isStartBatAnimation) requestAnimationFrame(animate);
    });

    dogButton.addEventListener("click", function() {
        var now = parseInt(animation['dog'].value);
        var markUp = true;
        var markDown = false;
        function animate() {
            master.renderer['dog'].render();
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

            master.dog.distributeRotation(now)
            master.dog.updateAnimation();
            master.dog.updateTransform();
            animation['dog'].value = now;
            
            if (master.isStartDogAnimation) requestAnimationFrame(animate);
        }

        master.isStartDogAnimation = !master.isStartDogAnimation;
        if (master.isStartDogAnimation) requestAnimationFrame(animate);
    });

}
