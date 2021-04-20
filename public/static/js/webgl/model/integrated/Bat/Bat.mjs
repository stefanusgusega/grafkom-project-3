import {defCube, color, changeColor, indicesCube, cubeTextureCoordinates, getNormalCube, getTangentCube, getBitangentCube} from './../../base/cube.mjs';
import {rotateMat, translateMat, scaleMat, matmul, matIdentityMat, transformBlock, changeBlockColor, scaleBlock, flatten2D, translateBlock, rotateBlock, vertToMatrix, matIdentity} from './../../../utils/util.mjs';
import {Node} from './../../node.mjs';
import {image} from './textures.mjs';

export class Bat {
    constructor(master) {
        this.master = master;
        this.center = [0, 0, 0];
        this.buildSkeleton()
    }

    buildSkeleton() {
        const cubeSize = 2;
        const bodyShape = [0.8, 0.6, 0.4];
        const Wing1Size = [0.6, 0.4, 0.1];
        const Wing2Size = [0.6, 0.4, 0.1];
        const legShape = [0.1, 0.5, 0.1];

        const kScaleBody = [bodyShape[0]/cubeSize, bodyShape[1]/cubeSize, bodyShape[2]/cubeSize]
        const kScaleWing1 = [Wing1Size[0]/cubeSize, Wing1Size[1]/cubeSize, Wing1Size[2]/cubeSize]
        const kScaleWing2 = [Wing2Size[0]/cubeSize, Wing2Size[1]/cubeSize, Wing2Size[2]/cubeSize]
        const kScaleLeg = [legShape[0]/cubeSize, legShape[1]/cubeSize, legShape[2]/cubeSize]
        

        const translateBody = [0, 0, 0];
        const translateWing1 = [translateBody[0]+0.6,translateBody[1],translateBody[2]];
        const translateWing2 = [translateBody[0]-0.6,translateBody[1],translateBody[2]];
        const translateFrontLeg = {
            'left': [translateBody[0]+0.2, translateBody[1]-0.4,translateBody[2]],
            'right': [translateBody[0]-0.2, translateBody[1]-0.4,translateBody[2]],
        }
        const translateear = {
            'left': [translateBody[0]+0.1, translateBody[1]+0.2,translateBody[2]],
            'right': [translateBody[0]-0.1, translateBody[1]+0.2,translateBody[2]],
        }

        const body = scaleBlock(defCube, kScaleBody[0], kScaleBody[1], kScaleBody[2])
        const Wing1 = scaleBlock(defCube, kScaleWing1[0], kScaleWing1[1], kScaleWing1[2])
        const Wing2 = scaleBlock(defCube, kScaleWing2[0], kScaleWing2[1], kScaleWing2[2])
        const leg = scaleBlock(defCube, kScaleLeg[0], kScaleLeg[1], kScaleLeg[2])
       

        this.centers = {
            'body': translateBody,
            'wing2': translateWing2,
            'wing1': translateWing1,
            'leg-front-left': translateFrontLeg['left'],
            'leg-front-right': translateFrontLeg['right'],
            'ear-left': translateear['left'],
            'ear-right': translateear['right'],
        }

        this.skeletons = {
            'body': translateBlock(body, this.centers['body'][0], this.centers['body'][1], this.centers['body'][2]),
            'wing2': translateBlock(Wing2, this.centers['wing2'][0], this.centers['wing2'][1], this.centers['wing2'][2]),
            'wing1': translateBlock(Wing1, this.centers['wing1'][0], this.centers['wing1'][1], this.centers['wing1'][2]),
            'leg-front-left': translateBlock(leg, this.centers['leg-front-left'][0], this.centers['leg-front-left'][1], this.centers['leg-front-left'][2]),
            'leg-front-right': translateBlock(leg, this.centers['leg-front-right'][0], this.centers['leg-front-right'][1], this.centers['leg-front-right'][2]),
            'ear-left': translateBlock(leg, this.centers['ear-left'][0], this.centers['ear-left'][1], this.centers['ear-left'][2]),
            'ear-right': translateBlock(leg, this.centers['ear-right'][0], this.centers['ear-right'][1], this.centers['ear-right'][2])
        }
        
        this.colors = {
            'body': new Float32Array(changeBlockColor(this.skeletons['body'], 1, 0, 0)),
            'wing2': new Float32Array(changeBlockColor(this.skeletons['wing2'], 0, 1, 0)),
            'wing1': new Float32Array(changeBlockColor(this.skeletons['wing1'], 0, 0, 1)),
            'leg-front-left': new Float32Array(changeBlockColor(this.skeletons['leg-front-left'], 1, 1, 0)),
            'leg-front-right': new Float32Array(changeBlockColor(this.skeletons['leg-front-right'], 1, 0, 1)),
            'ear-left': new Float32Array(changeBlockColor(this.skeletons['ear-left'], 0, 1, 1)),
            'ear-right': new Float32Array(changeBlockColor(this.skeletons['ear-right'], 0.5, 0.5, 0.5)),
        };

        this.jointPoints = {
            'body': this.centers['body'],
            'wing2': this.centers['wing2'],
            'wing1': [this.centers['wing1'][0], this.centers['body'][1], this.centers['wing1'][2]],
            'leg-front-left': this.centers['leg-front-left'],
            'leg-front-right': this.centers['leg-front-right'],
            'ear-left': this.centers['ear-left'],
            'ear-right': this.centers['ear-right'],
        }
        
        this.textureCoords = {
            'body': cubeTextureCoordinates,
            'wing2': cubeTextureCoordinates,
            'wing1': cubeTextureCoordinates,
            'leg-front-left': cubeTextureCoordinates,
            'leg-front-right': cubeTextureCoordinates,
            'ear-left': cubeTextureCoordinates,
            'ear-right': cubeTextureCoordinates,
        }

        this.normals = {
            'body': getNormalCube(this.skeletons['body']),
            'wing2': getNormalCube(this.skeletons['wing2']),
            'wing1': getNormalCube(this.skeletons['wing1']),
            'leg-front-left': getNormalCube(this.skeletons['leg-front-left']),
            'leg-front-right': getNormalCube(this.skeletons['leg-front-right']),
            'ear-left': getNormalCube(this.skeletons['ear-left']),
            'ear-right': getNormalCube(this.skeletons['ear-right']),
        }

        this.tangents = {
            'body': getTangentCube(this.skeletons['body']),
            'wing2': getTangentCube(this.skeletons['wing2']),
            'wing1': getTangentCube(this.skeletons['wing1']),
            'leg-front-left': getTangentCube(this.skeletons['leg-front-left']),
            'leg-front-right': getTangentCube(this.skeletons['leg-front-right']),
            'leg-back-left': getTangentCube(this.skeletons['ear-left']),
            'leg-back-right': getTangentCube(this.skeletons['ear-right']),
        }

        this.bitangents = {
            'body': getBitangentCube(this.skeletons['body']),
            'wing2': getBitangentCube(this.skeletons['wing2']),
            'wing1': getBitangentCube(this.skeletons['wing1']),
            'leg-front-left': getBitangentCube(this.skeletons['leg-front-left']),
            'leg-front-right': getBitangentCube(this.skeletons['leg-front-right']),
            'leg-back-left': getBitangentCube(this.skeletons['ear-left']),
            'leg-back-right': getBitangentCube(this.skeletons['ear-right']),
        }

        this.inRotation = {
            'body': 0,
            'wing2': 0,
            'wing1': 0,
            'leg-front-left': 0,
            'leg-front-right': 0,
            'ear-left': 0,
            'ear-right': 0
        }

        this.inRotation = {
            'body': {'x': 0, 'y': 0, 'z': 0},
            'wing2': {'x': 0, 'y': 0, 'z': 0},
            'wing1': {'x': 0, 'y': 0, 'z': 0},
            'leg-front-left': {'x': 0, 'y': 0, 'z': 0},
            'leg-front-right': {'x': 0, 'y': 0, 'z': 0},
            'ear-left': {'x': 0, 'y': 0, 'z': 0},
            'ear-right': {'x': 0, 'y': 0, 'z': 0},
        }

        this.rotation = 0;
        this.bodyLocation = [-1, -2, -1];

        this.createTree()
        this.transformModel();
        this.updateAnimation();
        this.updateTransform();
    }

    createTree() {
        const texture = [
            {
                target: this.master.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                url: image,
            },
            {
                target: this.master.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                url: image,
            },
            {
                target: this.master.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                url: image,
            },
            {
                target: this.master.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                url: image,
            },
            {
                target: this.master.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                url: image,
            },
            {
                target: this.master.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
                url: image,
            },
        ];
        

        const skeletonNodes = {};
        for (var k in this.skeletons) skeletonNodes[k] = new Node(matIdentityMat(), this.jointPoints[k], this.centers[k], this.skeletons[k], indicesCube, this.colors[k], this.normals[k], this.tangents[k], this.bitangents[k], texture, this.textureCoords[k], null, null, k);

        this.root = skeletonNodes['body'];
        this.root.left = skeletonNodes['wing1'];
        this.root.left.right = skeletonNodes['wing2'];
        this.root.left.right.right = skeletonNodes['leg-front-left'] 
        this.root.left.right.right.right = skeletonNodes['leg-front-right']
        this.root.left.right.right.right.right = skeletonNodes['ear-left'] 
        this.root.left.right.right.right.right.right = skeletonNodes['ear-right'] 
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
        this.inRotation['leg-front-left']['x'] = val
        this.inRotation['leg-front-right']['x'] = -val
    }

    transformModel() {
        this.root.transform = matmul(matIdentityMat(), translateMat(this.bodyLocation[0], this.bodyLocation[1], this.bodyLocation[2]))
        this.root.transform = matmul(this.root.transform, rotateMat(this.inRotation['body']['x'], this.inRotation['body']['y'], this.inRotation['body']['z'], 0, 0, 0))
    }

    updateAnimation() {
        this.root.left.baseTransform = rotateMat(this.inRotation['wing1']['x'], 0, 0, this.root.left.jointPoint[0]+this.bodyLocation[0], this.root.left.jointPoint[1]+this.bodyLocation[1], this.root.left.jointPoint[2]+this.bodyLocation[2])
        this.root.left.right.baseTransform = rotateMat(this.inRotation['wing2']['x'], 0, 0, this.root.left.right.jointPoint[0]+this.bodyLocation[0], this.root.left.right.jointPoint[1]+this.bodyLocation[1], this.root.left.right.jointPoint[2]+this.bodyLocation[2])
        this.root.left.right.right.baseTransform = rotateMat(this.inRotation['leg-front-left']['x'], 0, 0, this.root.left.right.right.jointPoint[0]+this.bodyLocation[0], this.root.left.right.right.jointPoint[1]+this.bodyLocation[1], this.root.left.right.right.jointPoint[2]+this.bodyLocation[2])
        this.root.left.right.right.right.baseTransform = rotateMat(this.inRotation['leg-front-right']['x'], 0, 0, this.root.left.right.right.right.jointPoint[0]+this.bodyLocation[0], this.root.left.right.right.right.jointPoint[1]+this.bodyLocation[1], this.root.left.right.right.right.jointPoint[2]+this.bodyLocation[2])
    }
}