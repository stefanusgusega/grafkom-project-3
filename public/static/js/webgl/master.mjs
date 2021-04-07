import {Yoga} from './model/integrated/dog.mjs';

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

        this.eye = [0, 0, -8];
        this.center = [0, 0, 0];
        this.up = [0, 1, 0];

        this.mode = 1;
        this.movement = [0, 0, 0];
        this.cameraRotation = [0, 0, 0];

        this.yoga = new Yoga();
        this.renderer = {}

        this.matWorldUniformLocation;
        this.matViewUniformLocation;
        this.matProjUniformLocation;
    }
}