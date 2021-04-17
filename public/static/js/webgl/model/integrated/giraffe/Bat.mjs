import {defCube, color, changeColor, indicesCube, cubeTextureCoordinates, getNormalCube} from './../../base/cube.mjs';
import {rotateMat, translateMat, scaleMat, matmul, matIdentityMat, transformBlock, changeBlockColor, scaleBlock, flatten2D, translateBlock, rotateBlock, vertToMatrix, matIdentity} from './../../../utils/util.mjs';
import {Node} from './../../node.mjs';
import {texture} from './textures.mjs';

export class Bat {
    constructor() {
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
        

        const translateBody = [-2, 1, -1];
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
            'Wing2': translateWing2,
            'Wing1': translateWing1,
            'leg-front-left': translateFrontLeg['left'],
            'leg-front-right': translateFrontLeg['right'],
            'ear-left': translateear['left'],
            'ear-right': translateear['right'],
        }

        this.skeletons = {
            'body': translateBlock(body, this.centers['body'][0], this.centers['body'][1], this.centers['body'][2]),
            'Wing2': translateBlock(Wing2, this.centers['Wing2'][0], this.centers['Wing2'][1], this.centers['Wing2'][2]),
            'Wing1': translateBlock(Wing1, this.centers['Wing1'][0], this.centers['Wing1'][1], this.centers['Wing1'][2]),
            'leg-front-left': translateBlock(leg, this.centers['leg-front-left'][0], this.centers['leg-front-left'][1], this.centers['leg-front-left'][2]),
            'leg-front-right': translateBlock(leg, this.centers['leg-front-right'][0], this.centers['leg-front-right'][1], this.centers['leg-front-right'][2]),
            'ear-left': translateBlock(leg, this.centers['ear-left'][0], this.centers['ear-left'][1], this.centers['ear-left'][2]),
            'ear-right': translateBlock(leg, this.centers['ear-right'][0], this.centers['ear-right'][1], this.centers['ear-right'][2])
        }
        
        this.colors = {
            'body': new Float32Array(changeBlockColor(this.skeletons['body'], 1, 0, 0)),
            'Wing2': new Float32Array(changeBlockColor(this.skeletons['Wing2'], 0, 1, 0)),
            'Wing1': new Float32Array(changeBlockColor(this.skeletons['Wing1'], 0, 0, 1)),
            'leg-front-left': new Float32Array(changeBlockColor(this.skeletons['leg-front-left'], 1, 1, 0)),
            'leg-front-right': new Float32Array(changeBlockColor(this.skeletons['leg-front-right'], 1, 0, 1)),
            'ear-left': new Float32Array(changeBlockColor(this.skeletons['ear-left'], 0, 1, 1)),
            'ear-right': new Float32Array(changeBlockColor(this.skeletons['ear-right'], 0.5, 0.5, 0.5)),
        };

        this.jointPoints = {
            'body': this.centers['body'],
            'Wing2': this.centers['Wing2'],
            'Wing1': [this.centers['Wing1'][0], this.centers['body'][1], this.centers['Wing1'][2]],
            'leg-front-left': this.centers['leg-front-left'],
            'leg-front-right': this.centers['leg-front-right'],
            'ear-left': this.centers['ear-left'],
            'ear-right': this.centers['ear-right'],
        }

        this.textures = {
            'body': texture,
            'Wing2': texture,
            'Wing1': texture,
            'leg-front-left': texture,
            'leg-front-right': texture,
            'ear-left': texture,
            'ear-right': texture,
        }

        this.textureCoords = {
            'body': cubeTextureCoordinates,
            'Wing2': cubeTextureCoordinates,
            'Wing1': cubeTextureCoordinates,
            'leg-front-left': cubeTextureCoordinates,
            'leg-front-right': cubeTextureCoordinates,
            'ear-left': cubeTextureCoordinates,
            'ear-right': cubeTextureCoordinates,
        }

        this.normals = {
            'body': getNormalCube(this.skeletons['body']),
            'Wing2': getNormalCube(this.skeletons['Wing2']),
            'Wing1': getNormalCube(this.skeletons['Wing1']),
            'leg-front-left': getNormalCube(this.skeletons['leg-front-left']),
            'leg-front-right': getNormalCube(this.skeletons['leg-front-right']),
            'ear-left': getNormalCube(this.skeletons['ear-left']),
            'ear-right': getNormalCube(this.skeletons['ear-right']),
        }

        this.rotation = 0;

        this.createTree()
        this.updateAnimation();
        this.updateTransform();
    }

    createTree() {
        const skeletonNodes = {};
        for (var k in this.skeletons) skeletonNodes[k] = new Node(matIdentityMat(), this.jointPoints[k], this.centers[k], this.skeletons[k], indicesCube, this.colors[k], this.normals[k], this.textures[k], this.textureCoords[k], null, null, k);

        this.root = skeletonNodes['body'];
        this.root.left = skeletonNodes['Wing1'];
        this.root.left.left = skeletonNodes['Wing2'];
        this.root.left.right = skeletonNodes['leg-front-left'] 
        this.root.left.right.right = skeletonNodes['leg-front-right']
        this.root.left.right.right.right = skeletonNodes['ear-left'] 
        this.root.left.right.right.right.right = skeletonNodes['ear-right'] 
    }

    updateTransform(node=this.root) {
        node.render['vertices'] = transformBlock(node.defVertices, node.transform);
        node.render['normal'] = getNormalCube(node.render['vertices']);
        if (node.left) {
            node.left.transform = matmul(node.left.baseTransform, node.transform);
            node.left.render['vertices'] = transformBlock(node.left.defVertices, node.left.transform);
            node.left.render['normal'] = getNormalCube(node.left.render['vertices']);
            var siblingNode = node.left.right;
            while (siblingNode) {
                siblingNode.transform = matmul(siblingNode.baseTransform, node.transform);
                siblingNode.render['vertices'] = transformBlock(siblingNode.defVertices, siblingNode.transform);
                siblingNode.render['normal'] = getNormalCube(siblingNode.render['vertices']);
                if (siblingNode.left) {
                    this.updateTransform(siblingNode.left);
                }
                siblingNode = siblingNode.right;
            }
            this.updateTransform(node.left);
        }
    }

    updateAnimation() {
        this.root.transform = rotateMat(this.rotation, 0, 0, this.root.jointPoint[0], this.root.jointPoint[1], this.root.jointPoint[2]);
        this.root.left.baseTransform = rotateMat(this.rotation, 0, 0, this.root.left.jointPoint[0], this.root.left.jointPoint[1], this.root.left.jointPoint[2])
        this.root.left.right.baseTransform = rotateMat(-this.rotation, 0, 0, this.root.left.right.jointPoint[0], this.root.left.right.jointPoint[1], this.root.left.right.jointPoint[2])
        this.root.left.right.right.baseTransform = rotateMat(-this.rotation, 0, 0, this.root.left.right.right.jointPoint[0], this.root.left.right.right.jointPoint[1], this.root.left.right.right.jointPoint[2])
        this.root.left.right.right.right.baseTransform = rotateMat(this.rotation, 0, 0, this.root.left.right.right.right.jointPoint[0], this.root.left.right.right.right.jointPoint[1], this.root.left.right.right.right.jointPoint[2])
        this.root.left.right.right.right.right.baseTransform = rotateMat(this.rotation, 0, 0, this.root.left.right.right.right.right.jointPoint[0], this.root.left.right.right.right.right.jointPoint[1], this.root.left.right.right.right.right.jointPoint[2])
    }
}