import {defCube, color, changeColor, indicesCube, cubeTextureCoordinates, getNormalCube, getTangentCube, getBitangentCube} from './../../base/cube.mjs';
import {rotateMat, translateMat, scaleMat, matmul, matIdentityMat, transformBlock, changeBlockColor, scaleBlock, flatten2D, translateBlock, rotateBlock, vertToMatrix, matIdentity} from './../../../utils/util.mjs';
import {Node} from './../../node.mjs';
import {texture} from './textures.mjs';

export class Dog {
    constructor() {
        this.center = [0,0,0];
        this.buildSkeleton();
    }

    buildSkeleton() {
        const xCenter = 0;
        const yCenter = 0;
        const zCenter = 0;
        const scale = 2;
        const cubeSize = 2;
        const bodySize = [1/scale, 1/scale, 3/scale];
        const neckSize = [1/scale, 0.4/scale, 0.1/scale];
        const headSize = [1/scale, 1/scale, 1/scale];
        const earSize = [0.1/scale, 0.2/scale, 0.1/scale];
        const tailSize = [0.1/scale, 0.2/scale, 1.5/scale];
        const legSize = [0.2/scale, 0.8/scale, 0.2/scale];

        const kScaleBody = [bodySize[0]/cubeSize, bodySize[1]/cubeSize, bodySize[2]/cubeSize]
        const kScaleNeck = [neckSize[0]/cubeSize, neckSize[1]/cubeSize, neckSize[2]/cubeSize]
        const kScaleHead = [headSize[0]/cubeSize, headSize[1]/cubeSize, headSize[2]/cubeSize]
        const kScaleEar = [earSize[0]/cubeSize, earSize[1]/cubeSize, earSize[2]/cubeSize]
        const kScaleTail = [tailSize[0]/cubeSize, tailSize[1]/cubeSize, tailSize[2]/cubeSize]
        const kScaleLeg = [legSize[0]/cubeSize, legSize[1]/cubeSize, legSize[2]/cubeSize];

        const translateBody = [xCenter, 0, 0];
        const translateNeck = [xCenter, bodySize[1]/2 + neckSize[1]/2, -(bodySize[2]/2 - neckSize[2]/2)];
        const translateHead = [xCenter, translateNeck[1] + neckSize[1]/2 + headSize[1]/2, translateNeck[2] - neckSize[2]/2 - headSize[2]/2];
        const translateFrontLeg = {
            'left': [xCenter+bodySize[0]/2 - legSize[0]/2, -(bodySize[1]/2 + legSize[1]/2), -(bodySize[2]/2 - legSize[2]/2)],
            'right': [xCenter-(bodySize[0]/2 - legSize[0]/2), -(bodySize[1]/2 + legSize[1]/2), -(bodySize[2]/2 - legSize[2]/2)],
        }
        const translateBackLeg = {
            'left': [xCenter+bodySize[0]/2 - legSize[0]/2, -(bodySize[1]/2 + legSize[1]/2), bodySize[2]/2 - legSize[2]/2],
            'right': [xCenter-(bodySize[0]/2 - legSize[0]/2), -(bodySize[1]/2 + legSize[1]/2), bodySize[2]/2 - legSize[2]/2],
        }
        const translateTail = [xCenter, yCenter+0.2, bodySize[2]/2+tailSize[2]/2];
        const translateEar = {
            'left': [xCenter+bodySize[0]/2-earSize[0]/2, translateHead[1]+headSize[1]/2+earSize[1]/2, translateHead[2]+headSize[2]/2-earSize[2]/2], // perlu dicek lagi
            'right': [xCenter-(bodySize[0]/2-earSize[0]/2), translateHead[1]+headSize[1]/2+earSize[1]/2, translateHead[2]+headSize[2]/2-earSize[2]/2] // perlu dicek lagi
        }

        const body = scaleBlock(defCube, kScaleBody[0], kScaleBody[1], kScaleBody[2])
        const neck = scaleBlock(defCube, kScaleNeck[0], kScaleNeck[1], kScaleNeck[2])
        const head = scaleBlock(defCube, kScaleHead[0], kScaleHead[1], kScaleHead[2])
        const leg = scaleBlock(defCube, kScaleLeg[0], kScaleLeg[1], kScaleLeg[2])
        const ear = scaleBlock(defCube, kScaleEar[0], kScaleEar[1], kScaleEar[2])
        const tail = scaleBlock(defCube, kScaleTail[0], kScaleTail[1], kScaleTail[2])

        this.centers = {
            'body': translateBody,
            'head': translateHead,
            'neck': translateNeck,
            'tail': translateTail,
            'ear-left': translateEar['left'],
            'ear-right': translateEar['right'],
            'leg-front-left': translateFrontLeg['left'],
            'leg-front-right': translateFrontLeg['right'],
            'leg-back-left': translateBackLeg['left'],
            'leg-back-right': translateBackLeg['right'],
        }

        this.skeletons = {
            'body': translateBlock(body, this.centers['body'][0], this.centers['body'][1], this.centers['body'][2]),
            'head': translateBlock(head, this.centers['head'][0], this.centers['head'][1], this.centers['head'][2]),
            'neck': translateBlock(neck, this.centers['neck'][0], this.centers['neck'][1], this.centers['neck'][2]),
            'tail' : translateBlock(tail, this.centers['tail'][0], this.centers['tail'][1], this.centers['tail'][2]),
            'ear-left': translateBlock(ear, this.centers['ear-left'][0], this.centers['ear-left'][1], this.centers['ear-left'][2]),
            'ear-right': translateBlock(ear, this.centers['ear-right'][0], this.centers['ear-right'][1], this.centers['ear-right'][2]),
            'leg-front-left': translateBlock(leg, this.centers['leg-front-left'][0], this.centers['leg-front-left'][1], this.centers['leg-front-left'][2]),
            'leg-front-right': translateBlock(leg, this.centers['leg-front-right'][0], this.centers['leg-front-right'][1], this.centers['leg-front-right'][2]),
            'leg-back-left': translateBlock(leg, this.centers['leg-back-left'][0], this.centers['leg-back-left'][1], this.centers['leg-back-left'][2]),
            'leg-back-right': translateBlock(leg, this.centers['leg-back-right'][0], this.centers['leg-back-right'][1], this.centers['leg-back-right'][2])
        }

        this.colors = {
            'body': new Float32Array(changeBlockColor(this.skeletons['body'], 1, 0, 0)),
            'head': new Float32Array(changeBlockColor(this.skeletons['head'], 0, 1, 0)),
            'neck': new Float32Array(changeBlockColor(this.skeletons['neck'], 0, 0, 1)),
            'tail': new Float32Array(changeBlockColor(this.skeletons['tail'], 0, 0, 1)),
            'ear-left': new Float32Array(changeBlockColor(this.skeletons['ear-left'], 0, 0, 1)),
            'ear-right': new Float32Array(changeBlockColor(this.skeletons['ear-right'], 0, 0, 1)),
            'leg-front-left': new Float32Array(changeBlockColor(this.skeletons['leg-front-left'], 1, 1, 0)),
            'leg-front-right': new Float32Array(changeBlockColor(this.skeletons['leg-front-right'], 1, 0, 1)),
            'leg-back-left': new Float32Array(changeBlockColor(this.skeletons['leg-back-left'], 0, 1, 1)),
            'leg-back-right': new Float32Array(changeBlockColor(this.skeletons['leg-back-right'], 0.5, 0.5, 0.5)),
        };

        this.jointPoints = {
            'body': this.centers['body'],
            'head': this.centers['head'],
            'neck': [this.centers['neck'][0], this.centers['body'][1], this.centers['neck'][2]],
            'tail': [this.centers['tail'][0], this.centers['tail'][1], this.centers['body'][2]],
            'ear-left': this.centers['ear-left'],
            'ear-right': this.centers['ear-right'],
            'leg-front-left': this.centers['leg-front-left'],
            'leg-front-right': this.centers['leg-front-right'],
            'leg-back-left': this.centers['leg-back-left'],
            'leg-back-right': this.centers['leg-back-right'],
        }

        this.textures = {
            'body': texture,
            'head': texture,
            'neck': texture,
            'tail': texture,
            'ear-left': texture,
            'ear-right': texture,
            'leg-front-left': texture,
            'leg-front-right': texture,
            'leg-back-left': texture,
            'leg-back-right': texture,
        }

        this.textureCoords = {
            'body': cubeTextureCoordinates,
            'head': cubeTextureCoordinates,
            'neck': cubeTextureCoordinates,
            'tail': cubeTextureCoordinates,
            'ear-left': cubeTextureCoordinates,
            'ear-right': cubeTextureCoordinates,
            'leg-front-left': cubeTextureCoordinates,
            'leg-front-right': cubeTextureCoordinates,
            'leg-back-left': cubeTextureCoordinates,
            'leg-back-right': cubeTextureCoordinates,
        }

        this.normals = {
            'body': getNormalCube(this.skeletons['body']),
            'head': getNormalCube(this.skeletons['head']),
            'neck': getNormalCube(this.skeletons['neck']),
            'tail': getNormalCube(this.skeletons['tail']),
            'ear-left': getNormalCube(this.skeletons['ear-left']),
            'ear-right': getNormalCube(this.skeletons['ear-right']),
            'leg-front-left': getNormalCube(this.skeletons['leg-front-left']),
            'leg-front-right': getNormalCube(this.skeletons['leg-front-right']),
            'leg-back-left': getNormalCube(this.skeletons['leg-back-left']),
            'leg-back-right': getNormalCube(this.skeletons['leg-back-right']),
        }

        this.tangents = {
            'body': getTangentCube(this.skeletons['body']),
            'head': getTangentCube(this.skeletons['head']),
            'neck': getTangentCube(this.skeletons['neck']),
            'leg-front-left': getTangentCube(this.skeletons['leg-front-left']),
            'leg-front-right': getTangentCube(this.skeletons['leg-front-right']),
            'leg-back-left': getTangentCube(this.skeletons['leg-back-left']),
            'leg-back-right': getTangentCube(this.skeletons['leg-back-right']),
        }

        this.bitangents = {
            'body': getBitangentCube(this.skeletons['body']),
            'head': getBitangentCube(this.skeletons['head']),
            'neck': getBitangentCube(this.skeletons['neck']),
            'leg-front-left': getBitangentCube(this.skeletons['leg-front-left']),
            'leg-front-right': getBitangentCube(this.skeletons['leg-front-right']),
            'leg-back-left': getBitangentCube(this.skeletons['leg-back-left']),
            'leg-back-right': getBitangentCube(this.skeletons['leg-back-right']),
        }

        this.inRotation = {
            'body': 0,
            'head': 0,
            'neck': 0,
            'tail': 0,
            'ear-left': 0,
            'ear-right': 0,
            'leg-front-left': 0,
            'leg-front-right': 0,
            'leg-back-left': 0,
            'leg-back-right': 0
        }
        this.inRotation = {
            'body': {'x': 0, 'y': 0, 'z': 0},
            'head': {'x': 0, 'y': 0, 'z': 0},
            'neck': {'x': 0, 'y': 0, 'z': 0},
            'tail': {'x': 0, 'y': 0, 'z': 0},
            'ear-left': {'x': 0, 'y': 0, 'z': 0},
            'ear-right': {'x': 0, 'y': 0, 'z': 0},
            'leg-front-left': {'x': 0, 'y': 0, 'z': 0},
            'leg-front-right': {'x': 0, 'y': 0, 'z': 0},
            'leg-back-left': {'x': 0, 'y': 0, 'z': 0},
            'leg-back-right': {'x': 0, 'y': 0, 'z': 0},
        }

        this.bodyLocation = [2, 0, 0]

        this.createTree()
        this.transformModel();
        this.updateAnimation();
        this.updateTransform();
    }
    createTree() {
        const skeletonNodes = {};
        for (var k in this.skeletons) skeletonNodes[k] = new Node(matIdentityMat(), this.jointPoints[k], this.centers[k], this.skeletons[k], indicesCube, this.colors[k], this.normals[k], this.tangents[k], this.bitangents[k], this.textures[k], this.textureCoords[k], null, null, k);

        this.root = skeletonNodes['body'];
        this.root.left = skeletonNodes['neck'];
        this.root.left.left = skeletonNodes['head'];
        this.root.left.left.left = skeletonNodes['ear-left'];
        this.root.left.left.left.right = skeletonNodes['ear-right'];
        this.root.left.right = skeletonNodes['leg-front-left'] 
        this.root.left.right.right = skeletonNodes['leg-front-right'] 
        this.root.left.right.right.right = skeletonNodes['leg-back-left'] 
        this.root.left.right.right.right.right = skeletonNodes['leg-back-right'] 
        this.root.left.right.right.right.right.right = skeletonNodes['tail'];
    }

    updateTransform(node=this.root) {
        node.render['vertices'] = transformBlock(node.defVertices, node.transform);
        node.render['normal'] = getNormalCube(node.render['vertices']);
        node.render['tangent'] = getTangentCube(node.render['vertices']);
        node.render['bitangent'] = getBitangentCube(node.render['vertices']);
        if (node.left) {
            const matJointNodeLeft = [
                [node.left.defJointPoint[0]],
                [node.left.defJointPoint[1]],
                [node.left.defJointPoint[2]],
                [1]
            ]
            node.left.jointPoint = flatten2D(matmul(node.transform, matJointNodeLeft))
            node.left.baseTransform = rotateMat(this.inRotation[node.left.name]['x'], this.inRotation[node.left.name]['y'], this.inRotation[node.left.name]['z'], node.left.jointPoint[0], node.left.jointPoint[1], node.left.jointPoint[2])
            node.left.transform = matmul(node.left.baseTransform, node.transform)

            node.left.render['vertices'] = transformBlock(node.left.defVertices, node.left.transform);
            node.left.render['normal'] = getNormalCube(node.left.render['vertices']);
            node.left.render['tangent'] = getTangentCube(node.left.render['vertices']);
            node.left.render['bitangent'] = getBitangentCube(node.left.render['vertices']);
            var siblingNode = node.left.right;
            var matJointNodeRight;
            while (siblingNode) {
                matJointNodeRight = [
                    [siblingNode.defJointPoint[0]],
                    [siblingNode.defJointPoint[1]],
                    [siblingNode.defJointPoint[2]],
                    [1]
                ]
                siblingNode.jointPoint = flatten2D(matmul(node.transform, matJointNodeRight))
                siblingNode.baseTransform = rotateMat(this.inRotation[siblingNode.name]['x'], this.inRotation[siblingNode.name]['y'], this.inRotation[siblingNode.name]['z'], siblingNode.jointPoint[0], siblingNode.jointPoint[1], siblingNode.jointPoint[2])
                siblingNode.transform = matmul(siblingNode.baseTransform, node.transform)

                siblingNode.render['vertices'] = transformBlock(siblingNode.defVertices, siblingNode.transform);
                siblingNode.render['normal'] = getNormalCube(siblingNode.render['vertices']);
                siblingNode.render['tangent'] = getTangentCube(siblingNode.render['vertices']);
                siblingNode.render['bitangent'] = getBitangentCube(siblingNode.render['vertices']);
                if (siblingNode.left) {
                    this.updateTransform(siblingNode.left);
                }
                siblingNode = siblingNode.right;
            }
            this.updateTransform(node.left);
        }
    }
    
    load(data) {
        this.bitangents = data.bitangents;
        this.bodyLocation = data.bodyLocation;
        this.inRotation = data.inRotation;
        this.jointPoints = data.jointPoints;
        this.normals = data.normals;
        this.texture = data.texture;
        
        this.createTree();
        this.transformModel();
        this.updateAnimation();
        this.updateTransform();
    }

    distributeRotation(val) {
        this.inRotation['neck']['x'] = val/2
        this.inRotation['leg-front-left']['x'] = val
        this.inRotation['leg-front-right']['x'] = -val
        this.inRotation['leg-back-left']['x'] = val
        this.inRotation['leg-back-right']['x'] = -val
        this.inRotation['tail']['y'] = val
    }

    transformModel() {
        this.root.transform = matmul(matIdentityMat(), translateMat(this.bodyLocation[0], this.bodyLocation[1], this.bodyLocation[2]))
        this.root.transform = matmul(this.root.transform, rotateMat(this.inRotation['body']['x'], this.inRotation['body']['y'], this.inRotation['body']['z'], 0, 0, 0))
    }

    updateAnimation() {
        this.root.left.baseTransform = rotateMat(this.inRotation['neck']['x'], 0, 0, this.root.left.jointPoint[0]+this.bodyLocation[0], this.root.left.jointPoint[1]+this.bodyLocation[1], this.root.left.jointPoint[2]+this.bodyLocation[2])
        this.root.left.left.baseTransform = rotateMat(this.inRotation['head']['x'], 0, 0, this.root.left.left.jointPoint[0]+this.bodyLocation[0], this.root.left.left.jointPoint[1]+this.bodyLocation[1], this.root.left.left.jointPoint[2]+this.bodyLocation[2])
        this.root.left.right.baseTransform = rotateMat(this.inRotation['leg-front-left']['x'], 0, 0, this.root.left.right.jointPoint[0]+this.bodyLocation[0], this.root.left.right.jointPoint[1]+this.bodyLocation[1], this.root.left.right.jointPoint[2]+this.bodyLocation[2])
        this.root.left.right.right.baseTransform = rotateMat(this.inRotation['leg-front-right']['x'], 0, 0, this.root.left.right.right.jointPoint[0]+this.bodyLocation[0], this.root.left.right.right.jointPoint[1]+this.bodyLocation[1], this.root.left.right.right.jointPoint[2]+this.bodyLocation[2])
        this.root.left.right.right.right.baseTransform = rotateMat(this.inRotation['leg-back-left']['x'], 0, 0, this.root.left.right.right.right.jointPoint[0]+this.bodyLocation[0], this.root.left.right.right.right.jointPoint[1]+this.bodyLocation[1], this.root.left.right.right.right.jointPoint[2]+this.bodyLocation[2])
        this.root.left.right.right.right.right.baseTransform = rotateMat(this.inRotation['leg-back-right']['x'], 0, 0, this.root.left.right.right.right.right.jointPoint[0]+this.bodyLocation[0], this.root.left.right.right.right.right.jointPoint[1]+this.bodyLocation[1], this.root.left.right.right.right.right.jointPoint[2]+this.bodyLocation[2])
        this.root.left.right.right.right.right.right.baseTransform = rotateMat(0, this.inRotation['tail']['y'], 0, this.root.left.right.right.right.right.right.jointPoint[0]+this.bodyLocation[0], this.root.left.right.right.right.right.right.jointPoint[1]+this.bodyLocation[1], this.root.left.right.right.right.right.right.jointPoint[2]+this.bodyLocation[2])
    }
}