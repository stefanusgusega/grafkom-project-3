import {defCube, color, indicesCube} from './../base/cube.mjs';


export class Yoga {
    constructor() {
        this.renderedVertices = defCube;
        this.renderedIndices = indicesCube;
        this.color = color;
    }
}