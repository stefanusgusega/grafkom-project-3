export function renderYoga(master) {
    master.gl.clear(master.gl.COLOR_BUFFER_BIT || master.gl.DEPTH_BUFFER_BIT);

    const vertex = master.gl.createBuffer();
    const color = master.gl.createBuffer();
    const indices = master.gl.createBuffer();

    master.gl.bindBuffer(master.gl.ARRAY_BUFFER, vertex)
    master.gl.bufferData(master.gl.ARRAY_BUFFER, master.yoga.renderedVertices, master.gl.STATIC_DRAW);

    master.gl.vertexAttribPointer(
        master.vPosition,
        3,
        master.gl.FLOAT,
        false,
        0,
        0
    );
    master.gl.enableVertexAttribArray(master.vPosition);

    master.gl.bindBuffer(master.gl.ARRAY_BUFFER, color)
    master.gl.bufferData(master.gl.ARRAY_BUFFER, master.yoga.color, master.gl.STATIC_DRAW);

    master.gl.vertexAttribPointer(
        master.vColor,
        3,
        master.gl.FLOAT,
        false,
        0,
        0
    );
    master.gl.enableVertexAttribArray(master.vColor);
    
    master.gl.bindBuffer(master.gl.ELEMENT_ARRAY_BUFFER, indices)
    master.gl.bufferData(master.gl.ELEMENT_ARRAY_BUFFER, master.yoga.renderedIndices, master.gl.STATIC_DRAW);
    
    master.gl.drawElements(master.gl.TRIANGLES, master.yoga.renderedIndices.length, master.gl.UNSIGNED_SHORT, 0);
}