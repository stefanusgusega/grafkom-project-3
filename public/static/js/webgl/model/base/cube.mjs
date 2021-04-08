import {normalize} from './../../utils/util.mjs'

export const defCube = new Float32Array([
    // x, y, z, R, G, B
    // Top
    -1, 1, -1,
    1, 1, -1, 
    1, 1, 1, 
    -1, 1, 1, 

    // Right
    -1, 1, 1, 
    -1, -1, 1, 
    -1, -1, -1,
    -1, 1, -1, 

    // Left
    1, 1, 1,  
    1, 1, -1, 
    1, -1, -1,
    1, -1, 1, 

    // Back
    1, 1, 1, 
    1, -1, 1, 
    -1, -1, 1,
    -1, 1, 1, 

    // Front
    1, 1, -1, 
    -1, 1, -1, 
    -1, -1, -1,
    1, -1, -1, 

    // Bottom
    -1, -1, -1,
    -1, -1, 1, 
    1, -1, 1, 
    1, -1, -1, 
]);

export const color = new Float32Array([
    0.8, 0.8, 0.8,
    0.8, 0.8, 0.8,
    0.8, 0.8, 0.8,
    0.8, 0.8, 0.8,

    0.8, 0.8, 0.8,
    0.8, 0.8, 0.8,
    0.8, 0.8, 0.8,
    0.8, 0.8, 0.8,

    0.8, 0.8, 0.8,
    0.8, 0.8, 0.8,
    0.8, 0.8, 0.8,
    0.8, 0.8, 0.8,

    0.8, 0.8, 0.8,
    0.8, 0.8, 0.8,
    0.8, 0.8, 0.8,
    0.8, 0.8, 0.8,

    0.8, 0.8, 0.8,
    0.8, 0.8, 0.8,
    0.8, 0.8, 0.8,
    0.8, 0.8, 0.8,

    0.8, 0.8, 0.8,
    0.8, 0.8, 0.8,
    0.8, 0.8, 0.8,
    0.8, 0.8, 0.8,
])

export const indicesCube = new Uint16Array([
    // Top
    0, 1, 2,
    0, 2, 3,

    // Right
    4, 5, 6,
    4, 6, 7,

    // Left
    8, 9, 10,
    8, 10, 11,

    // Back
    12, 13, 14,
    12, 14, 15,

    // Front
    16, 17, 18,
    16, 18, 19,

    // Bottom
    20, 21, 22,
    20, 22, 23
]);

export const cubeTextureCoordinates = new Float32Array([
    // Front
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Back
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Top
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Bottom
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Right
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Left
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
]);

export function changeColor(side, color, r, g, b) {
    const position = ['top', 'right', 'left', 'back', 'front', 'bottom'];
    var taken = 0;
    for (var i = 0; i < position.length; ++i) {
        if (side === position[i]) {
            taken = i;
            break
        }
    }
    var copy = [...color]
    for (var i = 0; i < 4; ++i) {
        copy[i*3 + taken*24] = r;
        copy[i*3 + taken*24 + 1] = g;
        copy[i*3 + taken*24 + 2] = b;
    }
    return new Float32Array(copy);
}

export function getNormalCube(block) {
    var ret = []
    for (var i = 0; i < block.length; i += 12) {
        var p2 = [block[i], block[i+1], block[i+2]];
        var p1 = [block[i+3], block[i+4], block[i+5]];
        var p3 = [block[i+6], block[i+7], block[i+8]];

        var Ax = p1[0],
            Ay = p1[1],
            Az = p1[2],
            Bx = p2[0],
            By = p2[1],
            Bz = p2[2],
            Cx = p3[0],
            Cy = p3[1],
            Cz = p3[2];

        var a = (By-Ay) * (Cz-Az) - (Cy-Ay) * (Bz-Az),
            b = (Bz-Az) * (Cx-Ax) - (Cz-Az) * (Bx-Ax),
            c = (Bx-Ax) * (Cy-Ay) - (Cx-Ax) * (By-Ay);
        var normal = normalize([a, b, c]);

        for (var j = 0; j < 4; ++j) {
            ret.push(normal[0]);
            ret.push(normal[1]);
            ret.push(normal[2]);
        }
    }
    return new Float32Array(ret);
}