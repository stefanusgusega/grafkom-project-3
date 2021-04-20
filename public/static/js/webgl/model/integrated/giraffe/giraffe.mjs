import {defCube, color, changeColor, indicesCube, cubeTextureCoordinates, getNormalCube, getTangentCube, getBitangentCube} from './../../base/cube.mjs';
import {rotateMat, translateMat, scaleMat, matmul, matIdentityMat, transformBlock, changeBlockColor, scaleBlock, flatten2D, translateBlock, rotateBlock, vertToMatrix, matIdentity} from './../../../utils/util.mjs';
import {Node} from './../../node.mjs';
import {texture} from './textures.mjs';

export class Giraffe {
    constructor() {
        this.center = [0, 0, 0];
        this.buildSkeleton()
    }

    buildSkeleton() {
        const cubeSize = 2;

        const scale = 1;
        const bodyShape = [1/scale, 1/scale, 2/scale];
        const neckShape = [0.6/scale, 2/scale, 0.2/scale];
        const headShape = [0.6/scale, 0.6/scale, 0.6/scale];
        const legShape = [0.2/scale, 0.6/scale, 0.2/scale];

        const kScaleBody = [bodyShape[0]/cubeSize, bodyShape[1]/cubeSize, bodyShape[2]/cubeSize]
        const kScaleNeck = [neckShape[0]/cubeSize, neckShape[1]/cubeSize, neckShape[2]/cubeSize]
        const kScaleHead = [headShape[0]/cubeSize, headShape[1]/cubeSize, headShape[2]/cubeSize]
        const kScaleLeg = [legShape[0]/cubeSize, legShape[1]/cubeSize, legShape[2]/cubeSize]

        const translateBody = [0, 0, 0];
        const translateNeck = [0, bodyShape[1]/2 + neckShape[1]/2, -(bodyShape[2]/2 - neckShape[2]/2)];
        const translateHead = [0, translateNeck[1] + 0.4/scale, translateNeck[2] - neckShape[2]/2 - headShape[2]/2];
        const translateFrontLeg = {
            'left': [bodyShape[0]/2 - legShape[0]/2, -(bodyShape[1]/2 + legShape[1]/2), -(bodyShape[2]/2 - legShape[2]/2)],
            'right': [-(bodyShape[0]/2 - legShape[0]/2), -(bodyShape[1]/2 + legShape[1]/2), -(bodyShape[2]/2 - legShape[2]/2)],
        }
        const translateBackLeg = {
            'left': [bodyShape[0]/2 - legShape[0]/2, -(bodyShape[1]/2 + legShape[1]/2), bodyShape[2]/2 - legShape[2]/2],
            'right': [-(bodyShape[0]/2 - legShape[0]/2), -(bodyShape[1]/2 + legShape[1]/2), bodyShape[2]/2 - legShape[2]/2],
        }

        const body = scaleBlock(defCube, kScaleBody[0], kScaleBody[1], kScaleBody[2])
        const neck = scaleBlock(defCube, kScaleNeck[0], kScaleNeck[1], kScaleNeck[2])
        const head = scaleBlock(defCube, kScaleHead[0], kScaleHead[1], kScaleHead[2])
        const leg = scaleBlock(defCube, kScaleLeg[0], kScaleLeg[1], kScaleLeg[2])

        this.centers = {
            'body': translateBody,
            'head': translateHead,
            'neck': translateNeck,
            'leg-front-left': translateFrontLeg['left'],
            'leg-front-right': translateFrontLeg['right'],
            'leg-back-left': translateBackLeg['left'],
            'leg-back-right': translateBackLeg['right'],
        }

        this.skeletons = {
            'body': translateBlock(body, this.centers['body'][0], this.centers['body'][1], this.centers['body'][2]),
            'head': translateBlock(head, this.centers['head'][0], this.centers['head'][1], this.centers['head'][2]),
            'neck': translateBlock(neck, this.centers['neck'][0], this.centers['neck'][1], this.centers['neck'][2]),
            'leg-front-left': translateBlock(leg, this.centers['leg-front-left'][0], this.centers['leg-front-left'][1], this.centers['leg-front-left'][2]),
            'leg-front-right': translateBlock(leg, this.centers['leg-front-right'][0], this.centers['leg-front-right'][1], this.centers['leg-front-right'][2]),
            'leg-back-left': translateBlock(leg, this.centers['leg-back-left'][0], this.centers['leg-back-left'][1], this.centers['leg-back-left'][2]),
            'leg-back-right': translateBlock(leg, this.centers['leg-back-right'][0], this.centers['leg-back-right'][1], this.centers['leg-back-right'][2])
        }
        
        this.colors = {
            'body': new Float32Array(changeBlockColor(this.skeletons['body'], 1, 0, 0)),
            'head': new Float32Array(changeBlockColor(this.skeletons['head'], 0, 1, 0)),
            'neck': new Float32Array(changeBlockColor(this.skeletons['neck'], 0, 0, 1)),
            'leg-front-left': new Float32Array(changeBlockColor(this.skeletons['leg-front-left'], 1, 1, 0)),
            'leg-front-right': new Float32Array(changeBlockColor(this.skeletons['leg-front-right'], 1, 0, 1)),
            'leg-back-left': new Float32Array(changeBlockColor(this.skeletons['leg-back-left'], 0, 1, 1)),
            'leg-back-right': new Float32Array(changeBlockColor(this.skeletons['leg-back-right'], 0.5, 0.5, 0.5)),
        };

        this.jointPoints = {
            'body': this.centers['body'],
            'head': this.centers['head'],
            'neck': [this.centers['neck'][0], this.centers['body'][1], this.centers['neck'][2]],
            'leg-front-left': this.centers['leg-front-left'],
            'leg-front-right': this.centers['leg-front-right'],
            'leg-back-left': this.centers['leg-back-left'],
            'leg-back-right': this.centers['leg-back-right'],
        }

        this.textures = {
            'body': texture,
            'head': texture,
            'neck': texture,
            'leg-front-left': texture,
            'leg-front-right': texture,
            'leg-back-left': texture,
            'leg-back-right': texture,
        }

        this.textureCoords = {
            'body': cubeTextureCoordinates,
            'head': cubeTextureCoordinates,
            'neck': cubeTextureCoordinates,
            'leg-front-left': cubeTextureCoordinates,
            'leg-front-right': cubeTextureCoordinates,
            'leg-back-left': cubeTextureCoordinates,
            'leg-back-right': cubeTextureCoordinates,
        }

        this.normals = {
            'body': getNormalCube(this.skeletons['body']),
            'head': getNormalCube(this.skeletons['head']),
            'neck': getNormalCube(this.skeletons['neck']),
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
            'leg-front-left': 0,
            'leg-front-right': 0,
            'leg-back-left': 0,
            'leg-back-right': 0
        }

        this.inRotation = {
            'body': {'x': 0, 'y': 0, 'z': 0},
            'head': {'x': 0, 'y': 0, 'z': 0},
            'neck': {'x': 0, 'y': 0, 'z': 0},
            'leg-front-left': {'x': 0, 'y': 0, 'z': 0},
            'leg-front-right': {'x': 0, 'y': 0, 'z': 0},
            'leg-back-left': {'x': 0, 'y': 0, 'z': 0},
            'leg-back-right': {'x': 0, 'y': 0, 'z': 0},
        }

        this.bodyLocation = [0, 0, 0]

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
        this.root.left.right = skeletonNodes['leg-front-left'] 
        this.root.left.right.right = skeletonNodes['leg-front-right'] 
        this.root.left.right.right.right = skeletonNodes['leg-back-left'] 
        this.root.left.right.right.right.right = skeletonNodes['leg-back-right'] 
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

    distributeRotation(val) {
        this.inRotation['neck']['x'] = val/2
        this.inRotation['leg-front-left']['x'] = val
        this.inRotation['leg-front-right']['x'] = -val
        this.inRotation['leg-back-left']['x'] = val
        this.inRotation['leg-back-right']['x'] = -val
    }

    transformModel() {
        this.root.transform = matmul(matIdentityMat(), translateMat(this.bodyLocation[0], this.bodyLocation[1], this.bodyLocation[2]))
        this.root.transform = matmul(this.root.transform, rotateMat(this.inRotation['body']['x'], this.inRotation['body']['y'], this.inRotation['body']['z'], 0, 0, 0))
    }

    updateAnimation() {
        this.root.left.baseTransform = rotateMat(this.inRotation['neck']['x'], 0, 0, this.root.left.jointPoint[0], this.root.left.jointPoint[1], this.root.left.jointPoint[2])
        this.root.left.left.baseTransform = rotateMat(this.inRotation['head']['x'], 0, 0, this.root.left.left.jointPoint[0], this.root.left.left.jointPoint[1], this.root.left.left.jointPoint[2])
        this.root.left.right.baseTransform = rotateMat(this.inRotation['leg-front-left']['x'], 0, 0, this.root.left.right.jointPoint[0], this.root.left.right.jointPoint[1], this.root.left.right.jointPoint[2])
        this.root.left.right.right.baseTransform = rotateMat(this.inRotation['leg-front-right']['x'], 0, 0, this.root.left.right.right.jointPoint[0], this.root.left.right.right.jointPoint[1], this.root.left.right.right.jointPoint[2])
        this.root.left.right.right.right.baseTransform = rotateMat(this.inRotation['leg-back-left']['x'], 0, 0, this.root.left.right.right.right.jointPoint[0], this.root.left.right.right.right.jointPoint[1], this.root.left.right.right.right.jointPoint[2])
        this.root.left.right.right.right.right.baseTransform = rotateMat(this.inRotation['leg-back-right']['x'], 0, 0, this.root.left.right.right.right.right.jointPoint[0], this.root.left.right.right.right.right.jointPoint[1], this.root.left.right.right.right.right.jointPoint[2])
    }
}