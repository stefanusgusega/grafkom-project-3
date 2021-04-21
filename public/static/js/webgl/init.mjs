import {initShaders} from './utils/initShaders.mjs';
import {transpose, inverse, translationTranspos, matIdentity, matLookAt, matPerspective, matOblique, matOrtho, matmul, degToRad, arrToMat, flatten2D, rotateMat} from './utils/util.mjs';
import {render} from './render.mjs';
import {GiraffesRenderer} from './renderer/giraffe.mjs'
import {DogRenderer} from './renderer/dog.mjs'
import {BatRenderer} from './renderer/bat.mjs'
import { Dog } from './model/integrated/dog/dog.mjs';
import { Bat } from './model/integrated/Bat/Bat.mjs';
import { Giraffe } from './model/integrated/giraffe/giraffe.mjs';

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
    master.vTangent = master.gl.getAttribLocation(master.gl.program, 'vertTangent');
    master.vBitangent = master.gl.getAttribLocation(master.gl.program, 'vertBitangent');

    master.matWorldUniformLocation = master.gl.getUniformLocation(master.gl.program, 'mWorld');
	master.matViewUniformLocation = master.gl.getUniformLocation(master.gl.program, 'mView');
    master.matProjUniformLocation = master.gl.getUniformLocation(master.gl.program, 'mProj');
    master.matNormLocation = master.gl.getUniformLocation(master.gl.program, 'mNorm');
    master.mappingMode = master.gl.getUniformLocation(master.gl.program, 'mode');
    master.shadeMode = master.gl.getUniformLocation(master.gl.program, 'stateShade');
    master.textureMode = master.gl.getUniformLocation(master.gl.program, 'stateTexture');
    master.matNormalBumpLocation = master.gl.getUniformLocation(master.gl.program, 'normalMatrix');
    master.matUSamplerLocation = master.gl.getUniformLocation(master.gl.program, 'uSampler');
    master.matUSamplerCubeLocation = master.gl.getUniformLocation(master.gl.program, 'uSamplerCube');
    
    master.worldMatrix = matIdentity();
    var viewMatrix = matLookAt(master.eye, master.center, master.up);
    var projMatrix = matPerspective(degToRad(45), 640/640, 0.1, 1000.0);
    var normMatrix = transpose(inverse(flatten2D(matmul(arrToMat(viewMatrix), arrToMat(master.worldMatrix)))));
    var normBumpMatrix = new Float32Array([
        viewMatrix[0], viewMatrix[1], viewMatrix[2],
        viewMatrix[3], viewMatrix[4], viewMatrix[5],
        viewMatrix[6], viewMatrix[7], viewMatrix[8]
    ])

    const value_shadeButton = document.getElementById('shade').value;
    const value_textureButton = document.getElementById('texture').value;
    if (value_shadeButton == "On") {
        master.gl.uniform1i(master.shadeMode, 1);  
    } else {
        master.gl.uniform1i(master.shadeMode, 0);  
    }

    if (value_textureButton == 'On') {
        master.gl.uniform1i(master.shadeMode, 1);
    } else {
        master.gl.uniform1i(master.shadeMode, 0);
    }

    master.gl.uniformMatrix4fv(master.matWorldUniformLocation, false, master.worldMatrix);
	master.gl.uniformMatrix4fv(master.matViewUniformLocation, false, viewMatrix);
    master.gl.uniformMatrix4fv(master.matProjUniformLocation, false, projMatrix);
    master.gl.uniformMatrix4fv(master.matNormLocation, false, normMatrix);
    master.gl.uniform1i(master.matUSamplerLocation, 1);
    master.gl.uniform1i(master.matUSamplerCubeLocation, 0);
    // bump mapping
    master.gl.uniformMatrix3fv(master.matNormalBumpLocation, false, normBumpMatrix);

    master.giraffe = new Giraffe();
    master.dog = new Dog();
    master.bat = new Bat(master.gl);
    
    master.renderer['giraffe'] = new GiraffesRenderer(master);
    master.renderer['dog'] = new DogRenderer(master);
    master.renderer['bat'] = new BatRenderer(master);
    
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
        'z': document.getElementById('cameraRotateZ')
    }
    const giraffeTranslation = {
        'x': document.getElementById('gTx'),
        'y': document.getElementById('gTy'),
        'z': document.getElementById('gTz')
    }
    const giraffeBodyRotation = {
        'x': document.getElementById('gBx'),
        'y': document.getElementById('gBy'),
        'z': document.getElementById('gBz')
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
    const giraffeFeetFrontLeftRotation = {
        'x': document.getElementById('gFFLx'),
        'y': document.getElementById('gFFLy'),
        'z': document.getElementById('gFFLz')
    }
    const giraffeFeetFrontRightRotation = {
        'x': document.getElementById('gFFRx'),
        'y': document.getElementById('gFFRy'),
        'z': document.getElementById('gFFRz')
    }
    const giraffeFeetBackLeftRotation = {
        'x': document.getElementById('gFBLx'),
        'y': document.getElementById('gFBLy'),
        'z': document.getElementById('gFBLz')
    }
    const giraffeFeetBackRightRotation = {
        'x': document.getElementById('gFBRx'),
        'y': document.getElementById('gFBRy'),
        'z': document.getElementById('gFBRz')
    }
    const dogTranslation = {
        'x': document.getElementById('dTx'),
        'y': document.getElementById('dTy'),
        'z': document.getElementById('dTz')
    }
    const dogBodyRotation = {
        'x': document.getElementById('dBx'),
        'y': document.getElementById('dBy'),
        'z': document.getElementById('dBz')
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
    const dogEarRightRotation = {
        'x': document.getElementById('dREx'),
        'y': document.getElementById('dREy'),
        'z': document.getElementById('dREz')
    }
    const dogEarLeftRotation = {
        'x': document.getElementById('dLEx'),
        'y': document.getElementById('dLEy'),
        'z': document.getElementById('dLEz')
    }
    const dogTailRotation = {
        'x' : document.getElementById('dTailx'),
        'y' : document.getElementById('dTaily'),
        'z' : document.getElementById('dTailz')
    }
    const batTranslation = {
        'x': document.getElementById('bTx'),
        'y': document.getElementById('bTy'),
        'z': document.getElementById('bTz')
    }
    const batBodyRotation = {
        'x': document.getElementById('bBx'),
        'y': document.getElementById('bBy'),
        'z': document.getElementById('bBz')
    }
    const batWing1Rotation = {
        'x': document.getElementById('bW1x'),
        'y': document.getElementById('bW1y'),
        'z': document.getElementById('bW1z')
    }
    const batWing2Rotation = {
        'x': document.getElementById('bW2x'),
        'y': document.getElementById('bW2y'),
        'z': document.getElementById('bW2z')
    }
    const batLegFrontLeftRotation = {
        'x': document.getElementById('bLFLx'),
        'y': document.getElementById('bLFLy'),
        'z': document.getElementById('bLFLz')
    }
    const batLegFrontRightRotation = {
        'x': document.getElementById('bLFRx'),
        'y': document.getElementById('bLFRy'),
        'z': document.getElementById('bLFRz')
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
        'dog': document.getElementById('dogRot'),
        'bat': document.getElementById('batRot')
    }

    const resetButton = document.getElementById('reset');
    const orthoButton = document.getElementById('ortho');
    const obliqueButton = document.getElementById('oblique');
    const perspectiveButton = document.getElementById('perspective');
    const shadeButton = document.getElementById('shade');
    const textureButton = document.getElementById('texture')

    const giraffeButton = document.getElementById('giraffeAnimate');
    const dogButton = document.getElementById('dogAnimate')
    const batButton = document.getElementById('batAnimate')

    const saveButton = document.getElementById('save');
    const loadButton = document.getElementById('load');
    const uploadButton = document.getElementById('upload-btn');

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

    rotationCamera['z'].oninput = function() {
        master.cameraRotation[2] = parseInt(rotationCamera['z'].value);
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
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master);
    }

    giraffeTranslation['y'].oninput = function() {
        const val = parseInt(giraffeTranslation['y'].value)
        master.giraffe.bodyLocation[1] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master);
    }

    giraffeTranslation['z'].oninput = function() {
        const val = parseInt(giraffeTranslation['z'].value)
        master.giraffe.bodyLocation[2] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master);
    }

    giraffeBodyRotation['x'].oninput = function() {
        const val = parseInt(giraffeBodyRotation['x'].value)
        master.giraffe.inRotation['body']['x'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeBodyRotation['y'].oninput = function() {
        const val = parseInt(giraffeBodyRotation['y'].value)
        master.giraffe.inRotation['body']['y'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeBodyRotation['z'].oninput = function() {
        const val = parseInt(giraffeBodyRotation['z'].value)
        master.giraffe.inRotation['body']['z'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeNeckRotation['x'].oninput = function() {
        const val = parseInt(giraffeNeckRotation['x'].value)
        master.giraffe.inRotation['neck']['x'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeNeckRotation['y'].oninput = function() {
        const val = parseInt(giraffeNeckRotation['y'].value)
        master.giraffe.inRotation['neck']['y'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeNeckRotation['z'].oninput = function() {
        const val = parseInt(giraffeNeckRotation['z'].value)
        master.giraffe.inRotation['neck']['z'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeHeadRotation['x'].oninput = function() {
        const val = parseInt(giraffeHeadRotation['x'].value)
        master.giraffe.inRotation['head']['x'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeHeadRotation['y'].oninput = function() {
        const val = parseInt(giraffeHeadRotation['y'].value)
        master.giraffe.inRotation['head']['y'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeHeadRotation['z'].oninput = function() {
        const val = parseInt(giraffeHeadRotation['z'].value)
        master.giraffe.inRotation['head']['z'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegFrontLeftRotation['x'].oninput = function() {
        const val = parseInt(giraffeLegFrontLeftRotation['x'].value)
        master.giraffe.inRotation['leg-front-left']['x'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegFrontLeftRotation['y'].oninput = function() {
        const val = parseInt(giraffeLegFrontLeftRotation['y'].value)
        master.giraffe.inRotation['leg-front-left']['y'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegFrontLeftRotation['z'].oninput = function() {
        const val = parseInt(giraffeLegFrontLeftRotation['z'].value)
        master.giraffe.inRotation['leg-front-left']['z'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegFrontRightRotation['x'].oninput = function() {
        const val = parseInt(giraffeLegFrontRightRotation['x'].value)
        master.giraffe.inRotation['leg-front-right']['x'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegFrontRightRotation['y'].oninput = function() {
        const val = parseInt(giraffeLegFrontRightRotation['y'].value)
        master.giraffe.inRotation['leg-front-right']['y'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegFrontRightRotation['z'].oninput = function() {
        const val = parseInt(giraffeLegFrontRightRotation['z'].value)
        master.giraffe.inRotation['leg-front-right']['z'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegBackLeftRotation['x'].oninput = function() {
        const val = parseInt(giraffeLegBackLeftRotation['x'].value)
        master.giraffe.inRotation['leg-back-left']['x'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegBackLeftRotation['y'].oninput = function() {
        const val = parseInt(giraffeLegBackLeftRotation['y'].value)
        master.giraffe.inRotation['leg-back-left']['y'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegBackLeftRotation['z'].oninput = function() {
        const val = parseInt(giraffeLegBackLeftRotation['z'].value)
        master.giraffe.inRotation['leg-back-left']['z'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegBackRightRotation['x'].oninput = function() {
        const val = parseInt(giraffeLegBackRightRotation['x'].value)
        master.giraffe.inRotation['leg-back-right']['x'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeLegBackRightRotation['y'].oninput = function() {
        const val = parseInt(giraffeLegBackRightRotation['y'].value)
        master.giraffe.inRotation['leg-back-right']['y'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeFeetFrontLeftRotation['x'].oninput = function() {
        const val = parseInt(giraffeFeetFrontLeftRotation['x'].value)
        master.giraffe.inRotation['feet-front-left']['x'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeFeetFrontLeftRotation['y'].oninput = function() {
        const val = parseInt(giraffeFeetFrontLeftRotation['y'].value)
        master.giraffe.inRotation['feet-front-left']['y'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeFeetFrontLeftRotation['z'].oninput = function() {
        const val = parseInt(giraffeFeetFrontLeftRotation['z'].value)
        master.giraffe.inRotation['feet-front-left']['z'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeFeetFrontRightRotation['x'].oninput = function() {
        const val = parseInt(giraffeFeetFrontRightRotation['x'].value)
        master.giraffe.inRotation['feet-front-right']['x'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeFeetFrontRightRotation['y'].oninput = function() {
        const val = parseInt(giraffeFeetFrontRightRotation['y'].value)
        master.giraffe.inRotation['feet-front-right']['y'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeFeetFrontRightRotation['z'].oninput = function() {
        const val = parseInt(giraffeFeetFrontRightRotation['z'].value)
        master.giraffe.inRotation['feet-front-right']['z'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeFeetBackLeftRotation['x'].oninput = function() {
        const val = parseInt(giraffeFeetBackLeftRotation['x'].value)
        master.giraffe.inRotation['feet-back-left']['x'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeFeetBackLeftRotation['y'].oninput = function() {
        const val = parseInt(giraffeFeetBackLeftRotation['y'].value)
        master.giraffe.inRotation['feet-back-left']['y'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeFeetBackLeftRotation['z'].oninput = function() {
        const val = parseInt(giraffeFeetBackLeftRotation['z'].value)
        master.giraffe.inRotation['feet-back-left']['z'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeFeetBackRightRotation['x'].oninput = function() {
        const val = parseInt(giraffeFeetBackRightRotation['x'].value)
        master.giraffe.inRotation['feet-back-right']['x'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeFeetBackRightRotation['y'].oninput = function() {
        const val = parseInt(giraffeFeetBackRightRotation['y'].value)
        master.giraffe.inRotation['feet-back-right']['y'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    giraffeFeetBackRightRotation['z'].oninput = function() {
        const val = parseInt(giraffeFeetBackRightRotation['z'].value)
        master.giraffe.inRotation['feet-back-right']['z'] = val
        master.giraffe.transformModel()
        master.giraffe.updateTransform()
        render(master)
    }

    dogTranslation['x'].oninput = function() {
        const val = parseInt(dogTranslation['x'].value)
        master.dog.bodyLocation[0] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master);
    }
    
    dogTranslation['y'].oninput = function() {
        const val = parseInt(dogTranslation['y'].value)
        master.dog.bodyLocation[1] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master);
    }
    
    dogTranslation['z'].oninput = function() {
        const val = parseInt(dogTranslation['z'].value)
        master.dog.bodyLocation[2] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master);
    }

    dogBodyRotation['x'].oninput = function() {
        const val = parseInt(dogBodyRotation['x'].value)
        master.dog.inRotation['body']['x'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }

    dogBodyRotation['y'].oninput = function() {
        const val = parseInt(dogBodyRotation['y'].value)
        master.dog.inRotation['body']['y'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }

    dogBodyRotation['z'].oninput = function() {
        const val = parseInt(dogBodyRotation['z'].value)
        master.dog.inRotation['body']['z'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }

    
    dogNeckRotation['x'].oninput = function() {
        const val = parseInt(dogNeckRotation['x'].value)
        master.dog.inRotation['neck']['x'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogNeckRotation['y'].oninput = function() {
        const val = parseInt(dogNeckRotation['y'].value)
        master.dog.inRotation['neck']['y'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogNeckRotation['z'].oninput = function() {
        const val = parseInt(dogNeckRotation['z'].value)
        master.dog.inRotation['neck']['z'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogHeadRotation['x'].oninput = function() {
        const val = parseInt(dogHeadRotation['x'].value)
        master.dog.inRotation['head']['x'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogHeadRotation['y'].oninput = function() {
        const val = parseInt(dogHeadRotation['y'].value)
        master.dog.inRotation['head']['y'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogHeadRotation['z'].oninput = function() {
        const val = parseInt(dogHeadRotation['z'].value)
        master.dog.inRotation['head']['z'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegFrontLeftRotation['x'].oninput = function() {
        const val = parseInt(dogLegFrontLeftRotation['x'].value)
        master.dog.inRotation['leg-front-left']['x'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegFrontLeftRotation['y'].oninput = function() {
        const val = parseInt(dogLegFrontLeftRotation['y'].value)
        master.dog.inRotation['leg-front-left']['y'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegFrontLeftRotation['z'].oninput = function() {
        const val = parseInt(dogLegFrontLeftRotation['z'].value)
        master.dog.inRotation['leg-front-left']['z'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegFrontRightRotation['x'].oninput = function() {
        const val = parseInt(dogLegFrontRightRotation['x'].value)
        master.dog.inRotation['leg-front-right']['x'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegFrontRightRotation['y'].oninput = function() {
        const val = parseInt(dogLegFrontRightRotation['y'].value)
        master.dog.inRotation['leg-front-right']['y'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegFrontRightRotation['z'].oninput = function() {
        const val = parseInt(dogLegFrontRightRotation['z'].value)
        master.dog.inRotation['leg-front-right']['z'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegBackLeftRotation['x'].oninput = function() {
        const val = parseInt(dogLegBackLeftRotation['x'].value)
        master.dog.inRotation['leg-back-left']['x'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegBackLeftRotation['y'].oninput = function() {
        const val = parseInt(dogLegBackLeftRotation['y'].value)
        master.dog.inRotation['leg-back-left']['y'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegBackLeftRotation['z'].oninput = function() {
        const val = parseInt(dogLegBackLeftRotation['z'].value)
        master.dog.inRotation['leg-back-left']['z'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegBackRightRotation['x'].oninput = function() {
        const val = parseInt(dogLegBackRightRotation['x'].value)
        master.dog.inRotation['leg-back-right']['x'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegBackRightRotation['y'].oninput = function() {
        const val = parseInt(dogLegBackRightRotation['y'].value)
        master.dog.inRotation['leg-back-right']['y'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogLegBackRightRotation['z'].oninput = function() {
        const val = parseInt(dogLegBackRightRotation['z'].value)
        master.dog.inRotation['leg-back-right']['z'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }

    dogEarLeftRotation['x'].oninput = function() {
        const val = parseInt(dogEarLeftRotation['x'].value)
        master.dog.inRotation['ear-left']['x'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }

    dogEarLeftRotation['y'].oninput = function() {
        const val = parseInt(dogEarLeftRotation['y'].value)
        master.dog.inRotation['ear-left']['y'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }

    dogEarLeftRotation['z'].oninput = function() {
        const val = parseInt(dogEarLeftRotation['z'].value)
        master.dog.inRotation['ear-left']['z'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }

    dogEarRightRotation['x'].oninput = function() {
        const val = parseInt(dogEarRightRotation['x'].value)
        master.dog.inRotation['ear-right']['x'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogEarRightRotation['y'].oninput = function() {
        const val = parseInt(dogEarRightRotation['y'].value)
        master.dog.inRotation['ear-right']['y'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }

    dogEarRightRotation['z'].oninput = function() {
        const val = parseInt(dogEarRightRotation['z'].value)
        master.dog.inRotation['ear-right']['z'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }
    
    dogTailRotation['x'].oninput = function() {
        const val = parseInt(dogTailRotation['x'].value)
        master.dog.inRotation['tail']['x'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }

    dogTailRotation['y'].oninput = function() {
        const val = parseInt(dogTailRotation['y'].value)
        master.dog.inRotation['tail']['y'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }

    dogTailRotation['z'].oninput = function() {
        const val = parseInt(dogTailRotation['z'].value)
        master.dog.inRotation['tail']['z'] = val
        master.dog.transformModel()
        master.dog.updateTransform()
        render(master)
    }

    batTranslation['x'].oninput = function() {
        const val = parseInt(batTranslation['x'].value)
        master.bat.bodyLocation[0] = val
        master.bat.transformModel()
        master.bat.updateTransform()
        render(master);
    }

    batTranslation['y'].oninput = function() {
        const val = parseInt(batTranslation['y'].value)
        master.bat.bodyLocation[1] = val
        master.bat.transformModel()
        master.bat.updateTransform()
        render(master);
    }

    batTranslation['z'].oninput = function() {
        const val = parseInt(batTranslation['z'].value)
        master.bat.bodyLocation[2] = val
        master.bat.transformModel()
        master.bat.updateTransform()
        render(master);
    }

    batBodyRotation['x'].oninput = function() {
        const val = parseInt(batBodyRotation['x'].value)
        master.bat.inRotation['body']['x'] = val
        master.bat.transformModel()
        master.bat.updateTransform()
        render(master)
    }

    batBodyRotation['y'].oninput = function() {
        const val = parseInt(batBodyRotation['y'].value)
        master.bat.inRotation['body']['y'] = val
        master.bat.transformModel()
        master.bat.updateTransform()
        render(master)
    }

    batBodyRotation['z'].oninput = function() {
        const val = parseInt(batBodyRotation['z'].value)
        master.bat.inRotation['body']['y'] = val
        master.bat.transformModel()
        master.bat.updateTransform()
        render(master)
    }

    batWing1Rotation['x'].oninput = function() {
        const val = parseInt(batWing1Rotation['x'].value)
        master.bat.inRotation['wing1']['x'] = val
        master.bat.transformModel()
        master.bat.updateTransform()
        render(master)
    }

    batWing1Rotation['y'].oninput = function() {
        const val = parseInt(batWing1Rotation['y'].value)
        master.bat.inRotation['wing1']['y'] = val
        master.bat.transformModel()
        master.bat.updateTransform()
        render(master)
    }

    batWing1Rotation['z'].oninput = function() {
        const val = parseInt(batWing1Rotation['z'].value)
        master.bat.inRotation['wing1']['z'] = val
        master.bat.transformModel()
        master.bat.updateTransform()
        render(master)
    }

    batWing2Rotation['x'].oninput = function() {
        const val = parseInt(batWing2Rotation['x'].value)
        master.bat.inRotation['wing2']['x'] = val
        master.bat.transformModel()
        master.bat.updateTransform()
        render(master)
    }

    batWing2Rotation['y'].oninput = function() {
        const val = parseInt(batWing2Rotation['y'].value)
        master.bat.inRotation['wing2']['y'] = val
        master.bat.transformModel()
        master.bat.updateTransform()
        render(master)
    }

    batWing2Rotation['z'].oninput = function() {
        const val = parseInt(batWing2Rotation['z'].value)
        master.bat.inRotation['wing2']['z'] = val
        master.bat.transformModel()
        master.bat.updateTransform()
        render(master)
    }

    batLegFrontLeftRotation['x'].oninput = function() {
        const val = parseInt(batLegFrontLeftRotation['x'].value)
        master.bat.inRotation['leg-front-left']['x'] = val
        master.bat.transformModel()
        master.bat.updateTransform()
        render(master)
    }

    batLegFrontLeftRotation['y'].oninput = function() {
        const val = parseInt(batLegFrontLeftRotation['y'].value)
        master.bat.inRotation['leg-front-left']['y'] = val
        master.bat.transformModel()
        master.bat.updateTransform()
        render(master)
    }

    batLegFrontLeftRotation['z'].oninput = function() {
        const val = parseInt(batLegFrontLeftRotation['z'].value)
        master.bat.inRotation['leg-front-left']['z'] = val
        master.bat.transformModel()
        master.bat.updateTransform()
        render(master)
    }

    batLegFrontRightRotation['x'].oninput = function() {
        const val = parseInt(batLegFrontRightRotation['x'].value)
        master.bat.inRotation['leg-front-right']['x'] = val
        master.bat.transformModel()
        master.bat.updateTransform()
        render(master)
    }

    batLegFrontRightRotation['y'].oninput = function() {
        const val = parseInt(batLegFrontRightRotation['y'].value)
        master.bat.inRotation['leg-front-right']['y'] = val
        master.bat.transformModel()
        master.bat.updateTransform()
        render(master)
    }

    batLegFrontRightRotation['z'].oninput = function() {
        const val = parseInt(batLegFrontRightRotation['z'].value)
        master.bat.inRotation['leg-front-right']['z'] = val
        master.bat.transformModel()
        master.bat.updateTransform()
        render(master)
    }

    animation['giraffe'].oninput = function() {
        const val = parseInt(animation['giraffe'].value);
        master.giraffe.distributeRotation(val)
        master.giraffe.updateAnimation();
        master.giraffe.updateTransform();
        render(master);
    };

    animation['dog'].oninput = function() {
        const val = parseInt(animation['dog'].value);
        master.dog.distributeRotation(val)
        master.dog.updateAnimation();
        master.dog.updateTransform();
        render(master);
    }

    animation['bat'].oninput = function() {
        const val = parseInt(animation['bat'].value);
        master.bat.distributeRotation(val)
        master.bat.updateAnimation();
        master.bat.updateTransform();
        render(master);
    }
    
    shadeButton.addEventListener("click", function(){
        const val = document.getElementById('shade').value;
        if(val == "On"){
            document.getElementById("shade").value="Off";
            master.gl.uniform1i(master.gl.getUniformLocation(master.gl.program,"stateShade"), 0);  
        } else {
            document.getElementById("shade").value="On";
            master.gl.uniform1i(master.gl.getUniformLocation(master.gl.program,"stateShade"), 1);  
        }
        render(master)
    });

    textureButton.addEventListener("click", function(){
        const val = document.getElementById('shade').value;
        if(val == "On"){
            document.getElementById("shade").value="Off";
            master.gl.uniform1i(master.gl.getUniformLocation(master.gl.program,"textureOn"), 0);  
        } else {
            document.getElementById("shade").value="On";
            master.gl.uniform1i(master.gl.getUniformLocation(master.gl.program,"textureOn"), 1);  
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
            render(master)
            if (markUp) {
                now++;
                if (now == 40) {
                    markUp = false;
                    markDown = true;
                }
            }
            if (markDown) {
                now--;
                if (now == -40) {
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

    dogButton.addEventListener("click", function() {
        var now = parseInt(animation['dog'].value);
        var markUp = true;
        var markDown = false;
        function animate() {
            render(master)
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

    batButton.addEventListener("click", function() {
        var now = parseInt(animation['bat'].value);
        var markUp = true;
        var markDown = false;
        function animate() {
            render(master)
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

            master.bat.distributeRotation(now)
            master.bat.updateAnimation();
            master.bat.updateTransform();
            animation['bat'].value = now;
            
            if (master.isStartBatAnimation) requestAnimationFrame(animate);
        }

        master.isStartBatAnimation = !master.isStartBatAnimation;
        if (master.isStartBatAnimation) requestAnimationFrame(animate);
    });

    uploadButton.addEventListener('change', function(event) {
        const reader = new FileReader();
        const file = event.target.files[0];
  
        reader.addEventListener('load', event => {
            try{
                var data = JSON.parse(event.target.result);
            } catch (err) {
                alert("invalid json file data!");
            }

            master.mode = data.mode;
            master.eye = data.eye;
            master.center = data.center;
            master.up = data.up;
            master.movement = data.movement;
            master.cameraRotation = data.cameraRotation;

            master.giraffe.load(data.giraffe)
            master.renderer['giraffe'].load(master);

            master.dog.load(data.dog)
            master.renderer['dog'].load(master);

            master.bat.load(data.bat)
            master.renderer['bat'].load(master);

            // master.dog = data.dog;
            // master.bat = data.bat;


            updateWorld(master);
            updateProj(master);
            updateView(master);
            console.log('Success');
            render(master)

        });
        reader.readAsText(file);
    });

    loadButton.addEventListener('click', function() {
        if (window.FileList && window.File && window.FileReader) {
            uploadButton.click();
        } else {
            alert("file upload not supported by your browser!");
        }
    })

    saveButton.addEventListener("click", function() {
        const save = {
            mode: master.mode,
            eye: master.eye,
            center: master.center,
            up: master.up,
            movement: master.movement,
            cameraRotation: master.cameraRotation,
            giraffe: master.giraffe,
            dog: master.dog,
            bat: master.bat
        }
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(save));
        var downloadWidget = document.getElementById('download-link');
        downloadWidget.setAttribute("href",     dataStr     );
        downloadWidget.setAttribute("download", "data.json");
        downloadWidget.click();
    })
}
