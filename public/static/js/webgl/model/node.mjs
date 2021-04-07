export class Node {
    constructor(transform, jointPoint, center, vertices, indices, color, left, right, name) {
        this.name = name;
        // this.childs = childs;
        this.left = left;
        this.right = right;
        this.center = center;
        this.transform = transform;
        this.jointPoint = jointPoint;
        this.defVertices = vertices;
        this.render = {
            'color': color,
            'vertices': vertices,
            'indices': indices,
        }
    }
}