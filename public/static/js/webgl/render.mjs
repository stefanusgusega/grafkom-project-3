export function render(master) {
    master.gl.clearColor(1.0, 1.0, 1.0, 1.0);
    master.gl.clearDepth(1.0);
    master.gl.enable(master.gl.DEPTH_TEST);
    master.gl.depthFunc(master.gl.LEQUAL);

    master.gl.clear(master.gl.COLOR_BUFFER_BIT || master.gl.DEPTH_BUFFER_BIT);

    // master.renderer['giraffe'].render();
    // master.renderer['dog'].render();
    master.renderer['bat'].render();
}
