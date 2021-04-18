import {matIdentityMat} from './../utils/util.mjs';


export class Node {
    constructor(transform, jointPoint, center, vertices, indices, color, normal, texture, textureCoord, left, right, name) {
        this.name = name;
        this.left = left;
        this.right = right;
        this.center = center;
        this.baseTransform = matIdentityMat();
        this.transform = transform;
        this.jointPoint = jointPoint;
        this.defVertices = vertices;
        this.render = {
            'color': color,
            'vertices': vertices,
            'indices': indices,
            'normal': normal,
            'texture': texture,
            'textureCoord': textureCoord,
        }
    }
}