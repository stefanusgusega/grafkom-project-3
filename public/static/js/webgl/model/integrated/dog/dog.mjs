import {defCube} from './../../base/cube.mjs';

export class Dog {
    constructor() {
        this.center = [0,0,0];
        this.buildSkeleton();
    }

    buildSkeleton() {
        const xCenter = 2;
        const yCenter = 0;
        const zCenter = 0;

        const cubeSize = 2;
        const bodySize = [1, 1, 3];
        const neckSize = [1, 1, 0.1];
        const headSize = [1, 1, 1];
        const earSize = [0.1, 0.2, 0.1];
        const tailSize = [0.1, 0.2, 1.5];
        const legSize = [0.2, 0.8, 0.2];

        const kScaleBody = [bodySize[0]/cubeSize, bodySize[1]/cubeSize, bodySize[2]/cubeSize]
        const kScaleNeck = [neckSize[0]/cubeSize, neckSize[1]/cubeSize, neckSize[2]/cubeSize]
        const kScaleHead = [headSize[0]/cubeSize, headSize[1]/cubeSize, headSize[2]/cubeSize]
        const kScaleEar = [earSize[0]/cubeSize, earSize[1]/cubeSize, earSize[2]/cubeSize]
        const kScaleTail = [tailSize[0]/cubeSize, tailSize[1]/cubeSize, tailSize[2]/cubeSize]
        const kScaleLeg = [legSize[0]/cubeSize, legSize[1]/cubeSize, legSize[2]/cubeSize];

        const translateBody = [xCenter, 0, 0];
        const translateNeck = [xCenter, bodySize[1]/2 + neckSize[1]/2, -(bodySize[2]/2 - neckSize[2]/2)];
        const translateHead = [xCenter, translateNeck[1] + 0.4, translateNeck[2] - neckSize[2]/2 - headSize[2]/2];
        const translateFrontLeg = {
            'left': [xCenter+bodySize[0]/2 - legSize[0]/2, -(bodySize[1]/2 + legSize[1]/2), -(bodySize[2]/2 - legSize[2]/2)],
            'right': [xCenter-(bodySize[0]/2 - legSize[0]/2), -(bodySize[1]/2 + legSize[1]/2), -(bodySize[2]/2 - legSize[2]/2)],
        }
        const translateBackLeg = {
            'left': [xCenter+bodySize[0]/2 - legSize[0]/2, -(bodySize[1]/2 + legSize[1]/2), bodySize[2]/2 - legSize[2]/2],
            'right': [xCenter-(bodySize[0]/2 - legSize[0]/2), -(bodySize[1]/2 + legSize[1]/2), bodySize[2]/2 - legSize[2]/2],
        }
        const translateTail = [xCenter, yCenter, bodySize[2]/2+tailSize[2]/2];
        const translateEar = {
            'left': [xCenter+bodySize[0]/2-earSize[0]/2, 2*translateNeck[1]+earSize[1]/2, translateNeck[2]*2], // perlu dicek lagi
            'right': [xCenter-(bodySize[0]/2-earSize[0]/2), 2*translateNeck[1]+earSize[1]/2, translateNeck[2]*2] // perlu dicek lagi
        }

    }
}