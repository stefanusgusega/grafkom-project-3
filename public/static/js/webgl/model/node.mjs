import {matIdentityMat} from './../utils/util.mjs';


export class Node {
    constructor(transform, jointPoint, center, vertices, indices, color, normal, tangent, bitangent, texture, textureCoord, left, right, name) {
        this.name = name;
        this.left = left;
        this.right = right;
        this.center = center;
        this.baseTransform = matIdentityMat();
        this.transform = transform;
        this.defJointPoint = jointPoint;
        this.jointPoint = jointPoint;
        this.defVertices = vertices;
        this.render = {
            'color': color,
            'vertices': vertices,
            'indices': indices,
            'normal': normal,
            'tangent': tangent,
            'bitangent': bitangent,
            'texture': texture,
            'textureCoord': textureCoord,
        }
    }
}