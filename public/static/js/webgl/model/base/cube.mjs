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