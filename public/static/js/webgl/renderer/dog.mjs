import {loadTexture, isPowerOf2} from './../utils/util.mjs';

export class DogRenderer {
    constructor(master) {
        this.load(master)
    }

    load(master) {
        this.master = master;
        this.root = master.dog.root;
        this.loadAllTexture();
    } 

    loadAllTexture(node=this.root) {
        if (node.right) this.loadAllTexture(node.right)
        if (node.left) this.loadAllTexture(node.left);
        node.render['loadedTexture'] = loadTexture(this.master, node.render['texture']);
    }

    render(node=this.root) {
        if (node.right) this.render(node.right);
        if (node.left) this.render(node.left);

        this.master.gl.uniform1i(this.master.mappingMode, 1);
        const vertex = this.master.gl.createBuffer();
        const textureCoord = this.master.gl.createBuffer();
        const normal = this.master.gl.createBuffer();
        const tangent = this.master.gl.createBuffer();
        const bitangent = this.master.gl.createBuffer();
        const indices = this.master.gl.createBuffer();

        this.master.gl.bindBuffer(this.master.gl.ARRAY_BUFFER, vertex)
        this.master.gl.bufferData(this.master.gl.ARRAY_BUFFER, node.render['vertices'], this.master.gl.STATIC_DRAW);
        this.master.gl.vertexAttribPointer(this.master.vPosition, 3, this.master.gl.FLOAT, false, 0, 0);
        this.master.gl.enableVertexAttribArray(this.master.vPosition);
        
        this.master.gl.bindBuffer(this.master.gl.ARRAY_BUFFER, textureCoord)
        this.master.gl.bufferData(this.master.gl.ARRAY_BUFFER, node.render['textureCoord'], this.master.gl.STATIC_DRAW);
        this.master.gl.vertexAttribPointer(this.master.vTexture, 2, this.master.gl.FLOAT, false, 0, 0);
        this.master.gl.enableVertexAttribArray(this.master.vTexture);
        
        this.master.gl.bindBuffer(this.master.gl.ARRAY_BUFFER, normal)
        this.master.gl.bufferData(this.master.gl.ARRAY_BUFFER, node.render['normal'], this.master.gl.STATIC_DRAW);
        this.master.gl.vertexAttribPointer(this.master.vNormal, 3, this.master.gl.FLOAT, false, 0, 0);
        this.master.gl.enableVertexAttribArray(this.master.vNormal);

        this.master.gl.bindBuffer(this.master.gl.ARRAY_BUFFER, tangent)
        this.master.gl.bufferData(this.master.gl.ARRAY_BUFFER, node.render['tangent'], this.master.gl.STATIC_DRAW);
        this.master.gl.vertexAttribPointer(this.master.vTangent, 3, this.master.gl.FLOAT, false, 0, 0);
        this.master.gl.enableVertexAttribArray(this.master.vTangent);

        this.master.gl.bindBuffer(this.master.gl.ARRAY_BUFFER, bitangent)
        this.master.gl.bufferData(this.master.gl.ARRAY_BUFFER, node.render['bitangent'], this.master.gl.STATIC_DRAW);
        this.master.gl.vertexAttribPointer(this.master.vBitangent, 3, this.master.gl.FLOAT, false, 0, 0);
        this.master.gl.enableVertexAttribArray(this.master.vBitangent);


        this.master.gl.bindBuffer(this.master.gl.ELEMENT_ARRAY_BUFFER, indices)
        this.master.gl.bufferData(this.master.gl.ELEMENT_ARRAY_BUFFER, node.render['indices'], this.master.gl.STATIC_DRAW);

        this.master.gl.activeTexture(this.master.gl.TEXTURE1);
        this.master.gl.bindTexture(this.master.gl.TEXTURE_2D, node.render['loadedTexture']);
        this.master.gl.uniform1i(this.master.matUSamplerLocation, 1);

        this.master.gl.drawElements(this.master.gl.TRIANGLES, node.render['indices'].length, this.master.gl.UNSIGNED_SHORT, 0);
    }
}
