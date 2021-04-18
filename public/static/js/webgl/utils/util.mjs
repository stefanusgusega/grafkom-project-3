export function hex2dec(n) {
    return parseInt(n,16).toString(10)
}

export function degToRad(degree) {
    return degree * Math.PI / 180;
}

export function transpose(arr) {
    const mat = arrToMat(arr);

    for (let i = 0; i < mat.length; i++) {
        for (let j = 0; j < i; j++) {
            const tmp = mat[i][j];
            mat[i][j] = mat[j][i];
            mat[j][i] = tmp;
        };
    }

    return flatten2D(mat);
}

export function matIdentity() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}

export function matIdentityMat() {
    return [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ]
}

const EPSILON = 0.00001;

export function matLookAt(eye, center, up) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
        eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2],
        centerx = center[0],
        centery = center[1],
        centerz = center[2];

    if (Math.abs(eyex - centerx) < EPSILON &&
        Math.abs(eyey - centery) < EPSILON &&
        Math.abs(eyez - centerz) < EPSILON) {
        return matIdentity();
    }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }

    return new Float32Array([
        x0, y0, z0, 0,
        x1, y1, z1, 0,
        x2, y2, z2, 0,
        -(x0*eyex + x1*eyey + x2*eyez), -(y0*eyex + y1*eyey + y2*eyez), -(z0*eyex + z1*eyey + z2*eyez), 1
    ])
}

export function matmul(a, b) {
    var aNumRows = a.length, 
        aNumCols = a[0].length,
        bNumCols = b[0].length,
        m = new Array(aNumRows);
    for (var r = 0; r < aNumRows; ++r) {
        m[r] = new Array(bNumCols);
        for (var c = 0; c < bNumCols; ++c) {
            m[r][c] = 0;
            for (var i = 0; i < aNumCols; ++i) {
                m[r][c] += a[r][i] * b[i][c];
            }
        }
    }
    return m;
}

export function arrToMat(a) {
    const size = Math.sqrt(a.length);
    const m = new Array(size);
    for (var i = 0; i < size; ++i) {
        m[i] = new Array(size);
        for (var j = 0; j < size; ++j) {
            m[i][j] = a[i*size + j];
        }
    }
    return m
}

export function vertToMatrix(vert) {
    const ret = [];
    for (var i = 0; i < vert.length; i+=3) {
        const temp = [
            [vert[i]],
            [vert[i+1]],
            [vert[i+2]],
            [1]
        ];
        ret.push(temp);
    }
    return ret;
}

export function flatten2D(m) {
    var ret = []
    for (var i = 0; i < m.length; ++i) {
        for (var j = 0; j < m[i].length; ++j) {
            ret.push(m[i][j]);
        }
    }
    return new Float32Array(ret);
}

export function scaleMat(x, y, z) {
    return [
        [x, 0, 0, 0],
        [0, y, 0, 0],
        [0, 0, z, 0],
        [0, 0, 0, 1],
    ]
}

export function translateMat(x, y, z) {
    return [
        [1, 0, 0, x],
        [0, 1, 0, y],
        [0, 0, 1, z],
        [0, 0, 0, 1]
    ]
}

export function rotateMat(tetax, tetay, tetaz, x, y, z) {
    const minTrans = translateMat(-x, -y, -z)
    const rotatex = [
        [1, 0, 0, 0],
        [0, Math.cos(degToRad(tetax)), Math.sin(degToRad(tetax)), 0],
        [0, -Math.sin(degToRad(tetax)), Math.cos(degToRad(tetax)), 0],
        [0, 0, 0, 1]
    ]
    const rotatey = [
        [Math.cos(degToRad(tetay)), 0, -Math.sin(degToRad(tetay)), 0],
        [0, 1, 0, 0],
        [Math.sin(degToRad(tetay)), 0, Math.cos(degToRad(tetay)), 0],
        [0, 0, 0, 1]
    ]
    const rotatez = [
        [Math.cos(degToRad(tetaz)), -Math.sin(degToRad(tetaz)), 0, 0],
        [Math.sin(degToRad(tetaz)), Math.cos(degToRad(tetaz)), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ]
    const posTrans = translateMat(x, y, z);
    const ret = matmul(matmul(matmul(matmul(posTrans, rotatez), rotatey), rotatex), minTrans);
    return ret
}

export function translation(matrix, x, y, z) {
    const M = [
        [1, 0, 0, x],
        [0, 1, 0, y],
        [0, 0, 1, z],
        [0, 0, 0, 1]
    ]
    return flatten2D(matmul(M, matrix))
}

export function scaling(matrix, x, y, z) {
    const M = [
        [x, 0, 0, 0],
        [0, y, 0, 0],
        [0, 0, z, 0],
        [0, 0, 0, 1]
    ]
    return flatten2D(matmul(M, matrix))
}

function rotatex(matrix, teta) {
    const M = [
        [1, 0, 0, 0],
        [0, Math.cos(degToRad(teta)), Math.sin(degToRad(teta)), 0],
        [0, -Math.sin(degToRad(teta)), Math.cos(degToRad(teta)), 0],
        [0, 0, 0, 1]
    ]
    return flatten2D(matmul(M, matrix))
}

function rotatey(matrix, teta) {
    const M = [
        [Math.cos(degToRad(teta)), 0, -Math.sin(degToRad(teta)), 0],
        [0, 1, 0, 0],
        [Math.sin(degToRad(teta)), 0, Math.cos(degToRad(teta)), 0],
        [0, 0, 0, 1]
    ]
    return flatten2D(matmul(M, matrix))
}

function rotatez(matrix, teta) {
    const M = [
        [Math.cos(degToRad(teta)), -Math.sin(degToRad(teta)), 0, 0],
        [Math.sin(degToRad(teta)), Math.cos(degToRad(teta)), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ]
    return flatten2D(matmul(M, matrix));
}

export function rotate(arr1d, tetax, tetay, tetaz, x, y, z) {
    const matrix_center = translation(arr1d, -x, -y, -z),
          rotate_x = rotatex(vertToMatrix(matrix_center)[0], tetax),
          rotate_y = rotatey(vertToMatrix(rotate_x)[0], tetay),
          rotate_z = rotatez(vertToMatrix(rotate_y)[0], tetaz),
          back = translation(vertToMatrix(rotate_z)[0], x, y, z)
    return back;
}

export function scaleBlock(arr1d, x, y, z) {
    const mat = vertToMatrix(arr1d);
    const ret = []
    for (var i = 0; i < mat.length; ++i) {
        const scaled = scaling(mat[i], x, y, z);
        for (var j = 0; j < scaled.length-1; ++j) ret.push(scaled[j])
    }
    return new Float32Array(ret);
}

export function translateBlock(arr1d, x, y, z) {
    const mat = vertToMatrix(arr1d);
    const ret = []
    for (var i = 0; i < mat.length; ++i) {
        const translated = translation(mat[i], x, y, z);
        for (var j = 0; j < translated.length-1; ++j) ret.push(translated[j])
    }
    return new Float32Array(ret);
}

export function rotateBlock(arr1d, tetax, tetay, tetaz, x, y, z) {
    const mat = vertToMatrix(arr1d);
    const ret = []
    for (var i = 0; i < mat.length; ++i) {
        const rotated = rotate(mat[i], tetax, tetay, tetaz, x, y, z);
        for (var j = 0; j < rotated.length-1; ++j) ret.push(rotated[j])
    }
    return new Float32Array(ret);
}

export function matOrtho(left, right, bottom, top, near, far) {
    const a = right - left,
          b = top -bottom,
          c = far - near;

    return new Float32Array([
        2/a, 0, 0, 0,
        0, 2/b, 0, 0,
        0, 0, -2/c, 0,
        -(left+right)/a, -(top+bottom)/b, -(far+near)/c, 1
    ])
}

export function translationTranspos(matrix, x, y, z) {
    const M = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [x, y, z, 1]
    ]
    return flatten2D(matmul(M, matrix))
}

export function matOblique(teta, phi) {
    const t = degToRad(teta),
          p = degToRad(phi),
          cotT = -1/Math.tan(t),
          cotP = -1/Math.tan(p);
    
    return transpose([
        1, 0, cotT, 0,
        0, 1, cotP, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ])
}

export function matPerspective(fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy/2),
        nf = 1 / (near-far);
    return new Float32Array([
        f/aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far+near)*nf, -1,
        0, 0, 2*far*near*nf, 0
    ]);
}

export function normalize(arr) {
    var len = Math.sqrt(arr[0]*arr[0] + arr[1]*arr[1] + arr[2]*arr[2]);
    if (len > 0) {
        len = 1 / len;
    }
    return new Float32Array([arr[0]*len, arr[1]*len, arr[2]*len]);
}

export function inverse(m) {
    var ret = [0, 0, 0, 0,
               0, 0, 0, 0,
               0, 0, 0, 0,
               0, 0, 0, 0]

    var m00 = m[0 * 4 + 0];
    var m01 = m[0 * 4 + 1];
    var m02 = m[0 * 4 + 2];
    var m03 = m[0 * 4 + 3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var m30 = m[3 * 4 + 0];
    var m31 = m[3 * 4 + 1];
    var m32 = m[3 * 4 + 2];
    var m33 = m[3 * 4 + 3];
    var tmp_0  = m22 * m33;
    var tmp_1  = m32 * m23;
    var tmp_2  = m12 * m33;
    var tmp_3  = m32 * m13;
    var tmp_4  = m12 * m23;
    var tmp_5  = m22 * m13;
    var tmp_6  = m02 * m33;
    var tmp_7  = m32 * m03;
    var tmp_8  = m02 * m23;
    var tmp_9  = m22 * m03;
    var tmp_10 = m02 * m13;
    var tmp_11 = m12 * m03;
    var tmp_12 = m20 * m31;
    var tmp_13 = m30 * m21;
    var tmp_14 = m10 * m31;
    var tmp_15 = m30 * m11;
    var tmp_16 = m10 * m21;
    var tmp_17 = m20 * m11;
    var tmp_18 = m00 * m31;
    var tmp_19 = m30 * m01;
    var tmp_20 = m00 * m21;
    var tmp_21 = m20 * m01;
    var tmp_22 = m00 * m11;
    var tmp_23 = m10 * m01;

    var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
        (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
        (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
        (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
        (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    ret[0] = d * t0;
    ret[1] = d * t1;
    ret[2] = d * t2;
    ret[3] = d * t3;
    ret[4] = d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
            (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30));
    ret[5] = d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
            (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30));
    ret[6] = d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
            (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30));
    ret[7] = d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
            (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20));
    ret[8] = d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
            (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33));
    ret[9] = d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
            (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33));
    ret[10] = d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
            (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33));
    ret[11] = d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
            (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23));
    ret[12] = d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
            (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22));
    ret[13] = d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
            (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02));
    ret[14] = d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
            (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12));
    ret[15] = d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
            (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02));

    return ret;
}

export function changeBlockColor(block, r, g, b) {
    const ret = []
    for (var i = 0; i < block.length; i+=3) {
        ret.push(r);
        ret.push(g);
        ret.push(b);
    }
    return ret;
}

export function transformBlock(block, mat) {
    const ret = [];
    for (var i = 0; i < block.length; i+=3) {
        const temp = [
            [block[i]],
            [block[i+1]],
            [block[i+2]],
            [1]
        ]
        const transformed = matmul(mat, temp);
        const takenVert = [transformed[0], transformed[1], transformed[2]]
        ret.push(new Float32Array(takenVert));
    }
    return flatten2D(ret);
}

export function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

export function loadTexture(master, base64) {
    const texture = master.gl.createTexture();
    master.gl.bindTexture(master.gl.TEXTURE_2D, texture);
    const level = 0;
    const internalFormat = master.gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = master.gl.RGBA;
    const srcType = master.gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([255, 0, 0, 255]);
    master.gl.texImage2D(master.gl.TEXTURE_2D, level, internalFormat,
                  width, height, border, srcFormat, srcType,
                  pixel);
    
    const image = new Image();
    image.onload = function () {
        master.gl.bindTexture(master.gl.TEXTURE_2D, texture);
        master.gl.texImage2D(master.gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            master.gl.generateMipmap(master.gl.TEXTURE_2D);
        } else {
            master.gl.texParameteri(master.gl.TEXTURE_2D, master.gl.TEXTURE_WRAP_S, master.gl.CLAMP_TO_EDGE);
            master.gl.texParameteri(master.gl.TEXTURE_2D, master.gl.TEXTURE_WRAP_T, master.gl.CLAMP_TO_EDGE);
            master.gl.texParameteri(master.gl.TEXTURE_2D, master.gl.TEXTURE_MIN_FILTER, master.gl.LINEAR);
        }
    }
    image.src = base64;
    
    return texture;
}

// TODO: bump mapping here