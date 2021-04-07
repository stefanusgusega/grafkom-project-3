export class YogasRenderer {
    constructor(master) {
        this.master = master;
        this.vertex = master.gl.createBuffer();
        this.color = master.gl.createBuffer();
        this.indices = master.gl.createBuffer();
        this.root = master.yoga.root;
    }

    render(node=this.root) {
        // for (var i = 0; i < node.childs.length; ++i) this.render(node.childs[i]);
        if (node.right) this.render(node.right);
        if (node.left) this.render(node.left);

        this.master.gl.bindBuffer(this.master.gl.ARRAY_BUFFER, this.vertex)
        this.master.gl.bufferData(this.master.gl.ARRAY_BUFFER, node.render['vertices'], this.master.gl.STATIC_DRAW);
        this.master.gl.vertexAttribPointer(this.master.vPosition, 3, this.master.gl.FLOAT, false, 0, 0);
        this.master.gl.enableVertexAttribArray(this.master.vPosition);
        
        this.master.gl.bindBuffer(this.master.gl.ARRAY_BUFFER, this.color)
        this.master.gl.bufferData(this.master.gl.ARRAY_BUFFER, node.render['color'], this.master.gl.STATIC_DRAW);
        this.master.gl.vertexAttribPointer(this.master.vColor, 3, this.master.gl.FLOAT, false, 0, 0);
        this.master.gl.enableVertexAttribArray(this.master.vColor);
        
        this.master.gl.bindBuffer(this.master.gl.ELEMENT_ARRAY_BUFFER, this.indices)
        this.master.gl.bufferData(this.master.gl.ELEMENT_ARRAY_BUFFER, node.render['indices'], this.master.gl.STATIC_DRAW);
        this.master.gl.drawElements(this.master.gl.TRIANGLES, node.render['indices'].length, this.master.gl.UNSIGNED_SHORT, 0);
    }
}
