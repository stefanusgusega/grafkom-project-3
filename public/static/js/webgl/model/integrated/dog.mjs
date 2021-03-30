import {defCube, color, changeColor, indicesCube} from './../base/cube.mjs';
import {changeBlockColor, scaleBlock, flatten2D, translateBlock, rotateBlock, vertToMatrix} from './../../utils/util.mjs';

export class Yoga {
    constructor() {
        this.center = [0, 0, 0];

        this.buildSkeleton()
    }

    buildSkeleton() {
        const body = scaleBlock(defCube, 0.5, 0.5, 1)
        const head = scaleBlock(defCube, 0.3, 0.3, 0.3)
        const neck = scaleBlock(defCube, 0.3, 1.5, 0.1)
        const leg = scaleBlock(defCube, 0.1, 0.3, 0.1)
        const tail = scaleBlock(defCube, 0.1, 0.1, 0.1)

        const bodyPos = [0, 0, 0]
        const headPos = [0, 2, -1.2]
        const neckPos = [0, 1, -1]
        const frontLeg = {
            'left': [0.4, -0.6, -0.9],
            'right': [-0.4, -0.6, -0.9]
        }
        const backLeg = {
            'left': [0.4, -0.6, 0.9],
            'right': [-0.4, -0.6, 0.9]
        }

        var skeleton = [];
        skeleton.push(translateBlock(body, bodyPos[0], bodyPos[1], bodyPos[2]))
        skeleton.push(translateBlock(head, headPos[0], headPos[1], headPos[2]))
        skeleton.push(translateBlock(neck, neckPos[0], neckPos[1], neckPos[2]))
        skeleton.push(translateBlock(leg, frontLeg['left'][0], frontLeg['left'][1], frontLeg['left'][2]))
        skeleton.push(translateBlock(leg, frontLeg['right'][0], frontLeg['right'][1], frontLeg['right'][2]))
        skeleton.push(translateBlock(leg, backLeg['left'][0], backLeg['left'][1], backLeg['left'][2]))
        skeleton.push(translateBlock(leg, backLeg['right'][0], backLeg['right'][1], backLeg['right'][2]))
        skeleton = flatten2D(skeleton);

        const numBlock = 7;
        const indices = [];
        for (var i = 0; i < numBlock; ++i) 
            for (var j = 0; j < indicesCube.length; ++j) 
                indices.push(indicesCube[j]+(i*24));
        
        var colors = [];
        // colors.push(changeBlockColor(color, 1.0, 1.0, 1.0));
        // colors.push(changeBlockColor(color, 0.0, 1.0, 1.0));
        // colors.push(changeBlockColor(color, 1.0, 0.0, 1.0));
        // colors.push(changeBlockColor(color, 1.0, 1.0, 0.0));
        // colors.push(changeBlockColor(color, 1.0, 0.0, 0.0));
        // colors.push(changeBlockColor(color, 0.0, 1.0, 0.0));
        // colors.push(changeBlockColor(color, 0.0, 0.0, 1.0));
        for (var i = 0; i < numBlock; ++i) 
            colors.push(color);
        colors = flatten2D(colors)
        
        this.renderedVertices = skeleton;
        this.renderedIndices = new Uint16Array(indices);
        this.color = colors;
    }
}