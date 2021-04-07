import {defCube, color, changeColor, indicesCube} from './../base/cube.mjs';
import {rotateMat, translateMat, scaleMat, matmul, matIdentityMat, transformBlock, changeBlockColor, scaleBlock, flatten2D, translateBlock, rotateBlock, vertToMatrix, matIdentity} from './../../utils/util.mjs';
import {Node} from './../node.mjs';

export class Yoga {
    constructor() {
        this.center = [0, 0, 0];

        this.buildSkeleton()
    }

    buildSkeleton() {
        const cubeSize = 2;
        const bodyShape = [1, 1, 2];
        const neckShape = [0.6, 2, 0.2];
        const headShape = [0.6, 0.6, 0.6];
        const legShape = [0.2, 0.6, 0.2];

        const kScaleBody = [bodyShape[0]/cubeSize, bodyShape[1]/cubeSize, bodyShape[2]/cubeSize]
        const kScaleNeck = [neckShape[0]/cubeSize, neckShape[1]/cubeSize, neckShape[2]/cubeSize]
        const kScaleHead = [headShape[0]/cubeSize, headShape[1]/cubeSize, headShape[2]/cubeSize]
        const kScaleLeg = [legShape[0]/cubeSize, legShape[1]/cubeSize, legShape[2]/cubeSize]

        const translateBody = [0, 0, 0];
        const translateNeck = [0, bodyShape[1]/2 + neckShape[1]/2, -(bodyShape[2]/2 - neckShape[2]/2)];
        const translateHead = [0, translateNeck[1] + 0.4, translateNeck[2] - neckShape[2]/2 - headShape[2]/2];
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

        this.createTree()
        this.updateTransform();
    }

    createTree() {
        const skeletonNodes = {};
        for (var k in this.skeletons) skeletonNodes[k] = new Node(matIdentityMat(), this.jointPoints[k], this.centers[k], this.skeletons[k], indicesCube, this.colors[k], null, null, k);

        this.root = skeletonNodes['body'];
        this.root.left = skeletonNodes['neck'];
        this.root.left.left = skeletonNodes['head'];
        this.root.left.right = skeletonNodes['leg-front-left'] 
        this.root.left.right.right = skeletonNodes['leg-front-right'] 
        this.root.left.right.right.right = skeletonNodes['leg-back-left'] 
        this.root.left.right.right.right.right = skeletonNodes['leg-back-right'] 
        console.log(this.root)

        this.root.left.transform = rotateMat(20, 0, 0, this.root.left.jointPoint[0], this.root.left.jointPoint[1], this.root.left.jointPoint[2])
    }

    updateTransform(node=this.root) {
        node.render['vertices'] = transformBlock(node.defVertices, node.transform);
        if (node.left) {
            node.left.transform = matmul(node.left.transform, node.transform);
            node.left.render['vertices'] = transformBlock(node.left.defVertices, node.left.transform);
            var siblingNode = node.left.right;
            while (siblingNode) {
                siblingNode.transform = matmul(siblingNode.transform, node.transform);
                siblingNode.render['vertices'] = transformBlock(siblingNode.defVertices, siblingNode.transform);
                if (siblingNode.left) {
                    this.updateTransform(siblingNode.left);
                }
                siblingNode = siblingNode.right;
            }
            this.updateTransform(node.left);
        }
    }
}