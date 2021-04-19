import {Giraffe} from './model/integrated/giraffe/giraffe.mjs';
import {Dog} from './model/integrated/dog/dog.mjs';
import { Bat } from './model/integrated/Bat/Bat.mjs';
export class Master {
    constructor() {
        this.canvas;
        this.gl; 

        this.vertex;
        this.index;
        this.normal;

        this.vPosition;
        this.vColor;
        this.vNormal;
        this.vTangent;
        this.vBitangent;
        this.vTexture;

        this.worldMatrix;

        this.eye = [0, 0, -8];
        this.center = [0, 0, 0];
        this.up = [0, 1, 0];

        this.mode = 1;
        this.movement = [0, 0, 0];
        this.cameraRotation = [0, 0, 0];

        this.giraffe;
        this.dog;
        this.bat;
        this.isStartGiraffeAnimation = false;
        this.isStartDogAnimation = false;
        this.renderer = {}

        this.matWorldUniformLocation;
        this.matViewUniformLocation;
        this.matProjUniformLocation;
        this.matUSamplerLocation;
        // for bump mapping
        this.matDiffuseLocation;
        this.matNormMapLocation;
        this.matLightPosLocation;

    }
}
